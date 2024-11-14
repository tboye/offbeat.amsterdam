import { Event, Place, Tag } from "~/server/utils/sequelize"

/**
 * Method to search for events with pagination and filtering
 * @returns
 **/


// start = new Date(),
// end,
// query,
// tags,
// places,
// show_recurrent,
// show_multidate,
// limit,
// page,
// older,
// reverse,
// user_id,
// ap_user_id,
// include_unconfirmed = false,
// include_parent = false,
// include_description=false,
// include_ap_events=false,

import { eventQuerySchema } from "~/server/utils/events"

export default defineEventHandler(async (event) => {
    const opt = await getValidatedQuery(event, eventQuerySchema.parse)
    return getEvents(opt)
    // return Event.findAll({ include: [Place, { model: Tag, attributes: ['tag'], through: { attributes: [] } }] })
})
