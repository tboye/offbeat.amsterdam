<template>
<v-container class='px-2 px-sm-6 pt-0' id='home'>

    <!-- Announcements -->
    <section id='announcements' class='mt-2 mt-sm-4' v-if='announcements?.length'>
      <Announcement v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement' />
    </section>

    <!-- Events -->
    <section id='events' class='mt-sm-4 mt-2' v-if='!$fetchState.pending'>
      <v-lazy class='event v-card' :value='shouldLoadImmediately(idx)'
        v-for='(event, idx) in visibleEvents' :key='event.id'
        :min-height='hide_thumbs ? 105 : undefined'
        :options="{ threshold: .5, rootMargin: '500px' }"
        :class="{ 'theme--dark': is_dark }"
        :data-event-id="event.id"
        @click="storeEventId(event)">
        <Event :event='event' :lazy='!shouldLoadImmediately(idx)' />
      </v-lazy>
    </section>
    <section class='text-center' v-else>
      <v-progress-circular class='mt-5 justify-center align-center mx-auto' color='primary' indeterminate model-value='20' />
    </section>

</v-container>
</template>

<script>
import { mapState, mapActions, mapGetters  } from 'vuex'
import { DateTime } from 'luxon'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import ThemeView from '@/components/ThemeView'
import { mdiMagnify, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'Index',
  components: { Event, Announcement, ThemeView },
  middleware: 'setup',
  fetch () {
    if (process.server) return
    if (this.filter.query) {
      return this.getEvents({
        query: this.filter.query,
        older: true
      })
    } else {
      return this.getEvents({
        start: this.start,
        end: this.end,
      })
    }
  },
  data ({ $time }) {
    return {
      mdiMagnify, mdiCloseCircle,
      isCurrentMonth: true,
      now: $time.nowUnix(),
      start: $time.startMonth(),
      end: null,
      tmpEvents: [],
      selectedDay: null,
      storeUnsubscribe: null,
      isRestoringScroll: false,
      lastViewedEventId: null,
    }
  },
  head () {
    // FIXME: Temporary solution to include part of the description into index title
    const desc = this.settings?.description || ''
    const shortDesc = desc.includes('. ') ? desc.split('. ')[0] : desc

    return {
      title: this.settings.title + ' | ' + shortDesc,
      htmlAttrs: {
        lang: this.settings.instance_locale,
      },
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: this.settings?.description },
        { hid: 'og-description', name: 'og:description', content: this.settings?.description },
        { hid: 'og-title', property: 'og:title', content: this.settings.title },
        { hid: 'og-url', property: 'og:url', content: this.settings.baseurl },
        { property: 'og:image', content: this.settings.baseurl + '/logo.png' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: this.settings.baseurl + '/logo.png' },
        { rel: 'alternate', type: 'application/rss+xml', title: this.settings.title, href: this.settings.baseurl + '/feed/rss' },
        { rel: 'alternate', type: 'text/calendar', title: this.settings.title, href: this.settings.baseurl + '/feed/ics' },
        { rel: 'me', href: `${this.settings.baseurl}/federation/u/${this.settings.instance_name}`},
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'announcements', 'events', 'filter']),
    ...mapGetters(['hide_thumbs', 'is_dark']),
    visibleEvents () {
      const now = this.$time.nowUnix()
      if (this.selectedDay) {
        const min = this.selectedDay.startOf('day').toUnixInteger()
        const max = this.selectedDay.endOf('day').toUnixInteger()
        return this.events.filter(e => (e.start_datetime <= max && (e.end_datetime || (e.start_datetime + 1)) > min) && (this.filter.show_recurrent || !e.parentId))
      } else if (this.isCurrentMonth && !this.filter.query) {
          return this.events.filter(e => {
            const max_datetime = Math.max(e.start_datetime, e.end_datetime)
            return (e.end_datetime ? max_datetime >= now : e.start_datetime + 3 * 60 * 60 >= now) && (this.filter.show_recurrent || !e.parentId)
          })
      } else {
        return this.events.filter(e => this.filter.show_recurrent || !e.parentId)
      }
    }
  },
  created () {
    this.$root.$on('dayclick', this.dayChange)
    this.$root.$on('monthchange', this.monthChange)
    if (process.client) {
      this.storeUnsubscribe = this.$store.subscribeAction( { after: (action, state) => {
        if (action.type === 'setFilter') { this.$fetch() }
      }})
    }
  },
  mounted () {
    this.initScrollRestoration()
  },
  destroyed () {
    this.$root.$off('dayclick')
    this.$root.$off('monthchange')
    if (typeof this.storeUnsubscribe === 'function') {
      this.storeUnsubscribe()
    }
  },
  methods: {
    ...mapActions(['getEvents']),

    // Store event ID for scroll restoration
    storeEventId(event) {
      this.lastViewedEventId = event.id
      sessionStorage.setItem('last_event_id', event.id.toString())
    },

    // Simplified scroll preservation
    initScrollRestoration() {
      // Disable browser scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }

      // Set up router hooks
      if (this.$router) {
        // Handle scroll after navigation
        this.$router.afterEach((to, from) => {
          this.$nextTick(() => {
            if (to.path === '/') {
              // Try to restore scroll for home page
              this.restoreScrollToEvent()
            } else {
              // Scroll to top for all other pages
              window.scrollTo(0, 0)
            }
          })
        })
      }
    },

    // Determine which events should be loaded immediately
    shouldLoadImmediately(idx) {
      if (idx < 9) return true
      if (this.isRestoringScroll && this.lastViewedEventId) {
        // Find the index of the event we're trying to restore to
        const targetEventIndex = this.visibleEvents.findIndex(e => e.id === this.lastViewedEventId)
        if (targetEventIndex !== -1) {
          // Load up to the target event
          return idx <= targetEventIndex
        }
      }
      return false
    },

    // Restore scroll to the last viewed event
    restoreScrollToEvent() {
      const lastEventId = sessionStorage.getItem('last_event_id')
      if (!lastEventId) return

      this.lastViewedEventId = parseInt(lastEventId)
      this.isRestoringScroll = true

      // Event should be loaded immediately, so scroll to it
      this.$nextTick(() => {
        this.scrollToEvent()
      })
    },

    scrollToEvent() {
      const eventElement = document.querySelector(`[data-event-id="${this.lastViewedEventId}"]`)

      if (eventElement) {
        // Get the element's position relative to the document
        const rect = eventElement.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY

        // Use responsive offset that scales with viewport size
        const offset = Math.max(60, window.innerHeight * 0.1)

        window.scrollTo({
          top: Math.max(0, elementTop - offset),
          behavior: 'instant'
        })
      }

      this.resetScrollRestorationState()
    },

    // Reset scroll restoration state
    resetScrollRestorationState() {
      this.isRestoringScroll = false
      this.lastViewedEventId = null
      sessionStorage.removeItem('last_event_id')
    },

    async monthChange ({ year, month }) {
      if (this.filter.query) return
      this.$nuxt.$loading.start()
      let isCurrentMonth

      // Reset scroll restoration for filtering
      this.resetScrollRestorationState()

      // unselect current selected day
      this.selectedDay = null
      const now = DateTime.local({zone: this.settings.instance_timezone})
      // check if current month is selected
      if (month === now.month && year === now.year) {
        isCurrentMonth = true
        this.start = now.startOf('month').toUnixInteger()
        this.end = null
      } else {
        isCurrentMonth = false
        this.start = DateTime.local(year, month, { zone: this.settings.instance_timezone }).toUnixInteger()
        this.end = DateTime.local(year, month, { zone: this.settings.instance_timezone }).plus({ month: !this.$vuetify.breakpoint.smAndDown ? 1 : 0 }).endOf('month').toUnixInteger() // .endOf('week').unix()
      }
      await this.$fetch()
      this.$nuxt.$loading.finish()
      this.$nextTick( () => this.isCurrentMonth = isCurrentMonth)
    },

    dayChange (day) {
      if (!day) {
        this.selectedDay = null
        return
      }

      // Reset scroll restoration for filtering
      this.resetScrollRestorationState()

      const date = DateTime.fromJSDate(day)
      this.selectedDay = day ? DateTime.local({ zone: this.settings.instance_timezone }).set({ year: date.year, month: date.month, day: date.day}) : null
    }
  }
}
</script>
