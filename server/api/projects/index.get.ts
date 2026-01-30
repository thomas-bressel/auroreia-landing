/**
 * List Projects API Endpoint
 *
 * GET /api/projects
 *
 * Returns all projects belonging to the authenticated owner.
 * Includes both active projects and those in the trash.
 * Projects are sorted with active ones first, then deleted ones.
 *
 * @returns Array of project objects
 * @throws 401 - Not authenticated
 */
import { getMySQLPool } from '../../utils/mysql'
import { getSessionOwner } from '../../utils/session'

export default defineEventHandler(async (event) => {
  // Verify authentication
  const owner = await getSessionOwner(event)
  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const pool = getMySQLPool()

  // Fetch all projects for this owner (including trashed ones)
  // Sort: active projects first, then deleted ones, ordered by creation date
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
