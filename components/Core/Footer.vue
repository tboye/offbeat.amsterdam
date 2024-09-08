<script setup lang="ts">
import type { APUser } from '~/server/utils/sequelize'

const { Settings } = useSettings()

const showFollowMe = ref(false)

const { data: trusted_instances } = await useFetch<APUser[]>('/api/ap_users/trusted')
const { data: footerLinks } = await useFetch('/api/settings/footerLinks')

</script>
<template>
    <v-footer id='footer' aria-label='Footer'>
        <v-dialog >v-model='showFollowMe' destroy-on-close max-width='700px' :fullscreen='$vuetify.breakpoint.xsOnly'>
            <!-- <FollowMe @close='showFollowMe=false' is-dialog /> -->
        </v-dialog>
       
        <v-btn v-for="link in footerLinks" :key="link?.label" color="primary" flat class="ml1"
            :href="link?.href" :to="link?.to" :target="link?.href && '_blank'">{{ link?.label }}</v-btn>


        <v-menu v-if="Settings.enable_trusted_instances && trusted_instances?.length"
            offset="left bottom" open-on-hover transition="slide-y-transition">
            <template v-slot:activator="{ props }">
                <v-btn class="ml-1" v-bind="props" color="primary" flat>{{ Settings.trusted_instances_label || $t('admin.trusted_instances_label_default') }}</v-btn>
            </template>
            <v-list lines="two" max-width="550">
                <v-list-item lines="two" v-for='instance in trusted_instances' :key="instance.ap_id" target="_blank" :href="instance?.object.url ?? instance?.ap_id">
                    <v-avatar>
                        <v-img :src="instance.object?.icon.url" />
                    </v-avatar>
                    <v-list-item-title>{{ instance?.object?.name ?? instance?.object?.preferredUsername }}</v-list-item-title>
                    <v-list-item-subtitle>{{ instance?.object?.summary }}</v-list-item-subtitle>
                </v-list-item>
            </v-list>
        </v-menu>

        <v-btn class="ml-1" v-if="Settings.enable_federation" color="primary" flat rel="me" @click.prevent="showFollowMe=true">{{ $t('event.interact_with_me') }}</v-btn>
        <v-spacer />
        <v-btn color="primary" flat href="https://gancio.org" target="_blank" rel="noopener"> Gancio <small>{{ Settings.version }}</small></v-btn>
    </v-footer>
</template>