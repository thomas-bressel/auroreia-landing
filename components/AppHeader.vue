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

    <!-- Burger button (mobile only) -->
    <button
      class="header__burger"
      :class="{ 'is-active': isMenuOpen }"
      @click="toggleMenu"
      aria-label="Menu de navigation"
      :aria-expanded="isMenuOpen"
      aria-controls="main-navigation"
    >
      <span class="header__burger-line"></span>
      <span class="header__burger-line"></span>
      <span class="header__burger-line"></span>
    </button>

    <!-- Navigation overlay (mobile only) -->
    <div
      v-if="isMenuOpen"
      class="header__overlay"
      @click="closeMenu"
      aria-hidden="true"
    ></div>

    <!-- Navigation menu -->
    <nav
      id="main-navigation"
      class="header__nav"
      :class="{ 'is-open': isMenuOpen }"
      aria-label="Navigation principale"
    >
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
import { ref } from 'vue'

const emit = defineEmits<{
  navClick: []
}>()

const isMenuOpen = ref(false)

/**
 * Toggles the mobile menu open/closed
 */
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

/**
 * Closes the mobile menu
 */
const closeMenu = () => {
  isMenuOpen.value = false
}

/**
 * Handles navigation link clicks - emits event and scrolls to section after unlock
 * @param event - The click event from the navigation link
 */
const handleNavClick = (event: Event) => {
  event.preventDefault()
  closeMenu() // Close mobile menu when link is clicked
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
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  gap: 0.75rem;
}

.header__brand {
  display: flex;
  align-items: center;
  z-index: 102;
}

.header__logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

/* Burger button (mobile only) */
.header__burger {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 26px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 102;
  transition: transform 0.3s ease;
}

.header__burger:hover {
  transform: scale(1.1);
}

.header__burger-line {
  width: 100%;
  height: 3px;
  background: #ffffff;
  border-radius: 10px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.header__burger.is-active .header__burger-line:nth-child(1) {
  transform: translateY(10.5px) rotate(45deg);
}

.header__burger.is-active .header__burger-line:nth-child(2) {
  opacity: 0;
  transform: translateX(-20px);
}

.header__burger.is-active .header__burger-line:nth-child(3) {
  transform: translateY(-10.5px) rotate(-45deg);
}

/* Overlay for mobile menu */
.header__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 99;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile navigation (slide-in menu) */
.header__nav {
  position: fixed;
  top: 0;
  right: -100%;
  width: 75%;
  max-width: 300px;
  height: 100vh;
  background: rgba(15, 15, 15, 0.98);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  z-index: 101;
  transition: right 0.3s ease;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.header__nav.is-open {
  right: 0;
}

.header__link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.25rem;
  transition: color 0.2s, transform 0.2s;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  display: block;
  text-align: center;
  width: 100%;
}

.header__link:hover,
.header__link:focus {
  color: #00c2c7;
  transform: translateX(-8px);
  outline: 2px solid #00c2c7;
  outline-offset: 4px;
}

.header__link:focus {
  outline-style: solid;
}

/* Tablet: Horizontal navigation, hide burger */
@media (min-width: 480px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    padding: 1.25rem 4%;
    gap: 0;
  }

  .header__logo {
    height: 45px;
  }

  .header__burger {
    display: none;
  }

  .header__overlay {
    display: none;
  }

  .header__nav {
    position: static;
    width: auto;
    max-width: none;
    height: auto;
    background: transparent;
    backdrop-filter: none;
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
    padding: 0;
    border: none;
  }

  .header__link {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    width: auto;
  }

  .header__link:hover,
  .header__link:focus {
    transform: none;
  }
}

/* Desktop: Full layout */
@media (min-width: 650px) {
  .header {
    padding: 1.5rem 5%;
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
