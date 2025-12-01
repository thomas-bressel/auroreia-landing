<template>
  <canvas
    ref="auroraCanvas"
    id="aurora"
    aria-hidden="true"
    role="presentation"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const auroraCanvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

/**
 * Initialize Aurora animation on component mount
 */
onMounted(() => {
  // Initialize Aurora immediately when component mounts
  console.log('[Aurora] Component mounted', auroraCanvas.value)

  if (!auroraCanvas.value) {
    console.error('[Aurora] Canvas ref is null!')
    return
  }

  requestAnimationFrame(() => {
    console.log('[Aurora] Starting initialization...')
    initAurora()
  })
})

/**
 * Initializes the Aurora canvas animation with gradient waves
 */
const initAurora = () => {
  if (!auroraCanvas.value) {
    console.error('[Aurora] Canvas not available in initAurora')
    return
  }

  const canvas = auroraCanvas.value
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })

  if (!ctx) {
    console.error('[Aurora] Failed to get 2d context')
    return
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  console.log('[Aurora] Canvas initialized', canvas.width, 'x', canvas.height)

  let time = 0

  /**
   * Animation loop that draws the aurora effect
   */
  const animate = () => {
    if (!ctx) return

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    time += 0.005

    for (let i = 0; i < 3; i++) {
      const gradient = ctx.createLinearGradient(
        0,
        canvas.height * 0.3,
        canvas.width,
        canvas.height * 0.7
      )

      const colors = [
        { pos: 0, color: 'rgba(0, 194, 199, 0.03)' },
        { pos: 0.5, color: 'rgba(122, 95, 255, 0.04)' },
        { pos: 1, color: 'rgba(255, 122, 89, 0.03)' }
      ]

      colors.forEach(({ pos, color }) => {
        gradient.addColorStop(pos, color)
      })

      ctx.fillStyle = gradient
      ctx.globalCompositeOperation = 'lighter'

      for (let x = 0; x < canvas.width; x += 4) {
        const y =
          canvas.height * 0.5 +
          Math.sin((x * 0.01 + time + i) * 0.8) * 80 +
          Math.cos((x * 0.02 - time * 0.5 + i) * 1.2) * 60

        ctx.fillRect(x, y - 100, 4, 200)
      }
    }

    ctx.globalCompositeOperation = 'source-over'

    animationId = requestAnimationFrame(animate)
  }

  console.log('[Aurora] Starting animation loop')
  animate()

  /**
   * Handles window resize events to adjust canvas dimensions
   */
  const handleResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log('[Aurora] Resized to', canvas.width, 'x', canvas.height)
  }

  window.addEventListener('resize', handleResize)
}

/**
 * Cleanup animation frame on component unmount
 */
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
#aurora {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>