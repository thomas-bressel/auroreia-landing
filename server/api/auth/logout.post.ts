import { deleteSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await deleteSession(event)

  return {
    success: true,
    message: 'Déconnexion réussie'
  }
})
