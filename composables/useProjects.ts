interface Project {
  id: string
  displayName: string
  status: 'pending' | 'provisioning' | 'active' | 'suspended' | 'deleted'
  createdAt: string
  mysqlHost: string | null
  redisHost: string | null
}

export function useProjects() {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Récupère la liste des projets
   */
  async function fetchProjects() {
    try {
      loading.value = true
      error.value = null
      const response = await $fetch('/api/projects')
      projects.value = response.projects as Project[]
    } catch (e: any) {
      error.value = e.data?.message || 'Erreur lors du chargement des projets'
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouveau projet
   */
  async function createProject(displayName: string, drawerUsername: string, drawerPassword: string) {
    const response = await $fetch('/api/projects', {
      method: 'POST',
      body: { displayName, drawerUsername, drawerPassword }
    })
    // Rafraîchir la liste
    await fetchProjects()
    return response
  }

  /**
   * Supprime un projet
   */
  async function deleteProject(projectId: string) {
    await $fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    // Rafraîchir la liste
    await fetchProjects()
  }

  /**
   * Lance le provisioning d'un projet
   */
  async function provisionProject(projectId: string) {
    const response = await $fetch(`/api/projects/${projectId}/provision`, { method: 'POST' })
    // Rafraîchir la liste après un court délai pour voir le changement de status
    setTimeout(() => fetchProjects(), 2000)
    return response
  }

  /**
   * Restaure un projet depuis la corbeille
   */
  async function restoreProject(projectId: string) {
    await $fetch(`/api/projects/${projectId}/restore`, { method: 'POST' })
    await fetchProjects()
  }

  /**
   * Supprime définitivement un projet (hard delete)
   */
  async function hardDeleteProject(projectId: string) {
    await $fetch(`/api/projects/${projectId}/hard-delete`, { method: 'POST' })
    await fetchProjects()
  }

  return {
    projects: computed(() => projects.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchProjects,
    createProject,
    deleteProject,
    restoreProject,
    hardDeleteProject,
    provisionProject
  }
}
