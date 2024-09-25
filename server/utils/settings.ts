export type KeyValueType =
| { [key: string]: string }

import { z } from 'zod'
// import { SettingType } from './sequelize'

export const settingSchema = z.object({
    key: z.string(),
    is_secret: z.boolean().default(false),
    value: z.string()
})


export type SettingType = z.infer<typeof settingSchema>

export const publicSettings:KeyValueType = {}
export const secretSettings:KeyValueType = {}

export function getSetting (key: string) {
    return publicSettings[key]
}

export function setSetting (setting: SettingType) {
    if (setting.is_secret) {
        secretSettings[setting.key] = setting.value
    } else {
        publicSettings[setting.key] = setting.value
    }
    return Setting.upsert(setting)
}

export async function loadSettings () {
    const settings = await Setting.findAll()
    for (const iterator of settings) {
        publicSettings[iterator.key] = iterator.value
    }
}