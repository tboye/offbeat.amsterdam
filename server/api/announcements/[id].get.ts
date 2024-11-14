/**
 * get a specific announcement
 * this is used in announcement page
 */
export default defineEventHandler(async event => {
  const announcement = await Announcement.findByPk(event.context.params?.id)
  if (announcement) {
    return announcement
  } else {
    throw createError({ status: 404, message: 'Not found' })
  }
})