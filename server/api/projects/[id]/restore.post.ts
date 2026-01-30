import { getMySQLPool } from '../../../utils/mysql'
import { getSessionOwner } from '../../../utils/session'
import { restartProjectContainers } from '../../../provisioning/provisioning.service'

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

  // On ne peut restaurer que les projets dans la corbeille
  if (project.status !== 'deleted') {
    throw createError({
      statusCode: 400,
      message: 'Ce projet n\'est pas dans la corbeille'
    })
  }

  // Restaurer le projet dans son état précédent
  const restoreStatus = project.previous_status || 'pending'

  // Si le projet était actif, redémarrer les conteneurs
  if (restoreStatus === 'active') {
    console.log(`[Restore] Redémarrage des conteneurs pour ${projectId}...`)
    const result = await restartProjectContainers(projectId)
    if (!result.success) {
      console.warn(`[Restore] Erreur lors du redémarrage des conteneurs: ${result.error}`)
      // On restaure quand même le statut, l'utilisateur pourra relancer manuellement
    }
  }

  await pool.execute(
    `UPDATE projects SET status = ?, previous_status = NULL, updated_at = NOW() WHERE id = ?`,
    [restoreStatus, projectId]
  )

  return {
    success: true,
    message: restoreStatus === 'active' ? 'Projet restauré (conteneurs redémarrés)' : 'Projet restauré',
    status: restoreStatus
  }
})
