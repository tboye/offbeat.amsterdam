<template >
  <client-only>
    <l-map ref="mapinput" id="leaflet-map-input" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

      <l-marker
        v-for="item in markers"
        :key="item.id"
        :lat-lng="item.position"
        :visible="item.visible"
        :draggable="item.draggable"
        @click="item.place && usePlace(item)"
      >
        <l-popup >
          <p>{{item.place && item.place.name }}</p>
        </l-popup>
      </l-marker>
    </l-map>

  </client-only>
</template>
<script>

import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import dayjs from 'dayjs';
import { mapState } from 'vuex'
import { Icon } from 'leaflet';

export default {
   components: {
     LMap,
     LTileLayer,
     LMarker,
     LPopup,
   },
   data ({ $store }) {
     return {
       // map
       url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
       attribution:
         '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
       zoom: $store.state.settings.map_zoom || 5,
       center: $store.state.settings.map_center || [42, 12],
       markers: []
     }
   },
   mounted() {
     delete Icon.Default.prototype._getIconUrl;
     Icon.Default.mergeOptions({
       iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
       iconUrl: require('leaflet/dist/images/marker-icon.png'),
       shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
     });

     this.getEvents();
     this.$root.$on('addMarker', (a) => {
       if (this.$refs.mapinput) {
         this.addMarker(a)
       }
     });
     this.$root.$on('panTo', (a) => {
       if (this.$refs.mapinput) {
         this.panTo(a)
       }
     });
   },
   computed: {
     ...mapState(['settings']),
   },
   methods: {
     panTo (center) {
       this.$refs.mapinput.mapObject.panTo({lat: center[1], lng: center[0]})
     },
     zoomUpdated (zoom) {
       this.zoom = zoom;
     },
     centerUpdated (center) {
       this.center = center;
     },
     async getEvents () {
       this.events = await this.$api.getEvents({
         start: dayjs().unix(),
         show_recurrent: true
       })

       this.events.forEach((item, i) => {
         if (item.place.details !== "undefined") {
           item.place.details = JSON.parse(item.place.details);
           this.addMarkers(item);
         }
       });

     },
     addMarker(d) {
       let newMarker = [{
         id: d.properties.geocoding.osm_id,
         position: { lat: d.geometry.coordinates[1], lng: d.geometry.coordinates[0] },
         draggable: false,
         visible: true
       }]
       this.markers.push.apply(this.markers, newMarker)
       this.$refs.mapinput.mapObject.panTo({lat: d.geometry.coordinates[1], lng: d.geometry.coordinates[0]})
     },
     addMarkers(d) {
       this.event = JSON.stringify(d);

       let newMarker = [{
         id: d.id,
         title: d.title,
         event: JSON.stringify(d),
         description: d.description,
         place: d.place,
         tags: d.tags,
         multidate: d.multidate,
         start_datetime: d.start_datetime,
         end_datetime: d.end_datetime,
         position: { lat: d.place.details.geometry.coordinates[1], lng: d.place.details.geometry.coordinates[0] },
         draggable: false,
         visible: true
       }]

       this.markers.push.apply(this.markers, newMarker)
     },
     usePlace(item) {
       this.$root.$emit('inputPlace', { ...item.place })
     }
   }
}
</script>

<style>
  #leaflet-map-input {
    height: 300px;
    border-radius: .5rem;
    border: 1px solid #fff;
    z-index: 1;
  }
</style>
