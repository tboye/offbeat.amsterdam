<template lang="pug">
v-card
  v-card-title SMTP Email configuration
  v-card-text
    p(v-html="$t('admin.smtp_description')")
    v-form(v-model='isValid')

      v-text-field(v-model='admin_email'
        @blur="save('admin_email', admin_email )"
        :label="$t('admin.admin_email')"
        :hint="$t('admin.admin_email_help')"
        persistent-hint
        :rules="$validators.email")

      v-switch(v-model='smtp.sendmail'
        :label="$t('admin.smtp_use_sendmail')")

      v-row(v-if='!smtp.sendmail')
        v-col(cols=12 md=9)
          v-text-field(v-model='smtp.host'
            :label="$t('admin.smtp_hostname')"
            :rules="[$validators.required('admin.smtp_hostname')]")
        v-col(cols=12 md=3)
          v-text-field(v-model='smtp.port'
            :label="$t('admin.smtp_port')"
            :rules="[$validators.required('admin.smtp_port')]")

        v-col(cols=12)
          v-switch(v-model='smtp.secure'
            :label="$t('admin.smtp_secure')")
        
        v-col(md=6)
          v-text-field(v-model='smtp.auth.user'
            :label="$t('common.user')")

        v-col(md=6)
          v-text-field(v-model='smtp.auth.pass'
            :label="$t('common.password')"
            type='password')

  v-card-actions
    v-spacer
    v-btn(color='primary' @click='testSMTP' :loading='loading' :disabled='loading || !isValid' outlined) {{$t('admin.smtp_test_button')}}
    v-btn(color='warning' @click="done" outlined) {{$t("common.ok")}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  data ({ $store }) {
    // if ($store.state.settings.smtp) {
    //   smtp.host = $store.state.settings.smtp.host
    //   if ($store.state.settings.smtp.auth) {
    //     smtp.auth.user = $store.state.settings.smtp.auth.user
    //     smtp.auth.pass = $store.state.settings.smtp.auth.pass
    //   } else {
    //     smtp.auth = {}
    //   }
    // }
    return {
      isValid: false,
      loading: false,
      smtp: { auth: {} },
      admin_email: $store.state.settings.admin_email || ''
    }
  },
  async fetch () {
    this.smtp = await this.$axios.$get('/settings/smtp').catch(_e => ({ auth: {} }))
    if (!this.smtp.auth) {
      this.smtp.auth = {}
    }
  },
  computed: mapState(['settings']),
  watch: {
    'smtp.secure' (value) {
      console.error(this.smtp.port)
      if ([465, 587].includes(this.smtp.port) || !this.smtp.port) {
        this.smtp.port = value ? 465 : 587
      }
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async testSMTP () {
      this.loading = true
      try {
        const smtp = JSON.parse(JSON.stringify(this.smtp))
        if (!smtp.auth.user) {
          delete smtp.auth
        }
        if (!smtp.secure) {
          smtp.secure = false
          smtp.ignoreTLS = true
        }        
        // await this.setSetting({ key: 'smtp', value: JSON.parse(JSON.stringify(this.smtp)) })
        await this.$axios.$post('/settings/smtp', { smtp })
        this.$root.$message(this.$t('admin.smtp_test_success', { admin_email: this.admin_email }), { color: 'success' })
      } catch (e) {
        console.error(e)
        this.$root.$message(e.response && e.response.data, { color: 'error' })
      }
      this.loading = false
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    },    
    done () {
      const smtp = JSON.parse(JSON.stringify(this.smtp))
      if (!smtp.auth.user) {
        delete smtp.auth
      }
      if (!smtp.secure) {
        smtp.secure = false
        smtp.ignoreTLS = true
      }
      this.setSetting({ key: 'smtp', value: smtp })
      this.$emit('close')
    },

  }
}
</script>