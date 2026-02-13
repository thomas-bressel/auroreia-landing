/**
 * Current User API Endpoint
 *
 * GET /api/auth/me
 *
 * Returns information about the currently authenticated user.
 * Used by the frontend to check authentication status and get user data.
 *
 * @returns Owner info and approval status
 * @throws 401 - Not authenticated (no valid session)
 */
import { getSessionOwner } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const owner = await getSessionOwner(event)

  if (!owner) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  return {
    pendingApproval: owner.status === 'pending',
    owner: {
      id: owner.id,
      email: owner.email,
      displayName: owner.displayName,
      status: owner.status,
      emailVerified: owner.emailVerified
    }
  }
})
