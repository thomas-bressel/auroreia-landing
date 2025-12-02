<template>
  <footer class="footer" role="contentinfo">
    <p class="footer__copyright">© 2025 AuroreIA – L'intelligence artificielle au service des PME</p>
    <nav class="footer__nav" aria-label="Navigation du pied de page">
      <NuxtLink to="/mentions-legales" class="footer__link">Mentions légales</NuxtLink>
      <NuxtLink to="/politique-confidentialite" class="footer__link">Politique de confidentialité</NuxtLink>
    </nav>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.footer {
  text-align: center;
  padding: 2rem;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer__copyright {
  font-size: 0.9rem;
  color: #c0c0c0;
  margin-bottom: 1rem;
}

.footer__nav {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer__link {
  color: #c0c0c0;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.footer__link:hover,
.footer__link:focus {
  color: #00c2c7;
  outline: 2px solid #00c2c7;
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .footer__nav {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
