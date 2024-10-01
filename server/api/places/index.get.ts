import { Event, Place } from "#imports"
import { Op, fn, col, cast, where } from "@sequelize/core"

import { z } from 'zod'
const schema = z.object({
  query: z.string().optional().transform(q => q?.toLocaleLowerCase())
})

export default defineEventHandler(async event => {
    const { query } = await getValidatedQuery(event, schema.parse)
    console.error(query)

  if (!query) {
    return Place.findAll({
      order: [[fn('COUNT', col('events.placeId')), 'DESC']],
      include: [{ model: Event, where: { is_visible: true }, required: true, attributes: [] }],
      group: ['place.id'],
      raw: true
    })
  } else {
    return Place.findAll({
        order: [[fn('COUNT', col('events.placeId')), 'DESC']],
        where: {
          [Op.or]: [
            where(fn('LOWER', col('name')), Op.like, '%' + query + '%' ),
            where(fn('LOWER', col('address')), Op.like, '%' + query + '%'),
          ]
        },
        attributes: ['name', 'address', 'latitude', 'longitude', 'id'],
        include: [{ model: Event, where: { is_visible: true }, required: true, attributes: [] }],
        group: ['place.id'],
        raw: true,
        limit: 10,
        subQuery: false
      })
  }
})

// export default defineEventHandler(async event => {
//     const { query } = await getValidatedQuery(event, schema.parse)

//     const tags = await Tag.findAll({
//         order: [[fn('COUNT', col('tag.tag')), 'DESC']],
//         attributes: ['tag'],
//         ...( query && { where: {
//           tag: { [Op.like]: `%${query}%` }
//         }}),
//         include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
//         group: ['tag.tag'],
//         limit: 10,
//         raw: true,
//         subQuery: false
//       })
  
//       return tags.map(t => t.tag)
// })
