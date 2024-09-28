import { Event } from "#imports"
import { Op, fn, col } from "@sequelize/core"
interface QueryInterface {
    query?: string
}

export default defineEventHandler(async event => {
    const { query } = getQuery<QueryInterface>(event)
    const tags = await Tag.findAll({
        order: [[fn('COUNT', col('tag.tag')), 'DESC']],
        attributes: ['tag'],
        where: {
          tag: { [Op.like]: `%${query}%` }
        },
        include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
        group: ['tag.tag'],
        limit: 10,
        raw: true,
        subQuery: false
      })
  
      return tags.map(t => t.tag)
})
