<script setup lang="ts">
/**
 * HomeView - Simplified Lobby
 * Feature: 006-battle-module-update (Clarification: Lobby Flow Refactor)
 * Updated: 007-wild-encounter-capture (Wild encounter flow with Capturar preview)
 *
 * Shows only:
 * - Welcome text
 * - "Battle" button (auto-selects next opponent in progression)
 * - "Wild Encounter" button
 * - Progress display (badges earned)
 *
 *
 * Flow Guard: Checks hasStarter flag before allowing battle
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTeamStore } from '@/stores/team'
import { useProgressStore } from '@/stores/progress'
import { useEncounterStore, type EncounteredPokemon } from '@/stores/useEncounterStore'
import { getRandomUndefeatedNpc } from '@/data/thematicNpcs'
import { gymLeaders } from '@/data/gymLeaders'
import Buscar from '@/components/Buscar.vue'


const router = useRouter()
const teamStore = useTeamStore()
const progressStore = useProgressStore()
const encounterStore = useEncounterStore()

// Modal state for "No Starter" warning
const showNoStarterModal = ref(false)

// Wild encounter modal state (Buscar animation)
const showWildEncounter = ref(false)


// Badge images mapping (ordered by gym progression)
import badgeJose from '@/assets/images/badges/Valle_Vivo-JOSE.png'
import badgeManuel from '@/assets/images/badges/Medalla_Oleada_Viva-MANUEL.png'
import badgeRafael from '@/assets/images/badges/Medalla_del_Ritmo_Pacifico-RAFAEL.png'
import badgeSofia from '@/assets/images/badges/El_Cielo_Sagrado-SOFIA.png'
import badgeValeria from '@/assets/images/badges/SelvaPacifica-VALERIA.png'

const badgeImages = [
  { src: badgeJose, name: 'Medalla Valle Vivo' },
  { src: badgeManuel, name: 'Medalla Oleada Viva' },
  { src: badgeRafael, name: 'Medalla Ritmo Pacífico' },
  { src: badgeSofia, name: 'Medalla Cielo Sagrado' },
  { src: badgeValeria, name: 'Medalla Selva Pacífica' }
]

// Computed: Number of badges earned
const badgesEarned = computed(() => progressStore.earnedBadges.length)

// Computed: Can battle/explore (team must not be empty)
const canBattle = computed(() => !teamStore.isTeamEmpty && teamStore.hasStarter)

/**
 * Lobby Guard: Auto-redirect to starter selection if no team
 * Prevents "back button" exploits
 */
onMounted(() => {
  // Load team from localStorage to ensure sync
  teamStore.loadTeam()

  // If team is empty and no starter, redirect to starter selection
  if (teamStore.isTeamEmpty || !teamStore.hasStarter) {
    console.log('[HomeView] No team or starter - redirecting to starter selection')
    router.replace('/starter-selection')
  }
})

// Computed: Current gym info
const currentGymInfo = computed(() => {
  if (progressStore.isGameComplete) {
    return { name: '¡Campeón!', index: 6 }
  }
  const gym = gymLeaders.find(g => g.id === progressStore.currentGym)
  return gym ? { name: gym.name, index: progressStore.currentGym } : { name: 'Gimnasio 1', index: 1 }
})



/**
 * Check if player has a starter (hasStarter flag)
 */
function hasStarter(): boolean {
  return teamStore.hasStarter
}

/**
 * Navigate to starter selection
 */
function goToStarterSelection() {
  showNoStarterModal.value = false
  router.push('/starter-selection')
}

/**
 * Handle "Battle" button click
 * Auto-selects next opponent in linear progression
 */
function handleBattleClick() {
  // Flow Guard: Check for starter
  if (!hasStarter()) {
    showNoStarterModal.value = true
    return
  }

  // Check if game is complete
  if (progressStore.isGameComplete) {
    // All gym leaders defeated - maybe show a message?
    console.log('[HomeView] Game complete - no more story battles')
    return
  }

  // Determine next opponent
  const canChallengeGym = progressStore.canChallengeGymLeader(progressStore.currentGym)

  if (canChallengeGym) {
    // Challenge Gym Leader
    const gymLeader = gymLeaders.find(g => g.id === progressStore.currentGym)
    if (gymLeader) {
      sessionStorage.setItem('battleTarget', JSON.stringify({
        type: 'gym-leader',
        id: gymLeader.id,
      }))
      router.push('/battle')
    }
  } else {
    // Challenge random undefeated NPC from current gym's pool
    const npc = getRandomUndefeatedNpc(progressStore.defeatedTrainers)
    if (npc) {
      sessionStorage.setItem('battleTarget', JSON.stringify({
        type: 'npc',
        id: npc.id,
      }))
      router.push('/battle')
    }
  }
}

