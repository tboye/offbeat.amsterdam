const express = require('express')
const router = express.Router()
const Users = require('./users')
const Places = require('./places')
const Events = require('./events')
const Inbox = require('./inbox')
const log = require('../log')

const { verifySignature } = require('./helpers')
const { HttpError } = require('../helpers')

/**
 * Federation is calling!
 * ref: https://www.w3.org/TR/activitypub/#Overview
 */

// middleware to check if federation is enabled
router.use((_req, res, next) => {
  if (res.locals.settings.enable_federation) {
    return next()
  }
  log.debug('[FEDI] Federation disabled!')
  return res.status(401).send('Federation disabled')
})

// parse JSON body
router.use(express.json({ type: ['application/json', 'application/activity+json', 'application/ld+json'] }))

router.get('/m/:event_id:json(.json)?', Events.get)

// get any message coming from federation
router.post('/u/:name/inbox', verifySignature, Inbox)

router.get('/u/:name/outbox', Users.outbox)
// router.get('/u/:name/followers', Users.followers)

router.get('/u/:name', Users.get)

router.get('/p/:id', Places.get)

// Handle 404
router.use((req, res) => {
  log.warn(`[FEDI] 404 Page not found: ${req.path}`)
  res.status(404).send('404: Page not Found')
})

router.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    log.warn(err.message)
    res.status(err.status).send(err.message)
  } else {
    log.error(err);
    res.status(501).send('Internal Server Error')
  }
})

module.exports = router
