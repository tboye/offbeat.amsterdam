<template>
  <nav>
    <NavHeader />

    <!-- title -->
    <h1 v-if="$route.name === 'index'" class="text-center">
      <nuxt-link id="title" v-text="settings.title" to="/" />
      <div
        class="text-body-1 font-weight-light pb-3"
        v-text="settings?.description"
      />
    </h1>
    <div v-else class="text-center">
      <nuxt-link id="title" v-text="settings.title" to="/" />
      <div
        class="text-body-1 font-weight-light pb-3"
        v-text="settings?.description"
      />
    </div>

    <NavSearch />
    <NavBar v-if="!['event-slug','e-slug'].includes($route.name)"/>
  </nav>
</template>
<script>
import { mapState } from 'vuex'
import NavHeader from './NavHeader.vue'
import NavBar from './NavBar.vue'
import NavSearch from './NavSearch.vue'

export default {
  name: 'Appbar',
  components: { NavHeader, NavBar, NavSearch },
  computed: mapState(['settings']),
}
</script>
<style>

.theme--dark nav {
  background:
      radial-gradient(circle, rgba(48, 48, 48, 0.8), rgba(20, 20, 20, 0) 60%),
      conic-gradient(from 90deg at 1px 1px, transparent 60deg, #2e2e2e 0)
      0 0/20px 20px;
}

.theme--light nav {
  background:
      radial-gradient(circle, rgba(255, 243, 243, 0.8), rgba(255, 255, 255, 0) 60%),
      conic-gradient(from 90deg at 1px 1px, transparent 60deg, #fff3f3 0)
      0 0/20px 20px;
}

#title {
  word-break: break-all;
  font-size: 2rem;
  font-weight: 600;
  text-decoration: none;
}
</style>
