<template>
  <v-container>
    <v-card>
      <v-card-title class='text-h4 font-weight-bold'>{{ page.title }}</v-card-title>
      <v-card-text v-html='page.content' />
    </v-card>
  </v-container>
</template>
<script>
import { mapState } from 'vuex'
  
  export default {
    name: 'Page',
    async asyncData ({ params, error, $axios }) {
      try {
        const page = await $axios.$get(`/pages/${params.slug}`)
        if (!page) {
          error({ statusCode: 404, message: 'Page not found' })
        }
        return { page }
      } catch (e) {
        console.error(e)
        error({ statusCode: 404, message: 'Page not found' })
      }
    },
    data () {
      return { page: { title: '' } }
    },
    head () {
      if (!this.page) {
        return {}
      }
      return {
        htmlAttrs: {
          lang: this.settings.instance_locale
        },
        title: `${this.settings.title} - ${this.page.title}`
      }
    },
    computed: mapState(['settings'])
  }
  </script>
  