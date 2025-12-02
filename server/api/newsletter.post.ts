import { getDatabase } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, honeypot } = body

    // Protection honeypot : si le champ est rempli, c'est un bot
    if (honeypot) {
      console.warn('Bot detected via honeypot field')
      return {
        success: false,
        error: 'Requête invalide'
      }
    }

    // Validation de l'email
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        error: 'Email requis'
      }
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Format d\'email invalide'
      }
    }

    // Récupérer des informations contextuelles
    const headers = getHeaders(event)
    const ipAddress = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'

    // Insérer dans la base de données
    const db = getDatabase()

    try {
      const stmt = db.prepare(`
        INSERT INTO newsletter_subscribers (email, ip_address, user_agent)
        VALUES (?, ?, ?)
      `)

      stmt.run(email.toLowerCase().trim(), ipAddress, userAgent)

      return {
        success: true,
        message: 'Inscription réussie ! Merci de votre intérêt.'
      }
    } catch (dbError: any) {
      // Gérer les doublons (UNIQUE constraint)
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return {
          success: false,
          error: 'Cet email est déjà inscrit à notre newsletter'
        }
      }

      console.error('Database error:', dbError)
      return {
        success: false,
        error: 'Erreur lors de l\'inscription'
      }
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue'
    }
  }
})
