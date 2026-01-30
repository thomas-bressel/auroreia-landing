export default defineNuxtRouteMiddleware(async (to) => {
  // Ne pas exécuter côté serveur
  if (import.meta.server) return

  const { isAuthenticated, isPendingApproval, checkAuth, loading } = useAuth()

  // Vérifier l'auth si pas encore fait
  if (loading.value) {
    await checkAuth()
  }

  // Page pending-approval : accessible uniquement si pending
  if (to.path === '/pending-approval') {
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
    // Si le compte est actif, rediriger vers dashboard
    if (!isPendingApproval.value) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Pages protégées : rediriger vers login si non connecté
  if (to.path.startsWith('/dashboard')) {
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
    // Si le compte est en attente d'approbation, rediriger vers pending-approval
    if (isPendingApproval.value) {
      return navigateTo('/pending-approval')
    }
  }

  // Pages auth (login/register) : rediriger vers dashboard ou pending-approval si déjà connecté
  if (to.path === '/login' || to.path === '/register') {
    if (isAuthenticated.value) {
      if (isPendingApproval.value) {
        return navigateTo('/pending-approval')
      }
      return navigateTo('/dashboard')
    }
  }
})
