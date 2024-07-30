export default function ({ $axios, store }) {
  if (process.client) {
    $axios.setBaseURL(store.state.settings.baseurl + '/api')
  } else {
    const config = require('../server/config')
    $axios.setBaseURL(config.baseurl + '/api')
  }
}
