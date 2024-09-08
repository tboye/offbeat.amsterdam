<script setup lang="ts">
const { Settings } = useSettings()
const route = useRoute()

const url = useRequestURL()
const URL = `${url.protocol}://${url.host}`

const selfReachable = await useFetch('/api/reachable')

</script>
<template>
    <v-alert v-if='URL!==Settings.baseurl' rounded="0" flat type='warning' show-icon icon='mdi-alert'>
        <span v-html="$t('admin.wrong_domain_warning', { URL, baseurl: Settings.baseurl })" />
    </v-alert>
    <v-alert v-if='!selfReachable' rounded="0" flat type='warning' show-icon icon='mdi-alert'>
        <span v-html="$t('admin.not_reachable_warning', { baseurl: Settings.baseurl })" />
    </v-alert>
</template>