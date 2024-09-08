import { Tag, Place, Event } from './sequelize'

export async function getTagEvents (tag: string | undefined) {
    if (!tag) { 
        throw new Error(`Tag not specified`)
    }

    // TODO
    return Event.findAll({ include: [ Tag ]})

}