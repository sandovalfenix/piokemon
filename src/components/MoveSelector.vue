<template>
  <div class="space-y-2" role="region" aria-label="Move selection">
    <p class="text-sm text-gray-600 dark:text-gray-400">Select a move (press 1-4):</p>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="(move, index) in moves"
        :key="move.id"
        :disabled="disabled"
        :class="[
          'px-4 py-3 text-gray-800 rounded-xl transition-all duration-150',
          'bg-gray-100 shadow-[4px_4px_6px_rgba(0,0,0,0.25),-4px_-4px_6px_rgba(255,255,255,0.8)]',
          'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]',
          'hover:translate-x-[1px] hover:translate-y-[1px]',
          'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]',
          'active:translate-x-[2px] active:translate-y-[2px]',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          { 'hover:translate-x-0 hover:translate-y-0': disabled }
        ]"
        :aria-label="`Move ${index + 1}: ${move.name}, Type: ${move.type}, Power: ${move.power}`"
        @click="handleMoveClick(index)"
      >
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold">{{ move.name }}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-slate-600 text-white">{{ move.type }}</span>
          </div>
          <div class="text-xs font-semibold">
            <span>Power: {{ move.power }}</span>
            <span class="ml-2">Acc: {{ move.accuracy }}%</span>
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
