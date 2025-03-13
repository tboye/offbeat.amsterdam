module.exports = (sequelize, DataTypes) =>
  sequelize.define('page', {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    visible: DataTypes.BOOLEAN,
    slug: {
      type: DataTypes.STRING,
      index: true,
      unique: true
    }
  })
