export default defineI18nLocale(locale => $fetch(`api/locale/${locale}`))

// export default async (context: any, locale: string) => {
//   try {
//     if (process.server) {
//       return context.$axios.$get(`locale/${locale}`)
//     } else {
//       // cannot use $axios here as plugins have not yet been loaded
//       return fetch(`${window.location.origin}/api/locale/${locale}`).then(ret => ret.json())
//     }
//   } catch (e) {
//     console.error(`Error loading locale ${locale}`, e)
//   }

//   return {}
// }
