import sequelize from "../utils/sequelize"

export default defineNitroPlugin(async (nitro) => {
    try {
        await sequelize.authenticate()
    } catch (e) {
        console.error(e)
    }
})