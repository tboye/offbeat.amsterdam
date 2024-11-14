import { Event } from "./sequelize"
import { DateTime } from 'luxon'
import { Op, literal, col, where, fn } from '@sequelize/core'

import { z } from 'zod'
export const eventQuerySchema = z.object({
  start: z.number().default(DateTime.local().toUnixInteger()),
  end: z.number().optional(),
  query: z.string().optional(),
  tags: z.string().default('').optional().transform( t => t?.split(',').map(t => t.trim())),
  places: z.string().optional(),
  show_recurrent: z.boolean().default(false),
  show_multidate: z.boolean().default(false),
  limit: z.number().optional(),
  page: z.number().optional(),
  older: z.boolean().optional(),
  reverse: z.boolean().optional(),
  user_id: z.number().optional(),
  ap_user_id: z.string().optional(),
  include_unconfirmed: z.boolean().default(false),
  include_parent: z.boolean().default(false),
  include_description: z.boolean().default(false),
  inlude_ap_events: z.boolean().default(false)
})

export type EventQueryType = z.infer<typeof eventQuerySchema>

export async function getEvents(args: EventQueryType) {


    const condition = {

      apUserApId: null,

      [Op.or]: {
        start_datetime: { [args.older ? Op.lte : Op.gte]: args.start },
        end_datetime: { [args.older ? Op.lte : Op.gte]: args.start }
      },

    }

    if (args.user_id) {
      condition.userId = args.user_id
    }

    if (args.include_parent !== true) {
      // do not include _parent_ recurrent event
      condition.recurrent = null
    }

    if (args.include_unconfirmed !== true) {
      // confirmed event only
      condition.is_visible = true
    }

    // // include recurrent events?
    if (!args.show_recurrent) {
      condition.parentId = null
    }

    if (!args.show_multidate) {
      condition.multidate = { [Op.not]: true }
    }

    if (args.end) {
      condition.start_datetime = { [args.older ? Op.gte : Op.lte]: args.end }
    }

    // // normalize tags
    // // if (args.tags) {
    // //   args.tags = args.tags.split(',').map(t => t.trim())
    // // }

    const replacements = []
    // if (args.tags && args.places) {
    //   condition[Op.and] = [
    //     { placeId: args.places ? args.places.split(',') : [] },
    //     fn('EXISTS', literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=${Col('event.id')} AND ${Col('tagTag')} in (?)`))
    //   ]
    //   replacements.push(args.tags)
    // } else if (args.tags) {
    //   condition[Op.and] = fn('EXISTS', literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=${Col('event.id')} AND ${Col('tagTag')} in (?)`))
    //   replacements.push(args.tags)
    // } else if (args.places) {
    //   condition.placeId = args.places.split(',')
    // }

    // if (args.query) {
    //   replacements.push(args.query)
    //   condition[Op.or] =
    //     [
    //       { title: where(fn('LOWER', col('title')), 'LIKE', '%' + args.query + '%') },
    //       where(fn('LOWER', col('name')), 'LIKE', '%' + args.query + '%'),
    //       fn('EXISTS', literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=${Col('event.id')} AND LOWER(${Col('tagTag')}) = LOWER(?)`))
    //     ]
    // }

    let pagination = {}
    if (args.limit) {
      pagination = {
        limit: args.limit,
        offset: args.limit * (args?.page ?? 1),
      }
    }

    console.error(condition)
    const events = await Event.findAll({
      where: condition,
    //   attributes: {
    //     exclude: [
    //       'likes', 'boost', 'userId', 'createdAt', 'resources', 'placeId', 'image_path', 'ap_object', 'ap_id',
    //       ...(!args.include_parent ? ['recurrent']: []),
    //       ...(!args.include_unconfirmed ? ['is_visible']: []),
    //       ...(!args.include_description ? ['description']: [])
    //     ]
    //   },
      order: [['start_datetime', args.reverse ? 'DESC' : 'ASC']],
      include: [
        {
          model: Tag,
          // order: [Sequelize.literal('(SELECT COUNT(tagTag) FROM event_tags WHERE tagTag = tag) DESC')],
          attributes: ['tag'],
          through: { attributes: [] }
        },
        { model: Place, required: true, attributes: ['id', 'name', 'address', 'latitude', 'longitude'] }
      ],
      ...pagination,
    //   replacements
    }).catch(e => {
      console.error('[EVENT]' + String(e))
      return []
    })

    return events
    // return events.map(e => {
    //   e = e.get()
    //   e.tags = e.tags ? e.tags.map(t => t && t.tag) : []
    //   e.end_datetime = Number(e.end_datetime) || null
    //   if (!e.multidate) {
    //     delete e.multidate
    //   }
    //   if (!e.image_path) {
    //     delete e.image_path
    //   }
    //   return e
    // })
}