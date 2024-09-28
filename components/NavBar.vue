<script setup lang="ts">
const { Settings } = useSettings()
const { isLogged } = useAuth()
</script>
<template>
    <v-tabs id='navbar' centered background-color='transparent' optional dense icons-and-text class='mt-4'>
        <!-- <v-tab v-if='isLogged || Settings.allow_anon_event' to='/add' :ripple="false"> -->
        <v-tab to='/add' :ripple="false">
            <span class='d-none d-sm-flex'>{{$t('common.add_event')}}</span>
            <v-icon color='primary' icon='mdi-plus' />
        </v-tab>
        <v-tab to='/export' :ripple="false">
            <span class='d-none d-sm-flex'>{{$t('common.share')}}</span>
            <v-icon icon='mdi-share-variant' />
        </v-tab>
    </v-tabs>    
</template>
