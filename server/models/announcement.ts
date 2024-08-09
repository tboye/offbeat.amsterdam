export default (sequelize: any, DataTypes: any) => {

  const Announcement = sequelize.define('announcement', {
    title: DataTypes.STRING,
    announcement: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  })


  return Announcement
}

