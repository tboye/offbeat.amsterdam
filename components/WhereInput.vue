<script setup lang="ts">
const { Settings } = useSettings()
interface Place {
  name: string,
  address: string
}

const search = ref('')
const value = defineModel<Place>({ default: { name: '', address: '' }})

const { data: places = [] } = await useFetch<Place[]>('/api/places', { params: { query: search }})
</script>
<template>
<v-row class="mb-4">
  <v-col cols="12" md="4">
    <span>{{ search }}</span>
    <v-combobox ref="place" :rules="[$valid.required('common.where')]" :label="$t('common.where')" :hint="$t('event.where_description')"
      prepend-icon="mdi-map-marker" hide-no-data v-model:search="search" persistent-hint :items="places" item-title="name" item-value="id">
      <!-- <template v-slot:item="{ item, attrs, on }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-list-item-content two-line="two-line" v-if="item.create">
            <v-list-item-title><v-icon color='primary' v-text='mdiPlus' :aria-label='$t("common.add")'></v-icon> {{$t('common.add')}} <strong>{{item.name}}</strong></v-list-item-title>
          </v-list-item-content>
          <v-list-item-content two-line="two-line" v-else-if="item.online">
            <v-list-item-title><v-icon color='primary' v-text='mdiLaptopAccount' :aria-label='$t("common.online")'></v-icon> {{$t('common.online')}}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-content two-line="two-line" v-else>
            <v-list-item-title v-text="item.name"></v-list-item-title>
            <v-list-item-subtitle v-text="item.address"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template> -->
    </v-combobox>
  </v-col>
  <!-- <v-col cols="12" :md="Settings.allow_online_event?5:8" v-if="!isOnLine">
    <v-text-field class="mr-4" ref="address" v-model="value.address" :prepend-icon="mdiMap" :disabled="disableAddress" :rules="[ v => disableAddress ? true : $validators.required('common.address')(v)]" :label="$t('common.address')" :hint="$t('event.address_description')" persistent-hint="persistent-hint">
      <template v-slot:append v-if="showAdvancedDialogButton">
        <TBtn @click="whereInputAdvancedDialog = true" tooltip="admin.geolocation" small="small">
          <v-icon v-text="mdiMapSearch"></v-icon>
        </TBtn>
      </template>
    </v-text-field>
  </v-col> -->
  <!-- <v-col cols="12" :md="isOnLine?8:3" v-if="Settings.allow_online_event">
    <v-combobox class="mr-4" v-model="onlineLocations" :prepend-icon="mdiLink" :hint="$t('event.online_locations_help')" :label="$t('event.online_locations')" :rules="isOnLine ? [$validators.required('event.online_locations')] : []" clearable="clearable" chips="chips" small-chips="small-chips" multiple="multiple" deletable-chips="deletable-chips" hide-no-data="hide-no-data" hide-selected="hide-selected" persistent-hint="persistent-hint" :delimiters="[',', ';', '; ']" :items="onlineLocations" @change="selectLocations">
      <template v-slot:selection="{ item, index, on, attrs, selected, parent }">
        <v-chip v-bind="attrs" :outlined="index !== 0" close="close" :close-icon="mdiCloseCircle" @click:close="parent.selectItem(item)" :input-value="selected" label="label" small="small">{{ item }}</v-chip>
      </template>
    </v-combobox>
  </v-col> -->
  <!-- <v-dialog v-model="whereInputAdvancedDialog" destroy-on-close="destroy-on-close" max-width="700px" :fullscreen="$vuetify.display.mobile" dense="dense">
    <WhereInputAdvanced ref="whereAdvanced" :place.sync="value" :event="event" @close="whereInputAdvancedDialog = false && this.$refs.address.blur()" :onlineLocations.sync="onlineLocations" @update:onlineLocations="selectLocations"></WhereInputAdvanced>
  </v-dialog> -->
</v-row>
    
</template>
<!-- // import { mdiMap, mdiMapMarker, mdiPlus, mdiCog, mdiLink, mdiCloseCircle, mdiLaptopAccount, mdiMapSearch } from '@mdi/js'
// import { mapState } from 'vuex'
// import debounce from 'lodash/debounce'
// import WhereInputAdvanced from './WhereInputAdvanced.vue'
// import TBtn from '../components/TBtn.vue'

