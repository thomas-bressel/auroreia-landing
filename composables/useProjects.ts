/**
 * Projects Composable
 *
 * Provides reactive state and methods for managing Drawer CIS projects.
 * Handles CRUD operations, provisioning, and trash management.
 *
 * @example
 * ```ts
 * const { projects, fetchProjects, createProject } = useProjects()
 * await fetchProjects()
 * ```
 */

/**
 * Project information returned from the API
 */
interface Project {
  id: string
  displayName: string
  status: 'pending' | 'provisioning' | 'active' | 'suspended' | 'deleted'
  createdAt: string
  mysqlHost: string | null
  redisHost: string | null
}

/**
 * Projects management composable
 *
 * @returns Projects state and management methods
 */
export function useProjects() {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetches all projects for the current authenticated owner.
   * Includes both active projects and those in the trash.
   *
   * @returns Promise<void>
   */
  async function fetchProjects() {
    try {
      loading.value = true
      error.value = null
      const response = await $fetch('/api/projects')
      projects.value = response.projects as Project[]
    } catch (e: any) {
      error.value = e.data?.message || 'Error loading projects'
    } finally {
      loading.value = false
    }
  }

  /**
   * Creates a new Drawer CIS project.
   * The project starts in 'pending' status until provisioned.
   *
   * @param displayName - Human-readable name for the project
   * @param drawerUsername - Admin username for the Drawer application
   * @param drawerPassword - Admin password for the Drawer application
   * @returns Promise with the API response containing the new project ID
   * @throws Error if creation fails
   */
  async function createProject(displayName: string, drawerUsername: string, drawerPassword: string) {
    const response = await $fetch('/api/projects', {
      method: 'POST',
      body: { displayName, drawerUsername, drawerPassword }
    })
    await fetchProjects()
    return response
  }

  /**
   * Soft deletes a project by moving it to the trash.
   * Stops the Docker containers to free up server resources.
   * The project can be restored later from the trash.
   *
   * @param projectId - The unique project identifier
   * @returns Promise<void>
   */
  async function deleteProject(projectId: string) {
    await $fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    await fetchProjects()
  }

  /**
   * Starts the provisioning process for a project.
   * Creates Docker containers (MySQL, Redis, phpMyAdmin, etc.) and initializes databases.
   * Project status changes: pending -> provisioning -> active
   *
   * @param projectId - The unique project identifier
   * @returns Promise with the API response
   */
  async function provisionProject(projectId: string) {
    const response = await $fetch(`/api/projects/${projectId}/provision`, { method: 'POST' })
    // Refresh list after a short delay to see the status change
    setTimeout(() => fetchProjects(), 2000)
    return response
  }

  /**
   * Restores a project from the trash.
   * Restarts the Docker containers if the project was previously active.
   *
   * @param projectId - The unique project identifier
   * @returns Promise<void>
   */
  async function restoreProject(projectId: string) {
    await $fetch(`/api/projects/${projectId}/restore`, { method: 'POST' })
    await fetchProjects()
  }

  /**
   * Permanently deletes a project (hard delete).
   * Removes all Docker containers, volumes, and project files.
   * This action is irreversible.
   *
   * @param projectId - The unique project identifier
   * @returns Promise<void>
   */
  async function hardDeleteProject(projectId: string) {
    await $fetch(`/api/projects/${projectId}/hard-delete`, { method: 'POST' })
    await fetchProjects()
  }

  return {
    /** List of all projects (including those in trash) */
    projects: computed(() => projects.value),
    /** True while fetching projects */
    loading: computed(() => loading.value),
    /** Error message if fetch failed, null otherwise */
    error: computed(() => error.value),
    fetchProjects,
    createProject,
    deleteProject,
    restoreProject,
    hardDeleteProject,
    provisionProject
  }
}
