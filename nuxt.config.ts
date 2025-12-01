export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: true,

  modules: ['@nuxt/image'],

  app: {
    head: {
      title: 'AuroreIA – Intelligence Artificielle pour PME | Transformation Digitale',
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'AuroreIA accompagne les PME dans leur transformation digitale avec des solutions IA innovantes : sites intelligents, audit SEO automatisé, cybersécurité et réputation en ligne.'
        },
        {
          name: 'keywords',
          content: 'intelligence artificielle, IA pour PME, transformation digitale, audit SEO, cybersécurité, site intelligent, GEO, réputation en ligne, Drawer CIS, LocalPulse'
        },
        { name: 'author', content: 'AuroreIA' },
        { name: 'robots', content: 'index, follow' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://auroreia.fr' },
        { property: 'og:title', content: 'AuroreIA – Intelligence Artificielle au service des PME' },
        {
          property: 'og:description',
          content: 'Transformez votre entreprise avec nos solutions IA : sites vivants, audit automatisé, cybersécurité et optimisation de votre présence en ligne.'
        },
        { property: 'og:image', content: 'https://auroreia.fr/og-image.jpg' },
        { property: 'og:locale', content: 'fr_FR' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://auroreia.fr' },
        { name: 'twitter:title', content: 'AuroreIA – Intelligence Artificielle pour PME' },
        {
          name: 'twitter:description',
          content: 'Transformez votre entreprise avec nos solutions IA : sites vivants, audit automatisé, cybersécurité.'
        },
        { name: 'twitter:image', content: 'https://auroreia.fr/og-image.jpg' },

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
        // Preload critical assets for faster LCP
        {
          rel: 'preload',
          href: '/logo-auroreIA.webp',
          as: 'image',
          type: 'image/webp'
        },
        { rel: 'canonical', href: 'https://auroreia.fr' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AuroreIA",
            "url": "https://auroreia.fr",
            "logo": "https://auroreia.fr/logo-auroreIA.webp",
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

  // SEO and Performance optimizations
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    },
    compressPublicAssets: {
      gzip: true,
      brotli: true
    }
  },

  // Enable compression and optimize build
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

  // Image optimization
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

  // Enable HTTP/2 push and caching
  routeRules: {
    // Static assets - no cookies, long cache
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
    // HTML pages - shorter cache
    '/': {
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    }
  },

  // Experimental features for better performance
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true
  }
})