/**
 * Newsletter Subscription API Endpoint
 *
 * POST /api/newsletter
 *
 * Subscribes an email address to the newsletter.
 * Includes honeypot protection against bots and duplicate prevention.
 * Stores subscriber data in SQLite database (separate from main MySQL).
 *
 * @param body.email - Email address to subscribe
 * @param body.honeypot - Hidden field for bot detection (should be empty)
 * @returns Success status and message
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, honeypot } = body

    // Honeypot protection: if field is filled, it's a bot
    if (honeypot) {
      console.warn('Bot detected via honeypot field')
      return {
        success: false,
        error: 'Requête invalide'
      }
    }

    // Validate email is provided
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        error: 'Email requis'
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Format d\'email invalide'
      }
    }

    // Collect contextual information for analytics/security
    const headers = getHeaders(event)
    const ipAddress = headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'

    // Insert into SQLite database
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
      // Handle duplicate email (UNIQUE constraint violation)
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
