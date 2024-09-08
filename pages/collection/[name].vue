<script setup lang="ts">
import type { Event } from '#build/types/nitro-imports'

const hide_thumbs = false

const route = useRoute()
const { data: events } = await useFetch<Event[]>(`/api/collections/${route.params.name}`) 

</script>
<template>
  <v-container id='home' class='px-2 px-sm-6 pt-0' fluid>

    <h1 class='d-block text-h3 font-weight-black text-center text-uppercase mt-10 mb-16 mx-auto w-100 text-underline'><u>{{route.params.name}}</u></h1>

    <!-- Events -->
    <div class="mb-2 mt-1 pl-1 pl-sm-2" id="events">
      <v-lazy class='event v-card' :value='idx<9' v-for='(event, idx) in events' :key='event.id' :min-height='hide_thumbs ? 105 : undefined' :options="{ threshold: .5, rootMargin: '500px' }">
        <Event :event='event' :lazy='idx>9' />
      </v-lazy>
    </div>
  </v-container>
</template>