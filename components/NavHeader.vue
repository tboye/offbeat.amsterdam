<template>
    <div class='d-flex pa-4'>
        <v-btn icon large nuxt to='/' variant="text">
            <img src='/static/logo.png' height='40' />
        </v-btn>
        
        <v-spacer/>
        
        <div class='d-flex'>
            <v-btn icon large href='/about' :title='$t("common.about")' :aria-label='$t("common.about")' variant="text">
                <v-icon icon='mdi-information' />
            </v-btn>
            <v-btn variant="text" icon large @click='toggleDark'>
                <v-icon icon='mdi-contrast-circle' />
            </v-btn>
            <client-only>
                <v-menu offset-y transition="slide-y-transition">
                    <template v-slot:activator="{ props }">
                        <v-btn variant="text" icon large v-bind='props' aria-label='Language' v-text="$i18n.locale" />
                    </template>
                    <v-list dense>
                        <v-list-item v-for='locale in $i18n.locales' @click.prevent.stop="$i18n.setLocale(locale.code)" :key='locale.code'>
                            <v-list-item-title v-text='locale.name' />
                        </v-list-item>
                        <v-list-item nuxt target='_blank' href='https://hosted.weblate.org/engage/gancio/'>
                            <v-list-item-subtitle v-text='$t("common.help_translate")' />
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn variant="text" slot='placeholder' large  icon arial-label='Language'>{{$i18n.locale}}</v-btn>
            </client-only> 
            
            <client-only>
                <v-menu v-if='$auth.loggedIn' offset-y transition="slide-y-transition">
                    <template v-slot:activator="{ props }">
                        <v-btn variant="text" class='mr-0' large icon v-bind='props' title='Menu' aria-label='Menu'>
                            <v-icon icon='mdi-dots-vertical' />
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item nuxt to='/settings'>
                            <template v-slot:prepend><v-icon icon='mdi-cog'></v-icon></template>
                            <v-list-item-title v-text="$t('common.settings')"/>
                        </v-list-item>
                        
                        <v-list-item nuxt to='/my_events'>
                            <template v-slot:prepend><v-icon icon='mdi-calendar-account'></v-icon></template>
                            <v-list-item-title v-text="$t('common.my_events')"/>
                        </v-list-item>
                        
                        <v-list-item v-if='$auth.user.is_admin || $auth.user.is_editor' nuxt to='/admin'>
                            <template v-slot:prepend><v-icon icon='mdi-account' /></template>
                            <v-list-item-title v-text="$t(`common.${$auth.user.role}`)" />
                        </v-list-item>
                        
                        <v-list-item @click='logout'>
                            <template v-slot:prepend><v-icon icon='mdi-logout' /></template>
                            <v-list-item-title v-text="$t('common.logout')" />
                        </v-list-item>
                    </v-list>
                </v-menu>
                <template #placeholder>
                    <v-btn variant="text" v-if='$auth.loggedIn' large icon aria-label='Menu' title='Menu'>
                        <v-icon icon='mdi-dots-vertical' />
                    </v-btn>
                </template>
            </client-only>
            
            <!-- login button -->
            <v-btn variant="text" class='mr-0' v-if='!$auth.loggedIn' large icon nuxt  to='/login' :title='$t("common.login")' :aria-label='$t("common.login")'>
                <v-icon icon='mdi-login' />
            </v-btn>
        </div>
    </div>
</template>
<script setup lang="ts">
const $i18n = { locale: 'it', locales: ['it'] }
const $auth = { loggedIn: true, user: { is_admin: true, role: 'admin', is_editor: true } }

function logout () {
    
}

function toggleDark () {
    
}
</script>