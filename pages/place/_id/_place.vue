<template>
  <v-container id='home' class='px-2 px-sm-6 pt-0'>
    <h1 class='d-block text-h4 font-weight-black text-center text-uppercase mt-10 mx-auto w-100 text-underline'>
      <u>{{ place.name }}</u>
    </h1>
    <span v-if='place.name!=="online"' class="d-block text-subtitle text-center w-100">{{ place.address }}</span>

    <!-- Map -->
    <div v-if='settings.allow_geolocation && place.latitude && place.longitude' >
      <div class="mt-4 mx-n2 md:mx-0">
        <Map :place='place' :LMapStyles="{'border-radius':0, height:'16rem'}" />
      </div>
      <div class="mt-4">
        <HowToArriveNav :place='place' class="justify-center" />
      </div>
    </div>

    <!-- Events -->
    <div id="events" class='mt-14'>
      <v-lazy class='event v-card' :value='idx<9' v-for='(event, idx) in events' :key='event.id' :min-height='hide_thumbs ? 105 : undefined' :options="{ threshold: .5, rootMargin: '500px' }" :class="{ 'theme--dark': is_dark }">
        <Event :event='event' :lazy='idx > 9' />
      </v-lazy>
    </div>

    <!-- Past Events -->
    <h2 class='mt-14 mb-3' v-if="pastEvents.length">{{$t('common.past_events')}}</h2>
    <div v-if="pastEvents.length" id="events">
      <v-lazy class='event v-card' :value='idx<9' v-for='(event, idx) in pastEvents' :key='event.id' :min-height='hide_thumbs ? 105 : undefined' :options="{ threshold: .5, rootMargin: '500px' }" :class="{ 'theme--dark': is_dark }">
        <Event :event='event' :lazy='idx > 9' />
      </v-lazy>
    </div>

  </v-container>
</template>
<script>

import { mapState, mapGetters } from 'vuex'
import Event from '@/components/Event'
import HowToArriveNav from '@/components/HowToArriveNav.vue'

export default {
  name: 'Place',
  components: {
    Event,
    HowToArriveNav,
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  head() {
    const title = `${this.settings.title} - ${this.place.name}`
    return {
      title,
      link: [
        { rel: 'alternate', type: 'application/rss+xml', title, href: this.settings.baseurl + `/feed/rss/place/${this.place.id}` },
        { rel: 'alternate', type: 'text/calendar', title, href: this.settings.baseurl + `/feed/ics/place/${this.place.id}` }
      ],
    }
  },
  computed: {
    ...mapState(['settings']),
    ...mapGetters(['hide_thumbs', 'is_dark']),
  },
  async asyncData({ $axios, params, error }) {
    try {
      const { events, pastEvents, place } = await $axios.$get(`/place/${params.id}`)
      return { events, pastEvents, place }
    } catch (e) {
      error({ statusCode: 404, message: 'Place not found!' })
    }
  }
}
</script>
