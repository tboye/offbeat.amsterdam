<template lang="pug">
v-container
  v-card-title {{$t('common.federation')}}
  v-card-text
    v-switch.mt-0(v-model='enable_federation'
      :label="$t('admin.enable_federation')"
      persistent-hint
      inset
      :hint="$t('admin.enable_federation_help')")

    template(v-if='enable_federation')

      v-switch.mt-4(v-model='federated_events_in_home'
        :label="$t('admin.federated_events_in_home')"
        :hint="$t('admin.federated_events_in_home_help')"
        persistent-hint inset)

      v-switch.mt-4(v-model='enable_resources'
        :label="$t('admin.enable_resources')"
        :hint="$t('admin.enable_resources_help')"
        persistent-hint inset)

      v-switch.mt-4(v-model='hide_boosts'
        :label="$t('admin.hide_boost_bookmark')"
        :hint="$t('admin.hide_boost_bookmark_help')"
        persistent-hint inset)

      //- v-text-field.mt-5(v-model='instance_name'
      //-   :label="$t('admin.instance_name')"
      //-   :hint="`${$t('admin.instance_name_help')} ${instance_ap_url}`"
      //-   placeholder='Instance name' persistent-hint
      //-   @blur='save("instance_name", instance_name)')

    v-combobox.mt-4(v-model='default_fedi_hashtags'
      :prepend-icon="mdiTagMultiple"
      :label="$t('admin.default_fedi_hashtags')"
      persistent-hint inset multiple
      :delimiters="[',', ';']"
      chips small-chips deletable-chips
      :hint="$t('admin.default_fedi_hashtags_help')"
      @blur='save("default_fedi_hashtags", default_fedi_hashtags)')
      template(v-slot:selection="{ item, on, attrs, selected, parent }")
                  v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
                    :input-value="selected" label small) {{ item }}


    v-text-field.mt-4(v-model='trusted_sources_label'
      :label="$t('admin.trusted_sources_label')"
      persistent-hint inset
      :placeholder="$t('admin.trusted_sources_label_default')"
      :hint="$t('admin.trusted_sources_label_help')"
      @blur='save("trusted_sources_label", trusted_sources_label)'
    )

    v-dialog(v-model='dialogAddTrustedSource' width='500px' :fullscreen='$vuetify.breakpoint.xsOnly')
      v-card
        v-card-title {{$t('admin.add_trusted_source')}}
        v-card-subtitle.mt-2(v-html="$t('admin.add_trusted_source_help')")
        v-card-text
          v-form(v-model='valid' @submit.prevent='createTrustedInstance' ref='form' lazy-validation)
            v-text-field.mt-4(v-model='source_url'
              persistent-hint
              :rules="[$validators.required('common.url')]"
              :loading='loading'
              :hint="$t('admin.add_trusted_source')"
              :label="$t('common.url')")
        v-card-actions
          v-spacer
          v-btn(outlined color='error' @click='dialogAddTrustedSource=false') {{$t('common.cancel')}}
          v-btn(outlined color='primary' :disabled='!valid || loading' :loading='loading' @click='createTrustedInstance') {{$t('common.ok')}}

    v-btn.mt-4(@click='dialogAddTrustedSource = true' color='primary' text) <v-icon v-text='mdiPlus'></v-icon> {{$t('admin.add_source')}}
    v-data-table(
      v-if='trusted_sources.length'
      dense
      :hide-default-footer='trusted_sources.length<10'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :header-props='{ sortIcon: mdiChevronDown }'
      :headers='headers'
      :items='trusted_sources')
      template(v-slot:item.logo="{item}")
        v-img(height=20 width=20 :src="item?.object?.icon?.url") 
      template(v-slot:item.name="{item}")
        span {{ item.object.name }}<br/>
        span @{{ item?.object?.preferredUsername ?? item?.instance?.data?.metadata?.nodeName}}@{{ item.instance.domain }}
      template(v-slot:item.info="{item}")
        span {{ item?.object?.summary ?? item?.instance?.data?.metadata?.nodeDescription}}
      template(v-slot:item.url="{item}")
        a(:href='item.object.url') {{ item.object.url }}
      template(v-slot:item.following="{ item }")
        v-switch(:input-value='item.following' :disabled='item.loading' :loading="item.loading === true" @change="() => toggleFollowing(item)" inset hide-details)
      template(v-slot:item.follower="{item}")
        v-icon(v-if='item.following' v-text='mdiDownload')
        v-icon(v-if='item.follower' v-text='mdiUpload')

      template(v-slot:item.actions="{item}")
        v-btn(icon @click='deleteTrustedSource(item)' color='error')
          v-icon(v-text='mdiDeleteForever')
    
  v-card-title Stats
  v-card-text
    span {{$t('admin.stats', stats)}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { mdiDeleteForever, mdiPlus, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiDownload, mdiUpload, mdiTagMultiple, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'Federation',
  data ({ $store, $options }) {
    return {
      mdiDeleteForever, mdiPlus, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiDownload, mdiUpload, mdiCloseCircle, mdiTagMultiple,
      source_url: '',
      instance_name: $store.state.settings.instance_name,
      trusted_sources_label: $store.state.settings.trusted_sources_label,
      url2host: $options.filters.url2host,
      dialogAddTrustedSource: false,
      stats: {},
      loading: false,
      trusted_sources: [],
      valid: false,
      headers: [
        { value: 'logo', text: 'Logo', width: 60, sortable: false },
        { value: 'name', text: 'Name' },
        { value: 'info', text: 'Info' },
        { value: 'url', text: 'URL' },
        { value: 'following', text: 'Following' },
        { value: 'follower', text: 'Follower' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async fetch() {
    this.stats = await this.$axios.$get('/ap_actors/stats')
    const trusted_sources = await this.$axios.$get('/ap_actors/trusted')
    this.trusted_sources = trusted_sources.map(t => {
      t.loading = false
      return t
    })
  },
  computed: {
    ...mapState(['settings']),
    enable_federation: {
      get () { return this.settings.enable_federation },
      set (value) { this.setSetting({ key: 'enable_federation', value }) }
    },
    enable_resources: {
      get () { return this.settings.enable_resources },
      set (value) { this.setSetting({ key: 'enable_resources', value }) }
    },
    federated_events_in_home: {
      get () { return this.settings.federated_events_in_home },
      set (value) { this.setSetting({ key: 'federated_events_in_home', value }) }
    },
    default_fedi_hashtags: {
      get () { return this.settings.default_fedi_hashtags },
      set (value) { this.setSetting({ key: 'default_fedi_hashtags', value }) }
    },    
    hide_boosts: {
      get () { return this.settings.hide_boosts },
      set (value) { this.setSetting({ key: 'hide_boosts', value }) }
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async createTrustedInstance () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      try {
        this.instance_url = this.instance_url.replace(/\/$/, '')
        await this.$axios.$post('/ap_actors/add_trust', { url: this.instance_url })
        this.$refs.form.reset()
        this.$fetch()
        this.dialogAddTrustedSource = false
        this.$root.$emit('update_trusted_sources')
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
      }
      this.loading = false
    },
    async deleteTrustedSource (trusted_source) {
      const ret = await this.$root.$confirm('admin.delete_trusted_source_confirm')
      if (!ret) { return }
      try {
        await this.$axios.$delete('/ap_actors/trust', { params: { ap_id: trusted_source.ap_id }})
        this.$fetch()
        this.$root.$emit('update_trusted_sources')
        this.$root.$message('admin.trusted_source_removed', { color: 'success' })
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
      }
    },
    async toggleFollowing (trusted_source) {
      try {
        trusted_source.loading = true
        await this.$axios.$put('/ap_actors/follow', { ap_id: trusted_source.ap_id })
        this.$root.$message('common.ok', { color: 'success' })
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
      }
      trusted_source.loading = false
      this.$fetch()
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
