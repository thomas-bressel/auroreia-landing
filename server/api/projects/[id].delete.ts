import { getMySQLPool } from '../../utils/mysql'
import { getSessionOwner } from '../../utils/session'
import { stopProjectContainers } from '../../provisioning/provisioning.service'

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

  // Vérifier que le projet appartient à l'owner
  const [rows] = await pool.execute(
    'SELECT id, status FROM projects WHERE id = ? AND owner_id = ?',
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

  if (project.status === 'deleted') {
    throw createError({
      statusCode: 400,
      message: 'Ce projet est déjà dans la corbeille'
    })
  }

  // Si le projet était actif ou en provisioning, arrêter les conteneurs pour libérer la RAM
  if (project.status === 'active' || project.status === 'provisioning') {
    console.log(`[Delete] Arrêt des conteneurs pour ${projectId}...`)
    const result = await stopProjectContainers(projectId)
    if (!result.success) {
      console.warn(`[Delete] Erreur lors de l'arrêt des conteneurs: ${result.error}`)
    }
  }

  // Sauvegarder le statut précédent pour pouvoir restaurer
  await pool.execute(
    `UPDATE projects SET previous_status = status, status = 'deleted', updated_at = NOW() WHERE id = ?`,
    [projectId]
  )

  return {
    success: true,
    message: 'Projet déplacé dans la corbeille (conteneurs arrêtés)'
  }
})
