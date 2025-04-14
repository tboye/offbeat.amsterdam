/**
 * This is a beta ics feed importer
 */

const ical = require('ical.js')
const get = require('lodash/get')

const plugin = {
  configuration: {
    name: 'Feed',
    author: 'lesion',
    url: 'https://framagit.org/les/gancio',
    description: 'Get events from a specified ics feed, this is a beta release of this plugin: you can specify only a single feed, images are not imported from ics, event location are taken as is as are not structured in ics, read the code',
    settings: {
      refresh_minutes: {
        type: 'NUMBER',
        description: 'Refresh the feed each n. minutes',
        required: true,
        hint: '60 minutes?'
      },
      feed_URL: {
        type: 'TEXT',
        description: 'ICS feed URL',
        required: true,
        hint: 'Check it before'
      },
      add_tag: {
        type: 'TEXT',
        description: 'Add this tag to each imported event',
        required: false,
      }
    }
  },

  gancio: null, // { helpers, log, settings }
  log: null,
  settings: null,
  db: null,
  interval: null,
  ETag: null,

  load(gancio, settings) {
    plugin.gancio = gancio // contains all gancio settings, including all plugins settings
    plugin.log = gancio.log // just the logger
    plugin.db = gancio.db
    plugin.settings = settings // this plugin settings

    plugin.log.info("Feed plugin loaded!")

    // TODO: could use the TaskManager?
    plugin.interval = setInterval(this._tick, settings.refresh_minutes*1000*60)
    this._tick()
  },

  unload () {
    plugin.log.debug('[FEED Plugin] Clear interval an unload plugin')
    clearInterval(plugin.interval)
  },

  onTest () {
    plugin._tick()
  },

  async _tick () {
    if (!plugin.settings?.feed_URL) {
      plugin.log.warning('[FEED Plugin] feed URL is required!')
      clearInterval(plugin.interval)
      return
    }

    plugin.log.debug(`[FEED Plugin] Fetching ${plugin.settings?.feed_URL}`)
    try {
      let ics = await fetch(plugin.settings?.feed_URL,
        { headers: {
          Accept: 'text/calendar',
          ...(plugin.ETag && { ETag: plugin.ETag } )
        }})
        .catch(e => plugin.log.error(`[FEED Plugin] Error fetching "${plugin.settings?.feed_URL}": ${String(e)}`))


      plugin.ETag = ics.headers?.etag
      const ret = ical.parse(await ics.text())
      const component = new ical.Component(ret)
      const events = component.getAllSubcomponents('vevent')

      plugin.log.info(`[FEED Plugin] Parsing ${events.length} events from ${plugin.settings.feed_URL}`)

      await events.forEach(async e => {
        const event = new ical.Event(e)

        // TODO: parse GEO => latitude/longiture field?
        // TODO: parse CATEGORY => tags field?
        const evt = {
          title: get(event, 'summary', ''),
          description: get(event, 'description', ''),
          start_datetime: get(event, 'startDate', '').toUnixTime(),
          end_datetime: get(event, 'endDate', '').toUnixTime(),
          is_visible: true
        }

        // search for an event with the same title / start_datetime to avoid duplication (should use ics uuid but where to store it?)
        const exists = await plugin.db.models.event.findOne({ where: { title: evt.title, start_datetime: evt.start_datetime }})
        if (exists) {
          plugin.log.debug(`[FEED Plugin] Event ${evt.title} already exists, do not add it`)
          return
        }
        plugin.log.debug(`[FEED Plugin] Adding event: ${evt.title} `)

        const address = event.location
        if (!address) {
          plugin.log.debug(`[FEED Plugin] No location found in this event ${evt.title}`)
          return
        }

        // Create a new event
        // TODO [image]: ics could not embed images (ok you can use ATTACH but it is not supported by the used library, see https://github.com/adamgibbons/ics/issues/194,
        // we could visit the original event's url and get the image from there via opengraph with some fallback
        try {
          // TODO [place]: how we should create a place? in ics the location field is just a string, should we query nominatim?
          let place = await plugin.db.models.place.findOne({ where: { address }})
          if (!place) {
            plugin.log.info(`[FEED Plugin] Create a new place: ${address}`)
            place = await plugin.db.models.place.create({ name: address, address })
          }
          const dbEvent = await plugin.db.models.event.create(evt)
          plugin.log.debug(`[FEED Plugin] Create event ${dbEvent.title} @ ${place.name}`)
          dbEvent.setPlace(place)
        } catch (e) {
          console.error(e, String(e))
        }
      })

    } catch (e) {
      plugin.log.error(`[FEED Plugin] Error parsing ics "${plugin.settings?.feed_URL}": ${String(e)}`)
    }

  }
}

module.exports = plugin
