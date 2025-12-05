<!--
  TeamBuilderView
  Feature: 003-pokemon-team-builder
  User Story 1: Browse Pokemon Catalog
  User Story 2: Select Pokemon and View Available Moves
  User Story 3: Build Custom Team
  User Story 4: Start Battle with Custom Team

  Main view integrating Pokemon catalog, move selector, team roster, and battle start
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import PokemonCatalog from '@/components/teamBuilder/PokemonCatalog.vue'
import AddPokemonModal from '@/components/teamBuilder/AddPokemonModal.vue'
import TeamRoster from '@/components/teamBuilder/TeamRoster.vue'
import { useTeamStore } from '@/stores/team'
import { useBattleStore } from '@/stores/battle'
import type { Pokemon, Move, TeamMember } from '@/models/teamBuilder'

const router = useRouter()
const teamStore = useTeamStore()
const battleStore = useBattleStore()
const { roster, isTeamEmpty, isTeamFull, hasLeadPokemon } = storeToRefs(teamStore)

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isModalOpen = ref(false)
const selectedPokemonForModal = ref<Pokemon | null>(null)

/**
 * Load team from localStorage on mount
 * Task: T043
 */
onMounted(() => {
  teamStore.loadTeam()
})

/**
 * Handle Pokemon selection from catalog - open modal
 * Task: T026
 */
function handlePokemonSelect(pokemon: Pokemon) {
  if (isTeamFull.value) {
    errorMessage.value = 'Team is full (6/6). Remove a Pokemon to add more.'
    setTimeout(() => {
      errorMessage.value = null
    }, 3000)
    return
  }

  selectedPokemonForModal.value = pokemon
  isModalOpen.value = true
  errorMessage.value = null
  successMessage.value = null
}

/**
 * Handle close modal
 */
function handleCloseModal() {
  isModalOpen.value = false
  selectedPokemonForModal.value = null
}

/**
 * Calculate max HP based on Pokemon stats and level
 * Task: T064
 */
function calculateMaxHp(baseHp: number, level: number): number {
  // HP calculation formula: ((2 * Base + IV + (EV / 4)) * Level / 100) + Level + 10
  // For simplicity, assume IV=31 (max) and EV=0
  const iv = 31
  const ev = 0
  return Math.floor(((2 * baseHp + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
}

/**
 * Handle add to team from modal
 * Task: T034, T035
 */
function handleAddToTeam(selectedMoves: Move[]) {
  errorMessage.value = null
  successMessage.value = null

  // Validation
  if (!selectedPokemonForModal.value) {
    errorMessage.value = 'No Pokemon selected'
    return
  }

  if (selectedMoves.length === 0) {
    errorMessage.value = 'Please select at least 1 move'
    return
  }

  if (selectedMoves.length > 4) {
    errorMessage.value = 'Cannot select more than 4 moves'
    return
  }

  if (isTeamFull.value) {
    errorMessage.value = 'Team is full (6/6). Remove a Pokemon to add more.'
    return
  }

  // Create TeamMember
  const level = 50
  const maxHp = calculateMaxHp(selectedPokemonForModal.value.stats.hp, level)

  const teamMember: TeamMember = {
    pokemon: selectedPokemonForModal.value,
    selectedMoves,
    level,
    currentHp: maxHp,
    maxHp,
    position: roster.value.length, // Will be updated by store
  }

  // Add to team
  const result = teamStore.addPokemon(teamMember)

  if (result.valid) {
    successMessage.value = `${selectedPokemonForModal.value.name} added to team!`
    teamStore.saveTeam()

    // Clear selection and close modal
    selectedPokemonForModal.value = null
    isModalOpen.value = false

    // Clear message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } else {
    errorMessage.value = result.errors[0] ?? 'Failed to add Pokemon to team'

    // Clear message after 3 seconds
    setTimeout(() => {
      errorMessage.value = null
    }, 3000)
  }
}

async function startBattle() {
  errorMessage.value = null

  try {
    await battleStore.startBattleWithCustomTeam()
    router.push('/battle')
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
      console.error('[TeamBuilderView] Battle start failed:', error.message)
    }
  }
}
</script>

<template>
  <div class="team-builder-view">
    <div class="view-container">
      <!-- Team status bar -->
      <div class="team-status-bar">
        <div class="battle-controls">
          <button
            class="start-battle-button"
            :disabled="isTeamEmpty || !hasLeadPokemon"
            @click="startBattle"
          >
            Start Battle
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="success-banner">
        {{ successMessage }}
      </div>

      <!-- Main content area -->
      <div class="content-grid">
        <!-- Pokemon Catalog -->
        <div class="catalog-section">
          <PokemonCatalog @pokemon-select="handlePokemonSelect" />
        </div>

        <!-- Team Roster -->
        <div class="roster-section">
          <TeamRoster />
        </div>
      </div>

      <!-- Add Pokemon Modal -->
      <AddPokemonModal
        :pokemon="selectedPokemonForModal"
        :is-open="isModalOpen"
        @close="handleCloseModal"
        @add-to-team="handleAddToTeam"
      />
    </div>
  </div>
</template>

<style scoped>
.team-builder-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.view-container {
  max-width: 1800px;
  margin: 0 auto;
}

.team-status-bar {
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.team-info h3 {
  color: #fff;
  font-size: 1.25rem;
  margin: 0 0 4px 0;
}

.team-lead {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.start-battle-button {
  padding: 12px 32px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-battle-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(245, 87, 108, 0.4);
}

.start-battle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  padding: 12px 24px;
  background: rgba(255, 59, 48, 0.9);
  color: #fff;
  font-weight: 500;
  text-align: center;
}

.success-banner {
  padding: 12px 24px;
  background: rgba(52, 199, 89, 0.9);
  color: #fff;
  font-weight: 500;
  text-align: center;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
}

@media (max-width: 1400px) {
  .content-grid {
    grid-template-columns: 1fr 350px;
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.catalog-section,
.roster-section {
  min-height: 300px;
}
</style>
