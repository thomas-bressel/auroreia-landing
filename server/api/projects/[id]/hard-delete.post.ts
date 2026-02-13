/**
 * Hard Delete Project API Endpoint
 *
 * POST /api/projects/:id/hard-delete
 *
 * Permanently deletes a project from the trash.
 * Removes all Docker containers, volumes, and project files.
 * Deletes the database record. This action is IRREVERSIBLE.
 *
 * Only projects already in the trash can be hard deleted.
 * Use the regular DELETE endpoint first to move to trash.
 *
 * @param id - Project ID (route parameter)
 * @returns Success status
 * @throws 400 - Project not in trash
 * @throws 401 - Not authenticated
 * @throws 404 - Project not found
 */
import { getMySQLPool } from '../../../utils/mysql'
import { getSessionOwner } from '../../../utils/session'
import { deprovisionProject } from '../../../provisioning/provisioning.service'

export default defineEventHandler(async (event) => {
  // Verify authentication
  const owner = await getSessionOwner(event)
  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const projectId = getRouterParam(event, 'id')
  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'ID de projet requis'
    })
  }

  const pool = getMySQLPool()

  // Verify project belongs to owner and is in trash
  const [rows] = await pool.execute(
    'SELECT id, status, previous_status FROM projects WHERE id = ? AND owner_id = ?',
    [projectId, owner.id]
  )

  const projects = rows as any[]
  if (projects.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Projet non trouvé'
    })
  }

  const project = projects[0]

  // Only trashed projects can be permanently deleted
  if (project.status !== 'deleted') {
    throw createError({
      statusCode: 400,
      message: 'Seuls les projets dans la corbeille peuvent être supprimés définitivement'
    })
  }

  // If project was provisioned, clean up Docker resources (containers, volumes, files)
  if (project.previous_status === 'active' || project.previous_status === 'provisioning') {
    console.log(`[HardDelete] Deprovisioning project ${projectId}...`)
    const result = await deprovisionProject(projectId)
    if (!result.success) {
      console.error(`[HardDelete] Deprovisioning failed: ${result.error}`)
      // Continue to delete database record even if cleanup fails
    }
  }

  // Delete database record permanently
  await pool.execute('DELETE FROM projects WHERE id = ?', [projectId])

  return {
    success: true,
    message: 'Projet supprimé définitivement'
  }
})
