<template lang="pug">
v-container.px-2.px-sm-6.pt-0

  //- View
  #themeview.mt-sm-4.mt-2
    ThemeView

  //- Announcements
  #announcements.mt-2.mt-sm-4(v-if='announcements.length')
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

  //- Events
  #events.mt-sm-4.mt-2
    Event(:event='event' v-for='(event, idx) in visibleEvents' :lazy='idx>2' :key='event.id')
</template>

<script>
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
    return this.getEvents({
      start: this.start,
      end: this.end
    })
  },
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 60000) {
      this.$fetch()
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
    }
  },
  head () {
    return {
      title: this.settings.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: this.settings.description },
        { hid: 'og-description', name: 'og:description', content: this.settings.description },
        { hid: 'og-title', property: 'og:title', content: this.settings.title },
        { hid: 'og-url', property: 'og:url', content: this.settings.baseurl },
        { property: 'og:image', content: this.settings.baseurl + '/logo.png' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: this.settings.baseurl + '/logo.png' },
        { rel: 'alternate', type: 'application/rss+xml', title: this.settings.title, href: this.settings.baseurl + '/feed/rss' },
        { rel: 'alternate', type: 'text/calendar', title: this.settings.title, href: this.settings.baseurl + '/feed/ics' }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'announcements', 'events', 'filter']),
    visibleEvents () {
      const now = this.$time.nowUnix()
      if (this.selectedDay) {
        const min = this.selectedDay.startOf('day').toUnixInteger()
        const max = this.selectedDay.endOf('day').toUnixInteger()
        return this.events.filter(e => (e.start_datetime < max && (e.end_datetime || e.start_datetime) > min) && (this.filter.show_recurrent || !e.parentId))
      } else if (this.isCurrentMonth && !this.filter.query) {
          return this.events.filter(e => ((e.end_datetime ? e.end_datetime > now : e.start_datetime + 3 * 60 * 60 > now) && (this.filter.show_recurrent || !e.parentId)))
      } else {
        return this.events.filter(e => this.filter.show_recurrent || !e.parentId)
      }
    }
  },
  created () {
    this.$root.$on('dayclick', this.dayChange)
    this.$root.$on('monthchange', this.monthChange)
    this.storeUnsubscribe = this.$store.subscribeAction( { after: (action, state) => {
      if (action.type === 'setFilter') {
        if (this.filter.query && this.filter.query.length > 2) {
          this.search()
        } else {
          this.tmpEvents = []
          this.$fetch()
        }
      }
    }})
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
    search: debounce(async function() {
      this.tmpEvents =  await this.$api.getEvents({
        start: 0,
        show_recurrent: this.filter.show_recurrent,
        show_multidate: this.filter.show_multidate,
        query: this.filter.query
      })
    }, 200),
    async monthChange ({ year, month }) {
      this.$nuxt.$loading.start()
      let isCurrentMonth

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
      const date = DateTime.fromJSDate(day)
      this.selectedDay = day ? DateTime.local({ zone: this.settings.instance_timezone }).set({ year: date.year, month: date.month, day: date.day}) : null
    }
  }
}
</script>
