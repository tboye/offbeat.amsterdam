// const minifyTheme = require('minify-css-string').default
// import { ca, cs, de, en, es, fr, it, nl, pl, pt, tr, sk, sv, ro, ru, zhHans  } from 'vuetify/lib/locale/index.mjs'
import { ca, cs, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, tr, sk, sv, ro, ru, zhHans  } from 'vuetify/lib/locale'

import { aliases, mdi } from 'vuetify/iconsets/mdi'
export default (ctx) => {

//   const settings = process.server ? (res.locals.settings || {}) : nuxtState.state.settings || {}
//   const is_dark = nuxtState?.state?.localSettings['theme.is_dark'] ?? settings['theme.is_dark']

  return {
    lang: { locales: { ca, cs, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, sv, tr, ro, ru, zhHans } },
    // lang: { locales: { ca, cs, de, en, es, fr, it, nl, pl, pt, sk, sv, tr, ro, ru, zhHans } },
    theme: {
      options: {
        customProperties: false,
        variations: false,
        // minifyTheme,
      },
      icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
    //   dark: is_dark,
    //   themes: {
    //     dark: settings.dark_colors,
    //     light: settings.light_colors
    //   }
    },
  }
}