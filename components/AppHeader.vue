<template>
  <header class="header" role="banner">
    <div class="header__brand">
      <img
        src="/logo-auroreIA.webp"
        alt="Logo AuroreIA - Intelligence Artificielle pour PME"
        class="header__logo"
        width="200"
        height="36"
        loading="eager"
      />
    </div>
    <nav class="header__nav" aria-label="Navigation principale">
      <a
        href="#services"
        class="header__link"
        @click="handleNavClick"
        @keydown.enter="handleNavClick"
      >
        Services
      </a>
      <a
        href="#vision"
        class="header__link"
        @click="handleNavClick"
        @keydown.enter="handleNavClick"
      >
        Vision
      </a>
      <a
        href="#contact"
        class="header__link"
        @click="handleNavClick"
        @keydown.enter="handleNavClick"
      >
        Contact
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  navClick: []
}>()

/**
 * Handles navigation link clicks - emits event and scrolls to section after unlock
 * @param event - The click event from the navigation link
 */
const handleNavClick = (event: Event) => {
  event.preventDefault()
  emit('navClick')

  // Scroll to the section after unlocking
  const target = (event.target as HTMLAnchorElement).getAttribute('href')
  if (target) {
    setTimeout(() => {
      const element = document.querySelector(target)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 600)
  }
}
</script>

<style scoped>
/* Mobile First: Base styles for mobile */
.header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem 3%;
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  gap: 1rem;
}

.header__brand {
  display: flex;
  align-items: center;
}

.header__logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.header__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  width: 100%;
}

.header__link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s, outline 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: block;
}

.header__link:hover,
.header__link:focus {
  color: #00c2c7;
  outline: 2px solid #00c2c7;
  outline-offset: 4px;
}

.header__link:focus {
  outline-style: solid;
}

/* Tablet: Compact horizontal navigation */
@media (min-width: 480px) {
  .header {
    padding: 1.25rem 4%;
  }

  .header__logo {
    height: 45px;
  }

  .header__nav {
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
    width: auto;
  }

  .header__link {
    display: inline-block;
  }
}

/* Desktop: Full layout */
@media (min-width: 650px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    padding: 1.5rem 5%;
    gap: 0;
  }

  .header__logo {
    height: 50px;
  }

  .header__nav {
    gap: 1rem;
  }

  .header__link {
    padding: 0.5rem 1.25rem;
  }
}
</style>
