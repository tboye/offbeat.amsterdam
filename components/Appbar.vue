<template>
  <nav>
    <NavHeader />

    <!-- title -->
    <h1 v-if="$route.name === 'index'" class="text-center">
      <nuxt-link id="title" v-text="settings.title" to="/" />
      <div
        class="text-body-1 font-weight-light pb-3"
        v-html="settings?.description"
      />
    </h1>
    <div v-else class="text-center">
      <nuxt-link id="title" v-text="settings.title" to="/" />
      <div
        class="text-body-1 font-weight-light pb-3"
        v-html="settings?.description"
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
      radial-gradient(circle, #312737, transparent 60%),
      conic-gradient(from 90deg at 1px 1px, transparent 60deg, #292929 0)
      0 0/20px 20px;
}

.theme--light nav {
  background:
      radial-gradient(circle, #f3e9ff, transparent 60%),
      conic-gradient(from 90deg at 1px 1px, transparent 60deg, #fdebeb 0)
      0 0/20px 20px;
}

#title {
  word-break: break-word;
  font-size: 3.5rem;
  font-weight: 600;
  text-decoration: none;
  font-family: 'VT323', monospace !important;
}

#title::before {
  content: "[";
}

#title::after {
  content: "]";
}
</style>
