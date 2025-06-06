<template>
  <div class='d-flex pa-4'>
    <v-btn icon large nuxt to='/'>
      <img src='/logo.png' height='40' />
    </v-btn>

    <v-spacer/>

    <div class='d-flex'>

      <v-btn icon large @click='toggleDark'>
        <v-icon v-text='mdiCircleHalfFull' />
      </v-btn>

      <client-only>
        <v-menu  offset-y transition="slide-y-transition">
          <template v-slot:activator="{ on, attrs }">
            <v-btn class='mr-0' large icon v-bind='attrs' v-on='on' title='Menu' aria-label='Menu'>
              <v-icon v-text='mdiDotsVertical' />
            </v-btn>
          </template>
          <v-list >
            <v-list-item nuxt to='/about'>
              <v-list-item-content>
                <v-list-item-title v-text="$t('common.about')"/>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-for="link in settings.footerLinks"
              :key="link.label"
              :to="link.to"
              :href="link.href"
            >
              <v-list-item-content>
                <v-list-item-title>{{ link.label }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>


            <v-list-item v-if='$auth.loggedIn' nuxt to='/settings'>
              <v-list-item-content>
                <v-list-item-title v-text="$t('common.settings')"/>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if='$auth.loggedIn' nuxt to='/my_events'>
              <v-list-item-content>
                <v-list-item-title v-text="$t('common.my_events')"/>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if='$auth.user?.is_admin || $auth.user?.is_editor' nuxt to='/admin'>
              <v-list-item-content>
                <v-list-item-title v-text="$t(`common.${$auth.user?.role}`)" />
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click='handleAuthClick'>
              <v-list-item-content>
                <v-list-item-title v-text="$auth.loggedIn ? $t('common.logout') : $t('common.login')" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        <template #placeholder>
          <v-btn large icon aria-label='Menu' title='Menu'>
            <v-icon v-text='mdiDotsVertical' />
          </v-btn>
        </template>
      </client-only>

    </div>
  </div>
</template>
<script>

import { mdiLogin, mdiDotsVertical, mdiLogout, mdiAccount, mdiCog, mdiInformation, mdiCircleHalfFull, mdiCalendarAccount } from '@mdi/js'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  data () {
    return { mdiLogin, mdiDotsVertical, mdiLogout, mdiAccount, mdiCog, mdiInformation, mdiCircleHalfFull, mdiCalendarAccount }
  },
  computed: {
    ...mapGetters(['hide_thumbs', 'is_dark']),
    ...mapState(['settings']),
  },
  methods: {
    ...mapActions(['setLocalSetting']),
    async toggleDark() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      this.setLocalSetting({ key: 'theme.is_dark', value: !this.is_dark })
    },

    handleAuthClick () {
      if (this.$auth.loggedIn) {
        this.$root.$message('common.logout_ok')
        this.$auth.logout()
      } else {
        window.location.href = '/login'
      }
    }
  },
}
</script>
