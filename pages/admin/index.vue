<script setup lang="ts">
const { isAdmin } = useAuth()
const selectedTab = ref()
</script>
<template>
    <v-container>
        <v-card>

            <!-- admin alert -->
             <AdminSetupAlert v-if="isAdmin" />

             <v-tabs v-model="selectedTab" show-arrows bg-color="primary">
                <v-tab href="#settings" v-if="isAdmin" value="settings"> {{ $t('common.settings') }}</v-tab>
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