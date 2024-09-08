<script setup>

// const { serviceConfig } = useAuth()

const openSidebar = ref()
const config = useRuntimeConfig()

</script>
<template>
    <v-app>
        <CoreAppBar />
        <!-- <CoreSideBar v-model="openSidebar" /> -->
        <!-- <CoreNavBar @toggleSidebar="openSidebar = !openSidebar" /> -->
        <v-main>
            <slot />
        </v-main>
        <!-- <CoreDialog /> -->
        <!-- <CoreNotification /> -->
         <CoreFooter />
        <!-- <v-footer app height="40"><v-spacer />v.{{config.public.version}}</v-footer> -->
    </v-app>
</template>

