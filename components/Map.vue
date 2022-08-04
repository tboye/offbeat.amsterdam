<template >
  <client-only>
    <l-map ref="map" id="leaflet-map" :zoom="zoom" :center="center"
      @update:center="centerUpdated"
      @update:zoom="zoomUpdated">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

      <l-marker
        v-for="item in markers"
        :key="item.id"
        :lat-lng="item.position"
        :visible="item.visible"
        :draggable="item.draggable"

      >
      <l-popup >
        <a @click="filterPlace(item)">{{item.place && item.place.name }}</a>
      </l-popup>
      </l-marker>
    </l-map>

  </client-only>
</template>
<script>

import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import dayjs from 'dayjs';
import { mapActions, mapState } from 'vuex'
import { Icon } from 'leaflet';

export default {
   components: {
     LMap,
     LTileLayer,
     LMarker,
     LPopup
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
     this.$root.$on('centerMap', () => {
       this.centerMap()
     });
     setTimeout(() => {
       this.$refs.map.mapObject.invalidateSize();
     }, 200);
   },
   computed: {
     ...mapState(['settings']),
   },
   methods: {
     ...mapActions(['setSetting']),
     async centerMap () {
       await this.setSetting({ key: 'map_center', value: this.center })
       await this.setSetting({ key: 'map_zoom', value: this.zoom })
       return
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
     filterPlace(item) {
       this.$router.push("/place/"+item.place.name);
     }
   }
}
</script>

<style>
  #leaflet-map {
    height: 300px;
    border-radius: .5rem;
    border: 1px solid #fff;
    z-index: 1;
  }
</style>
