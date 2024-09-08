export default () => {
    type SettingsType =
    | { [key: string]: string }

    // const { data: Settings } = await useFetch('/api/setting')
    const Settings = useState<SettingsType>('settings', () => reactive({ }))
  
    const loadSettings = async () => {
      Settings.value = await $fetch('/api/settings')
    }
  
    const saveSetting = async (key: string, value: string) => {
      Settings.value[key] = value
      await $fetch(`/api/setting`, { method: 'POST', body: { key, value } })
    }
  
    return { Settings, saveSetting, loadSettings }
  }
  