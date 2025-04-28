<template lang="pug">
v-container
  v-card-title {{$t('common.settings')}}
  v-card-text

    v-text-field(v-model='title'
      :label="$t('common.title')"
      :hint="$t('admin.title_description')"
      :rules="[$validators.required('common.title')]"
      @blur='save("title", title)'
      persistent-hint)

    v-text-field.mt-5(v-model='instance_name'
      v-if='setup'
      :label="$t('admin.instance_name')"
      :rules="$validators.ap_handler"
      :hint="$t('admin.instance_name_help', { ap_handler })"
      @blur='save("instance_name", instance_name)'
      persistent-hint)

    v-text-field.mt-5(v-model='description'
      :label="$t('common.description')"
      :hint="$t('admin.description_description')"
      persistent-hint
      @blur='save("description", description)')

    //- select timezone
    v-autocomplete.mt-5(v-model='instance_timezone'
      :label="$t('admin.select_instance_timezone')"
      :hint="$t('admin.instance_timezone_description')"
      :items="filteredTimezones"
      persistent-hint
      placeholder='Timezone, type to search')

    v-select.mt-5(
      v-model='instance_locale'
      :label="$t('admin.instance_locale')"
      :hint="$t('admin.instance_locale_description')"
      persistent-hint
      :items='locales'
    )

    v-select.mt-5(
      v-model='calendar_first_day_of_week'
      :label="$t('admin.calendar_first_day_of_week')"
      :hint="$t('admin.calendar_first_day_of_week_description')"
      persistent-hint
      :items='calendar_week_days'
    )

    v-switch.mt-4(v-model='allow_registration'
      inset
      :label="$t('admin.allow_registration_description')")

    v-switch.mt-1(v-model='allow_anon_event'
      inset
      :label="$t('admin.allow_anon_event')")

    v-switch.mt-1(v-model='allow_multidate_event'
      inset
      :label="$t('admin.allow_multidate_event')")

    v-switch.mt-1(v-model='allow_recurrent_event'
      inset
      :label="$t('admin.allow_recurrent_event')")

    v-switch.mt-1(v-if='allow_recurrent_event'
      v-model='recurrent_event_visible'
      inset
      :label="$t('admin.recurrent_event_visible')")

    v-switch.mt-1(v-model='allow_event_without_end_time'
      inset
      :label="$t('admin.allow_event_without_end_time')")

    v-switch.mt-1(v-model='allow_online_event'
      inset
      :label="$t('admin.allow_online_event')")

    v-switch.mt-4(v-model='allow_geolocation'
      inset
      persistent-hint
      :hint="$t('admin.allow_geolocation_hint')"
      :label="$t('admin.allow_geolocation')")

    v-switch.mt-4(v-model='show_download_media'
      inset
      persistent-hint
      :hint="$t('admin.show_download_media_hint')"
      :label="$t('admin.show_download_media')")

    v-switch.mt-4(v-model='enable_moderation'
      inset
      persistent-hint
      :hint="$t('admin.enable_moderation_hint')"
      :label="$t('admin.enable_moderation')")

    v-switch.mt-4(v-model='enable_report'
      v-if="enable_moderation"
      inset
      persistent-hint
      :hint="$t('admin.enable_report_hint')"
      :label="$t('admin.enable_report')")

  v-dialog(v-model='showSMTP' destroy-on-close max-width='700px' :fullscreen='$vuetify.breakpoint.xsOnly')
    SMTP(@close='showSMTP = false')

  v-card-actions
    v-btn(outlined @click='showSMTP=true' color='primary')
      <v-icon v-if='!settings.admin_email' color='error' class="mr-2" v-text='mdiAlert'></v-icon> {{$t('admin.show_smtp_setup')}}

  v-btn(text @click='$emit("complete")' color='primary' v-if='setup') {{$t('common.next')}}
    v-icon(v-text='mdiArrowRight')

