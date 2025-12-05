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
import { getRandomUndefeatedNpcFromGym, getNpcsByGym, areGymNpcsDefeated } from '@/data/thematicNpcs'
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

// Computed: Progress bar state (0% -> 50% NPC -> 100% Gym)
const currentGymProgress = computed(() => {
  const currentGym = progressStore.currentGym
  const gymNpcs = getNpcsByGym(currentGym)
  const defeatedNpcsCount = gymNpcs.filter(npc =>
    progressStore.defeatedTrainers.includes(npc.id)
  ).length
  const totalNpcs = gymNpcs.length

  // NPCs account for 0-50%, Gym Leader accounts for 50-100%
  const npcProgress = totalNpcs > 0 ? (defeatedNpcsCount / totalNpcs) * 50 : 0
  const isGymDefeated = progressStore.isGymLeaderDefeated(currentGym)

  return {
    percentage: isGymDefeated ? 100 : npcProgress,
    phase: isGymDefeated ? 'gym-complete' : (npcProgress >= 50 ? 'gym-ready' : 'npc-phase'),
    defeatedNpcs: defeatedNpcsCount,
    totalNpcs,
    canChallengeGym: areGymNpcsDefeated(currentGym, progressStore.defeatedTrainers),
  }
})

// Computed: Progress bar label
const progressLabel = computed(() => {
  if (progressStore.isGameComplete) return '¡Campeón!'
  const { defeatedNpcs, totalNpcs, canChallengeGym } = currentGymProgress.value
  if (canChallengeGym) return `¡Desafía al Líder de Gimnasio!`
  return `NPCs: ${defeatedNpcs}/${totalNpcs}`
})

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
 * Computed: Current gym progress percentage
 * 0% → 50% = NPCs progress, 50% → 100% = Gym Leader defeated
 */
const gymProgressPercent = computed(() => {
  if (progressStore.isGameComplete) return 100

  const gymId = progressStore.currentGym
  const gymNpcs = getNpcsByGym(gymId)
  const totalNpcs = gymNpcs.length
  const defeatedNpcs = gymNpcs.filter(npc =>
    progressStore.defeatedTrainers.includes(npc.id)
  ).length

  // NPCs contribute 0-50%, gym leader adds final 50%
  const npcProgress = totalNpcs > 0 ? (defeatedNpcs / totalNpcs) * 50 : 0

  // If gym leader is already defeated for this gym, add 50%
  const gymLeaderDefeated = progressStore.isGymLeaderDefeated(gymId)
  const leaderProgress = gymLeaderDefeated ? 50 : 0

  return Math.round(npcProgress + leaderProgress)
})

/**
 * Computed: Progress description text
 */
