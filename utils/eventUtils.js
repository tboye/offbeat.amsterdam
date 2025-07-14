import { DateTime } from 'luxon'

export function formatISO(timestamp, timezone) {
  return DateTime.fromSeconds(timestamp, { zone: timezone }).toISO()
}

export function buildEventJsonLd(event, settings, $helper) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: formatISO(event.start_datetime, settings.instance_timezone),
    eventStatus: "https://schema.org/EventScheduled",
    description: event.plain_description || "",
    mainEntityOfPage: `${settings.baseurl}/event/${event.slug || event.id}`,
  }

  if (event.online_locations?.[0]) {
    schema.url = event.online_locations[0]
  }

  if (event.end_datetime) {
    schema.endDate = formatISO(event.end_datetime, settings.instance_timezone)
  }

  const isOnline = event.place?.name?.toLowerCase() === 'online'
  schema.eventAttendanceMode = isOnline ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode"
  if (!isOnline) {
    schema.location = {
      "@type": "Place",
      name: event.place.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.place.address
      }
    }
  }

  if (event.tags?.length) {
    schema.keywords = event.tags.join(', ')
  }

  const image = $helper?.mediaURL?.(event)
  if (image) {
    schema.image = image
  }

  if (event.online_locations?.length) {
    schema.offers = {
      "@type": "Offer",
      url: event.online_locations[1] || event.online_locations[0],
      availability: "https://schema.org/InStock"
    }
  }

  return schema
}
