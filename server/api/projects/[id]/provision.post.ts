import { getMySQLPool } from '../../../utils/mysql'
import { getSessionOwner } from '../../../utils/session'
import { provisionProject } from '../../../provisioning/provisioning.service'

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

  // Récupérer le projet et vérifier qu'il appartient à l'owner
  const [rows] = await pool.execute(
    `SELECT id, display_name as displayName, status, drawer_admin_username as adminUsername,
            drawer_admin_password_hash as adminPasswordHash
     FROM projects
     WHERE id = ? AND owner_id = ?`,
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

  // Vérifier que le projet est en status "pending"
  if (project.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: `Le projet ne peut pas être provisionné (status actuel: ${project.status})`
    })
  }

  // Lancer le provisioning (en arrière-plan pour ne pas bloquer la requête)
  // Note: En production, on utiliserait une queue de jobs (Bull, etc.)
  provisionProject(
    projectId,
    project.displayName,
    owner.id,
    owner.email,
    project.adminUsername,
    project.adminPasswordHash
  ).then(result => {
    if (result.success) {
      console.log(`[API] Provisioning de ${projectId} terminé avec succès`)
    } else {
      console.error(`[API] Provisioning de ${projectId} échoué:`, result.error)
    }
  })

  return {
    success: true,
    message: 'Provisioning démarré',
    projectId
  }
})
