export const securityConfig = {
  headers: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
    xXSSProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: ['()'],
      microphone: ['()'],
      geolocation: ['()']
    }
  },
  rateLimiter: {
    tokensPerInterval: 5,
    interval: 'hour',
    headers: true,
    driver: {
      name: 'lruCache'
    }
  },
  corsHandler: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://auroreia.fr'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  csrf: {
    enabled: true,
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  allowedMethodsRestricter: {
    methods: ['GET', 'POST']
  }
}
