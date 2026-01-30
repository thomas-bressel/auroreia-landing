interface Owner {
  id: string
  email: string
  displayName: string | null
  status: 'pending' | 'active' | 'suspended'
  emailVerified: boolean
}

interface AuthState {
  owner: Owner | null
  loading: boolean
}

const authState = reactive<AuthState>({
  owner: null,
  loading: true
})

export function useAuth() {
  const router = useRouter()

  /**
   * Vérifie si l'utilisateur est connecté
   */
  async function checkAuth(): Promise<boolean> {
    try {
      authState.loading = true
      // Utiliser $fetch au lieu de useFetch pour éviter le cache
      const response = await $fetch('/api/auth/me')
      if (response?.owner) {
        authState.owner = response.owner as Owner
        return true
      }
      authState.owner = null
      return false
    } catch {
      authState.owner = null
      return false
    } finally {
      authState.loading = false
    }
  }

  /**
   * Inscription
   */
  async function register(email: string, password: string, displayName?: string) {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName }
    })
    if (response.owner) {
      authState.owner = response.owner as Owner
    }
    return response
  }

  /**
   * Connexion
   */
  async function login(email: string, password: string) {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    if (response.owner) {
      authState.owner = response.owner as Owner
    }
    return response
  }

  /**
   * Déconnexion
   */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    authState.owner = null
    router.push('/login')
  }

  return {
    owner: computed(() => authState.owner),
    loading: computed(() => authState.loading),
    isAuthenticated: computed(() => !!authState.owner),
    isPendingApproval: computed(() => authState.owner?.status === 'pending'),
    isActive: computed(() => authState.owner?.status === 'active'),
    checkAuth,
    register,
    login,
    logout
  }
}
