export default defineNuxtPlugin(() => {
  // Charger les fonts Google de manière asynchrone
  if (process.client) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap'

    // Ajouter le lien au head
    document.head.appendChild(link)

    // Optionnel: utiliser Font Loading API pour plus de contrôle
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('400 1em Inter'),
        document.fonts.load('600 1em Inter'),
        document.fonts.load('500 1em Space Grotesk'),
        document.fonts.load('700 1em Space Grotesk')
      ]).then(() => {
        document.documentElement.classList.add('fonts-loaded')
      }).catch(() => {
        // Fonts n'ont pas pu charger, on continue avec les fallbacks
        console.warn('Les fonts Google n\'ont pas pu charger')
      })
    }
  }
})
