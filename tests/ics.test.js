const path = require('path')

switch (process.env.DB) {
  case 'mariadb':
    process.env.config_path = path.resolve(__dirname, './seeds/config.mariadb.json')
    break
  case 'postgresql':
    process.env.config_path = path.resolve(__dirname, './seeds/config.postgres.json')
    break
  case 'sqlite':
  default:
    process.env.config_path = path.resolve(__dirname, './seeds/config.sqlite.json')
}

const { parseIcsData } = require('../server/helpers/icsparser.js')
const request = require('supertest')
const express = require('express')
const icsController = require('../server/api/controller/ics.js')

const app = express()
app.use(express.json())

app.post('/api/ics-import', icsController.importICSFile)
app.post('/api/ics-import/url', icsController.importICSURL)


const singleEventIcs = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sample ICS Test//NONSGML v1.0//EN
BEGIN:VEVENT
UID:12345
SUMMARY:Single Event Test
DESCRIPTION:This is a single test event
LOCATION:Test Location
DTSTART:20250311T120000Z
DTEND:20250311T140000Z
END:VEVENT
END:VCALENDAR
`

const multipleEventsIcs = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sample ICS Test//NONSGML v1.0//EN
BEGIN:VEVENT
UID:12345
SUMMARY:First Event
DESCRIPTION:First event description
LOCATION:Location A
DTSTART:20250311T120000Z
DTEND:20250311T140000Z
END:VEVENT
BEGIN:VEVENT
UID:67890
SUMMARY:Second Event
DESCRIPTION:Second event description
LOCATION:Location B
DTSTART:20250312T150000Z
DTEND:20250312T170000Z
END:VEVENT
END:VCALENDAR
`

describe('ICSParser', () => {
  test('should parse a single event correctly', () => {
    const events = parseIcsData(singleEventIcs)

    expect(events.length).toBe(1)
    expect(events[0].title).toBe('Single Event Test')
    expect(events[0].description).toBe('This is a single test event')
    expect(events[0].location).toBe('Test Location')
    expect(events[0].start_datetime).toBeGreaterThan(0)
    expect(events[0].end_datetime).toBeGreaterThan(events[0].start_datetime)
  })

  test('should parse multiple events correctly', () => {
    const events = parseIcsData(multipleEventsIcs)

    expect(events.length).toBe(2)

    // First event
    expect(events[0].title).toBe('First Event')
    expect(events[0].description).toBe('First event description')
    expect(events[0].location).toBe('Location A')
    expect(events[0].start_datetime).toBeGreaterThan(0)
    expect(events[0].end_datetime).toBeGreaterThan(events[0].start_datetime)

    // Second event
    expect(events[1].title).toBe('Second Event')
    expect(events[1].description).toBe('Second event description')
    expect(events[1].location).toBe('Location B')
    expect(events[1].start_datetime).toBeGreaterThan(0)
    expect(events[1].end_datetime).toBeGreaterThan(events[1].start_datetime)
  })

  test('should return an empty array if no events are found', () => {
    const emptyIcs = `BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR`
    const events = parseIcsData(emptyIcs)

    expect(events.length).toBe(0)
  })

  // TODO: test for invalid ICS format
  // TODO: test for facebook events ics standards (organizer, etc)
})

describe('ICS API (/api/ics-parser)', () => {
  test('should return 1 event from valid input', async () => {
    const res = await request(app)
      .post('/api/ics-import')
      .send({ icsText: singleEventIcs })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.events.length).toBe(1)
    expect(res.body.events[0].title).toBe('Single Event Test')
    expect(res.body.events[0].location).toBe('Test Location')
  })

  test('should return 400 if no icsText is provided', async () => {
    const res = await request(app)
      .post('/api/ics-import')
      .send({})

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
