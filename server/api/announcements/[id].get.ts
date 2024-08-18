// return an announcement
export default defineEventHandler((event) => {
    return Announcement.findByPk(event.context.params?.id)
  })
  