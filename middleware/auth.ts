/**
 * Authentication Middleware
 *
 * Handles route protection and redirects based on authentication state.
 * Runs client-side only to check auth status before allowing navigation.
 *
 * Route protection rules:
 * - /dashboard/*: Requires authenticated + active account
 * - /pending-approval: Requires authenticated + pending account
 * - /login, /register: Redirects to dashboard if already authenticated
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip server-side execution (auth check happens client-side only)
  if (import.meta.server) return

  const { isAuthenticated, isPendingApproval, checkAuth, loading } = useAuth()

  // Perform auth check if not already done
  if (loading.value) {
    await checkAuth()
  }

  // Handle /pending-approval page: only accessible for pending accounts
  if (to.path === '/pending-approval') {
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
    // If account is already active, redirect to dashboard
    if (!isPendingApproval.value) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Handle protected pages (/dashboard/*): require authenticated + active account
  if (to.path.startsWith('/dashboard')) {
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
    // If account is pending approval, redirect to pending-approval page
    if (isPendingApproval.value) {
      return navigateTo('/pending-approval')
    }
  }

  // Handle auth pages (/login, /register): redirect if already authenticated
  if (to.path === '/login' || to.path === '/register') {
    if (isAuthenticated.value) {
      if (isPendingApproval.value) {
        return navigateTo('/pending-approval')
      }
      return navigateTo('/dashboard')
    }
  }
})
