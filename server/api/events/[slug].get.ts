import { Event } from "#imports"

export default defineEventHandler(async event => {
    const element = await Event.findOne({ where: { slug: event.context.params?.slug } })
    if (element) {
        return element
    } else {
        throw createError({ status: 404, message: 'Not found' })
    }
})
