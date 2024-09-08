import type { User } from "#build/types/nitro-imports"

export default () => {
    const authUser = useState<User | null>('auth_user', () => null)
    const authLoading = useState('auth_loading', () => true)
    
    const isLogged = computed(() => !!authUser.value?.id )
  
    const isAdmin = computed(() => !!(authUser.value?.role === 'admin'))
  
    async function login (username: string, password: string) {
      authLoading.value = true
  
      try {
  
        const data = await $fetch<User>('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password
          }
        })
        
        authUser.value = data
  
      } finally {
        authLoading.value = false
      }
    }
    
  
    async function refreshToken () {
      try {
        await $fetch('/api/auth/refresh')
      } catch (e) {
        console.error('Error', e)
        authUser.value = null
      }
    }
  
    async function getUser (token: string) {
      const data = await $fetch<User>('/api/auth/user', { headers: {
        cookie: `access_token=${token};`
      } }).catch()
      authUser.value = data
    }
  
    // const reRefreshAccessToken = () => {
    //   const authToken = useAuthToken()
      
    //   if (!authToken.value) {
    //     return
    //   }
      
    //   const jwt = jwt_decode(authToken.value)
      
    //   const newRefreshTime = jwt.exp - 60000
      
    //   setTimeout(async () => {
    //     await refreshToken()
    //     reRefreshAccessToken()
    //   }, newRefreshTime);
    // }
    
    async function initAuth () {
      authLoading.value = true
      try {
        await refreshToken()
        // await getUser()
      } finally {
        authLoading.value = false
      }
    }
    
    async function logout () {
      await $fetch('/api/auth/logout', { method: 'POST' })
      authUser.value = null
    }
  
    return {
      login,
      logout,
      authUser,
      getUser,
      authLoading,
      isLogged,
      isAdmin,
      initAuth
    }
  }