export default defineNuxtPlugin((nuxtApp) => {
    const formatter = {
        time (unixTimestamp: number) {
            console.error(unixTimestamp)
            if (!unixTimestamp) return 'no'
            return new Date(unixTimestamp*1000).toLocaleString()
        },
        timeToISO (unixTimestamp: number) {
            if (!unixTimestamp) return 'no'
            return new Date(unixTimestamp*1000).toISOString()
        }
    }
    nuxtApp.provide('formatter', formatter)
})