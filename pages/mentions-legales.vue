<template>
  <div class="legal-page">
    <AuroraBackground />
    <div class="legal-content">
      <NuxtLink to="/" class="back-link" aria-label="Retour à l'accueil">
        ← Retour à l'accueil
      </NuxtLink>

      <h1>Mentions Légales</h1>

      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          Le site <strong>AuroreIA</strong> est édité par une personne physique, en cours de création d'entité juridique.
        </p>
        <p>
          <strong>Directeur de publication :</strong>BRESSEL Thomas<br>
          <strong>Email :</strong> contact@thomasbressel.fr<br>
          <strong>Statut :</strong> Projet en phase de lancement
        </p>
      </section>

      <section>
        <h2>2. Hébergement</h2>
        <p>
          Le site est hébergé par :<br>
          <strong>Hostinger International Ltd.</strong><br>
          61 Lordou Vironos Street, 6023 Larnaca, Cyprus<br>
          +357 25 020 200
        </p>
      </section>

      <section>
        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu de ce site (textes, images, logos, graphismes, etc.) est la propriété exclusive d'AuroreIA,
          sauf mention contraire. Toute reproduction, distribution, modification ou utilisation sans autorisation préalable
          est strictement interdite.
        </p>
      </section>

      <section>
        <h2>4. Données personnelles</h2>
        <p>
          Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à l'envoi de notre newsletter.
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
        </p>
        <p>
          Pour plus d'informations, consultez notre <NuxtLink to="/politique-confidentialite">Politique de confidentialité</NuxtLink>.
        </p>
      </section>

      <section>
        <h2>5. Cookies</h2>
        <p>
          Ce site n'utilise pas de cookies de tracking ou de publicité. Seuls des cookies techniques essentiels au
          fonctionnement du site peuvent être utilisés.
        </p>
      </section>

      <section>
        <h2>6. Limitation de responsabilité</h2>
        <p>
          AuroreIA s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
          Toutefois, AuroreIA ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises
          à disposition sur ce site.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Pour toute question concernant les mentions légales, vous pouvez nous contacter à l'adresse :
          <a href="mailto:contact@thomasbressel.fr">contact@thomasbressel.fr</a>
        </p>
      </section>

      <p class="last-update">Dernière mise à jour : {{ lastUpdate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdate = new Date().toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

useHead({
  title: 'Mentions Légales - AuroreIA',
  meta: [
    { name: 'description', content: 'Mentions légales du site AuroreIA - Intelligence artificielle au service des PME' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.legal-page {
  position: relative;
  min-height: 100vh;
  color: #e0e0e0;
}

.legal-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #00c2c7;
  text-decoration: none;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-link:hover,
.back-link:focus {
  background: rgba(0, 194, 199, 0.1);
  outline: 2px solid #00c2c7;
  outline-offset: 2px;
}

h1 {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 3rem;
  text-align: center;
  background: linear-gradient(135deg, #00c2c7, #b24bf3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  font-size: 1.5rem;
  color: #00c2c7;
  margin-bottom: 1rem;
}

p {
  line-height: 1.8;
  color: #c0c0c0;
  margin-bottom: 1rem;
}

p:last-child {
  margin-bottom: 0;
}

a {
  color: #00c2c7;
  text-decoration: underline;
  transition: color 0.2s;
}

a:hover,
a:focus {
  color: #b24bf3;
}

strong {
  color: #ffffff;
}

.last-update {
  text-align: center;
  font-size: 0.85rem;
  color: #808080;
  font-style: italic;
  margin-top: 3rem;
}

@media (max-width: 768px) {
  .legal-content {
    padding: 3rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  section {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}
</style>
