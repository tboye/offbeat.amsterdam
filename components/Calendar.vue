<template lang="pug">
    v-date-picker(
      :landscape="landscape"
      v-model='date'
      full-width
      show-adjacent-months
      :locale='$i18n.locale'
      aria-label='Calendar')
  </template>

</template>
<script>
import { mapState } from 'vuex'
import { mdiChevronDown, mdiClose } from '@mdi/js'

export default {
  name: 'Calendar',
  data ({$time}) {

    const month = $time.currentMonth()
    const year = $time.currentYear()
    return {
      mdiChevronDown, mdiClose,
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      selectedDate: null,
      page: { month, year },
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    landscape () {
      return true
      // return this.$vuetify.breakpoint.smAndDown
    },
    attributes () {
      return this.$time.attributesFromEvents(this.events)
    }
  },
  methods: {
    updatePage (page) {
      if (page.month !== this.page.month || page.year !== this.page.year) {
        this.page.month = page.month
        this.page.year = page.year
        this.$root.$emit('monthchange', page)
      }
    },
    click (day) {
      this.$root.$emit('dayclick', day)
    }
  }
}
</script>

<style>
.vc-container.vc-is-dark {
  --gray-900: #111;
  --gray-700: #333;
}

.vc-container {
  --gray-400: #999 !important;
  --rounded-lg: 4px !important;
}

.vc-opacity-0 {
  opacity: 0.3 !important;
}

.past-event {
  opacity: 0.3;
}

#calendarButton {
  margin-top: -6px;
  margin-left: -10px;
}
</style>
