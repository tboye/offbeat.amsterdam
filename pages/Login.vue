<template>
    <v-container class='pa-0 pa-md-3'>
        <v-row class="mt-md-5 ma-0" justify='center'>
            <v-col class='pa-0 pa-md-3' cols='12' md="6" lg="5" xl="4">
                <v-form v-model='valid' ref='form' lazy-validation @submit.prevent='submit'>
                    <v-card>
                        <v-card-title>{{$t('common.login')}}</v-card-title>
                        <v-card-subtitle v-text="$t('login.description')" />
                        <v-card-text>
                            <span>{{ email }}</span>
                            <v-text-field v-model='email' validate-on-blur :rules='$valid.email'
                                autofocus :label='$t("common.email")' />
                            
                            <v-text-field v-model='password' :rules='$valid.password'
                                type='password' :label='$t("common.password")' />
                        </v-card-text>

                        <v-card-actions>
                            <v-btn text
                                tabindex="1"
                                @click='forgot' small>{{$t('login.forgot_password')}}</v-btn>
                        </v-card-actions>
                            
                        <v-card-actions>
                        <v-spacer/>
                    
                          <v-btn v-if='settings?.allow_registration'
                            to='/register'
                            text
                            color='orange'>{{$t('login.not_registered')}}</v-btn>
                    
                          <v-btn color='success'
                            type='submit' outlined
                            :disabled='!valid || loading' :loading='loading'>{{$t('common.login')}}</v-btn>
                        </v-card-actions>
                    </v-card>

                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>
    
<script setup lang="ts">
const valid = ref(false)
const email = ref('')
const password = ref('')

function submit () {
    console.error('submit')
}
</script>
