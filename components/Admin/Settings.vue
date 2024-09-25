<script setup lang="ts">
const { Settings, saveSetting } = useSettings()
function getSetting(key: string) {
    return Settings.value[key]
}
function setSetting(key: string, value: string) {
    return saveSetting(key, value)
}

const localSettings = { ...Settings.value }

</script>
<template>
    <v-container>
        <v-card-title>{{ $t('common.settings') }}</v-card-title>
        <v-card-text>
            
            <v-text-field :modelValue="getSetting('title')"
                :label="$t('common.title')"
                @update:model-value="v => setSetting('title', v)"
                :hint="$t('admin.title_description')" persistent-hint />
            
            <v-text-field class='mt-5' :modelValue="getSetting('description')"
                :label="$t('common.description')"
                @update:model-value="v => setSetting('description', v)"
                :hint="$t('admin.description_description')" persistent-hint />                

        </v-card-text>
    </v-container>
</template>