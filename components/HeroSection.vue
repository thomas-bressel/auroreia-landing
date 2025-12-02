<template>
  <section class="hero" aria-label="Introduction AuroreIA">
    <h1 class="hero__title-hidden">AuroreIA - Passez à l'ère de l'intelligence artificielle</h1>

    <div
      v-for="(text, idx) in texts"
      :key="idx"
      class="hero__text"
      :class="{ 'hero__text--active': currentIndex === idx }"
      :aria-hidden="currentIndex !== idx"
      :data-index="idx"
    >
      <span v-if="idx === 0">
        Ce n'est pas un site web, c'est <span class="hero__highlight">une entité numérique vivante</span>
      </span>
      <span v-else-if="idx === 1">
        Ce n'est pas un audit, c’est  <span class="hero__highlight">le double numérique de votre entreprise</span>
      </span>
      <span v-else>
        <span class="hero__highlight">C’est une intelligence dédiée qui travaille pour votre entreprise.</span>
      </span>
    </div>

    <div
      class="hero__indicator"
      :aria-hidden="!isLocked || currentIndex === texts.length - 1"
      role="status"
      aria-live="polite"
    >
      <span class="hero__title-hidden">Faites défiler pour continuer</span>
      <span aria-hidden="true">↓</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentIndex = ref(0)
const isLocked = ref(true)
const scrollProgress = ref(0)

// Reduced thresholds for faster unlock and better LCP
const scrollThreshold = 500
const scrollThresholdLast = 1000
const unlockThreshold = 1500

const texts = [
  'text1',
  'text2',
  'text3'
]

const emit = defineEmits<{
  unlocked: []
}>()

/**
 * Unlocks the scroll and transitions from hero to main content
 */
const unlockScroll = () => {
  if (isLocked.value) {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('unlocked')
      document.body.classList.add('unlocked')
      document.documentElement.style.overflowY = 'scroll'
      document.body.style.overflow = 'visible'
    }
    isLocked.value = false
    emit('unlocked')

    // Set focus on main content after unlocking
    setTimeout(() => {
      const mainContent = document.querySelector('#services')
      if (mainContent && mainContent instanceof HTMLElement) {
        mainContent.focus()
      }
    }, 100)
  }
}

// Expose the function to make it accessible from parent component
defineExpose({
  unlockScroll
})

/**
 * Handles mouse wheel events for hero section text navigation
 * @param e - The wheel event
 */
const handleWheel = (e: WheelEvent) => {
  if (isLocked.value) {
    scrollProgress.value += e.deltaY

    const currentThreshold = currentIndex.value === 1 ? scrollThresholdLast : scrollThreshold

    if (scrollProgress.value > currentThreshold && currentIndex.value < texts.length - 1) {
      currentIndex.value++
      scrollProgress.value = 0
    } else if (scrollProgress.value < -currentThreshold && currentIndex.value > 0) {
      currentIndex.value--
      scrollProgress.value = 0
    } else if (scrollProgress.value > unlockThreshold && currentIndex.value === texts.length - 1) {
      // Immediate unlock for better performance
      unlockScroll()
    }

    // Apply ceiling: prevent negative accumulation when at first text
    if (currentIndex.value === 0 && scrollProgress.value < 0) {
      scrollProgress.value = 0
    }

    // Apply floor: prevent positive accumulation when at last text (before unlock)
    if (currentIndex.value === texts.length - 1 && scrollProgress.value > unlockThreshold) {
      scrollProgress.value = unlockThreshold
    }

    e.preventDefault()
  }
}

/**
 * Handles keyboard navigation for accessibility
 * @param e - The keyboard event
 */
const handleKeyDown = (e: KeyboardEvent) => {
  if (isLocked.value) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      if (currentIndex.value < texts.length - 1) {
        currentIndex.value++
      } else {
        unlockScroll()
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      if (currentIndex.value > 0) {
        currentIndex.value--
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (currentIndex.value === texts.length - 1) {
        unlockScroll()
      } else {
        currentIndex.value++
      }
    }
  }
}

/**
 * Re-locks the hero section when scrolling back to top
 */
const handleScroll = () => {
  if (typeof window !== 'undefined' && !isLocked.value && window.scrollY === 0) {
    document.documentElement.classList.remove('unlocked')
    document.body.classList.remove('unlocked')
    document.documentElement.style.overflowY = 'hidden'
    document.body.style.overflow = 'hidden'
    isLocked.value = true
    currentIndex.value = 0
    scrollProgress.value = 0
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll)
    window.scrollTo(0, 0)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.hero__title-hidden {
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

.hero__text {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  max-width: 95%;
  line-height: 1.4;
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: opacity 1s ease, transform 1s ease;
  position: absolute;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
  padding: 0 1rem;
}

.hero__text--active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.hero__indicator {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  color: #ffffff;
  animation: bounce 2s infinite;
  opacity: 0.7;
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(10px);
  }
}

/* Mobile First: Tablet and up */
@media (min-width: 480px) {
  .hero__text {
    font-size: 2.25rem;
    max-width: 90%;
  }
}

/* Desktop and up */
@media (min-width: 769px) {
  .hero__text {
    font-size: clamp(2.5rem, 5vw, 6rem);
    max-width: 80%;
    padding: 0 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__text {
    transition: none;
  }

  .hero__indicator {
    animation: none;
  }
}
</style>
