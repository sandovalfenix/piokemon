import { onMounted, onUnmounted, ref } from 'vue'

export interface Position {
  x: number
  y: number
}

export interface UseKeyboardMovementOptions {
  /** Posición inicial del jugador (en %) */
  initialPosition?: Position
  /** Velocidad de movimiento (en % por paso) */
  speed?: number
  /** Límites del área de movimiento */
  bounds?: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
  /** Callback cuando el jugador se mueve */
  onMove?: (position: Position, direction: string) => void
}

const defaultOptions: Required<UseKeyboardMovementOptions> = {
  initialPosition: { x: 50, y: 50 },
  speed: 3,
  bounds: { minX: 5, maxX: 95, minY: 5, maxY: 95 },
  onMove: () => {},
}

export function useKeyboardMovement(options: UseKeyboardMovementOptions = {}) {
  const opts = { ...defaultOptions, ...options }

  const position = ref<Position>({ ...opts.initialPosition })
  const isMoving = ref(false)
  const lastDirection = ref<string>('')

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    const { speed, bounds } = opts
    let newX = position.value.x
    let newY = position.value.y

    switch (direction) {
      case 'up':
        newY = clamp(position.value.y - speed, bounds.minY, bounds.maxY)
        break
      case 'down':
        newY = clamp(position.value.y + speed, bounds.minY, bounds.maxY)
        break
      case 'left':
        newX = clamp(position.value.x - speed, bounds.minX, bounds.maxX)
        break
      case 'right':
        newX = clamp(position.value.x + speed, bounds.minX, bounds.maxX)
        break
    }

    // Solo actualizar si hubo cambio
    if (newX !== position.value.x || newY !== position.value.y) {
      position.value = { x: newX, y: newY }
      lastDirection.value = direction
      isMoving.value = true
      opts.onMove(position.value, direction)

      // Reset moving state after animation
      setTimeout(() => {
        isMoving.value = false
      }, 200)
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    // Ignorar si el foco está en un input
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault()
        move('up')
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault()
        move('down')
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault()
        move('left')
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault()
        move('right')
        break
    }
  }

  const setPosition = (newPos: Position) => {
    position.value = { ...newPos }
  }

  const resetPosition = () => {
    position.value = { ...opts.initialPosition }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    position,
    isMoving,
    lastDirection,
    move,
    setPosition,
    resetPosition,
  }
}
