import { Event } from "./sequelize"

export async function getEvents({
        start = new Date(),
        end,
        query,
        tags,
        places,
        show_recurrent,
        show_multidate,
        limit,
        page,
        older,
        reverse,
        user_id,
        ap_user_id,
        include_unconfirmed = false,
        include_parent = false,
        include_description=false,
        include_ap_events=false,
    }) {

        return Event.findAll()
}