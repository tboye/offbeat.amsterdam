const express = require('express')
require('express-async-errors')
const app = express()
const initialize = require('./initialize.server')

const config = require('./config')
const helpers = require('./helpers')
const api = require('./api')

async function main () {
  const log = require('./log')

  try {
    await initialize.start()
  } catch (e) {
    log.error('[ERROR]' + e)
  }

  app.use([
    helpers.initSettings,
    helpers.logRequest,
    helpers.serveStatic()
  ])
  // const metricsController = require('./metrics')
  // const promBundle = require('express-prom-bundle')
  // const metricsMiddleware = promBundle({ includeMethod: true })

  app.enable('trust proxy')

  // do not handle all routes on setup
  if (config.status === 'READY') {
    const cors = require('cors')
    const { spamFilter } = require('./federation/helpers')
    const federation = require('./federation')
    const webfinger = require('./federation/webfinger')
    const exportController = require('./api/controller/export')
    const tagController = require('./api/controller/tag')
    const placeController = require('./api/controller/place')
    const collectionController = require('./api/controller/collection')
    const authController = require('./api/controller/oauth')

    // rss / ics feed
    app.use(helpers.feedRedirect)
    app.get('/feed/:format/tag/:tag', cors(), tagController.getEvents)
    app.get('/feed/:format/place/:placeNameOrId', cors(), placeController.getEvents)
    app.get('/feed/:format/collection/:name', cors(), collectionController.getEvents)
    app.get('/feed/:format', cors(), exportController.export)

    // federation api / activitypub / webfinger / nodeinfo
    app.use('/federation', federation)
    app.use('/.well-known', webfinger)

    // ignore unimplemented ping url from fediverse
    app.use(spamFilter)

    app.use(authController.authenticate)
    app.post('/oauth/token', authController.token)
    app.post('/oauth/login', authController.login)
    app.get('/oauth/authorize', authController.authorization)
    app.post('/oauth/authorize', authController.decision)
  }

  // api!
  app.use('/api', api())

  // redirect to ld+json AP event representation if json content-type is preferred
  app.use('/event/:slug', helpers.APEventRedirect)

  // redirect to Application Actor if json content-type is preferred
  app.use('/', helpers.APRedirect)

  // Handle 500
  app.use((err, _req, res, _next) => {
    if (err instanceof helpers.HttpError) {
      log.warn(err.message)
      res.status(err.status).send(err.message)
    } else {
      log.error(err?.stack ?? String(err))
      res.status(501).send('Internal Server Error')
    }
  })

  // remaining request goes to nuxt
  // first nuxt component is ./pages/index.vue (with ./layouts/default.vue)
  app.use(async (_req, res, next) => {
    await helpers.initLocals(res)
    res.locals.status = config.status
    next()
  })

  return app
}

if (process.env.NODE_ENV !== 'test') {
  main()
}

module.exports = {
  main,
  handler: app,
  unload: () => initialize.shutdown(false)
}
