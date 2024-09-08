<script setup lang="ts">
const { Settings } = useSettings()
function getSetting(key: string) {
    return Setting[key]
}


</script>
<template>
    <v-container>
        <v-card-title>{{ $t('common.settings') }}</v-card-title>
        <v-card-text>
            <v-text-field :modelValue="getSetting('title')"
                @update:model-value="v => setSetting('title')"
                :hint="$t('admin.title_description')" persistent-hint />
        </v-card-text>
    </v-container>
</template>