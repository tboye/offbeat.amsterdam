<template lang='pug'>
v-container
  v-card-title {{ $t('common.places') }}
    v-spacer
    v-text-field(v-model='search'
      :append-icon='mdiMagnify' outlined rounded
      :label="$t('common.search')"
      single-line hide-details)
  v-card-subtitle(v-html="$t('admin.place_description')")

  v-dialog(v-model='dialog' width='600' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card
      v-card-title {{ $t('admin.edit_place') }}
      v-card-text.mb-4
        v-form(v-model='valid' ref='form' lazy-validation)
          v-text-field(
            :rules="[$validators.required('common.name')]"
            :label="$t('common.name')"
            v-model='place.name'
            :placeholder='$t("common.name")')
        
          v-text-field(ref='address'
            :rules="[ v => $validators.required('common.address')(v)]"
            :label="$t('common.address')"
            v-model='place.address'
            persistent-hint)

          SearchAddress(v-if='settings.allow_geolocation' :place='place')
          
      v-card-actions
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.cancel') }}
        v-btn(@click='savePlace' color='primary' outlined :loading='loading'
          :disable='!valid || loading') {{ $t('common.save') }}

  v-card-text
    v-data-table(
      :headers='headers'
      :items='places'
      :hide-default-footer='places.length < 5'
      :header-props='{ sortIcon: mdiChevronDown }'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :search='search')
      template(v-slot:item.map='{ item }')
        v-icon(v-if='item.latitude && item.longitude' v-text='mdiMapMarker')
      template(v-slot:item.actions='{ item }')
        v-btn(@click='editPlace(item)' color='primary' icon)
          v-icon(v-text='mdiPencil')
        nuxt-link(:to='`/place/${item.id}/${encodeURIComponent(item.name)}`')
          v-icon(v-text='mdiEye')

</template>
<script>
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiMagnify, mdiEye, mdiMapMarker } from '@mdi/js'
import SearchAddress from '~/components/SearchAddress.vue'
import { mapState } from 'vuex'

export default {
  components: { SearchAddress },
  data() {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiChevronDown, mdiMagnify, mdiEye, mdiMapMarker,
      loading: false,
      dialog: false,
      valid: false,
      places: [],
      address: '',
      search: '',
      place: { name: '', address: '', latitude: null, longitude: null, id: null },
      headers: [
        { value: 'name', text: this.$t('common.name') },
        { value: 'address', text: this.$t('common.address') },
        { value: 'map', text: 'Map' },
        { value: 'actions', text: this.$t('common.actions'), align: 'right' }
      ],
    }
  },
  async fetch() {
    this.places = await this.$axios.$get('/places')
    // do not allow edit the online place
    this.places = this.places.filter(p => p.name !== 'online')
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    editPlace(item) {
      this.place.name = item.name
      this.place.address = item.address
      if (this.settings.allow_geolocation) {
        this.place.geocodedAddress = ''
        this.place.latitude = item.latitude
        this.place.longitude = item.longitude
      }
      this.place.id = item.id
      this.dialog = true
    },
    async savePlace() {
      if (!this.$refs.form.validate()) return
      this.loading = true
      await this.$axios.$put('/place', this.place)
      await this.$fetch()
      this.loading = false
      this.dialog = false
    },
  }
}
</script>
