const { Place } = require('../api/models/models')
const log = require('../log')

module.exports = {
  async get (req, res) {
    const { preferHTML } = require('./helpers')
    log.debug('[FEDI] Get location')
    const id = req.params.id
    if (!id) { return res.status(400).send('Bad request.') }

    if (preferHTML(req)) {
      return res.redirect(302, `/place/${id}`)
    }
    const place = await Place.findByPk(id)
    if (!place) {
      log.warn(`[FEDI] Place ${id} not found`)
      return res.status(404).send('Not found.')
    }

    const ret = place.toAP()
    ret['@context'] = ['https://www.w3.org/ns/activitystreams']
    res.type('application/activity+json; charset=utf-8')
    res.json(ret)
  },

  /**
   * Parses the location of an ActivityPub Event to extract physical and online locations.
   * @link https://www.w3.org/TR/activitystreams-vocabulary/#places
   * @link https://codeberg.org/fediverse/fep/src/commit/4a75a1bc50bc6d19fc1e6112f02c52621bc178fe/fep/8a8e/fep-8a8e.md#location
   * @param {Object} APEvent - The ActivityPub Event object
   * @returns {Array} An array containing the Place and a list of online locations
   */
  async parseAPLocation(APEvent) {
    const eventController = require('../api/controller/event')
    let place = null

    if (!APEvent?.location) {
      log.warn(`[FEDI] Event "${APEvent?.name}" has no location field`)
      return [null, null]
    }

    const locations = Array.isArray(APEvent.location) ? APEvent.location : [APEvent.location]

    // find the first physical place from locations
    let APPlace = locations.find(location => location?.type !== 'VirtualLocation')

    // get the list of online locations
    let onlineLocations = locations.filter(location => location.type === 'VirtualLocation' && location?.url).map(location => location.url)

    // online locations could be in attachments too
    onlineLocations = onlineLocations.concat(APEvent?.attachment?.filter(a => a?.type === 'Link').map(a => a?.href).filter(a => a && !onlineLocations.includes(a)) ?? [])

    // we have a physical place
    if (APPlace) {
      place = {
        place_name: APPlace?.name,
        ...(APPlace?.id && { place_ap_id: APPlace.id }),
        ...(APPlace?.latitude && APPlace?.longitude && { place_latitude: APPlace.latitude, place_longitude: APPlace.longitude }),
      }
    // no physical but at least virtual location
    } else if (onlineLocations.length) {
      place = {
        place_name: 'online'
      }
    // nothing...
    } else {
      log.warn(`[FEDI] No Physical nor Virtual location: ${JSON.stringify(APEvent.location)}`)
      return [null, null]
    }

    // the `address` field could be Text, PostalAddress or VirtualLocation, we do support the name as a fallback
    const addr = APPlace?.address
    if (addr) {
      if (typeof addr === 'string') {
        place.place_address = addr
      } else if ( addr?.streetAddress || addr?.addressLocality || addr?.addressCountry || addr?.addressRegion ) {
        place.place_address = [ addr?.streetAddress, addr?.addressLocality, addr?.addressRegion, addr?.addressCountry].filter(part => part).join(', ')
      } else if (addr?.url) {
        place.place_name = 'online'
      } else {
        console.warn(`[FEDI] Event "${APEvent?.name}" has bad address location: ${JSON.stringify(APPlace?.address)}`)
      }
    } else {
      place.place_address = place.place_name
    }

    place = await eventController._findOrCreatePlace(place)

    if (!place) {
        throw new Error('Place not found nor created')
    }

    return [place, onlineLocations]
  },
  
}
