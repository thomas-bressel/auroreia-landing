# AuroreIA Landing Page

Landing page moderne développée avec **Vue.js 3**, **Nuxt 3**, **TypeScript** et **SSR (Server-Side Rendering)**.

## Caractéristiques

- ✨ Animation d'aurore boréale en fond (Canvas)
- 🎯 Hero narratif avec scroll verrouillé
- 🎨 Design moderne avec gradients
- 📱 Responsive
- ⚡ SSR avec Nuxt 3
- 🔷 TypeScript pour la sécurité des types
- 🎭 Composants Vue 3 modulaires

## Structure du projet

```
nuxt-landing/
├── app.vue                    # Page principale
├── components/                # Composants Vue
│   ├── AppFooter.vue         # Footer
│   ├── AppHeader.vue         # Header avec navigation
│   ├── AuroraBackground.vue  # Animation aurore boréale
│   ├── ContactSection.vue    # Section contact
│   ├── HeroSection.vue       # Hero avec scroll narratif
│   ├── ServicesSection.vue   # Section services
│   └── VisionSection.vue     # Section vision
├── assets/
│   └── css/
│       └── main.css          # Styles globaux
├── nuxt.config.ts            # Configuration Nuxt
├── tsconfig.json             # Configuration TypeScript
└── package.json              # Dépendances

```

## Installation

```bash
# Installer les dépendances
npm install
```

## Développement

```bash
# Lancer le serveur de développement sur http://localhost:3000
npm run dev
```

## Production

```bash
# Build pour la production
npm run build

# Prévisualiser la version de production
npm run preview

# Générer un site statique
npm run generate
```

## Fonctionnalités de la landing page

### Hero narratif
Le Hero affiche 3 messages successifs avec un scroll verrouillé. Après le 3ème message, le scroll normal est déverrouillé automatiquement.

### Animation Aurora
Un canvas animé crée un effet d'aurore boréale en fond, avec des ondes de couleurs (cyan, violet, orange).

### Sections
- **Services** : Grid responsive présentant les 4 services principaux
- **Vision** : Texte centré dans une card glassmorphism
- **Contact** : CTA avec lien email

## Technologies utilisées

- **Nuxt 3** (v4.2.1) - Framework Vue avec SSR
- **Vue 3** (v3.5.24) - Framework JavaScript réactif
- **TypeScript** (v5.9.3) - Typage statique
- **Google Fonts** - Inter & Space Grotesk

## Configuration SSR

Le projet est configuré pour le SSR par défaut. Le rendu côté serveur améliore :
- Le SEO
- Les performances de chargement initial
- L'accessibilité

## License

ISC
