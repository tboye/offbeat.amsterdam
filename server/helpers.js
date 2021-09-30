const ical = require('ical.js')
const settingsController = require('./api/controller/settings')
const acceptLanguage = require('accept-language')
const express = require('express')
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(timezone)

const config = require('./config')
const log = require('./log')
const pkg = require('../package.json')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const axios = require('axios')
const crypto = require('crypto')
const Microformats = require('microformat-node')
const get = require('lodash/get')

const DOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const { window } = new JSDOM('<!DOCTYPE html>')
const domPurify = DOMPurify(window)
const URL = require('url')
const locales = require('../locales')

domPurify.addHook('beforeSanitizeElements', node => {
  if (node.hasAttribute && node.hasAttribute('href')) {
    const href = node.getAttribute('href')
    const text = node.textContent

    // remove FB tracking param
    if (href.includes('fbclid=')) {
      try {
        const url = new URL.URL(href)
        url.searchParams.delete('fbclid')
        node.setAttribute('href', url.href)
        if (text.includes('fbclid=')) {
          node.textContent = url.href
        }
      } catch (e) {
        return node
      }
    }
  }
  return node
})

module.exports = {
  sanitizeHTML (html) {
    return domPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'br',
        'h6', 'b', 'a', 'li', 'ul', 'ol', 'code', 'blockquote', 'u', 's', 'strong'],
      ALLOWED_ATTR: ['href', 'target']
    })
  },

  async initSettings (req, res, next) {
    await settingsController.load()
    // initialize settings
    req.settings = settingsController.settings
    req.secretSettings = settingsController.secretSettings

    req.settings.baseurl = config.baseurl || req.protocol + '://' + req.headers.host
    req.settings.hostname = new URL.URL(req.settings.baseurl).hostname
    req.settings.title = req.settings.title || config.title
    req.settings.description = req.settings.description || config.description
    req.settings.version = pkg.version

    // select locale based on cookie and accept-language header
    const acceptedLanguages = req.headers['accept-language']
    acceptLanguage.languages(Object.keys(locales))
    req.settings.locale = acceptLanguage.get(acceptedLanguages)
    // set locale and user locale
    req.settings.user_locale = settingsController.user_locale[req.settings.locale]
    dayjs.locale(req.settings.locale)
    dayjs.tz.setDefault(req.settings.instance_timezone)
    next()
  },

  serveStatic () {
    const router = express.Router()
    // serve logo, favicon, event's images/thumb
    router.use('/media/', express.static(config.upload_path))
    router.use('/noimg.svg', express.static('./static/noimg.svg'))
    
    router.use('/logo.png', (req, res, next) => {
      const logoPath = req.settings.logo || './static/gancio'
      return express.static(logoPath + '.png')(req, res, next)
    })

    router.use('/favicon.ico', (req, res, next) => {
      const faviconPath = req.settings.logo || './assets/favicon'
      return express.static(faviconPath + '.ico')(req, res, next)
    })

    return router
  },

  logRequest (req, res, next) {
    log.debug(`${req.method} ${req.path}`)
    next()
  },

  async getImageFromURL (url) {
    log.debug(`getImageFromURL ${url}`)
    const filename = crypto.randomBytes(16).toString('hex') + '.jpg'
    const finalPath = path.resolve(config.upload_path, filename)
    const thumbPath = path.resolve(config.upload_path, 'thumb', filename)
    const outStream = fs.createWriteStream(finalPath)
    const thumbStream = fs.createWriteStream(thumbPath)

    const resizer = sharp().resize(1200).jpeg({ quality: 95 })
    const thumbnailer = sharp().resize(400).jpeg({ quality: 90 })

    const response = await axios({ method: 'GET', url, responseType: 'stream' })

    return new Promise((resolve, reject) => {
      let onError = false
      const err = e => {
        if (onError) {
          return
        }
        onError = true
        reject(e)
      }

      response.data
        .pipe(thumbnailer)
        .on('error', err)
        .pipe(thumbStream)
        .on('error', err)

      response.data
        .pipe(resizer)
        .on('error', err)
        .pipe(outStream)
        .on('error', err)

      outStream.on('finish', () => resolve(filename))
    })
  },

  /**
   * Import events from url
   * It does supports ICS and H-EVENT
   */
  async importURL (req, res) {
    const URL = req.query.URL
    try {
      const response = await axios.get(URL)
      const contentType = response.headers['content-type']

      if (contentType.includes('text/html')) {
        Microformats.get({ html: response.data, filter: ['h-event'] }, (err, data) => {
          if (err || !data.items.length || !data.items[0].properties) {
            return res.sendStatus(404)
          }
          const events = data.items.map(e => {
            const props = e.properties
            const media = get(props, 'featured[0]')
            return {
              title: get(props, 'name[0]', ''),
              description: get(props, 'description[0]', ''),
              place: {
                name: get(props, 'location[0].properties.name', '') || get(props, 'location[0]'),
                address: get(props, 'location[0].properties.street-address')
              },
              start_datetime: dayjs(get(props, 'start[0]', '')).unix(),
              end_datetime: dayjs(get(props, 'end[0]', '')).unix(),
              tags: get(props, 'category', []),
              media: media ? [{ name: get(props, 'name[0]', ''), url: get(props, 'featured[0]'), focalpoint: [0, 0] }] : []
            }
          })
          return res.json(events)
        })
      } else if (contentType.includes('text/calendar')) {
        const ret = ical.parse(response.data)
        const component = new ical.Component(ret)
        const events = component.getAllSubcomponents('vevent')
        return res.json(events.map(e => {
          const event = new ical.Event(e)
          return {
            title: get(event, 'summary', ''),
            description: get(event, 'description', ''),
            place: get(event, 'location', ''),
            start: get(event, 'dtstart', ''),
            end: get(event, 'dtend', '')
          }
        }))
      }
    } catch (e) {
      log.error('[Import URL]', e)
      res.status(400).json(e.toString())
    }
  },

  getWeekdayN (date, n, weekday) {
    let cursor
    if (n === -1) {
      cursor = date.endOf('month')
      cursor = cursor.day(weekday)
      if (cursor.month() !== date.month()) {
        cursor = cursor.subtract(1, 'week')
      }
    } else {
      cursor = date.startOf('month')
      cursor = cursor.add(cursor.day() <= date.day() ? n - 1 : n, 'week')
      cursor = cursor.day(weekday)
    }
    cursor = cursor.hour(date.hour()).minute(date.minute()).second(0)
    log.debug(cursor)
    return cursor
  }

  
}
