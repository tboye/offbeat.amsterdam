
export default defineEventHandler(async event => {
    const setting = await readValidatedBody(event, body => settingSchema.parse(body))
    setSetting(setting)
    // return Setting.upsert(data)
})