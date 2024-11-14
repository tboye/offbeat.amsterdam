// return id and title of visible announcements
// this is used to show a preview at homepage
export default defineEventHandler(() => {
  return Announcement.findAll({ attributes: ['title', 'id'], where: { visible: true }})
})
