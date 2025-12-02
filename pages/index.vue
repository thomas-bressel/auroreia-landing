<template>
  <div>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppHeader @nav-click="handleNavClick" />
    <main class="main-content" id="main-content">
      <HeroSection ref="heroSection" />
      <ServicesSection />
      <VisionSection />
      <ContactSection />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const heroSection = ref<{ unlockScroll: () => void } | null>(null)

/**
 * Handles navigation click events and unlocks hero section scrolling
 */
const handleNavClick = () => {
  if (heroSection.value) {
    heroSection.value.unlockScroll()
  }
}
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  gap: 20rem;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #00c2c7;
  color: #000;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: 600;
  z-index: 1000;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
</style>
