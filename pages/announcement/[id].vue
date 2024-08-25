<script setup lang="ts">

const route = useRoute()
const { data: announcement, error } = await useFetch<Announcement>(`/api/announcements/${route.params.id}`)

if (!announcement.value) {
  throw createError({ statusCode: 404, statusMessage : 'Announcement Not Found' })
}

useHead({ title: `Announce - ${announcement.value.title}` })
</script>

<template>
    <v-container>
        <v-card>
            <v-card-title class='text-h5 font-weight-bold'>{{announcement?.title}}</v-card-title>
            <v-card-text v-html='announcement?.announcement' />
        </v-card>
    </v-container>
</template>
