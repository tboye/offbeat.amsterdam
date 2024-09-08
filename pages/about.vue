<script setup lang="ts">
const about = await useFetch('/api/settings/about')
</script>
<template>
    <v-container>
        <v-card-text v-html="about" />
    </v-container>
</template>