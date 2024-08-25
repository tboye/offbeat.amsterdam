<script setup>

// const { serviceConfig } = useAuth()

const openSidebar = ref()
const config = useRuntimeConfig()

</script>
<template>
    <v-app>
        <!-- <CoreSideBar v-model="openSidebar" /> -->
        <!-- <CoreNavBar @toggleSidebar="openSidebar = !openSidebar" /> -->
        <v-main class="bg-blue-grey-lighten-5" style="height:100vh;overflow:auto">
            <v-container fluid class="pa-3" style="height:100%">
                <slot />
            </v-container>
        </v-main>
        <!-- <CoreDialog /> -->
        <!-- <CoreNotification /> -->
        <v-footer app height="40"><v-spacer />v.{{config.public.version}}</v-footer>
    </v-app>
</template>

