import { onUnmounted, ref, computed } from 'vue'
import { useBattleStore } from '@/stores/battle'

/**
 * Composable for managing battle animation loop timing
 * Provides frame-based scheduling and input disabling during turn resolution
 *
 * @returns Object with phase state and input control utilities
 */
export function useBattleLoop() {
  const battleStore = useBattleStore()
  let rafId = 0
  const isAnimating = ref(false)

  // Computed phase state from store
  const phase = computed(() => battleStore.phase)
  const isSelectPhase = computed(() => phase.value === 'select')
  const isResolvingPhase = computed(() => phase.value === 'resolving')
  const isEndedPhase = computed(() => phase.value === 'ended')

  // Input should be disabled during resolving phase or when animating
  const isInputDisabled = computed(() => isResolvingPhase.value || isAnimating.value)

  /**
   * Schedule a function to run on the next animation frame
   * @param callback Function to execute on next frame
   */
  const scheduleFrame = (callback: () => void) => {
    rafId = requestAnimationFrame(() => {
      callback()
    })
  }

  /**
   * Run animation with input disabled
   * @param animation Function that returns a promise resolving when animation completes
   */
  const runAnimation = async (animation: () => Promise<void>) => {
    isAnimating.value = true
    try {
      await animation()
    } finally {
      isAnimating.value = false
    }
  }

  /**
   * Cancel any pending animation frame
   */
  const cancelFrame = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  onUnmounted(() => {
    cancelFrame()
  })

  return {
    phase,
    isSelectPhase,
    isResolvingPhase,
    isEndedPhase,
    isInputDisabled,
    isAnimating,
    scheduleFrame,
    runAnimation,
    cancelFrame,
  }
}