const progressDescription = computed(() => {
  if (progressStore.isGameComplete) return '¡Has completado el juego!'

  const gymId = progressStore.currentGym
  const gymNpcs = getNpcsByGym(gymId)
  const totalNpcs = gymNpcs.length
  const defeatedNpcs = gymNpcs.filter(npc =>
    progressStore.defeatedTrainers.includes(npc.id)
  ).length

  const canChallengeGym = progressStore.canChallengeGymLeader(gymId)

  if (canChallengeGym) {
    return `¡Listo para el Líder de Gimnasio!`
  } else {
    return `Entrenadores: ${defeatedNpcs}/${totalNpcs}`
  }
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
 * Strict progression: 1 Random Thematic NPC -> 1 Gym Leader loop
 * Players must defeat all NPCs from current gym before challenging gym leader
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

  // Determine next opponent using strict gym progression
  const currentGym = progressStore.currentGym
  const canChallengeGym = progressStore.canChallengeGymLeader(currentGym)

  if (canChallengeGym) {
    // All gym NPCs defeated - challenge Gym Leader
    const gymLeader = gymLeaders.find(g => g.id === currentGym)
    if (gymLeader) {
      sessionStorage.setItem('battleTarget', JSON.stringify({
        type: 'gym-leader',
        id: gymLeader.id,
      }))
      router.push('/battle')
    }
  } else {
    // Challenge random undefeated NPC from CURRENT GYM only (strict progression)
    const npc = getRandomUndefeatedNpcFromGym(currentGym, progressStore.defeatedTrainers)
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
  <main class="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
    <!-- Welcome Section -->
    <section class="mb-8">
      <h1 class="text-5xl font-bold mb-2 bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
        Pokémon MMO
      </h1>
      <p class="text-xl text-gray-500 dark:text-gray-400">¡Bienvenido, entrenador!</p>
    </section>

    <!-- Progress Display -->
    <section v-if="teamStore.hasStarter" class="mb-8 w-full max-w-md">
      <!-- Gym Progress Card -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <!-- Gym Header -->
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Gimnasio {{ progressStore.currentGym }}: {{ currentGymInfo.name }}
          </span>
          <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {{ Math.round(currentGymProgress.percentage) }}%
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="relative mb-2">
          <div class="w-full h-3 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 ease-out"
              :class="{
                'bg-linear-to-r from-green-400 to-green-500': currentGymProgress.percentage < 50,
                'bg-linear-to-r from-amber-400 to-orange-500': currentGymProgress.percentage >= 50 && currentGymProgress.percentage < 100,
                'bg-linear-to-r from-indigo-500 to-purple-600': currentGymProgress.percentage >= 100
              }"
              :style="{ width: `${currentGymProgress.percentage}%` }"
            />
          </div>
          <!-- Progress Markers -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div class="w-0.5 h-3 bg-gray-400 dark:bg-slate-500" />
            <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">NPC</span>
          </div>
          <div class="absolute top-0 right-0 flex flex-col items-center">
            <div class="w-0.5 h-3 bg-gray-400 dark:bg-slate-500" />
            <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">GYM</span>
          </div>
        </div>

        <!-- Progress Label -->
        <p class="text-xs text-center font-medium mt-4"
           :class="{
             'text-green-600 dark:text-green-400': !currentGymProgress.canChallengeGym,
             'text-amber-600 dark:text-amber-400 animate-pulse': currentGymProgress.canChallengeGym
           }">
          {{ progressLabel }}
        </p>

        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-slate-600 my-4" />

        <!-- Badges Display -->
        <div class="flex justify-center gap-3 mb-3">
          <img
            v-for="(badge, idx) in badgeImages"
            :key="idx"
            :src="badge.src"
            :alt="badge.name"
            class="w-10 h-10 object-contain transition-all duration-200 hover:scale-125"
            :class="{
              'opacity-100 drop-shadow-md': idx < badgesEarned,
              'opacity-30 grayscale': idx >= badgesEarned
            }"
          />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ progressStore.isGameComplete ? '¡Eres el Campeón! 🏆' : `Medallas: ${badgesEarned}/5` }}
        </p>
      </div>
    </section>

    <!-- Battle Buttons -->
    <section class="flex flex-col gap-4 w-full max-w-xs">
      <Button
        class="w-full text-lg py-6 rounded-xl font-semibold bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        size="lg"
        :disabled="progressStore.isGameComplete || !canBattle"
        @click="handleBattleClick"
      >
        {{ progressStore.isGameComplete ? '🏆 Campeón' : '⚔️ Batalla' }}
      </Button>

      <Button
        class="w-full text-lg py-6 rounded-xl font-semibold bg-white hover:bg-green-50 text-green-700 border-2 border-green-500 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        size="lg"
        variant="outline"
        :disabled="!canBattle"
        @click="handleWildBattleClick"
      >
        🌿 Encuentro Salvaje
      </Button>

      <Button
        class="w-full text-lg py-6 rounded-xl font-semibold bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-500 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        size="lg"
        variant="outline"
        @click="handleChangeTeamClick"
      >
        📦 Cambia tu equipo
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
