<script setup>
  defineProps({ announcement: { type: Object, default: () => ({}) } })
</script>
<template>
  <nuxt-link :to='`/announcement/${announcement?.id}`'>
    <v-alert rounded="0" flat  color="primary" border="left" show-icon :icon='mdiInformation'><h3>{{announcement.title}}</h3></v-alert>
  </nuxt-link>
</template>
