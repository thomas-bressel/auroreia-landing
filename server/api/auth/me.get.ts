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
