<script setup>
  defineProps({ announcement: { type: Object, default: () => ({}) } })
</script>
<template>
  <nuxt-link class="text-decoration-none" :to='`/announcement/${announcement?.id}`'>
    <v-alert type="info" :title='announcement.title' />
  </nuxt-link>
</template>