// export default {
//   name: 'WhereInput',
//   props: {
//     value: { type: Object, default: () => ({}) },
//     event: { type: Object, default: () => null },
//   },
//   components: { WhereInputAdvanced, TBtn },
//   data ( {$store} ) {
//     return {
//       mdiMap, mdiMapMarker, mdiPlus, mdiCog, mdiLink, mdiCloseCircle, mdiLaptopAccount, mdiMapSearch,
//       places: [],
//       place: { isNew: false, name: '' },
//       placeName: '',
//       disableAddress: true,
//       whereInputAdvancedDialog: false,
//       onlineLocations: this.event.online_locations || [],
//     }
//   },
//   computed: {
//     ...mapState(['settings']),
//     isOnLine () {
//       return this.settings.allow_online_event && this.place.name === 'online'
//     },
//     showAdvancedDialogButton () {


//       if (!this.place.name) return false
    
//       // do not show advanced dialog button in case geolocation is not allowed
//       if (!(this.settings.allow_geolocation)) {
//         return false
//       }

//       // known places already have coords
//       if (!this.place.isNew) return false

//       return true
//     }
//   },
//   mounted () {
//     this.$nextTick( () => {
//       this.search()
//     })
//   },
//   methods: {
//     search: debounce(async function(ev) {
//       const search = ev ? ev.target.value.trim().toLowerCase() : ''
//       this.places = await this.$axios.$get('place', { params: { search } }).catch()

//       // Filter out the place with name 'online' if not allowed
//       if (this.places.length) {
//         this.places = this.places.filter(p => p.name?.toLocaleLowerCase() !== 'online')
//       }
//       if (this.settings.allow_online_event) {
//         this.places.push({ online: true, name: 'online' })
//       }

//       if (!search && this.places.length) { 
//         return this.places 
//       }
//       const matches = this.places.find(p => search === p.name.toLocaleLowerCase())
//       if (!matches && search) {
//         this.places.unshift({ create: true, name: ev.target.value.trim() })
//       }
//     }, 200),
//     selectPlace (p) {
//       // force online events under place: online address: online
//       // this.event_only_online = false
//       this.place.isNew = false
//       // this.whereAdvancedId++

//       if (!p) { return }
//       if (typeof p === 'object' && !p.create && !p.online) {
//         if (p.id === this.value.id) return
//         this.place.name = p.name
//         this.place.address = p.address
//         if (this.settings.allow_geolocation) {
//           this.place.latitude = p.latitude
//           this.place.longitude = p.longitude
//         }
//         this.place.id = p.id
//         // if (this.settings.allow_event_only_online && this.place.name === 'online') {
//         //   this.event_only_online = true 
//         // }
//         this.disableAddress = true
//       } else { // this is a new place
//         this.place.isNew = true
//         this.place.name = (p.name || p).trim()
//         const tmpPlace = this.place.name.toLocaleLowerCase()
//         // search for a place with the same name
//         const place = this.places.find(p => !p.create && p.name.trim().toLocaleLowerCase() === tmpPlace)
//         if (place) {
//           this.place.name = place.name
//           this.place.id = place.id
//           this.place.address = place.address
//           this.disableAddress = true
//         } else {
//           delete this.place.id
//           this.place.address = ''
//           if (this.settings.allow_geolocation) {
//             this.place.latitude = p.latitude
//             this.place.longitude = p.longitude
//           }
//           this.disableAddress = false
//           this.$refs.place.blur()
//           this.$nextTick(() => { this.$refs.address && this.$refs.address.focus() })
//         }
//       }
//       this.$emit('input', { ...this.place })
//     },
//     selectLocations () {
//       this.event.online_locations = []

//       if (this.onlineLocations) {
//         // Insert up to 3 online location: the main one and 2 fallback
//         if (this.onlineLocations.length > 3) {
//           this.$nextTick(() => this.onlineLocations = this.onlineLocations.slice(0, 3))
//         }
//         // Remove duplicates
//         this.$nextTick(() => this.onlineLocations = [...new Set(this.onlineLocations)])
        
//         this.onlineLocations.forEach((item, i) => {
//           if (!item.startsWith('http')) { this.onlineLocations[i] = `https://${item}` }
//           this.event.online_locations[i] = this.onlineLocations[i]
//         })
//       }
//     },
//   }
// } -->
