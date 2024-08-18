import log from '../log'
import Sequelize from 'sequelize'
import { Place } from '../api/models/models'

export default {

  // find or create a place based on { place_id } or { place_name }
  // note that place's name are unique
  async findOrCreate (body) {
    if (body.place_id) {
      const place = await Place.findByPk(body.place_id)
      if (!place) {
        throw new Error(`Place not found`)
      }
      return place
    }

    const place_name = body.place_name && body.place_name.trim()
    const place_address = body.place_address && body.place_address.trim()
    if (!place_name || !place_address && place_name?.toLocaleLowerCase() !== 'online') {
      throw new Error(`place_id or place_name and place_address are required`)
    }
    let place = await Place.findOne({ where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), Sequelize.Op.eq, place_name.toLocaleLowerCase()) })
    if (!place) {
      place = await Place.create({
        name: place_name,
        address: place_address || '',
        latitude: Number(body.place_latitude) || null,
        longitude: Number(body.place_longitude) || null
      }).catch(e => {
        console.error(e)
        console.error(e?.errors)
      })
    }
    return place
  },  
}