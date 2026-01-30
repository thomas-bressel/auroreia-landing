import { getMySQLPool } from '../../../utils/mysql'
import { getSessionOwner } from '../../../utils/session'
import { deprovisionProject } from '../../../provisioning/provisioning.service'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
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

  // Vérifier que le projet appartient à l'owner et est dans la corbeille
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

  // On ne peut supprimer définitivement que les projets dans la corbeille
  if (project.status !== 'deleted') {
    throw createError({
      statusCode: 400,
      message: 'Seuls les projets dans la corbeille peuvent être supprimés définitivement'
    })
  }

  // Si le projet avait été provisionné, nettoyer les ressources Docker
  if (project.previous_status === 'active' || project.previous_status === 'provisioning') {
    console.log(`[HardDelete] Deprovisioning project ${projectId}...`)
    const result = await deprovisionProject(projectId)
    if (!result.success) {
      console.error(`[HardDelete] Deprovisioning failed: ${result.error}`)
      // On continue quand même pour supprimer l'entrée en base
    }
  }

  // Supprimer l'entrée en base de données
  await pool.execute('DELETE FROM projects WHERE id = ?', [projectId])

  return {
    success: true,
    message: 'Projet supprimé définitivement'
  }
})
