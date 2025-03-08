const escape = require('lodash/escape')
const axios = require('axios')
const crypto = require('crypto')
const config = require('../config')
const httpSignature = require('@peertube/http-signature')
const dayjs = require('dayjs')
const url = require('url')
const settingsController = require('../api/controller/settings')
const log = require('../log')
const Ego = require('./ego')
const Place = require('./places')

const { APUser, Instance, Event } = require('../api/models/models')
const { Task, TaskManager } = require('../taskManager')
const { getImageFromURL, sanitizeHTML, NotFoundError, BadRequestError, UnauthorizedError } = require('../helpers')

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const Helpers = {

  '@context': [
    'https://www.w3.org/ns/activitystreams',
    'https://w3id.org/security/v1',
    {
      toot: 'http://joinmastodon.org/ns#',

      // A property-value pair, e.g. representing a feature of a product or place.
      // https://docs.joinmastodon.org/spec/activitypub/#PropertyValue
      schema: 'http://schema.org#',
      ProperyValue: 'schema:PropertyValue',
      value: 'schema:value',

      // https://docs.joinmastodon.org/spec/activitypub/#discoverable
      // This flag may be used as an indicator of the user’s preferences toward being included
      // in external discovery services, such as search engines or other indexing tools
      // in gancio is always true
      "discoverable": "toot:discoverable",

      // https://docs.joinmastodon.org/spec/activitypub/#Hashtag
      "Hashtag": "https://www.w3.org/ns/activitystreams#Hashtag",

      // supported but always false
      manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',

      // focal point - https://docs.joinmastodon.org/spec/activitypub/#focalPoint
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      }
    }
  ],

  // ignore unimplemented ping url from fediverse
  spamFilter (req, res, next) {
    const urlToIgnore = [
      '/api/v1/instance',
      '/api/meta',
      '/api/statusnet/version.json',
      '/api/gnusocial/version.json',
      '/api/statusnet/config.json',
      '/status.php',
      '/siteinfo.json',
      '/friendika/json',
      '/friendica/json',
      '/poco'
    ]
    if (urlToIgnore.includes(req.path)) {
      log.debug(`[FEDI] Ignore noisy fediverse ${req.path}`)
      return res.status(404).send('Not Found')
    }
    next()
  },

  async signAndSend (message, inbox, method='post') {
    log.debug('[FEDI] Sign and %s %s %s', method, message, inbox)
    const inboxUrl = new url.URL(inbox)
    const privkey = settingsController.secretSettings.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()

    let header
    let digest
    if (method === 'post') {
      digest = crypto.createHash('sha256')
        .update(message)
        .digest('base64')
      const stringToSign = `(request-target): post ${inboxUrl.pathname}\nhost: ${inboxUrl.hostname}\ndate: ${d.toUTCString()}\ndigest: SHA-256=${digest}`
      signer.update(stringToSign)
      signer.end()
      const signature = signer.sign(privkey)
      const signature_b64 = signature.toString('base64')
      header = `keyId="${config.baseurl}/federation/u/${settingsController.settings.instance_name}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature_b64}"`
    } else {
      const stringToSign = `(request-target): get ${inboxUrl.pathname}\nhost: ${inboxUrl.hostname}\ndate: ${d.toUTCString()}`
      signer.update(stringToSign)
      signer.end()
      const signature = signer.sign(privkey)
      const signature_b64 = signature.toString('base64')
      header = `keyId="${config.baseurl}/federation/u/${settingsController.settings.instance_name}#main-key",algorithm="rsa-sha256",headers="(request-target) host date",signature="${signature_b64}"`
    }
    try {
      const ret = await axios(inbox, {
        headers: {
          Host: inboxUrl.hostname,
          Date: d.toUTCString(),
          Signature: header,
          ...(method === 'post' && ({ Digest: `SHA-256=${digest}` })),
          'Content-Type': 'application/activity+json',
          Accept: 'application/activity+json'
        },
        method,
        ...( method === 'post' && ({ data: message}))
      })

      // check if content-type is json
      if (!ret?.headers?.['content-type']?.includes('json')) {
        log.error(`[FEDI] Error in sign and send, wrong content-type returned: ${ret.headers['content-type']} - status: ${ret.status}`)
        return
      }

      log.debug(`[FEDI] signed ${ret.status} => ${ret?.headers?.['content-type']}`)
      return ret.data
    } catch (e) {
      log.error("[FEDI] Error in sign and send [%s]: %s", inbox, e?.response?.data?.error ?? e?.response?.statusMessage ?? '' + ' ' + String(e))
      throw e
    }
  },

  async sendEvent (event, type = 'Create') {
    if (!settingsController.settings.enable_federation) {
      log.info('[FEDI] Event not sent, federation is disabled')
      return
    }

    const followers = await APUser.findAll({ where: { follower: true } })
    log.debug("[FEDI] Sending to %d followers: [%s]", followers.length, followers.map(f => f.ap_id).join(', '))
    const recipients = {}
    followers.forEach(follower => {
      const sharedInbox = follower?.object?.endpoints?.sharedInbox ?? follower?.object?.inbox
      if (!recipients[sharedInbox]) { recipients[sharedInbox] = [] }
      recipients[sharedInbox].push(follower.ap_id)
    })

    for (const sharedInbox in recipients) {
      log.debug(`Notify ${sharedInbox} with event ${event.title} cc => ${recipients[sharedInbox].length}`)
      const body = {
        id: `${config.baseurl}/federation/m/${event.id}#${type}-${event.updatedAt.getTime()}`,
        type,
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [...recipients[sharedInbox], `${config.baseurl}/federation/u/${settingsController.settings.instance_name}/followers`],
        actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
        object: event.toAP(settingsController.settings, recipients[sharedInbox], type)
      }

      body['@context'] = [
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
        }]

      const task = new Task({
        name: 'AP',
        method: Helpers.signAndSend,
        args: [JSON.stringify(body), sharedInbox]
      })
      TaskManager.add(task)
    
    }
  },

  async parseAPMessage (APMessage, actor) {
    
    if (APMessage.type === 'Announce' || APMessage.type === 'Create') {
      if (!APMessage?.object || !APMessage?.type) {
        log.warn('[FEDI] message without `object` or `type` property: %s', APMessage)
        throw new BadRequestError('message without `object` or `type` property')
      }
      log.debug(`[FEDI] Parsing ${APMessage.type}`)
      return Helpers.parseAPMessage(APMessage?.object, actor)
    }

    let event
    if (typeof APMessage === 'string') {
      const is_local = APMessage?.match(`${config.baseurl}/federation/m/(.*)`)
      // Announce of local event
      if (is_local) {
        return Ego.boost(APMessage, actor)
      }
    } else if (APMessage.type === 'Event') {
      event = APMessage
    } else {
      log.warn(`[FEDI] Skip AP object of type: ${APMessage.type}`)
      return false
    }

    if (!actor.following || !actor.trusted) {
      log.warn(`[FEDI] APUser not followed or not trusted`)
      return false
    }

    try {
      let tmp_actor
      if (!event) {
        // this is an announce of a remote event, let's get the actor
        event = await Helpers.signAndSend('', APMessage, 'get')
      }
      if (event?.type === 'Event') {
        if (event?.attributedTo !== actor?.ap_id) {
          log.warn(`[FEDI] Event attributedTo Actor is different from Activity Actor ${event?.attributedTo} !== ${actor?.ap_id}, keep going as I trust and follow ${actor?.ap_id}`)
          const instance = await Helpers.getInstance(event?.attributedTo)
          tmp_actor = await Helpers.getActor(event?.attributedTo, instance)
        }
        return Helpers.parseAPEvent(event, tmp_actor ?? actor)
      } else {
        log.debug(`[FEDI] Skip AP object of type ${event?.type}`)
        return false
      }
    } catch (e) {
      log.error('[FEDI] Error getting remote AP Event (%s): %s', APMessage, e?.message ?? e)
      throw new Error("Error getting remote AP Event")
    }
  },
  
  /**
   *  Event object.type
   */
  async parseAPEvent (APEvent, actor) {
      const tagController = require('../api/controller/tag')

      if (APEvent?.type !== 'Event') {
        log.warn(`[FEDI] parseAPEvent with another object type ${APEvent.type}`)
        throw new BadRequestError(`Wrong object type: ${APEvent.type}`)
      }

      // validate incoming events
      const required_fields = ['name', 'startTime', 'id', 'type']
      let missing_field = required_fields.find(required_field => !APEvent[required_field])
      if (missing_field) {
        log.warn(`[FEDI] ${missing_field} required`)
        throw new BadRequestError(`${missing_field} required`)
      }

      // check if this event is new
      const ap_id = APEvent.id
      const exists = await Event.findOne({ where: { ap_id }})
      if (exists) {
        log.warn(`[FEDI] Avoid creating a duplicated event ${ap_id} - ${config.baseurl}/event/${exists.slug}`)
        return exists
      }
  
      const [ place, online_locations ] = await Place.parseAPLocation(APEvent)
  
      let media = []
      const image_url = APEvent?.attachment?.find(a => a?.mediaType.includes('image') && a.url)?.url
      if (image_url) {
  
        const file = await getImageFromURL(image_url)
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
  
      // TODO: should skip past event?

      // create it
      const event = await Event.create({
        title: APEvent?.name?.trim() ?? '',
        start_datetime: dayjs(APEvent.startTime).unix(),
        end_datetime: APEvent?.endTime ? dayjs(APEvent.endTime).unix() : null,
        description: sanitizeHTML(APEvent?.content ?? APEvent?.summary ?? ''),
        online_locations,
        media,
        is_visible: true,
        ap_id,
        ap_object: APEvent, 
        apUserApId: actor?.ap_id ?? actor,
      })
  
      if (place) {
        await event.setPlace(place)
      }
  
      // create/assign tags
      let tags = []
      if (APEvent.tag) {
        tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name?.substr(1)))
        await event.setTags(tags)
      }
      log.debug(`[FEDI] Event created: ${config.baseurl}/event/${event.slug}`)
      return event
  },

  async followActor (actor) {
    log.debug(`[FEDI] Following actor ${actor.ap_id}`)
    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/m/${actor.ap_id}#follow`,
      type: 'Follow',
      actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
      object: actor.ap_id
    }

    await Helpers.signAndSend(JSON.stringify(body), actor.object.endpoints?.sharedInbox ?? actor.object.inbox)
    await actor.update({ following: 1 })

    // let's try to get remote outbox
    const events = await Helpers.getOutbox(actor, 10)
    if (!events) {
      log.debug('[FEDI] No outbox events for %s', actor.ap_id)
      return
    }
    
    for(const event of events) {
      await Helpers.parseAPMessage(event, actor).catch(e => log.warn(e))
    }
  },

  async getOutbox(actor, limit) {
    log.debug('[FEDI] Get %s outbox: %s', actor?.ap_id, actor?.object?.outbox)
    
    if (!actor?.object?.outbox) return
    try {
      let collection = await Helpers.signAndSend('', actor?.object?.outbox, 'get')
      // embedded collection
      if (typeof collection?.first !== 'string') {
        return collection?.first?.orderedItems ?? []
      } else if (/^https?:\/\//.test(collection?.first)) {
        collection = await Helpers.signAndSend('', collection.first, 'get')
        if (Array.isArray(collection?.orderedItems)) {
          return collection?.orderedItems ?? []
        }
      }
    } catch (e) {
      log.warn('[FEDI] getOutbox %s failed: %s', actor.ap_id, e )
      return []
    }
  },

  async unfollowActor (actor) {
    log.debug(`[FEDI] Unfollowing actor ${actor.ap_id}`)

    const object = {
      id: `${config.baseurl}/federation/m/${actor.ap_id}#follow`,
      type: 'Follow',
      object: actor.ap_id
    }
    
    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/m/${actor.ap_id}#unfollow`,
      type: 'Undo',
      actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
      object
    }
    await Helpers.signAndSend(JSON.stringify(body), actor.object.endpoints?.sharedInbox || actor.object.inbox)
    return actor.update({ following: 0 })
  },


  // get Actor from URL using GET HTTP Signature 
  async getActor (URL, instance, force = false, fail_on_not_cached = false) {
    log.debug(`[FEDI] getActor for ${URL}`)

    let fedi_user

    // try with cache first
    if (!force) {
      fedi_user = await APUser.findByPk(URL, { include: Instance })
      if (fedi_user) {
        return fedi_user
      } else if (fail_on_not_cached) {
        return false
      }
    }

    fedi_user = await Helpers.signAndSend('', URL, 'get')
    if (!fedi_user?.id) {
      log.debug('[FEDI] getActor failed for %s', URL)
      return false
    }
    if (fedi_user) {
      log.info('[FEDI] Create/Update a new AP User "%s" and associate it to instance "%s"', fedi_user?.id, instance.domain)
      try {
        ([ fedi_user ] = await APUser.upsert({ ap_id: fedi_user?.id, object: fedi_user, instanceDomain: instance.domain, blocked: false }))
      } catch (e) {
        log.debug('[FEDI] Error in update/create ')
      }
    }
    return fedi_user
  },

  async getNodeInfo (instance_url) {
      let nodeInfo = await axios.get(`${instance_url}/.well-known/nodeinfo`, { headers: { Accept: 'application/json' } })
        .then(res => res.data)
        .catch(e => {
          log.debug('[FEDI] Node %s does not support nodeInfo', instance_url)
        })
      
      if (nodeInfo?.links) {
        const supportedVersion = nodeInfo.links.find(l => l.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.1' || 'http://nodeinfo.diaspora.software/ns/schema/2.0')
        if (!supportedVersion) {
          return false
        }
        const applicationActor = nodeInfo.links.find(l => l.rel === 'https://www.w3.org/ns/activitystreams#Application')
        nodeInfo = await axios.get(supportedVersion.href).then(res => res.data)
        log.debug('[FEDI] getNodeInfo "%s", applicationActor: %s, nodeInfo: %s', instance_url, applicationActor?.href, nodeInfo)
        return { applicationActor: applicationActor?.href, nodeInfo }
      }
      throw new Error(nodeInfo)
    },

  async getInstance (actor_url, force = false, fail_on_not_cached = false) {
    log.debug(`[FEDI] getInstance for ${actor_url}`)
    actor_url = new url.URL(actor_url)
    const domain = actor_url.host
    const instance_url = `${actor_url.protocol}//${actor_url.host}`
    let instance
    if (!force) {
      instance = await Instance.findByPk(domain)
      if (instance) {
        log.debug('[FEDI] Use cached instance: %s', instance.name)
        return instance
      } else if (fail_on_not_cached) {
        return false
      }
    }

    try {
      const { applicationActor, nodeInfo } = await Helpers.getNodeInfo(instance_url).catch(e => ({ }))
      const [ instance ] = await Instance.upsert({
          name: nodeInfo?.metadata?.nodeName ?? domain,
          domain,
          data: nodeInfo ?? {},
          blocked: false,
          applicationActor
        })
      log.debug('[FEDI] Create a new instance from %s: %s %s', instance_url, instance.name, nodeInfo)
      return instance
    } catch(e) {
      log.error('[FEDI] Wrong nodeInfo returned for "%s": %s', instance_url, e?.response?.data ?? String(e))
      return false
    }
  },

  /**
   * HTTP Signature middleware
   * https://www.w3.org/wiki/SocialCG/ActivityPub/Authentication_Authorization#Signing_requests_using_HTTP_Signatures
   * Each POST to /inbox coming from fediverse has to be verified.
   * Signature checking needs Actor's public key
   */
  async verifySignature (req, res, next) {

    const name = req.params.name
    const actor_url = req?.body?.actor
    const isDelete = req?.body?.type === 'Delete'
    const settings = settingsController.settings

    if (!name) {
      log.info('[AP] Bad /inbox request')
      return res.status(400).send('Bad request.')
    }
    if (name !== settings.instance_name) {
      log.info(`[FEDI] No record found for ${name} (applicationActor is ${settings.instance_name})`)
      return res.status(404).send(`No record found for ${escape(name)}`)
    }

    // do we have an actor?
    if (!actor_url) {
      log.warn(`[FEDI] Verify Signature: No actor url or empty body`)
      return res.status(401).send('Actor not found')
    }

    // Get instance's nodeinfo
    // getting this from db if it is not the first time we interact with it
    const instance = await Helpers.getInstance(actor_url, false, isDelete)
    if (!instance) {
      log.warn(`[FEDI] Verify Signature: Instance not found ${actor_url}`)
      if (isDelete) {
        return res.sendStatus(201)
      }
      return res.status(401).send('Instance not found')
    }

    // Is this instance blocked?
    if (instance.blocked) {
      log.warn(`[FEDI] Instance ${instance.domain} blocked`)
      return res.status(401).send('Instance blocked')
    }

    // get actor
    let ap_actor = await Helpers.getActor(actor_url, instance, false, isDelete)
    if (!ap_actor) {
      log.info(`[FEDI] Actor ${actor_url} not found`)
      if (isDelete) {
        return res.sendStatus(201)
      }
      return res.status(401).send('Actor not found')
    }

    if (ap_actor.blocked) {
      log.info(`[FEDI] Actor ${ap_actor.ap_id} blocked`)
      return res.status(401).send('Actor blocked')
    }

    if (!ap_actor?.object?.publicKey?.publicKeyPem) {
      log.info(`[FEDI] Actor %s has no publicKey at %s`, ap_actor.ap_id, actor_url)
      return res.status(401).send('No public key')
    }

    res.locals.fedi_user = ap_actor

    // TODO: check Digest // cannot do this with json bodyparser
    // const digest = crypto.createHash('sha256')
    //   .update(req.body)
    //   .digest('base64')
    // if (`SHA-256=${digest}` !== req.headers.signature) {
    //   log.warn(`Signature mismatch ${req.headers.signature} - ${digest}`)
    //   return res.status(401).send('Signature mismatch')
    // }

    // another little hack :/
    // https://github.com/joyent/node-http-signature/issues/87
    req.url = '/federation' + req.url
    const parsed = httpSignature.parseRequest(req)
    if (httpSignature.verifySignature(parsed, ap_actor.object.publicKey.publicKeyPem)) { return next() }

    // signature not valid, try without cache
    ap_actor = await Helpers.getActor(actor_url, instance, true)
    if (!ap_actor) {
      log.info(`[FEDI] Actor ${actor_url} not found`)
      return res.status(401).send('Actor not found')
    }

    if (!ap_actor?.object?.publicKey?.publicKeyPem) {
      log.info(`[FEDI] Actor %s has no publicKey at %s`, ap_actor.ap_id, actor_url)
      return res.status(401).send('No public key')
    }

    if (httpSignature.verifySignature(parsed, ap_actor.object.publicKey.publicKeyPem)) {
      log.debug(`[FEDI] Valid signature from ${actor_url} `)
      return next()
    }

    // still not valid
    log.info(`[FEDI] Invalid signature from Actor ${actor_url}`)
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
