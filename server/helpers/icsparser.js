const ical = require('ical.js')
const log = require('../log')
const { status } = require('../config')

function parseIcsData(icsText, includePastEvents = true) {
  const ret = ical.parse(icsText)
  const component = new ical.Component(ret)
  const events = component.getAllSubcomponents('vevent')

  // TODO: Filter events based on includePastEvents
  // TODO: Handle received not ics Text

  log.debug(`[ICS-PARSER] Found ${events.length} event(s)`)

  const now = Math.floor(Date.now() / 1000)

  return events
    .map(eventData => {
      const event = new ical.Event(eventData)

      // Check if optional organizer is present (RFC 5545:
      // "This property is OPTIONAL and MAY appear in an iCalendar object
      //  that specifies a group-scheduled calendar entity.")
      const organizerProp = event.component.getFirstProperty('organizer')
      const organizer = organizerProp
        ? {
            name: organizerProp.getParameter('cn') || '',
            email: (organizerProp.getFirstValue() || '').replace(/^mailto:/i, '')
          }
        : null

      return {
        title: event.summary || '',
        description: event.description || '',
        organizer, // contains { name, email } or null
        status: event.status || status,
        uid: event.uid || '',
        location: event.location || '',
        start_datetime: event.startDate.toUnixTime(),
        end_datetime: event.endDate.toUnixTime(),
        modified: event.lastModified?.toUnixTime() || '',
        is_visible: true
      }

    }
  )
}

module.exports = { parseIcsData }
