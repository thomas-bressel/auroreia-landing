/**
 * Internal API - Get Project Credentials
 *
 * GET /api/internal/credentials/:projectId
 *
 * Returns database credentials for a project.
 * Used by Drawer APIs to connect to project databases.
 *
 * Security: Protected by X-Internal-Key header
 */
import { getMySQLPool } from '../../../utils/mysql'

export default defineEventHandler(async (event) => {
  // Verify internal API key
  const internalKey = getHeader(event, 'x-internal-key')
  const expectedKey = process.env.INTERNAL_API_KEY

  if (!expectedKey) {
    console.error('[Credentials API] INTERNAL_API_KEY not configured')
    throw createError({ statusCode: 500, message: 'Server configuration error' })
  }

  if (!internalKey || internalKey !== expectedKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const projectId = getRouterParam(event, 'projectId')
  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID required' })
  }

  const pool = getMySQLPool()

  const [rows] = await pool.execute(
    `SELECT
      mysql_host,
      redis_host,
      mysql_user,
      mysql_password,
      redis_password
    FROM projects
    WHERE id = ? AND status = 'active'`,
    [projectId]
  )

  const projects = rows as any[]
  if (projects.length === 0) {
    throw createError({ statusCode: 404, message: 'Project not found or not active' })
  }

  const project = projects[0]

  return {
    mysql: {
      host: project.mysql_host,
      port: 3306,
      user: project.mysql_user,
      password: project.mysql_password
    },
    redis: {
      host: project.redis_host,
      port: 6379,
      password: project.redis_password
    }
  }
})
