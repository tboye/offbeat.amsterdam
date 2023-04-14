const log = require('../log')
const helpers = require('../helpers')
const linkifyHtml = require('linkify-html')
const get = require('lodash/get')
const dayjs = require('dayjs')
const eventController = require('../api/controller/event')
const { Event } = require('../api/models/models')

module.exports = {
  
  // create an Event from AP
  async create (req, res) {

    const APEvent = req.body?.object


    // check if we are following this user
    console.error(req.body)

    // 
    console.error(APEvent)

    // check if this event is new
    // const exists = await Event.findAll({ where: { }})

    const place = await eventController._findOrCreatePlace({
      place_name: APEvent.location?.name,
      place_address: APEvent.location?.address
    })

    // create it
    console.error(Event)
    const event = await Event.create({
      title: APEvent.name.trim(),
      start_datetime: dayjs(APEvent.startTime).unix(),
      description: helpers.sanitizeHTML(linkifyHtml(APEvent.content)),
      media: [],
      is_visible: true
    })

    await event.setPlace(place)
    return event

  }
}