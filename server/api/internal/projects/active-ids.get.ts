/**
 * Internal API - Get Active Project IDs
 *
 * GET /api/internal/projects/active-ids
 *
 * Returns the list of IDs for all active projects.
 * Used by Drawer API at boot time to restore delayed publication schedulers.
 *
 * Security: Protected by X-Internal-Key header
 */
import { getMySQLPool } from '../../../utils/mysql'

export default defineEventHandler(async (event) => {
  // Verify internal API key
  const internalKey = getHeader(event, 'x-internal-key')
  const expectedKey = process.env.INTERNAL_API_KEY

  if (!expectedKey) {
    console.error('[Active Projects API] INTERNAL_API_KEY not configured')
    throw createError({ statusCode: 500, message: 'Server configuration error' })
  }

  if (!internalKey || internalKey !== expectedKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const pool = getMySQLPool()

  const [rows] = await pool.execute(
    `SELECT id FROM projects WHERE status = 'active'`
  )

  const projects = rows as any[]

  return {
    projectIds: projects.map((p) => p.id)
  }
})
