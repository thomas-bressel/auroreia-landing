import { securityConfig } from './nuxt.config.security'



console.log('==========================================')
console.log('🔧 APP_ENV:', process.env.APP_ENV)
console.log('🔧 All env vars:', Object.keys(process.env).filter(k => k.includes('NODE')))
console.log('==========================================')



// Détection automatique de l'environnement
const isStaging = process.env.APP_ENV === 'staging'
const isProduction = process.env.APP_ENV === 'production'

// URL de base selon l'environnement
const baseURL = isStaging  ? 'https://staging.auroreia.fr' : isProduction ? 'https://auroreia.fr' : 'http://localhost:3000'

console.log('✅ isStaging:', isStaging)
console.log('✅ isProduction:', isProduction)
console.log('✅ baseURL:', baseURL)

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  modules: ['@nuxt/image', 'nuxt-security'],
  // @ts-ignore - nuxt-security types
  security: securityConfig,
  app: {
    head: {
      title: isStaging ? 'AuroreIA — Staging (L\'écosystème web vivant)' : 'AuroreIA — L\'écosystème web vivant',
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'AuroreIA propose un écosystème web vivant pour PME : sites intelligents, audits SEO, cybersécurité, accessibilité, réputation locale et optimisation continue par IA. Vos outils travaillent pour vous – automatiquement.'
        },
        {
          name: 'keywords',
          content: 'écosystème web intelligent, site vivant, intelligence artificielle PME, audit SEO IA, audit cybersécurité automatisé, audit accessibilité, réputation locale IA, LivingSite, Drawer CMS, optimisation funnels IA'
        },
        { name: 'author', content: 'AuroreIA' },
        // Ne pas indexer le staging
        { name: 'robots', content: isStaging ? 'noindex, nofollow' : 'index, follow' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: baseURL },
        { 
          property: 'og:title', 
          content: isStaging 
            ? 'AuroreIA – Staging – Intelligence Artificielle au service des PME' 
            : 'AuroreIA – Intelligence Artificielle au service des PME' 
        },
        {
          property: 'og:description',
          content: 'Transformez votre entreprise avec nos solutions IA : sites vivants, audit automatisé, cybersécurité et optimisation de votre présence en ligne.'
        },
        { property: 'og:image', content: `${baseURL}/og-image.jpg` },
        { property: 'og:locale', content: 'fr_FR' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: baseURL },
        { 
          name: 'twitter:title', 
          content: isStaging 
            ? 'AuroreIA – Staging – Intelligence Artificielle pour PME' 
            : 'AuroreIA – Intelligence Artificielle pour PME' 
        },
        {
          name: 'twitter:description',
          content: 'Transformez votre entreprise avec nos solutions IA : sites vivants, audit automatisé, cybersécurité.'
        },
        { name: 'twitter:image', content: `${baseURL}/og-image.jpg` },

        // Additional SEO
        { name: 'theme-color', content: '#00c2c7' },
        { name: 'msapplication-TileColor', content: '#00c2c7' }
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          href: '/logo-auroreIA.webp',
          as: 'image',
          type: 'image/webp'
        },
        { rel: 'canonical', href: baseURL },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AuroreIA",
            "url": baseURL,
            "logo": `${baseURL}/logo-auroreIA.webp`,
            "description": "Solutions d'intelligence artificielle pour PME",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "FR",
              "addressRegion": "Île-de-France"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+33-X-XX-XX-XX-XX",
              "contactType": "Sales",
              "email": "contact@auroreia.fr",
              "availableLanguage": "French"
            },
            "sameAs": [
              "https://www.linkedin.com/company/auroreia",
              "https://twitter.com/auroreia"
            ]
          })
        }
      ]
    }
  },

  css: [
    '~/assets/css/critical.css',
    '~/assets/css/main.css'
  ],

  compatibilityDate: '2025-01-21',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/mentions-legales', '/politique-confidentialite']
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true
    }
  },

  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue']
          }
        }
      }
    }
  },

  image: {
    format: ['webp', 'avif'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    provider: 'ipx'
  },

  routeRules: {
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    '/**/*.{png,jpg,jpeg,webp,svg,ico,css,js,woff,woff2}': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    '/': {
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    }
  },

  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true
  }
})