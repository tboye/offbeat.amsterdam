import { APUser } from "~/server/utils/sequelize"

export default defineEventHandler(async event => {
    return APUser.findAll({where: { trusted: true }})
})
