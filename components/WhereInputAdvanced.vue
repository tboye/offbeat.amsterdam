<template lang="pug">
v-card
  v-card-title {{ $t('event.where_advanced_options') }}
  v-card-subtitle {{ $t('event.where_advanced_options_description') }}

  v-card-text
    v-switch.mt-0.mb-5(v-model='online_event_only_update'
      persistent-hint
      :value='online_event_only'
      :label="$t('event.online_event_only_label')"
      :hint="$t('event.online_event_only_help')")

    v-combobox.mr-4.my-5(v-model="virtualLocations_update" v-if="place.address !== 'online'"
      :prepend-icon='mdiLink'
      :hint="$t('event.additional_online_locations_help')"
      :label="$t('event.additional_online_locations')"
      clearable chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
      :delimiters="[',', ';', '; ']"
      :items="virtualLocations_update")
      template(v-slot:selection="{ item, on, attrs, selected, parent }")
        v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
          :input-value="selected" label small) {{ item }}

  v-divider(v-if="settings.allow_geolocation || place.name === 'online'")
  v-card-text.mt-5(v-if="settings.allow_geolocation || place.name === 'online'")
    v-text-field.mt-0.mb-0(v-model='place.address'
      :prepend-icon='mdiMap'
      :disabled="!settings.allow_geolocation || online_event_only || place.name === 'online'"
      persistent-hint
      :hint="$t('event.address_overwrite_help')"
      :label="$t('event.address_overwrite')")

    v-row.mt-4
      v-col.py-0(cols=12 md=6)
        v-text-field(v-model="place.latitude"
          :prepend-icon='mdiLatitude'
          :disabled="!settings.allow_geolocation || online_event_only || place.name === 'online'"
          :label="$t('common.latitude')")
      v-col.py-0(cols=12 md=6)
        v-text-field(v-model="place.longitude"
          :prepend-icon='mdiLongitude'
          :disabled="!settings.allow_geolocation || online_event_only || place.name === 'online'"
          :label="$t('common.longitude')")
    p.mt-4(v-html="$t('event.address_geocoded_disclaimer')")

  v-card-actions
    v-spacer
    v-btn(@click='close' outlined) Close

</template>
<script>
import { mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import get from 'lodash/get'

export default {
  name: 'WhereInputAdvanced',
  props: {
    place: { type: Object, default: () => ({}) },
    event: { type: Object, default: () => null },
    online_event_only: { type: Boolean, default: false },
    virtualLocations: {type: Array, default: [] }
  },
  data () {
    return {
      mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle
    }
  },
  computed: {
    ...mapState(['settings']),
    online_event_only_update: {
      get () { return this.online_event_only },
      set (value) {
        this.$emit('update:onlineEvent', value)
        this.close()
      }
    },
    virtualLocations_update: {
      get () { return this.virtualLocations },
      set (value) {
        this.$emit('update:virtualLocations', value)
      }
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
  }
}
</script>
