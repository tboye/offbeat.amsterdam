import { test }from "linkifyjs"
export default defineNuxtPlugin((nuxtApp) => {

  const $t = nuxtApp.vueApp.$nuxt.$i18n.t.bind(nuxtApp.vueApp.$nuxt.$i18n)
  const validators = {
    required (fieldName: string) {
      return (v: string) => !(v===undefined || v===null || v.length <= 0) || $t('validators.required', { fieldName: $t(fieldName) })
    },
    email: [
      (v: string) => !!v || $t('validators.required', { fieldName: $t('common.email') }),
      (v: string) => (v && (v === 'admin' || !!test(v, 'email')) || $t('validators.email'))
    ],
    password: [
      (v: string) => !!v || $t('validators.required', { fieldName: $t('common.password') })
    ],
    latitude: [
      (v: number) => (v < 90 && v > -90) || $t('validators.latitude')
    ],
    longitude: [
      (v: number) => (v < 180 && v > -180) || $t('validators.longitude')
    ]
  }

  nuxtApp.provide("valid", validators)

})
