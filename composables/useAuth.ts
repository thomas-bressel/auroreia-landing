/**
 * Authentication Composable
 *
 * Provides reactive authentication state and methods for user authentication.
 * Uses a shared reactive state to maintain auth status across components.
 *
 * @example
 * ```ts
 * const { owner, isAuthenticated, login, logout } = useAuth()
 * ```
 */

/**
 * Owner account information returned from the API
 */
interface Owner {
  id: string
  email: string
  displayName: string | null
  status: 'pending' | 'active' | 'suspended'
  emailVerified: boolean
}

/**
 * Internal authentication state
 */
interface AuthState {
  owner: Owner | null
  loading: boolean
}

// Shared reactive state across all components using this composable
const authState = reactive<AuthState>({
  owner: null,
  loading: true
})

/**
 * Authentication composable for managing user sessions
 *
 * @returns Authentication state and methods
 */
export function useAuth() {
  const router = useRouter()

  /**
   * Checks if the user is currently authenticated by calling the /api/auth/me endpoint.
   * Updates the shared auth state with the user info if authenticated.
   *
   * Uses $fetch instead of useFetch to avoid caching issues on logout.
   *
   * @returns Promise<boolean> - True if user is authenticated, false otherwise
   */
  async function checkAuth(): Promise<boolean> {
    try {
      authState.loading = true
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
   * Registers a new owner account.
   * On success, updates the auth state with the new owner info.
   *
   * @param email - User's email address
   * @param password - User's password
   * @param displayName - Optional display name
   * @returns Promise with the API response containing owner info
   * @throws Error if registration fails (e.g., email already exists)
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
   * Authenticates a user with email and password.
   * On success, updates the auth state with the owner info.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with the API response containing owner info
   * @throws Error if credentials are invalid or account is suspended
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
   * Logs out the current user by calling the logout API endpoint.
   * Clears the auth state and redirects to the login page.
   */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    authState.owner = null
    router.push('/login')
  }

  return {
    /** Current authenticated owner (null if not authenticated) */
    owner: computed(() => authState.owner),
    /** True while authentication check is in progress */
    loading: computed(() => authState.loading),
    /** True if user is authenticated */
    isAuthenticated: computed(() => !!authState.owner),
    /** True if user's account is pending admin approval */
    isPendingApproval: computed(() => authState.owner?.status === 'pending'),
    /** True if user's account is active and approved */
    isActive: computed(() => authState.owner?.status === 'active'),
    checkAuth,
    register,
    login,
    logout
  }
}
