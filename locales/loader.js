export default async (context, locale) => {
  try {
    if (process.server) {
      return fetch(`${context.res.locals.settings.baseurl}/api/locale/${locale}`).then(ret => ret.json())
    } else {
      // cannot use $axios here as plugins have not yet been loaded
      return fetch(`${context.store.state.settings.baseurl}/api/locale/${locale}`).then(ret => ret.json())
    }
  } catch (e) {
    console.error(`Error loading locale ${locale}`, e)
  }

  return {}
}
