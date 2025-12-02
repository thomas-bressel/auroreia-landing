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

// Mouse interaction state
const mousePos = ref({ x: -1000, y: -1000 })
const disturbances: Array<{ x: number; y: number; strength: number; age: number }> = []
let lastDisturbanceTime = 0

/**
 * Handle mouse movement to create disturbances
 */
const handleMouseMove = (event: MouseEvent) => {
  const now = Date.now()
  mousePos.value = { x: event.clientX, y: event.clientY }

  // Throttle disturbance creation (every 30ms)
  if (now - lastDisturbanceTime < 30) return
  lastDisturbanceTime = now

  // Add a new disturbance at mouse position
  disturbances.push({
    x: event.clientX,
    y: event.clientY,
    strength: 1,
    age: 0
  })

  // Keep only recent disturbances (last 15)
  if (disturbances.length > 15) {
    disturbances.shift()
  }
}

/**
 * Handle mouse leaving canvas
 */
const handleMouseLeave = () => {
  mousePos.value = { x: -1000, y: -1000 }
}

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

  // Add global mouse event listeners
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
  console.log('[Aurora] Mouse listeners attached to window')

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
   * Calculate disturbance effect at a given position
   */
  const calculateDisturbance = (x: number, baseY: number): number => {
    let totalDisturbance = 0
    const maxDistance = 250 // Radius of influence

    // Apply each disturbance
    for (const disturbance of disturbances) {
      if (!disturbance) continue

      const dx = x - disturbance.x
      const dy = baseY - disturbance.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < maxDistance) {
        // Create a circular "ripple" effect
        const normalizedDist = distance / maxDistance

        // Use sine wave for ripple effect + exponential falloff for smooth circular disturbance
        const ripple = Math.cos(normalizedDist * Math.PI) // Creates wave pattern
        const falloff = Math.exp(-normalizedDist * 10) // Exponential decay for smooth circular edge
        const influence = ripple * falloff

        // Direction: push away from disturbance center
        const angle = Math.atan2(dy, dx)
        const pushStrength = influence * disturbance.strength * 35 // Very subtle: 35 instead of 80

        // Apply circular disturbance
        totalDisturbance += pushStrength
      }
    }

    return totalDisturbance
  }

  /**
   * Update disturbance ages and remove old ones
   */
  const updateDisturbances = () => {
    for (let i = disturbances.length - 1; i >= 0; i--) {
      const disturbance = disturbances[i]
      if (!disturbance) continue

      disturbance.age += 1
      disturbance.strength = Math.max(0, 1 - disturbance.age / 160) // Fade over 60 frames (~1 second)

      // Remove old disturbances
      if (disturbance.strength <= 0.01) {
        disturbances.splice(i, 1)
      }
    }
  }

  /**
   * Animation loop that draws the aurora effect
   */
  const animate = () => {
    if (!ctx) return

    // Update disturbances each frame
    updateDisturbances()

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
        const baseY =
          canvas.height * 0.5 +
          Math.sin((x * 0.01 + time + i) * 0.8) * 80 +
          Math.cos((x * 0.02 - time * 0.5 + i) * 1.2) * 60

        // Apply mouse disturbance
        const disturbance = calculateDisturbance(x, baseY)
        const y = baseY + disturbance

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
 * Cleanup animation frame and event listeners on component unmount
 */
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
  console.log('[Aurora] Mouse listeners removed from window')
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