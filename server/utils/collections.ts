import { Op } from "@sequelize/core"
import { Event } from "./sequelize"

export async function getCollectionEvents({
        start,
        // end: number,
        // query = '',
        // tags = null,
        // places = null,
        // show_recurrent = false,
        // show_multidate = false,
        // limit = 9,
        // page = 1,
        // older = false,
        // reverse = false,
        // user_id = null,
        // ap_user_id = null,
        // include_unconfirmed = false,
        // include_parent = false,
        // include_description=false,
        // include_ap_events=false,
    } : { start: number } = { start: new Date().valueOf() }) {

        return Event.findAll({ where: { start_datetime: { [Op.gte]: start }}})
}