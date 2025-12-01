<template>
  <section id="vision" class="vision-section">
    <div class="vision-section__content">
      <h2 class="vision-section__title">Notre Vision</h2>
      <p class="vision-section__text">
        Il y a eu les sites statiques et dynamiques. Aujourd'hui, avec l'écosystème d'AuroreIA,
        <strong class="vision-section__highlight">vos sites deviennent vivants</strong> : ils écoutent, analysent, agissent et interagissent.
        Ils augmentent vos capacités, sans effort supplémentaire.
      </p>
      <p class="vision-section__text">
        Nous vous proposons la vision d'un futur où votre présence en ligne est vivante,
        intelligente et connectée. Une entreprise symbiotique où l'humain et l'IA collaborent
        pour créer une expérience client exceptionnelle.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
/* Mobile First: Base styles for mobile */
.vision-section {
  padding: 3rem 5%;
  scroll-margin-top: 80px;
}

.vision-section__content {
  text-align: center;
  max-width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(25px);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.vision-section__title {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #00c2c7, #7a5fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.vision-section__text {
  font-size: 1rem;
  color: #e0e0e0;
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.vision-section__text:last-child {
  margin-bottom: 0;
}

.vision-section__highlight {
  color: #ffffff;
  font-weight: 600;
}

/* Tablet */
@media (min-width: 480px) {
  .vision-section {
    padding: 4rem 7%;
    scroll-margin-top: 90px;
  }

  .vision-section__content {
    padding: 2rem;
    border-radius: 18px;
  }

  .vision-section__title {
    font-size: 2rem;
    margin-bottom: 1.25rem;
  }

  .vision-section__text {
    font-size: 1.05rem;
    line-height: 1.75;
  }
}

/* Desktop */
@media (min-width: 769px) {
  .vision-section {
    padding: 5rem 10%;
    scroll-margin-top: 100px;
  }

  .vision-section__content {
    max-width: 900px;
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
  }

  .vision-section__title {
    font-size: clamp(2rem, 4vw, 2.4rem);
    margin-bottom: 1.5rem;
  }

  .vision-section__text {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }
}
</style>
