<template>
  <div class="space-y-2" role="region" aria-label="Move selection">
    <p class="text-sm text-gray-600 dark:text-gray-400">Select a move (press 1-4):</p>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="(move, index) in moves"
        :key="move.id"
        :disabled="disabled"
        :class="['btn', { 'btn-disabled': disabled }]"
        :aria-label="`Move ${index + 1}: ${move.name}, Type: ${move.type}, Power: ${move.power}`"
        @click="handleMoveClick(index)"
      >
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold">{{ move.name }}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-slate-600 text-white">{{ move.type }}</span>
          </div>
          <div class="text-xs text-gray-300">
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
import type { Move } from '@/domain/battle/engine/entities'

const props = defineProps<{
  disabled?: boolean
}>()

const battleStore = useBattleStore()

const moves = computed(() => battleStore.playerPokemon?.moves ?? [])
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
    battleStore.selectPlayerMove(move.id)
  }
}

const handleMoveClick = (index: number) => {
  input.handleClick(index)
}
</script>
<style scoped lang="postcss">
.btn {
  @apply px-4 py-3 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-disabled {
  @apply hover:bg-slate-700;
}
</style>
