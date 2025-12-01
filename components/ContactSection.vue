<template>
  <section id="contact" class="contact">
    <h2 class="contact__title">Prêt à franchir le pas ?</h2>
    <p class="contact__intro">Discutons ensemble de la transformation de votre activité avec AuroreIA.</p>

    <div class="contact__methods">
      <a
        href="mailto:contact@auroreia.fr"
        class="contact__cta"
        aria-label="Envoyer un email à contact@auroreia.fr"
      >
        📧 Contactez-nous par email
      </a>

      <p class="contact__info">
        <strong class="contact__info-label">Email :</strong>
        <a href="mailto:contact@auroreia.fr" class="contact__email-link">
          contact@auroreia.fr
        </a>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
/* Mobile First: Base styles for mobile */
.contact {
  text-align: center;
  padding: 3rem 5%;
  scroll-margin-top: 80px;
}

.contact__title {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #00c2c7, #7a5fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.contact__intro {
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 1.75rem;
  padding: 0 1rem;
}

.contact__methods {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.contact__cta {
  display: inline-block;
  background: linear-gradient(90deg, #00c2c7, #7a5fff, #ff7a59);
  color: #fff;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
  box-shadow: 0 4px 16px rgba(122, 95, 255, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.contact__cta:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(122, 95, 255, 0.6);
}

.contact__cta:focus {
  outline: 3px solid #00c2c7;
  outline-offset: 4px;
  transform: scale(1.03);
}

.contact__info {
  font-size: 0.95rem;
  color: #e0e0e0;
}

.contact__info-label {
  color: #ffffff;
  display: block;
  margin-bottom: 0.25rem;
}

.contact__email-link {
  color: #00c2c7;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
  word-break: break-all;
}

.contact__email-link:hover,
.contact__email-link:focus {
  border-bottom-color: #00c2c7;
  outline: none;
}

/* Tablet */
@media (min-width: 480px) {
  .contact {
    padding: 4rem 7%;
    scroll-margin-top: 90px;
  }

  .contact__title {
    font-size: 2rem;
    margin-bottom: 1.1rem;
  }

  .contact__intro {
    font-size: 1.05rem;
    margin-bottom: 1.875rem;
  }

  .contact__methods {
    gap: 1.35rem;
  }

  .contact__cta {
    padding: 0.925rem 2rem;
    font-size: 1.05rem;
    width: auto;
  }

  .contact__info {
    font-size: 0.975rem;
  }

  .contact__info-label {
    display: inline;
    margin-bottom: 0;
    margin-right: 0.5rem;
  }

  .contact__email-link {
    word-break: normal;
  }
}

/* Desktop */
@media (min-width: 769px) {
  .contact {
    padding: 5rem 10%;
    scroll-margin-top: 100px;
  }

  .contact__title {
    font-size: clamp(2rem, 4vw, 2.4rem);
    margin-bottom: 1.2rem;
  }

  .contact__intro {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .contact__methods {
    gap: 1.5rem;
  }

  .contact__cta {
    padding: 1rem 2.4rem;
    border-radius: 12px;
    font-size: 1.1rem;
    box-shadow: 0 6px 20px rgba(122, 95, 255, 0.4);
  }

  .contact__cta:hover {
    transform: scale(1.07);
    box-shadow: 0 8px 28px rgba(122, 95, 255, 0.6);
  }

  .contact__cta:focus {
    transform: scale(1.05);
  }

  .contact__info {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact__cta {
    transition: none;
  }
}
</style>
