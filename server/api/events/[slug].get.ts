import { Event, Place, Tag } from "~/server/utils/sequelize"

export default defineEventHandler(async event => {
    const element = await Event.findOne({ where: { slug: event.context.params?.slug }, include: [Tag, Place] })
    if (element) {
        return element
    } else {
        throw createError({ status: 404, message: 'Not found' })
    }
})
