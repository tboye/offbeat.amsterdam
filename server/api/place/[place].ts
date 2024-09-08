import { getPlaceEvents } from "~/server/utils/place"

export default defineEventHandler(async event => {
    const place = event.context.params?.place
    if (place) {
        getPlaceEvents(place)
    }
})
