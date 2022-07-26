<template >
  <client-only>
    <l-map id="leaflet-map" style="height: 300px" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

      <l-marker
        v-for="item in markers"
        :key="item.id"
        :lat-lng="item.position"
        :visible="item.visible"
        :draggable="item.draggable"
        @click="filterPlace(item)"
      >
      </l-marker>
    </l-map>

  </client-only>
</template>
<script>

import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import dayjs from 'dayjs';
import Event from '@/components/Event'


export default {
   components: {
     LMap,
     LTileLayer,
     LMarker,
     LPopup,
     Event
   },
   data () {
     return {
       // map
       url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
       attribution:
         '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
       zoom: 5,
       center: [42, 12],
       markers: [],
     }
   },
   mounted() {
     this.getEvents();

   },
   methods: {
     zoomUpdated (zoom) {
       this.zoom = zoom;
       console.log(this.markers)
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
           item.place.details = JSON.parse(item.place.details);
           this.addMarkers(item);
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

 @media (max-width: 600px) {
   #leaflet-map {
     width:calc(100% - 4rem);
     margin: 0 auto;
   }
  }
</style>
