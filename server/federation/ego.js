const { Event } = require('../api/models/models')
const config = require('../config')
const log = require('../log')
const { NotFoundError } = require('../helpers')

module.exports = {
  async boost (APMessage, actor) {
    const match = APMessage?.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) {
      log.debug('[FEDI] Boosted something not local: %s', APMessage)
      throw new NotFoundError('Event not found')
    }
    log.info(`[FEDI] boost ${match[1]}`)
    const event = await Event.findByPk(Number(match[1]))
    if (!event) {
      log.debug('[FEDI] Boosted event not found: %s', APMessage)
      throw new NotFoundError('Event not found')
    }

    return event.update({ boost: [...event.boost, actor] })
  },

  async unboost (req, res) {
    const APMessage = req.body?.object
    const ap_id = APMessage?.object?.object ?? APMessage?.object
    log.info(`[FEDI] Unboost ${ap_id}`)
    const match = ap_id?.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) {
      // unboost remote event
      const event = await Event.findOne({ where: { ap_id } })
      if (!event) { return res.status(404).send('Event not found!') }
      await event.destroy()
    } else {
      const event = await Event.findByPk(Number(match[1]))
      if (!event) { return res.status(404).send('Event not found!') }
      await event.update({ boost: event.boost.filter(actor => actor !== req.body.actor) })
    }
  },

  async bookmark (req, res) {
    const match = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) {
      log.debug('[FEDI] No match for bookmark: %s', JSON.stringify(req.body))
      return res.status(404).send('Event not found!')
    }
    const event = await Event.findByPk(Number(match[1]))
    log.info(`[FEDI] ${req.body.actor} bookmark ${event.title} (${event.likes.length})`)
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ likes: [...event.likes, req.body.actor] })
    res.sendStatus(201)
  },

  async unbookmark (req, res) {
    const body = req.body
    const object = body.object
    const match = object.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    const event = await Event.findByPk(Number(match[1]))
    log.info(`[FEDI] ${body.actor} unbookmark ${event.title} (${event.likes.length})`)
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ likes: event.likes.filter(actor => actor !== body.actor) })
    res.status(201).send()
  }
}
