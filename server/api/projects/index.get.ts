import { getMySQLPool } from '../../utils/mysql'
import { getSessionOwner } from '../../utils/session'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  const owner = await getSessionOwner(event)
  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const pool = getMySQLPool()

  // Récupérer tous les projets de l'owner (y compris ceux dans la corbeille)
  const [rows] = await pool.execute(
    `SELECT id, display_name as displayName, status, previous_status as previousStatus,
            created_at as createdAt, mysql_host as mysqlHost, redis_host as redisHost
     FROM projects
     WHERE owner_id = ?
     ORDER BY CASE WHEN status = 'deleted' THEN 1 ELSE 0 END, created_at DESC`,
    [owner.id]
  )

  return {
    projects: rows
  }
})
