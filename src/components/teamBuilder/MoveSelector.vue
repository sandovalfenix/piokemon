<!--
  MoveSelector Component
  Feature: 003-pokemon-team-builder
  Task: T023

  Allows users to select up to 4 moves for a Pokemon
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Pokemon, Move } from '@/models/teamBuilder'
import { fetchMovesBatch } from '@/services/teamBuilder'
import MoveCard from './MoveCard.vue'

interface Props {
  pokemon: Pokemon | null
}

interface Emits {
  (e: 'moves-selected', moves: Move[]): void
  (e: 'add-to-team'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const availableMoves = ref<Move[]>([])
const selectedMoves = ref<Move[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)

// Computed
const canAddMore = computed(() => selectedMoves.value.length < 4)
const isReady = computed(() => selectedMoves.value.length >= 1 && selectedMoves.value.length <= 4)

/**
 * Fetch move details for selected Pokemon
 */
async function fetchMoveDetails(): Promise<void> {
  if (!props.pokemon) return

  isLoading.value = true
  loadError.value = null

  try {
    // Get first 50 moves (or all if less than 50)
    const moveIds = props.pokemon.moves.slice(0, 50).map((m) => m.id)
    const moves = await fetchMovesBatch(moveIds)

    if (moves.length === 0) {
      loadError.value = 'No moves found for this Pokemon'
    } else {
      availableMoves.value = moves
    }
  } catch (error) {
    loadError.value = 'Failed to load moves. Please try again.'
    console.error('[MoveSelector] Error fetching moves:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Check if a move is already selected
 */
function isMoveSelected(move: Move): boolean {
  return selectedMoves.value.some((m) => m.id === move.id)
}

/**
 * Handle adding a move to selection
 */
function handleAddMove(move: Move): void {
  if (selectedMoves.value.length >= 4) {
    console.warn('[MoveSelector] Cannot add more than 4 moves')
    return
  }

  if (isMoveSelected(move)) {
    console.warn('[MoveSelector] Move already selected')
    return
  }

  selectedMoves.value.push(move)
  emit('moves-selected', selectedMoves.value)
}

/**
 * Handle removing a move from selection
 */
function handleRemoveMove(move: Move): void {
  const index = selectedMoves.value.findIndex((m) => m.id === move.id)
  if (index !== -1) {
    selectedMoves.value.splice(index, 1)
    emit('moves-selected', selectedMoves.value)
  }
}

/**
 * Clear all selected moves
 */
function clearSelection(): void {
  selectedMoves.value = []
  emit('moves-selected', [])
}

/**
 * Handle add to team button
 */
function handleAddToTeam(): void {
  if (!isReady.value) {
    console.warn('[MoveSelector] Must select 1-4 moves before adding to team')
    return
  }
  emit('add-to-team')
}

// Watch for Pokemon changes
import { watch } from 'vue'
watch(
  () => props.pokemon,
  (newPokemon) => {
    if (newPokemon) {
      // Reset state
      availableMoves.value = []
      selectedMoves.value = []
      loadError.value = null
      // Fetch moves
      fetchMoveDetails()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="pokemon" class="move-selector bg-gray-50 rounded-lg p-4">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-xl font-bold text-gray-900 mb-1">
        Select Moves for {{ pokemon.name }}
      </h3>
      <p class="text-sm text-gray-600">
        Choose 1-4 moves for battle ({{ selectedMoves.length }}/4 selected)
      </p>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="spinner animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading moves...</span>
    </div>

    <!-- Error Message -->
    <div v-else-if="loadError" class="error-message bg-red-50 border border-red-300 rounded p-4">
      <p class="text-red-700">{{ loadError }}</p>
      <button
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        @click="fetchMoveDetails"
      >
        Retry
      </button>
    </div>

    <!-- Selected Moves -->
    <div v-else-if="selectedMoves.length > 0" class="selected-moves mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-semibold text-gray-900">Selected Moves</h4>
        <button
          class="text-sm text-red-600 hover:text-red-800 transition-colors"
          @click="clearSelection"
        >
          Clear All
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <MoveCard
          v-for="move in selectedMoves"
          :key="move.id"
          :move="move"
          :selected="true"
          @remove="handleRemoveMove"
        />
      </div>
    </div>

    <!-- Available Moves -->
    <div v-if="!isLoading && !loadError" class="available-moves">
      <h4 class="font-semibold text-gray-900 mb-2">Available Moves</h4>

      <!-- Warning if 4 moves selected -->
      <div
        v-if="selectedMoves.length >= 4"
        class="warning-message bg-yellow-50 border border-yellow-300 rounded p-3 mb-3"
      >
        <p class="text-yellow-800 text-sm">
          ⚠️ Maximum of 4 moves reached. Remove a move to add another.
        </p>
      </div>

      <!-- Moves Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        <MoveCard
          v-for="move in availableMoves"
          :key="move.id"
          :move="move"
          :selected="isMoveSelected(move)"
          :disabled="!canAddMore && !isMoveSelected(move)"
          @add="handleAddMove"
          @remove="handleRemoveMove"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="!isLoading && !loadError" class="actions mt-4 pt-4 border-t border-gray-300">
      <button
        class="add-to-team-button w-full px-6 py-3 rounded-lg font-bold text-lg transition-all"
        :class="{
          'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg': isReady,
          'bg-gray-300 text-gray-500 cursor-not-allowed': !isReady,
        }"
        :disabled="!isReady"
        :aria-label="`Add ${pokemon.name} to team with selected moves`"
        @click="handleAddToTeam"
      >
        {{ isReady ? `Add ${pokemon.name} to Team` : 'Select at least 1 move' }}
      </button>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-state text-center py-8 text-gray-500">
    <p>Select a Pokemon to view and choose moves</p>
  </div>
</template>

<style scoped>
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar for moves list */
.available-moves > div:last-child::-webkit-scrollbar {
  width: 8px;
}

.available-moves > div:last-child::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.available-moves > div:last-child::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.available-moves > div:last-child::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
