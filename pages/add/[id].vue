<!-- Add / Edit event

 -->
<script setup lang="ts">
import { Tag } from '#build/types/nitro-imports';

const event = ref({ title: '', tags: [] })

const valid = ref(false)
const edit = ref(false)
const loading = ref(false)

const openImportDialog = ref(false)
const searchTag = ref('')

const { data: tags, status: statusTags } = await useFetch<Tag[]>('/api/tags', { params: { query: searchTag }})

function done () {

}
</script>
<template>
  <v-container class="pa-0 pa-md-3">
    <v-card>
      <v-card-title>
        <v-btn class='float-right' color='primary' @click='openImportDialog = true' prepend-icon="mdi-file-import">{{$t('common.import')}}</v-btn>
        <h4>{{ edit ? $t('common.edit_event') : $t('common.add_event') }}</h4>
      </v-card-title>
      <v-dialog v-model='openImportDialog' :fullscreen='$vuetify.display.mobile'>
        <!-- <ImportDialog(@close='openImportDialog = false' @imported='eventImported') -->
      </v-dialog>
      <v-card-text class='px-0 px-xs-2'>
        <v-form v-model='valid' ref='form' lazy-validation>
          <v-container>
            <v-row>
              <!-- Not logged event -->
              <v-col v-if='!$auth?.loggedIn' cols=12>
                <p v-html="$t('event.anon_description')" />
              </v-col>

              <!-- Title -->
              <v-col cols=12>
                <!-- @change='v => event?.title = v'
                :value = 'event?.title' -->
                <v-text-field v-model="event.title"
                prepend-icon='mdi-format-title'
                :label="$t('common.title')"
                :rules="[$valid.required('common.title')]"
                autofocus ref='title' />
                </v-col>


              <!-- TAGS -->
              <v-col cols=12 md=6>
                <span>{{tags}} - {{ searchTag }} - {{ statusTags}}</span>
                <v-combobox
                  v-model:search="searchTag"
                  v-model="event.tags"
                  prepend-icon="mdi-tag-multiple"
                  chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
                  cache-items
                  :loading="statusTags === 'pending'"
                  :delimiters="[',', ';']"
                  :items="tags"
                  :menu-props="{ maxWidth: 400, eager: true }"
                  :label="$t('common.tags')">
                  <!-- <template v-slot:selection="{ item, on, attrs, selected, parent }">
                    <v-chip v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                      :input-value="selected" label small>{{ item }}</v-chip>
                  </template> -->
                </v-combobox>
              </v-col>


            </v-row>            
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click='done' :loading='loading' :disabled='!valid || loading' outlined color='primary'>{{ edit ? $t('common.save') : $t('common.send') }}</v-btn>
      </v-card-actions>
    </v-card>
</v-container>
</template>
