const log = require('../log')
const helpers = require('../helpers')
const linkifyHtml = require('linkify-html')
const dayjs = require('dayjs')
const { Event, User, Tag, Place, APUser, Resource, EventNotification } = require('../api/models/models')
const tagController = require('../api/controller/tag')
const Helpers = require('./helpers')

module.exports = {
  
  async get (req, res) {
    const { preferHTML } = require('../helpers')
    const event_id = req.params.event_id
    const json = req.params.json
    if (preferHTML(req) && !json) {
      return res.redirect(302, `/event/${event_id}`)
    }
    const event = await Event.findByPk(req.params.event_id, { include: [User, Tag, Place] })
    if (!event) {
      log.debug(`[FEDI] Event not found - ${req.path}`)
      return res.status(404).send('Not found')
    }
  
    log.debug(`[FEDI] Get event details - ${event.slug}`)
    const eventAp = event.toAP(res.locals.settings)
    eventAp['@context'] = [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1',
      {
        toot: 'http://joinmastodon.org/ns#',
  
        // A property-value pair, e.g. representing a feature of a product or place. We use this to publish this very same instance
        // https://docs.joinmastodon.org/spec/activitypub/#PropertyValue
        schema: 'http://schema.org#',
        ProperyValue: 'schema:PropertyValue',
        value: 'schema:value',
  
        // https://docs.joinmastodon.org/spec/activitypub/#discoverable
        "discoverable": "toot:discoverable",
  
        // https://docs.joinmastodon.org/spec/activitypub/#Hashtag
        "Hashtag": "https://www.w3.org/ns/activitystreams#Hashtag",
  
        manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',
  
        // focal point - https://docs.joinmastodon.org/spec/activitypub/#focalPoint
        "focalPoint": {
          "@container": "@list",
          "@id": "toot:focalPoint"
        }
      }
    ]
  
    res.type('application/activity+json; charset=utf-8')
    return res.json(eventAp)
  },

  // create an Event from AP
  async create (req, res) {

    try {
      await Helpers.parseAPEvent(req.body, res.locals.fedi_user)
    } catch (e) {
      log.error('[FEDI] Error parsing AP Event: %s', e?.message ?? e)
      return res.status(400).send("Error parsing AP Event")
    }

    return res.sendStatus(201)

  },

  // update an event from AP
  async update (req, res) {
    const APEvent = req.body?.object

    // check if this event is new
    const ap_id = APEvent?.id ?? APEvent

    if (!ap_id) {
      log.warn('[FEDI] id not found in body.object')
      return res.sendStatus(404)
    }

    const event = await Event.findOne({ where: { ap_id }, include: [APUser]})
    if (!event) {
      log.warn('[FEDI] Event with this ap_id not found: %s', ap_id)
      return res.sendStatus(404)
    }

    // is the owner the same?
    if (res.locals.fedi_user.ap_id !== event?.ap_user?.ap_id) {
      log.error('[FEDI] Event %s updated not from the owner! %s != %s', ap_id, res.locals.fedi_user.ap_id, event?.ap_user?.ap_id)
    }

    const [ place, online_locations ] = await Place.parseAPEvent(APEvent)

    let media = []
    const image_url = APEvent?.attachment?.find(a => a?.mediaType.includes('image') && a.url)?.url
    if (image_url) {

      const file = await helpers.getImageFromURL(image_url)
      log.debug('[FEDI] Download attachment for event %s', image_url)

      media = [{
        url: file.filename,
        height: file.height,
        width: file.width,
        name: APEvent.attachment[0]?.name || APEvent.name.trim() || '',
        size: file.size || 0,
        focalpoint: APEvent.attachment[0]?.focalPoint
      }]
    }

    // create it
    event.update({
      title: APEvent.name.trim(),
      start_datetime: dayjs(APEvent.startTime).unix(),
      end_datetime: APEvent?.endTime ? dayjs(APEvent.endTime).unix() : null,
      description: helpers.sanitizeHTML(linkifyHtml(APEvent?.content ?? '', { target: '_blank', render: { email: ctx => ctx.content }})),
      online_locations,
      media,
      is_visible: true,
      ap_id,
      ap_object: APEvent,
      apUserApId: req.body.actor,
    })

    await event.setPlace(place)

    // create/assign tags
    let tags = []
    if (APEvent.tag) {
      tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name.substr(1)))
      await event.setTags(tags)
    }

    return res.status(201).send()

  },

  // remove an event from AP
  async remove (req, res) {
    const APEvent = req.body?.object
    const ap_id = APEvent?.id ?? APEvent

    if (!ap_id) {
      log.warn('[FEDI] Remove Event: missing id')
      return res.sendStatus(404)
    }

    const event = await Event.findOne({ where: { ap_id }, include: [APUser]})
    if (!event) {
      log.error('[FEDI] Event not found: %s', APEvent?.id ?? APEvent)
      return res.sendStatus(404)
    }
    
    // is the owner the same?
    if (res.locals.fedi_user.ap_id !== event?.ap_user?.ap_id) {
      log.error('[FEDI] Event %s updated not from the owner! %s != %s', ap_id, res.locales.fedi_user.ap_id, event)
    }

    if (event.media && event.media.length && !event.recurrent) {
      try {
        const old_path = path.join(config.upload_path, event.media[0].url)
        const old_thumb_path = path.join(config.upload_path, 'thumb', event.media[0].url)
        await fs.unlink(old_thumb_path)
        await fs.unlink(old_path)
      } catch (e) {
        log.info(e.toString())
      }
    }

    if (event.recurrent) {
      await Event.update({ parentId: null }, { where: { parentId: event.id } })
    }

    log.debug('[EVENT REMOVED] ' + event.title)
    try {
      // remove related resources
      await Resource.destroy({ where: { eventId: event.id }})
      
      await EventNotification.destroy({ where: { eventId: event.id }})
      // and finally remove the event
      await event.destroy()
    } catch (e) {
      log.error('[FEDI] Error removing event: %s', String(e))
      return  res.sendStatus(500)
    }

    return res.sendStatus(201)

  }

}