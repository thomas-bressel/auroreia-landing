<template>
  <div id="app" :class="{ 'app-loaded': isLoaded }">
    <AuroraBackground />
    <div class="content-wrapper">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isLoaded = ref(false)

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
.content-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
</style>