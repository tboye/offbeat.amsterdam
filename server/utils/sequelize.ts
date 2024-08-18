import { DataTypes, Sequelize, Model, 
    InferAttributes,
    InferCreationAttributes } from '@sequelize/core'
import { SqliteDialect } from '@sequelize/sqlite3'

// import AnnouncementModel from '../models/announcement'
// import EventModel from '../models/event'

class Announcement extends Model<InferAttributes<Announcement>,  InferCreationAttributes<Announcement>> {
    declare title: string
    declare announcement: string | null
    declare visible: boolean
}

  const Announcement = sequelize.define('announcement', {
    title: DataTypes.STRING,
    announcement: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  })

const db = new Sequelize({
    dialect: "sqlite",
    storage: "./gancio2.sqlite",
    models: [Announcement]
})

// export const Announcement = AnnouncementModel(db, DataTypes)
// export const Events = EventModel(db, DataTypes)

try {
    db.authenticate()
} catch (e) {
    console.error(e)
}

export default db

