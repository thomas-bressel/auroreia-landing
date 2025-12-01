import { defineEventHandler, setHeader, getRequestURL } from 'h3'

/**
 * Server middleware to strip cookies from static resources
 * Runs on every request to ensure no cookies are sent with static assets
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Define static asset extensions
  const staticExtensions = [
    '.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico',
    '.css', '.js', '.mjs',
    '.woff', '.woff2', '.ttf', '.eot',
    '.json', '.xml'
  ]

  // Define static paths
  const staticPaths = [
    '/_nuxt/',
    '/assets/'
  ]

  // Check if this is a static resource
  const isStaticFile = staticExtensions.some(ext => path.endsWith(ext))
  const isStaticPath = staticPaths.some(staticPath => path.startsWith(staticPath))

  if (isStaticFile || isStaticPath) {
    // Set response headers to remove cookies
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    // Clear any existing cookie headers
    if (event.node.res.removeHeader) {
      event.node.res.removeHeader('Set-Cookie')
      event.node.res.removeHeader('set-cookie')
    }

    // Prevent cookies from being sent
    if (event.node.req.headers.cookie) {
      delete event.node.req.headers.cookie
    }
  }
})
