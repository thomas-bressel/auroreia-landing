<template>
  <header class="header" role="banner">
    <div class="header__brand">
      <NuxtLink to="/">
        <img
          src="/logo-auroreIA.webp"
          alt="Logo AuroreIA - Intelligence Artificielle pour PME"
          class="header__logo"
          width="200"
          height="36"
          loading="eager"
        />
      </NuxtLink>
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

      <!-- Séparateur mobile -->
      <div class="header__separator"></div>

      <!-- Menu utilisateur -->
      <div class="header__user">
        <!-- Non connecté -->
        <template v-if="!isAuthenticated">
          <NuxtLink to="/login" class="header__btn header__btn--login" @click="closeMenu">
            Connexion
          </NuxtLink>
        </template>

        <!-- Connecté -->
        <template v-else>
          <div class="header__user-menu" :class="{ 'is-open': isUserMenuOpen }">
            <button
              class="header__user-trigger"
              @click="toggleUserMenu"
              :aria-expanded="isUserMenuOpen"
            >
              <span class="header__user-avatar">
                {{ userInitial }}
              </span>
              <span class="header__user-name">{{ displayName }}</span>
              <svg class="header__user-chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>

            <div class="header__user-dropdown" v-show="isUserMenuOpen">
              <NuxtLink to="/dashboard" class="header__user-item" @click="closeAllMenus">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Mes projets
              </NuxtLink>
              <button class="header__user-item header__user-item--logout" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  navClick: []
}>()

const { owner, isAuthenticated, logout, checkAuth } = useAuth()

const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const userInitial = computed(() => {
  if (owner.value?.displayName) {
    return owner.value.displayName.charAt(0).toUpperCase()
  }
  if (owner.value?.email) {
    return owner.value.email.charAt(0).toUpperCase()
  }
  return '?'
})

const displayName = computed(() => {
  return owner.value?.displayName || owner.value?.email?.split('@')[0] || ''
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeAllMenus = () => {
  isMenuOpen.value = false
  isUserMenuOpen.value = false
}

const handleLogout = async () => {
  closeAllMenus()
  await logout()
}

const handleNavClick = (event: Event) => {
  event.preventDefault()
  closeMenu()
  emit('navClick')

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

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.header__user-menu')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  checkAuth()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

/* Separator (mobile only) */
.header__separator {
  width: 80%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 0;
}

/* User section */
.header__user {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.header__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.header__btn--login {
  background: linear-gradient(135deg, #00c2c7 0%, #0098a3 100%);
  color: #ffffff;
}

.header__btn--login:hover {
  background: linear-gradient(135deg, #00d4da 0%, #00aab5 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 194, 199, 0.3);
}

/* User menu */
.header__user-menu {
  position: relative;
  width: 100%;
}

.header__user-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.header__user-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.header__user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c2c7 0%, #0098a3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: #ffffff;
}

.header__user-name {
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header__user-chevron {
  transition: transform 0.2s ease;
}

.header__user-menu.is-open .header__user-chevron {
  transform: rotate(180deg);
}

.header__user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  z-index: 110;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.header__user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: background 0.2s ease;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.header__user-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header__user-item--logout {
  color: #ff6b6b;
}

.header__user-item--logout:hover {
  background: rgba(255, 107, 107, 0.1);
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

  .header__separator {
    display: none;
  }

  .header__user {
    width: auto;
    margin-left: 1rem;
  }

  .header__user-menu {
    width: auto;
  }

  .header__user-trigger {
    width: auto;
  }

  .header__user-dropdown {
    left: auto;
    right: 0;
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
