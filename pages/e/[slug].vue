<script setup lang="ts">
import type { Event } from '#build/types/nitro-imports'

const route = useRoute()
const { data: event } = await useFetch<Event>(`/api/events/${route.params.slug}`)

if (!event) {
    throw createError({ status: 404, statusMessage: 'Event not found'})
}

</script>
<template>
<v-container>
    <v-card>
        <v-card-title>
            {{ event?.title }}
        </v-card-title>
    </v-card>
</v-container>
</template>