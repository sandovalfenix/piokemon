<!--
  AddPokemonModal Component
  Feature: 003-pokemon-team-builder

  Modal to select moves before adding a Pokemon to the team
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Pokemon, Move } from '@/models/teamBuilder'
import { fetchMovesBatch } from '@/services/teamBuilder'
import PhysicalIcon from '@/assets/img/Battle/physical.png'
import SpecialIcon from '@/assets/img/Battle/special.png'
import StatusIcon from '@/assets/img/Battle/status.png'

interface Props {
  pokemon: Pokemon | null
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'add-to-team', moves: Move[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const availableMoves = ref<Move[]>([])
const selectedMoves = ref<Move[]>([])
const moveSearchQuery = ref('')
const isLoading = ref(false)
const loadError = ref<string | null>(null)

// Computed
const canAddMore = computed(() => selectedMoves.value.length < 4)
const isReady = computed(() => selectedMoves.value.length >= 1 && selectedMoves.value.length <= 4)

const filteredMoves = computed(() => {
  if (!moveSearchQuery.value.trim()) {
    return availableMoves.value
  }

  const query = moveSearchQuery.value.toLowerCase().trim()
  return availableMoves.value.filter(move =>
    move.name.toLowerCase().includes(query) ||
    move.type.toLowerCase().includes(query) ||
    move.category.toLowerCase().includes(query)
  )
})

/**
 * Fetch move details when pokemon changes
 */
watch(
  () => props.pokemon,
  async (newPokemon) => {
    if (!newPokemon || !props.isOpen) {
      availableMoves.value = []
      selectedMoves.value = []
      return
    }

    await fetchMoveDetails()
  },
  { immediate: true }
)

/**
 * Fetch move details when modal opens
 */
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && props.pokemon) {
      await fetchMoveDetails()
    } else {
      selectedMoves.value = []
      loadError.value = null
    }
  }
)

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
      loadError.value = 'No moves available for this Pokemon'
      availableMoves.value = []
      return
    }

    availableMoves.value = moves
  } catch (error) {
    console.error('Failed to fetch moves:', error)
    loadError.value = 'Failed to load moves. Please try again.'
    availableMoves.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle move add
 */
function handleAddMove(move: Move): void {
  if (!canAddMore.value) return
  if (selectedMoves.value.some((m) => m.id === move.id)) return

  selectedMoves.value.push(move)
}

/**
 * Handle move remove
 */
function handleRemoveMove(move: Move): void {
  selectedMoves.value = selectedMoves.value.filter((m) => m.id !== move.id)
}

/**
 * Check if move is selected
 */
function isMoveSelected(move: Move): boolean {
  return selectedMoves.value.some((m) => m.id === move.id)
}

/**
 * Handle add to team
 */
function handleAddToTeam(): void {
  if (!isReady.value) return
  emit('add-to-team', selectedMoves.value)
  handleClose()
}

/**
 * Handle close modal
 */
function handleClose(): void {
  selectedMoves.value = []
  moveSearchQuery.value = ''
  emit('close')
}

/**
 * Handle backdrop click
 */
function handleBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

/**
 * Get type color class
 */
function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    Normal: '#a8a878',
    Fire: '#f08030',
    Water: '#6890f0',
    Electric: '#f8d030',
    Grass: '#78c850',
    Ice: '#98d8d8',
    Fighting: '#c03028',
    Poison: '#a040a0',
    Ground: '#e0c068',
    Flying: '#a890f0',
    Psychic: '#f85888',
    Bug: '#a8b820',
    Rock: '#b8a038',
    Ghost: '#705898',
    Dragon: '#7038f8',
    Dark: '#705848',
    Steel: '#b8b8d0',
    Fairy: '#ee99ac',
  }
  return typeColors[type] ?? '#a8a878'
}

