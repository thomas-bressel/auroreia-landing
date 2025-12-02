<template>
  <section id="services" class="services" tabindex="-1">
    <h2 class="services__title">Nos Solutions IA pour PME</h2>
    <p class="services__intro">
      Découvrez notre écosystème de solutions intelligentes conçues pour transformer votre présence digitale
    </p>

    <ul class="services__list" role="list">
      <li v-for="(service, idx) in services" :key="idx" class="services__item">
        <article class="services__card">
          <img v-if="service.logo" :src="`/${service.logo}`" :alt="`Logo ${service.title}`" class="services__logo" loading="lazy" width="80" height="80" />
          <h3 class="services__card-title">{{ service.title }}</h3>
          <p v-if="service.subtitle" class="services__card-subtitle">{{ service.subtitle }}</p>
          <p class="services__card-description">{{ service.description }}</p>
        </article>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/**
 * List of AI services offered to SMEs
 */
const services = [
  {
    title: 'Drawer CIS',
    subtitle: 'Content Intelligent Software',
    logo: 'logo_seul.webp',
    description: 'Centralisez et optimisez vos contenus web avec Drawer CIS. Notre IA comprend vos textes et vous propose des formulations améliorées, vous permettant de gagner du temps et d’augmenter l’impact de votre communication digitale.'
  },
  {
    title: 'AI-SEO & GEO',
    subtitle: 'Optimisation intelligente',
    logo: 'AI-SEOGEO_logo.webp',
    description: 'Optimisez votre visibilité locale et nationale avec l’IA. AI-SEO & GEO analyse automatiquement votre présence en ligne, fournit des recommandations personnalisées et vous envoie un rapport clair chaque mois — sans installation ni apprentissage d’outils complexes.'
  },
  {
    title: 'CyberSafe',
    subtitle: 'Sécurité automatisée',
    logo: 'logo-CyberSafe.webp',
    description: 'Protégez votre infrastructure digitale grâce à l’IA. CyberSafe détecte automatiquement les vulnérabilités et risques exposés, puis vous envoie chaque mois un rapport clair et actionnable — la sécurité renforcée, sans complexité.'
  }
]
</script>

<style scoped>
/* Mobile First: Base styles for mobile */
.services {
  padding: 3rem 5%;
  scroll-margin-top: 80px;
}

.services__title {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #00c2c7, #7a5fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

.services__intro {
  text-align: center;
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 2rem;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
}

.services__list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.services__item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.services__item:hover,
.services__item:focus-within {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 194, 199, 0.3);
}

.services__card {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.services__logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.services__card-title {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.35rem;
  color: #ffffff;
  margin: 0;
}

.services__card-subtitle {
  font-size: 0.9rem;
  color: #00c2c7;
  font-weight: 600;
  margin: 0;
}

.services__card-description {
  font-size: 0.95rem;
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0;
  flex-grow: 1;
}

/* Tablet */
@media (min-width: 480px) {
  .services {
    padding: 4rem 7%;
    scroll-margin-top: 90px;
  }

  .services__title {
    font-size: 2rem;
  }

  .services__intro {
    font-size: 1.05rem;
    max-width: 600px;
  }

  .services__list {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.75rem;
  }

  .services__card {
    padding: 1.75rem;
  }

  .services__logo {
    width: 70px;
    height: 70px;
  }

  .services__card-title {
    font-size: 1.4rem;
  }
}

/* Desktop */
@media (min-width: 769px) {
  .services {
    padding: 5rem 10%;
    scroll-margin-top: 100px;
  }

  .services__title {
    font-size: clamp(2rem, 4vw, 2.4rem);
  }

  .services__intro {
    font-size: 1.1rem;
    margin-bottom: 3rem;
    max-width: 800px;
  }

  .services__list {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .services__item:hover,
  .services__item:focus-within {
    transform: translateY(-8px);
  }

  .services__card {
    padding: 2rem;
    gap: 1rem;
  }

  .services__logo {
    width: 80px;
    height: 80px;
  }

  .services__card-title {
    font-size: 1.5rem;
  }

  .services__card-subtitle {
    font-size: 0.95rem;
  }

  .services__card-description {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .services__item {
    transition: none;
  }
}
</style>
