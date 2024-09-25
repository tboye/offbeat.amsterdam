<script setup lang="ts">
const { loadSettings } = useSettings()
loadSettings()
const { isAdmin } = useAuth()
const selectedTab = ref('')
</script>
<template>
    <v-container>
        <v-card>
            
            <!-- admin alert -->
            <AdminSetupAlert v-if="isAdmin" />
            <v-tabs v-model="selectedTab" show-arrows bg-color="primary">
                <!-- <v-tab href="#settings" v-if="isAdmin" value="settings"> {{ $t('common.settings') }}</v-tab> -->
                <v-tab href="#settings" value="settings"> {{ $t('common.settings') }}</v-tab>
                <v-tab href="#events" value="events"> {{ $t('common.events') }}</v-tab>
                <v-tab href="#users" value="users"> {{ $t('common.users') }}</v-tab>
                <v-tab href="#collections" value="collections"> {{ $t('common.collections') }}</v-tab>
                <v-tab href="#federation" value="federation"> {{ $t('common.federation') }}</v-tab>
                <v-tab href="#moderation" value="moderation"> {{ $t('common.moderation') }}</v-tab>
                <v-tab href="#places" value="places"> {{ $t('common.places') }}</v-tab>
                <v-tab href="#tags" value="tags"> {{ $t('common.tags') }}</v-tab>
                <v-tab href="#theme" value="theme"> {{ $t('common.theme') }}</v-tab>
                <v-tab href="#geolocation" value="geolocation"> {{ $t('common.geolocation') }}</v-tab>
                <v-tab href="#announcements" value="announcements"> {{ $t('common.announcements') }}</v-tab>
                <v-tab href="#plugins" value="plugins"> {{ $t('common.plugins') }}</v-tab>
            </v-tabs>
            
            
            <v-card-text>
                <v-tabs-window v-model="selectedTab">
                    <v-tabs-window-item value="settings">
                        <AdminSettings />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>
        </v-card>
    </v-container>
</template>