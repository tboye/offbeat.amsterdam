<template lang='pug'>
  v-container
    v-card-title {{ $t('common.pages') }}
    v-card-subtitle(v-html="$t('admin.page_description')")
    v-dialog(v-model='dialog' width='800px' :fullscreen='$vuetify.breakpoint.xsOnly')
      v-card
        v-card-title {{ $t('admin.new_page') }}
        v-card-text.px-0
          v-form(v-model='valid' ref='page' @submit.prevent='save' lazy-validation)
            v-text-field.col-12(v-model='page.title'
              :rules="[$validators.required('common.title')]"
              :label='$t("common.title")')
            Editor.col-12(v-model='page.content' label='Content' height='250px'
              border no-save :placeholder="$t('common.description')")
        v-card-actions
          v-spacer
          v-btn(@click='dialog = false' color='error' outlined) {{ $t('common.cancel') }}
          v-btn(@click='save' color='primary' :disabled='!valid || loading' :loading='loading' outlined) {{ $t(`common.${editing ? 'save' : 'send'}`) }}
  
    v-btn(@click='openDialog' text color='primary') <v-icon v-text='mdiPlus'></v-icon> {{ $t('common.add') }}
    v-card-text
      v-data-table(
        v-if='pages.length'
        :hide-default-footer='pages.length<10'
        :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
        :header-props='{ sortIcon: mdiChevronDown }'
        :headers='headers'
        :items='pages')
        template(v-slot:item.actions='{ item }')
          <t-btn :to='`/p/${item.slug || item.id}`' :tooltip="$t('common.preview')"><v-icon v-text='mdiArrowRight' /></t-btn>
          t-btn(@click='toggle(item)' :color='item.visible ? "warning" : "success"' :tooltip="item.visible ? $t('common.disable') : $t('common.enable')")
            v-icon(v-text='item.visible ? mdiEyeOff : mdiEye')
          t-btn(@click='edit(item)' color='info' :tooltip="$t('common.edit')")
            v-icon(v-text='mdiPencil')
          t-btn(@click='remove(item)' color='error' :tooltip="$t('common.delete')")
            v-icon(v-text='mdiDeleteForever')
  </template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import Editor from '../Editor'
import Announcement from '../Announcement'
import TBtn from '../../components/TBtn.vue'

import { mdiPlus, mdiChevronRight, mdiChevronLeft, mdiChevronDown, mdiDeleteForever, mdiPencil, mdiEye, mdiEyeOff, mdiArrowRight } from '@mdi/js'

export default {
  components: { Editor, Announcement, TBtn },
  data() {
    return {
      mdiPlus, mdiChevronRight, mdiChevronLeft, mdiChevronDown, mdiDeleteForever, mdiPencil, mdiEyeOff, mdiEye, mdiArrowRight,
      valid: false,
      dialog: false,
      editing: false,
      pages: [],
      loading: false,
      headers: [
        { value: 'title', text: this.$t('common.title') },
        { value: 'actions', text: this.$t('common.actions'), align: 'right', sortable: false }
      ],
      page: { title: '', content: '' }
    }
  },
  async mounted() {
    this.pages = await this.$axios.$get('/pages')
  },
  methods: {
    edit(page) {
      this.page.title = page.title
      this.page.content = page.content
      this.page.id = page.id
      this.editing = true
      this.dialog = true
    },
    openDialog() {
      this.page = { title: '', content: '' }
      this.dialog = true
      this.$nextTick(() => this.$refs.page.reset())
    },
    async toggle(page) {
      try {
        page.visible = !page.visible
        await this.$axios.$put(`/pages/${page.id}`, page)
        this.pages = this.pages.map(a => a.id === page.id ? page : a)
        this.setPages(cloneDeep(this.pages.filter(a => a.visible)))
      } catch (e) { }
    },
    async remove(page) {
      const ret = await this.$root.$confirm('admin.delete_page_confirm', { title: page.title })
      if (!ret) { return }
      this.$axios.delete(`/pages/${page.id}`)
        .then(() => {
          this.$root.$message('admin.page_remove_ok')
          this.pages = this.pages.filter(a => a.id !== page.id)
        })
    },
    async save() {
      if (!this.$refs.page.validate()) { return }
      this.loading = true
      try {
        let page = null
        if (this.editing) {
          page = await this.$axios.$put(`/pages/${this.page.id}`, this.page)
          this.pages = this.pages.map(a => a.id === page.id ? page : a)
        } else {
          page = await this.$axios.$post('/pages', this.page)
          this.pages = this.pages.concat(page)
        }
        this.page = { title: '', content: '' }
        this.$refs.page.reset()
        this.editing = false
        this.dialog = false
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    }
  }
}
</script>  