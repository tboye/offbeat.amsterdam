import { Event } from "~/server/utils/sequelize"

export default defineEventHandler((event) => {
    return Event.findAll()
  })
  