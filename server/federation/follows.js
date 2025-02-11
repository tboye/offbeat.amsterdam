const config = require('../config')
const Helpers = require('./helpers')
const crypto = require('crypto')
const log = require('../log')
const settingsController = require('../api/controller/settings')

module.exports = {
  // follow request from fediverse
  // https://www.w3.org/wiki/ActivityPub/Primer/Follow_activity
  async follow (req, res) {
    const body = req.body
    const settings = res.locals.settings
    if (typeof body.object !== 'string') {
      log.warn(`[FEDI] Follow Activity with non string object not supported`)
      return res.status(400).send('Not supported, please set a string as object')
    }
    const username = body.object.replace(`${config.baseurl}/federation/u/`, '')
    if (username !== settings.instance_name) {
      log.warn(`[FEDI] Following the wrong user: ${username} instead of ${settings.instance_name} (could be a wrong config.baseurl)`)
      return res.status(404).send('User not found')
    }

    await res.locals.fedi_user.update({ follower: true })
    log.info(`[FEDI] Followed by ${body.actor}`)
    const guid = crypto.randomBytes(16).toString('hex')
    const message = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/${guid}`,
      type: 'Accept',
      actor: `${config.baseurl}/federation/u/${username}`,
      object: body
    }
    await Helpers.signAndSend(JSON.stringify(message), res.locals.fedi_user.object.inbox)
    res.status(200).send()
  },  

  // unfollow request from fediverse
  async unfollow (req, res) {
    const settings = res.locals.settings
    const body = req.body
    const username = body.object.object.replace(`${config.baseurl}/federation/u/`, '')
    if (username !== settings.instance_name) {
      log.warn(`[FEDI] Unfollowing wrong user: ${username} instead of ${settings.instance_name}`)
      return res.status(404).send('User not found')
    }

    await res.locals.fedi_user.update({ follower: false })
    log.info(`[FEDI] Unfollowed by ${body.actor}`)
    res.status(200).send()
  },
}