/**
 * Get category icon path
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Physical: PhysicalIcon,
    Special: SpecialIcon,
    Status: StatusIcon,
  }
  return icons[category] ?? ''
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && pokemon"
        class="modal-backdrop"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`modal-title-${pokemon.id}`"
      >
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 :id="`modal-title-${pokemon.id}`" class="modal-title">
              Select Moves for {{ pokemon.name }}
              <span class="move-count">({{ selectedMoves.length }}/4)</span>
            </h2>
          </div>

          <!-- Moves List -->
          <div class="moves-section">
            <!-- Move Search Bar -->
            <div v-if="!isLoading && !loadError && availableMoves.length > 0" class="move-search-bar">
              <input
                v-model="moveSearchQuery"
                type="text"
                placeholder="Search moves by name, type, or category..."
                class="move-search-input"
              />
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading moves...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="loadError" class="error-state">
              <p>{{ loadError }}</p>
              <button @click="fetchMoveDetails" class="retry-button">Retry</button>
            </div>

            <!-- No Results State -->
            <div v-else-if="availableMoves.length > 0 && filteredMoves.length === 0" class="empty-state">
              <p>No moves found matching "{{ moveSearchQuery }}"</p>
            </div>

            <!-- Moves List -->
            <div v-else-if="filteredMoves.length > 0" class="moves-list">
              <button
                v-for="move in filteredMoves"
                :key="move.id"
                class="move-item"
                :class="{
                  'move-selected': isMoveSelected(move),
                  'move-disabled': !canAddMore && !isMoveSelected(move)
                }"
                :disabled="!canAddMore && !isMoveSelected(move)"
                @click="isMoveSelected(move) ? handleRemoveMove(move) : handleAddMove(move)"
              >
                <div class="move-main">
                  <img
                    v-if="getCategoryIcon(move.category)"
                    :src="getCategoryIcon(move.category)"
                    :alt="move.category"
                    class="move-icon"
                  />
                  <span class="move-name">{{ move.name }}</span>
                  <span class="move-type" :style="{ backgroundColor: getTypeColor(move.type) }">{{ move.type }}</span>
                </div>
                <div class="move-stats ml-2">
                  <span v-if="move.power" class="stat">{{ move.power }}</span>
                  <span v-else class="stat">-</span>
                  <span class="stat-sep">•</span>
                  <span class="stat">{{ move.pp }} PP</span>
                </div>
              </button>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <p>No moves available</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button @click="handleClose" class="cancel-button">Cancel</button>
            <button
              @click="handleAddToTeam"
              class="add-button"
              :disabled="!isReady"
            >
              Add to Team
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-transform: capitalize;
}

.move-count {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.875rem;
  margin-left: 8px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* Moves Section */
.moves-section {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.move-search-bar {
  position: relative;
  margin-bottom: 8px;
  padding: 0 4px;
}

.move-search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.move-search-input:focus {
  border-color: #3b82f6;
}

.move-search-bar .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.moves-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Move Item */
.move-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.move-item:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.move-item.move-selected {
  background: #dbeafe;
  border-color: #3b82f6;
}

.move-item.move-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.move-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.move-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  object-fit: contain;
  opacity: 0.7;
}

.move-selected .move-icon {
  opacity: 1;
}

.move-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  text-transform: capitalize;
  flex: 1;
}

.move-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
  flex-shrink: 0;
}

.move-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
  flex-shrink: 0;
}

.stat {
  font-weight: 500;
}

.stat-sep {
  color: #d1d5db;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #6b7280;
  font-size: 0.875rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-button {
  margin-top: 12px;
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.add-button {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-button {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f9fafb;
  color: #1f2937;
}

.add-button {
  background: #10b981;
  color: white;
}

.add-button:hover:not(:disabled) {
  background: #059669;
}

.add-button:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 90vh;
  }

  .modal-header {
    padding: 12px 16px;
  }

  .modal-title {
    font-size: 0.9rem;
  }

  .move-count {
    font-size: 0.8rem;
  }

  .moves-section {
    padding: 4px;
  }

  .move-item {
    padding: 8px 10px;
  }

  .modal-footer {
    padding: 10px 12px;
  }
}
</style>
