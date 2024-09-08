import { getCollectionEvents } from "~/server/utils/collections"

export default defineEventHandler(event => {
    return getCollectionEvents()
})