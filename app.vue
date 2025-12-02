<template>
  <div id="app" :class="{ 'app-loaded': isLoaded }">
    <AuroraBackground />
    <div class="content-wrapper">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const heroSection = ref<{ unlockScroll: () => void } | null>(null)
const isLoaded = ref(false)

/**
 * Handles navigation click events and unlocks hero section scrolling
 */
const handleNavClick = () => {
  if (heroSection.value) {
    heroSection.value.unlockScroll()
  }
}

/**
 * Triggers the app fade-in animation after mounting
 */
onMounted(() => {
  // Add js-ready class to enable fade-in transition
  document.documentElement.classList.add('js-ready')

  // Trigger app fade-in after a short delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      isLoaded.value = true
    }, 100)
  })
})
</script>

<style>

.main-content {
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.content-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
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