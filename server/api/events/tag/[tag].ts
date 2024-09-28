import { getTagEvents } from "~/server/utils/tag"

export default defineEventHandler(async event => {
    const tag = event.context.params?.tag
    getTagEvents(tag)
})
