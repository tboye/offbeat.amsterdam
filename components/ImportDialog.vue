<template lang="pug">
v-card
  v-card-title {{$t('common.import')}}
  v-card-text
    p(v-html="$t('event.import_description')")
    v-form(v-model='valid' ref='form' lazy-validation @submit.prevent='importGeneric')
      v-row
        .col-xl-5.col-lg-5.col-md-7.col-sm-12.col-xs-12
          v-text-field(v-model='URL'
            :label="$t('common.url')"
            :hint="$t('event.import_URL')"
            persistent-hint
            :loading='loading' :error='error'
            :error-messages='errorMessage')
        .col
          v-file-input(
            :prepend-icon='mdiAttachment'
            v-model='file'
            accept=".ics"
            :label="$t('event.ics')"
            :hint="$t('event.import_ICS')"
            persistent-hint)

  v-card-actions
    v-spacer
    v-btn(outlined @click='$emit("close")' color='warning') {{$t('common.cancel')}}
    v-btn(outlined @click='importGeneric' :loading='loading' :disabled='loading'
      color='primary') {{$t('common.import')}}

</template>
<script>
import { mdiAttachment } from '@mdi/js'
import get from 'lodash/get'


export default {
  name: 'ImportDialog',
  data () {
    return {
      mdiAttachment,
      file: null,
      errorMessage: '',
      error: false,
      loading: false,
      valid: false,
      URL: '',
      event: {}
    }
  },
  methods: {
    importGeneric () {
      if (this.file) {
        this.importICS()
      } else {
        this.importURL()
      }
    },
    importICS () {
      const reader = new FileReader()
      reader.readAsText(this.file)
      reader.onload = async () => {
        try {
          const response = await this.$axios.post('/ics-import', {
            icsText: reader.result
          })

          const events = response.data.events || []

          if (!events.length) {
            this.error = true
            this.errorMessage = this.$t('event.import_error')
            return
          }
          // TODO: Inform the user if there are multiple events rather than just taking the first one
          this.event = events[0]
          // No Place object yet, so create a guess draft for the ui
          this.event.place = {
            name: this.event.location || 'Unknown Location'
  }

          this.$emit('imported', this.event)
        } catch (e) {
          this.error = true
          this.errorMessage = this.$t('event.import_error') + ': ' + (e.message || e)
        }
      }
    }
,
    async importURL () {
      if (!this.URL) {
        this.errorMessage = this.$validators.required('common.url')('')
        this.error = true
        return
      }
      if (!this.URL.match(/^https?:\/\//)) {
        this.URL = `https://${this.URL}`
      }
      this.error = false
      this.errorMessage = ''
      this.loading = true

      try {
        const ret = await this.$axios.$get('/event/import', { params: { URL: this.URL } })
        this.events = ret
        // check if contain an h-event
        this.$emit('imported', ret[0])
      } catch (e) {
        this.error = true
        this.errorMessage = String(e)
      }

      this.loading = false
    }
  }
}
</script>
