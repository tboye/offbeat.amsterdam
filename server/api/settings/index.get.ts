import { KeyValueType } from "~/server/utils/settings"

export default defineEventHandler( async event => {
    const publicSettings = await Setting.findAll({ where: { is_secret: false }})
    const ret:KeyValueType = {}
    publicSettings.forEach(setting => {
        ret[setting.key] = setting.value
    })
    return ret
})