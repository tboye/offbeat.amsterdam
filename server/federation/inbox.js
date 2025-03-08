const get = require('lodash/get')
const Follows = require('./follows')
const Resources = require('./resources')
const Events = require('./events')
const Users = require('./users')
const Ego = require('./ego')
const log = require('../log')
const { APUser, Resource } = require('../api/models/models')
const { parseAPMessage } = require('./helpers')

module.exports = async (req, res) => {
  const message = req.body

  // has to have an object and a type property..
  if (!message?.object || !message?.type) {
    log.warn('[FEDI] message without `object` or `type` property: %s', message)
    return res.status(404).send('Wrong AP message: no object or type property')
  }
  
  res.set('Content-Type', 'application/activity+json')
  log.debug('[FEDI] Type %s', message.type)
  switch (message.type) {
    case 'Follow':
      Follows.follow(req, res)
      break
    case 'Accept':
      return res.status(202).send()
    case 'Undo':
      // unfollow || unlike || unboost
      if (message.object?.type === 'Follow') {
        Follows.unfollow(req, res)
      } else if (message.object?.type === 'Like') {
        Ego.unbookmark(req, res)
      } else if (message.object?.type === 'Announce') {
        Ego.unboost(req, res)
      } else {
        log.warn('[FEDI] Undo Activity for unsupported Object: %s', JSON.stringify(message.object))
        return res.status(400).send('Undo Activity for unsupported Object')
      }
      break
    case 'Announce':
      log.debug(`[FEDI] Announce incoming from ${res.locals.fedi_user.ap_id}`)
      await parseAPMessage(message, res.locals.fedi_user)
      return res.status(201).send()
    case 'Note':
      log.debug('[FEDI] Direct Note Activity is not supported: %s', JSON.stringify(message.object))
      break
    case 'Like':
      Ego.bookmark(req, res)
      break
    case 'Delete':
      if (message.object?.type === 'Tombstone') {
        message.object.type = message.object?.formerType ?? 'Tombstone'
      }
      if (message.object?.type==='Note') {
        await Resources.remove(req, res)
      } else if (message.object?.type === 'Event') {
        await Events.remove(req, res)
      } else {
        const ap_id = get(req.body, 'object.id', req.body.object)
        const ap_actor = await APUser.findOne({ where: { ap_id }})
        if (ap_actor) {
          await Users.remove(req, res)
        } else {
          const resource = await Resource.findOne({ where: { activitypub_id: ap_id }})
          if (resource) {
            await Resources.remove(req, res)
          }
        }
      }
      break
    case 'Update':
      if (message.object?.type === 'Event') {
        log.debug(`[FEDI] Event update is coming from ${res.locals.fedi_user.ap_id}`)
        await Events.update(req, res)
      } else if (message.object?.type === 'Note') {
        log.debug('[FEDI] Note update is coming from %s', res.locals.fedi_user.ap_id)
        await Resources.update(req, res)
      } else {
        log.debug('[FEDI] Update unsupported Object: %s', JSON.stringify(message?.object))
      }
      break
    case 'Create':
      // this is a reply
      if (message.object?.type === 'Note') {
        await Resources.create(req, res)
      } else if (message.object?.type === 'Event') {
        log.debug(`[FEDI] Create Activity with Event type incoming from ${res.locals.fedi_user.ap_id}`)
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.trusted) {
          log.warn(`[FEDI] APUser not followed or not trusted`)
          return res.sendStatus(404)
        }
        await parseAPMessage(message, res.locals.fedi_user)
        return res.status(201).send()
      } else {
        log.warn('[FEDI] Create unsupported Object => %s', JSON.stringify(message?.object))
        return res.sendStatus(404)
      }
      break
    default:
      log.error('[FEDI] Unknown message type: %s', message?.type)
      res.sendStatus(404)
  }
}
