<template lang="pug">
v-row.justify-center.align-center
  v-col(cols="12" sm="10" md="8" lg="6" xl="6")
    v-container
      h1.title.text-center.text-uppercase.text-h4.mt-10.mx-auto.w-100
        strong.p-name.text--primary(itemprop="name") {{$t('common.about')}}
      v-card-text(v-if='$auth.user && $auth.user.is_admin')
        Editor.px-3.ma-0(v-model='about' :label="$t('common.edit')" height='500px')
      v-card-text(v-else v-html='about' class="body-1")
      v-card-actions(v-if='$auth.user && $auth.user.is_admin')
        v-spacer
        v-btn(color='primary' outlined
          @click='save') {{$t('common.save')}}
      v-btn(color='secondary' text href='https://github.com/tboye/offbeat.amsterdam' target='_blank' rel="noopener") Version {{settings.version}}
</template>
<script>
import Editor from '@/components/Editor'
import { mapState, mapActions } from 'vuex'

export default {
  components: { Editor },
  data ({ $store }) {
    return {
      about: $store.state.settings.about || this.$t('about')
    }
  },
  head () {
    return {
      htmlAttrs: {
        lang: this.settings.instance_locale
      },
      title: `${this.$t('common.about')} | ${this.settings.title}`
    }
  },
  computed: mapState(['settings']),
  methods: {
    ...mapActions(['setSetting']),
    save () {
      this.$root.$message('common.ok', { color: 'success' })
      this.setSetting({ key: 'about', value: this.about })
    }
  }
}
</script>
