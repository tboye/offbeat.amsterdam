const nominatim = require('../../../server/services/geocoding/nominatim')
const photon = require('../../../server/services/geocoding/photon')

const geocodingProviders = [ nominatim, photon ]

const geolocation = {
  getGeocodingProvider(providerName) { return geocodingProviders.find(i => i.commonName === providerName) }
}

module.exports = geolocation