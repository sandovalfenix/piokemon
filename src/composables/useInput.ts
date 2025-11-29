import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * Keyboard key mapping for move selection (1-4 maps to move indices 0-3)
 */
const MOVE_KEYS = ['1', '2', '3', '4'] as const

export interface InputHandlers {
  onMoveSelect?: (moveIndex: number) => void
  onCancel?: () => void
  onConfirm?: () => void
}

/**
 * Composable for handling keyboard and pointer input
 * Provides debouncing, disabled state management, and key mapping
 *
 * @param handlers Input event handlers
 * @param disabledRef Reactive ref to control input enabled state
 * @returns Object with input state utilities
 */
export function useInput(
  handlers: InputHandlers,
  disabledRef?: Ref<boolean>
) {
  const lastInputTime = ref(0)
  const DEBOUNCE_MS = 100

  /**
   * Check if input is allowed (not disabled and debounced)
   */
  const isInputAllowed = (): boolean => {
    if (disabledRef?.value) return false
    const now = Date.now()
    if (now - lastInputTime.value < DEBOUNCE_MS) return false
    lastInputTime.value = now
    return true
  }

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isInputAllowed()) return

    // Move selection keys (1-4)
    const moveKeyIndex = MOVE_KEYS.indexOf(e.key as typeof MOVE_KEYS[number])
    if (moveKeyIndex !== -1) {
      e.preventDefault()
      handlers.onMoveSelect?.(moveKeyIndex)
      return
    }

    // Other keys
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        handlers.onCancel?.()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        handlers.onConfirm?.()
        break
    }
  }

  /**
   * Handle touch/click with debouncing
   */
  const handleClick = (moveIndex: number) => {
    if (!isInputAllowed()) return
    handlers.onMoveSelect?.(moveIndex)
  }

  // Register keyboard listener
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleClick,
    isInputAllowed,
  }
}
