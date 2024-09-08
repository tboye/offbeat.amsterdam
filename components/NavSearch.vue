<script setup lang="ts">
import type { Collection } from '#build/types/nitro-imports';

const { Settings } = useSettings()

const route = useRoute()

const show_recurrent = ref()
const query = ref()

const show_calendar = computed(() => !Settings.value.show_calendar && ['index'].includes(route.name))
const show_search_bar = computed(() => ['index'].includes(route.name))

const { data: collections } = await useFetch<Collection[]>('/api/collections/home')

const show_collections_bar = true  // TODO

function setFilter (query: string) { 
    console.error('set filter', query)
}
</script>

<template>
    <div id="navsearch" class="mt-2 mt-sm-4" v-if='show_collections_bar || show_search_bar || show_calendar'>
        <div class="mx-2">
            <v-menu v-if='show_search_bar' offset="y" :close-on-content-click="false" tile>
                <template v-slot:activator="{ props }">
                    <v-text-field hide-details variant="outlined" v-model="query" :placeholder="$t('common.search')" @click:clear="setFilter(['query', null])"
                        @keypress:enter="setFilter(['query', query])" clearable>
                        <template v-slot:append>
                            <v-icon class="mr-2" v-if="query" icon="mdi-magnify" @click="setFilter(['query', query])"/>
                            <v-icon v-if='Settings.allow_recurrent_event || Settings.allow_multidate_event' icon='mdi-cog' v-bind='props' />
                        </template>
                    </v-text-field>
                </template>
                <v-card>
                <v-card-text>
                    <v-row dense>
                        <v-col v-if="Settings.allow_recurrent_event">
                            <v-switch class="mt-0" v-model="show_recurrent" @change="v => setFilter(['show_recurrent', v])"
                                hide-details :label="$t('event.show_recurrent')" inset />
                            </v-col>
                        </v-row>
                        <v-row v-if="show_calendar">
                            <v-col>
                                <!-- Calendar -->
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-menu>
            <span v-if="show_collections_bar">
                <v-btn class="mr-2 mt-2" small variant="outlined" v-for="collection in collections" color="primary" :key="collection.id"
                :to="`/collection/${encodeURIComponent(collection.name)}`">{{ collection.name }}</v-btn>
            </span>
            
            <!-- Calendar -->
            
        </div>
    </div> 
</template>

<style>
#navsearch {
margin: 0 auto;
max-width: 700px;
}
</style>