/**
 * Handle "Wild Encounter" button click
 */
function handleWildBattleClick() {
  // Flow Guard: Check for starter
  if (!hasStarter()) {
    showNoStarterModal.value = true
    return
  }

  // Open wild encounter search modal
  showWildEncounter.value = true
}

function handleChangeTeamClick() {
  router.push('/pc')
}

/**
 * Handle closing wild encounter modal
 */
function handleCloseWildEncounter() {
  showWildEncounter.value = false
  foundPokemon.value = null
}

/**
 * Feature 007: Handle Pokemon found from Buscar
 * Navigate directly to BattleView with wild Pokémon data (skip Capturar preview)
 */
function handlePokemonFound(pokemon: EncounteredPokemon) {
  // Store wild encounter data for BattleView
  sessionStorage.setItem('battleTarget', JSON.stringify({
    type: 'wild',
    id: `wild-${pokemon.id}`,
    pokemonData: pokemon,
  }))

  showWildEncounter.value = false

  // Navigate to battle immediately
  router.push('/battle')
  console.log('[HomeView] Pokémon found:', pokemon.name, '- Starting wild battle immediately')
}

/**
 * Feature 007: Handle Pokemon not found
 */
function handlePokemonNotFound() {
  console.log('[HomeView] No Pokémon found')
  // Buscar component stays open for retry or close
}

</script>

<template>
  <main class="lobby-container">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h1 class="title">Pokémon MMO</h1>
      <p class="subtitle">¡Bienvenido, entrenador!</p>
    </section>

    <!-- Progress Display (T026) -->
    <section v-if="teamStore.hasStarter" class="progress-section">
      <div class="badges-display">
        <img
          v-for="(badge, idx) in badgeImages"
          :key="idx"
          :src="badge.src"
          :alt="badge.name"
          class="badge-icon"
          :class="{ 'badge-earned': idx < badgesEarned, 'badge-unearned': idx >= badgesEarned }"
        />
      </div>
      <p class="progress-text">
        {{ progressStore.isGameComplete ? '¡Eres el Campeón!' : `Próximo: ${currentGymInfo.name}` }}
      </p>
    </section>

    <!-- Battle Buttons -->
    <section class="battle-section">
      <Button
        class="battle-btn story-btn"
        size="lg"
        :disabled="progressStore.isGameComplete || !canBattle"
        @click="handleBattleClick"
      >
        {{ progressStore.isGameComplete ? 'Campeón' : 'Batalla' }}
      </Button>

      <Button
        class="battle-btn wild-btn"
        size="lg"
        variant="outline"
        :disabled="!canBattle"
        @click="handleWildBattleClick"
      >
        Encuentro Salvaje
      </Button>
      <Button
        class="battle-btn wild-btn"
        size="lg"
        variant="outline"
        @click="handleChangeTeamClick"
      >
        Cambia tu equipo
      </Button>
    </section>

    <!-- Wild Encounter Modal (Buscar Animation) -->
    <Buscar
      v-if="showWildEncounter"
      @cerrar="handleCloseWildEncounter"
      @pokemon-encontrado="handlePokemonFound"
      @pokemon-no-encontrado="handlePokemonNotFound"
    />

    <!-- No Starter Modal -->
    <Dialog v-model:open="showNoStarterModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¡Necesitas un Pokémon!</DialogTitle>
          <DialogDescription>
            Antes de comenzar tu aventura, debes elegir tu Pokémon inicial.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="goToStarterSelection">
            Elegir Pokémon Inicial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </main>
</template>

<style scoped>
.lobby-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
}

.welcome-section {
  margin-bottom: 2rem;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: #666;
}

/* Progress Section (T026) */
.progress-section {
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.badges-display {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.badge-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: transform 0.2s, opacity 0.2s;
}

.badge-earned {
  opacity: 1;
  filter: none;
}

.badge-unearned {
  opacity: 0.3;
  filter: grayscale(100%);
}

.badge-icon:hover {
  transform: scale(1.2);
}

.progress-text {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}

.battle-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.battle-btn {
  width: 100%;
  font-size: 1.25rem;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.battle-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.story-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.story-btn:disabled {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #333;
  opacity: 1;
}

.wild-btn {
  background: white;
  color: #2e7d32;
  border: 2px solid #4caf50;
}

.wild-btn:hover {
  background: #e8f5e9;
}

</style>
