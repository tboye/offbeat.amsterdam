export default defineEventHandler( event => {
    return Setting.findAll({ where: { is_secret: false }})
})