// import type { KeyValueType } from "~/server/utils/settings"

export default () => {

    const Settings = useState<KeyValueType>('settings', () => reactive({ }))
  
    const loadSettings = async () => {
      Settings.value = await $fetch('/api/settings')
    }
  
    const saveSetting = async (key: string, value: string) => {
      Settings.value[key] = value
      await $fetch(`/api/settings`, { method: 'PUT', body: { key, value } })
    }
  
    return { Settings, saveSetting, loadSettings }
  }