</template>
<script>
import SMTP from './SMTP.vue'
import Geolocation from './Geolocation.vue'
import { mapActions, mapState } from 'vuex'
import { DateTime } from 'luxon'
import tzNames from './tz.json'
import { mdiAlert, mdiArrowRight, mdiMap } from '@mdi/js'
const locales = require('../../locales/index')

export default {
  props: {
    setup: { type: Boolean, default: false }
  },
  components: { SMTP, Geolocation },
  name: 'Settings',
  data ({ $store }) {
    return {
      mdiAlert, mdiArrowRight, mdiMap,
      title: $store.state.settings.title,
      description: $store.state.settings.description,
      instance_name: 'events',
      locales: Object.keys(locales).map(locale => ({ value: locale, text: locales[locale] })),
      showSMTP: false,
      showGeolocationConfigs: false,
    }
  },
  computed: {
    ...mapState(['settings']),
    calendar_week_days () {
      return [
        { value: null, text: this.$i18n.t('admin.calendar_first_day_of_week_default') },
        // TODO: could be refactored with luxon Info utils: Info.weekdays('long', {  locale: this.$i18n.locale } )[6] }
        { value: 1, text: DateTime.fromISO('1970-01-04T00:00:00.000Z').toFormat('EEEE', { locale: this.$i18n.locale })},
        { value: 2, text: DateTime.fromISO('1970-01-05T00:00:00.000Z').toFormat('EEEE', { locale: this.$i18n.locale })},
        { value: 7, text: DateTime.fromISO('1970-01-03T00:00:00.000Z').toFormat('EEEE', { locale: this.$i18n.locale })},
      ]
    },
    ap_handler () {
      return `@${this.instance_name}@${this.settings.hostname}`
    },
    instance_locale: {
      get () { return this.settings.instance_locale },
      set (value) { this.setSetting({ key: 'instance_locale', value }) }
    },
    instance_timezone: {
      get () { return this.settings.instance_timezone },
      set (value) { this.setSetting({ key: 'instance_timezone', value }) }
    },
    allow_registration: {
      get () { return this.settings.allow_registration },
      set (value) { this.setSetting({ key: 'allow_registration', value }) }
    },
    allow_anon_event: {
      get () { return this.settings.allow_anon_event },
      set (value) { this.setSetting({ key: 'allow_anon_event', value }) }
    },
    allow_recurrent_event: {
      get () { return this.settings.allow_recurrent_event },
      set (value) { this.setSetting({ key: 'allow_recurrent_event', value }) }
    },
    allow_event_without_end_time: {
      get () { return this.settings.allow_event_without_end_time },
      set (value) { this.setSetting({ key: 'allow_event_without_end_time', value }) }
    },
    allow_multidate_event: {
      get () { return this.settings.allow_multidate_event },
      set (value) { this.setSetting({ key: 'allow_multidate_event', value }) }
    },
    recurrent_event_visible: {
      get () { return this.settings.recurrent_event_visible },
      set (value) { this.setSetting({ key: 'recurrent_event_visible', value }) }
    },
    allow_geolocation: {
      get () { return this.settings.allow_geolocation },
      set (value) { this.setSetting({ key: 'allow_geolocation', value }) }
    },
    calendar_first_day_of_week: {
      get () { return this.settings.calendar_first_day_of_week },
      set (value) { this.setSetting({ key: 'calendar_first_day_of_week', value }) }
    },
    show_download_media: {
      get () { return this.settings.show_download_media },
      set (value) { this.setSetting({ key: 'show_download_media', value }) }
    },
    allow_online_event: {
      get () { return this.settings.allow_online_event },
      set (value) { this.setSetting({ key: 'allow_online_event', value }) }
    },
    enable_moderation: {
      get () { return this.settings.enable_moderation },
      set (value) { this.setSetting({ key: 'enable_moderation', value }) }
    },
    enable_report: {
      get () { return this.settings.enable_report },
      set (value) { this.setSetting({ key: 'enable_report', value }) }
    },
    filteredTimezones () {
      const current_timezone = DateTime.local().zoneName
      tzNames.unshift(current_timezone)
      return tzNames
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
