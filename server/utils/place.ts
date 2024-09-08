import { Place, Event } from './sequelize'

export async function getPlaceEvents (name: string | undefined) {
    if (!name) { 
        throw new Error(`Place name not specified`)
    }
    const place = await Place.findOne({ where: { name }})
    if (!place) {
        throw new Error(`Place ${name} not found`)
    }

    return Event.findAll({ where: { placeId: place.id }})

}