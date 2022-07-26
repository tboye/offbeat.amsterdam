<template>
    <v-container id="map-container">
      <div id="map"></div>
    </v-container>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import dayjs from 'dayjs';

export default {
  name: "MapComponent",
  data() {
    return {
      map: null,
      tileLayer: null,
      marker: null,
      events: []
    }
  },
  mounted() {
    this.initMap();
    this.$root.$on('addMarker', (a) => {
      this.addMarker(a)
    });
    this.$root.$on('getEvents', () => {
      this.getEvents()
    })
  },
  methods: {
    initMap() {
      this.map = L.map("map").setView([44.45, 11.2], 10);
      this.tileLayer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
        {
          maxZoom: 18,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        }
      );
      this.tileLayer.addTo(this.map);
    },
    addMarker(a) {
      // Clear markers
      if (this.marker) { this.map.removeLayer(this.marker) }
      // add markert coordinates [lat, lon]
      this.marker = L.marker([a.geometry.coordinates[1], a.geometry.coordinates[0]], {
          // draggable: true
      }).addTo(this.map);

      this.map.panTo(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]));
    },
    getEvents() {
      return
      // Clear markers
      // this.events = await this.$api.getEvents({
      //   start: dayjs().unix(),
      //   show_recurrent: true
      // })
    }
  },
};
</script>

<style>

#map-container {
  display: flex;
  justify-content: center;
}
#map {
  height: 266px;
  width: 100%;
  max-width: 498px;
  border-radius: .5rem;
  border: 1px solid #fff;
  margin: .3rem .5rem .5rem;
  z-index: 1;
}


@media (max-width: 600px) {

  #map {
    margin: 1rem 2rem;
    padding: 0;
  }
}

</style>
