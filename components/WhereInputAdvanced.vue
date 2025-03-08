<template lang="pug">
v-card
  v-card-title {{ $t('event.where_advanced_options') }}
  v-card-subtitle {{ $t('event.where_advanced_options_description') }}

  v-card-text
    SearchAddress(:place='place')

  v-card-actions
    v-spacer
    v-btn(@click='close' outlined) Close

</template>
<script>
import SearchAddress from './SearchAddress.vue'

export default {
  name: 'WhereInputAdvanced',
  props: {
    place: { type: Object, default: () => ({}) },
  },
  components: { SearchAddress },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
