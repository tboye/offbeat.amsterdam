import { Event } from "#imports"
import { Op, fn, col } from "@sequelize/core"

import { z } from 'zod'
const schema = z.object({
  query: z.string().optional()
})

export default defineEventHandler(async event => {
    const { query } = await getValidatedQuery(event, schema.parse)

    const tags = await Tag.findAll({
        order: [[fn('COUNT', col('tag.tag')), 'DESC']],
        attributes: ['tag'],
        ...( query && { where: {
          tag: { [Op.like]: `%${query}%` }
        }}),
        include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
        group: ['tag.tag'],
        limit: 10,
        raw: true,
        subQuery: false
      })
  
      return tags.map(t => t.tag)
})
