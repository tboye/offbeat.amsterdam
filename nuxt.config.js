const config = require('./server/config.js')
const locales = require('./locales/index')
const dns = require('node:dns')
dns.setDefaultResultOrder('ipv4first')

const isDev = (process.env.NODE_ENV !== 'production')
module.exports = {
  telemetry: false,
  modern: (process.env.NODE_ENV === 'production') && 'client',
  /*
   ** Headers of the page
   */
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
  },
  dev: isDev,
  server: config.server,


  vue: {
    config: {
      ignoredElements: ['gancio-events', 'gancio-event']
    }
  },

  css: ['./assets/style.css'],

  /*
   ** Customize the progress-bar component
   */
  loading: {
    color: 'orangered',
    height: '3px'
  }, //'~/components/Loading.vue',
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/helpers',
    '@/plugins/time', // datetime filters
    '@/plugins/axios', // axios baseurl configuration
    '@/plugins/validators', // inject validators
    '@/plugins/api', // api helpers
    '@/plugins/i18n',
    '@/plugins/formatter',
    { src: '@/plugins/v-calendar', ssr: false } // v-calendar
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/i18n',
    '~/modules/axios-proxy.js', // Note: import this before @nuxtjs/axios to override defaults of both instances: `$axios` available in context, and `axios` used in controllers
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/sitemap',
    ['cookie-universal-nuxt', { alias: 'cookies' }],
  ],

  sitemap: {
    hostname: config.baseurl,
    gzip: true,
    exclude: [
      '/Admin',
      '/settings',
      '/export',
      '/setup',
      '/Login',
      '/Authorize',
      '/my_events',
      '/Register',
      '/search'
    ],
    routes: async () => {
      const routes = [
        {
          url: '/',
          changefreq: 'daily'
        }
      ]
      if (config.status === 'READY') {
        try {
          const response = await fetch(`${config.baseurl}/api/events`)
          const events = await response.json()
          routes.push(...events.map(e => ({
            url: `/event/${e.slug}`,
            changefreq: 'weekly',
            lastmod: e.updatedAt
          })))
          return routes
        } catch (e) {
          return []
        }
      } else {
        return []
      }
    }
  },
  i18n: {
    locales: Object.keys(locales).map(key => ({
      code: key,
      name: locales[key],
      file: 'loader.js',
      language: key
    })),
    vueI18n: {
      fallbackLocale: 'en',
      silentTranslationWarn: true
    },
    langDir: 'locales',
    lazy: true,
    strategy: 'no_prefix',
    skipSettingLocaleOnNavigate: true,
    defaultLocale: 'en',
  },
  render: {
    static: {
      maxAge: "6000000"
    }
  },

  serverMiddleware: ['server/routes'],

  /*
   ** Axios module configuration
   * See https://github.com/nuxt-community/axios-module#options
   */
  axios: {
    prefix: '/api'
  },
  auth: {
    rewriteRedirects: true,
    fullPathRedirect: true,
    // localStorage: false, // https://github.com/nuxt-community/auth-module/issues/425
    cookie: {
      prefix: 'auth.',
      options: {
        sameSite: !isDev && 'Lax',
        // enable secure cookie only for https baseurl, ref #572
        secure: !isDev && /^https:/.test(config.baseurl),
        maxAge: 60 * 60 * 24 * 30 * 12 * 5
      }
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '../oauth/login',
            method: 'post',
            propertyName: 'access_token',
            withCredentials: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          },
          logout: false,
          user: { url: '/user', method: 'get', propertyName: false, autoFetch: false }
        },
        tokenRequired: true,
        tokenType: 'Bearer'
      }
    }
  },
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    treeShake: true,
    defaultAssets: false,
    optionsPath: './vuetify.options.js',
    customVariables: ['~/assets/variables.scss']
  },
  hooks: {
    listen(server) {
      server.keepAliveTimeout = 35000;
      server.headersTimeout = 36000;
    }
  },
  build: {
    extend(config, { isDev, isClient }) {
      // ..
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      })
      // Sets webpack's mode to development if `isDev` is true.
      if (isDev) {
        config.mode = 'development'
      }
    },
    corejs: 3,
    cache: true,
    hardSource: !isDev,
    extractCSS: !isDev,
    optimizeCSS: !isDev
  },
}
