export default defineEventHandler(event => {
    return Collection.findAll({ where: { isTop: true }})
})