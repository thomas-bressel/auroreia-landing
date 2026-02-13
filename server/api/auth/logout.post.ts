/**
 * Logout API Endpoint
 *
 * POST /api/auth/logout
 *
 * Terminates the current user session by deleting the session
 * from the database and clearing the session cookie.
 *
 * @returns Success status
 */
import { deleteSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await deleteSession(event)

  return {
    success: true,
    message: 'Déconnexion réussie'
  }
})
