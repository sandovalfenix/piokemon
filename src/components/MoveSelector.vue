<template>
  <div class="move-selector-container" role="region" aria-label="Move selection">
    <div class="grid grid-cols-2 gap-1.5">
      <button
        v-for="(move, index) in moves"
        :key="move.id"
        :disabled="disabled"
        :class="[
          'move-btn px-2 py-1.5 text-gray-800 rounded-lg transition-all duration-150',
          'bg-gray-100 shadow-[2px_2px_4px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)]',
          'hover:shadow-[1px_1px_2px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]',
          'hover:translate-x-[0.5px] hover:translate-y-[0.5px]',
          'active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]',
          'active:translate-x-[1px] active:translate-y-[1px]',
          'focus:outline-none focus:ring-1 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          { 'hover:translate-x-0 hover:translate-y-0': disabled }
        ]"
        :aria-label="`Move ${index + 1}: ${move.name}, Type: ${move.type}, Power: ${move.power}`"
        @click="handleMoveClick(index)"
      >
        <div class="flex flex-col items-start gap-0.5">
          <div class="flex items-center gap-1 w-full justify-between">
            <span class="font-semibold text-xs truncate">{{ move.name }}</span>
            <span class="type-badge text-[10px] px-1 py-0.5 rounded">{{ move.type }}</span>
          </div>
          <div class="text-[10px] text-gray-600">
            <span>Pwr: {{ move.power }}</span>
            <span class="ml-1.5">Acc: {{ move.accuracy }}%</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useBattleStore } from '@/stores/battle'
import { useInput } from '@/composables/useInput'
import { filterUsableMoves } from '@/domain/battle/engine/moveFilter'
import type { Move } from '@/domain/battle/engine/entities'

const props = defineProps<{
  disabled?: boolean
  /** Optional moves array - if provided, uses this instead of store */
  moves?: Move[]
  /** Battle style rendering mode */
  isBattleStyle?: boolean
}>()

const emit = defineEmits<{
  /** Emitted when a move is selected - pass move ID */
  (e: 'select-move', moveId: string): void
  /** Emitted when back/cancel is pressed */
  (e: 'back'): void
}>()

const battleStore = useBattleStore()

// Filter out status moves - only Physical/Special allowed per Feature 006 spec
// Use props.moves if provided, otherwise fall back to store
const moves = computed(() => {
  const allMoves = props.moves ?? battleStore.playerPokemon?.moves ?? []
  return filterUsableMoves(allMoves)
})

const disabledRef = toRef(props, 'disabled')

// Handle keyboard input (1-4 keys)
const input = useInput(
  {
    onMoveSelect: (moveIndex: number) => {
      if (moveIndex < moves.value.length) {
        selectMove(moves.value[moveIndex]!)
      }
    },
  },
  disabledRef
)

const selectMove = (move: Move) => {
  if (!props.disabled) {
    // Emit select-move event for parent component to handle
    emit('select-move', move.id)
  }
}

const handleMoveClick = (index: number) => {
  input.handleClick(index)
}
</script>

<style scoped>
.move-selector-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.move-btn {
  min-height: 44px;
  max-height: 52px;
}

.type-badge {
  background: #475569;
  color: white;
  flex-shrink: 0;
}
</style>
