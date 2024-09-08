export default defineEventHandler (async event => {
    return Setting.findOne({ where: { key: event?.context?.params?.key, is_secret: false } }).then(r => r?.value)
})