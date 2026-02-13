<template>
<section id="contact" class="contact">
  <h2 class="contact__title">Restez en contact</h2>

  <p class="contact__intro">
    Rejoignez notre communauté et suivez <strong>la naissance d'AuroreIA</strong>.
    Les premiers inscrits recevront une <strong>réduction exclusive</strong> lors du lancement officiel.
  </p>

  <div class="contact__methods">

    <!-- Formulaire Newsletter -->
    <form @submit.prevent="handleSubmit" class="newsletter-form" id="newsletter">
      <div class="newsletter-form__group">
        <label for="email-input" class="visually-hidden">Votre adresse email</label>
        <input
          id="email-input"
          v-model="email"
          type="email"
          placeholder="votre@email.fr"
          class="newsletter-form__input"
          :disabled="isLoading"
          required
          aria-required="true"
          aria-describedby="form-message"
        />

        <!-- Honeypot field - hidden from users but visible to bots -->
        <input
          v-model="honeypot"
          type="text"
          name="website"
          class="honeypot-field"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        />

        <button
          type="submit"
          class="newsletter-form__button"
          :disabled="isLoading"
          aria-label="S'inscrire à la newsletter AuroreIA"
        >
          {{ isLoading ? '...' : '🔔 Rejoindre l\'accès anticipé' }}
        </button>
      </div>

      <div
        v-if="message"
        :class="['form-message', messageType === 'success' ? 'form-message--success' : 'form-message--error']"
        role="alert"
        id="form-message"
      >
        {{ message }}
      </div>
    </form>

    <p class="contact__info">
      <strong class="contact__info-label">Email :</strong>
      <a href="mailto:contact@auroreia.fr" class="contact__email-link">
        contact@auroreia.fr
      </a>
    </p>
  </div>
</section>
</template>

<script setup lang="ts">
interface NewsletterResponse {
  success: boolean
  message?: string
  error?: string
}

const email = ref('')
const honeypot = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const handleSubmit = async () => {
  if (!email.value) return

  // Honeypot protection: if field is filled, it's a bot
  if (honeypot.value) {
    console.warn('Bot detected via honeypot')
    return
  }

  isLoading.value = true
  message.value = ''

  try {
    // Use useCsrfFetch to automatically include CSRF token
    const { data, error } = await useFetch<NewsletterResponse>('/api/newsletter', {
      method: 'POST',
      body: {
        email: email.value,
        honeypot: honeypot.value
      }
    })

    if (error.value) {
      messageType.value = 'error'
      message.value = 'Erreur de connexion. Veuillez réessayer.'
      console.error('Newsletter error:', error.value)
      return
    }

    const response = data.value
    if (response?.success) {
      messageType.value = 'success'
      message.value = response.message || 'Inscription réussie !'
      email.value = '' // Reset form
    } else {
      messageType.value = 'error'
      message.value = response?.error || 'Une erreur est survenue'
    }
  } catch (error) {
    messageType.value = 'error'
    message.value = 'Erreur de connexion. Veuillez réessayer.'
    console.error('Newsletter error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

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

/* Newsletter Form Styles */
.newsletter-form {
  width: 100%;
  max-width: 500px;
}

.newsletter-form__group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.newsletter-form__input {
  padding: 0.875rem 1.25rem;
  border: 2px solid #00c2c7;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.2s;
  width: 100%;
}

.newsletter-form__input::placeholder {
  color: #a0a0a0;
}

.newsletter-form__input:focus {
  outline: none;
  border-color: #7a5fff;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(122, 95, 255, 0.2);
}

.newsletter-form__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-form__button {
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
  cursor: pointer;
  width: 100%;
}

.newsletter-form__button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(122, 95, 255, 0.6);
}

.newsletter-form__button:focus {
  outline: 3px solid #00c2c7;
  outline-offset: 4px;
  transform: scale(1.03);
}

.newsletter-form__button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.form-message {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

.form-message--success {
  background: rgba(0, 194, 199, 0.15);
  color: #00c2c7;
  border: 1px solid #00c2c7;
}

.form-message--error {
  background: rgba(255, 122, 89, 0.15);
  color: #ff7a59;
  border: 1px solid #ff7a59;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Honeypot field - must be invisible but not use display:none */
.honeypot-field {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tablet responsive */
@media (min-width: 480px) {
  .newsletter-form__group {
    flex-direction: row;
    gap: 0.5rem;
  }

  .newsletter-form__input {
    flex: 1;
  }

  .newsletter-form__button {
    width: auto;
    white-space: nowrap;
  }
}

/* Desktop responsive */
@media (min-width: 769px) {
  .newsletter-form__input {
    padding: 1rem 1.5rem;
    font-size: 1.05rem;
  }

  .newsletter-form__button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  .form-message {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact__cta,
  .newsletter-form__button {
    transition: none;
  }

  .form-message {
    animation: none;
  }
}
</style>
