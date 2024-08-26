import { Event, Place, Tag } from "~/server/utils/sequelize"

export default defineEventHandler((event) => {
    return Event.findAll({ include: [Place, Tag] })
  })
  