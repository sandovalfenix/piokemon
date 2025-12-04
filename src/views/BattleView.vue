<script setup lang="ts">
/**
 * BattleView - Battle Orchestrator
 * Feature: 006-battle-module-update
 *
 * Reads battleTarget from sessionStorage and hydrates teams from PokéAPI
 * before passing to BattleScreen component.
 */

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BattleScreen from '@/components/BattleScreen.vue'
import DefeatModal from '@/components/battle/DefeatModal.vue'
import { useTeamStore } from '@/stores/team'
import { useBattleStore } from '@/stores/battle'
import { useProgressStore } from '@/stores/progress'
import { getNpcById, getRandomUndefeatedNpc } from '@/data/thematicNpcs'
import { gymLeaders } from '@/data/gymLeaders'
import { selectWildPokemon } from '@/data/wildPokemonPool'
import { hydrateTeam } from '@/services/pokeapi/pokemonHydrationService'
import { transformTeamMemberToBattlePokemon } from '@/services/teamBuilder'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Pokemon } from '@/domain/battle/engine/entities'

const router = useRouter()
const teamStore = useTeamStore()
const battleStore = useBattleStore()
const progressStore = useProgressStore()

// Loading state
const isLoading = ref(true)
const loadingMessage = ref('Cargando batalla...')
const error = ref<string | null>(null)

// Battle configuration (from sessionStorage)
const battleTarget = ref<{
  type: 'npc' | 'gym-leader' | 'wild'
  id?: string | number
} | null>(null)

// Hydrated teams
const playerTeam = ref<Pokemon[]>([])
const opponentTeam = ref<Pokemon[]>([])
const opponentName = ref('Oponente')

// Trainer info for BattleScreen
interface TrainerInfo {
  id: string
  name: string
  team: Pokemon[]
}
const trainerInfo = ref<TrainerInfo | null>(null)

// Victory/Defeat modal state
const showVictoryModal = ref(false)
const showDefeatModal = ref(false)
const showMoveLearningUI = ref(false) // TODO: Implement move learning

/**
 * Get wild Pokemon based on player progress
 */
function getWildPokemon(): { pokemonId: number; level: number }[] {
  const avgLevel = progressStore.currentGym * 5 + 3 // Scale with gym progress
  const wildLevel = Math.max(3, avgLevel - 2)

  // Use selectWildPokemon from wildPokemonPool
  const selectedPokemon = selectWildPokemon()

  return [
    {
      pokemonId: selectedPokemon.pokemonId,
      level: wildLevel,
    },
  ]
}

/**
 * Initialize battle by hydrating teams
 */
async function initializeBattle() {
  isLoading.value = true
  error.value = null

  try {
    // 1. Read battle target from sessionStorage
    const targetJson = sessionStorage.getItem('battleTarget')
    if (!targetJson) {
      // No battle target found - likely a page reload
      // Redirect to home instead of showing error
      console.warn('[BattleView] No battle target found, redirecting to home')
      router.replace('/')
      return
    }

    battleTarget.value = JSON.parse(targetJson)
    sessionStorage.removeItem('battleTarget') // Clean up

    // 2. Prepare player team
    loadingMessage.value = 'Preparando tu equipo...'
    teamStore.loadTeam()

    if (teamStore.roster.length === 0) {
      // No team - redirect to team builder
      console.warn('[BattleView] No team found, redirecting to home')
      router.replace('/')
      return
    }

    playerTeam.value = teamStore.roster.map(transformTeamMemberToBattlePokemon)

    // 3. Determine opponent and hydrate their team
    loadingMessage.value = 'Cargando oponente...'

    let opponentConfig: { pokemonId: number; level: number }[] = []

    // Safety check for battleTarget
    if (!battleTarget.value) {
      error.value = 'No se encontró el objetivo de batalla.'
      return
    }

    switch (battleTarget.value.type) {
      case 'npc': {
        const npc = battleTarget.value.id
          ? getNpcById(battleTarget.value.id as string)
          : getRandomUndefeatedNpc(progressStore.defeatedTrainers)

        if (!npc) {
          error.value = 'NPC no encontrado.'
          return
        }

        opponentName.value = npc.name
        opponentConfig = npc.team

        // Set trainer info for BattleScreen
        trainerInfo.value = {
          id: npc.id,
          name: npc.name,
          team: [], // Will be filled after hydration
        }

        // Track opponent for progress
        battleStore.$patch({
          opponentType: 'thematic-npc',
          opponentId: npc.id,
          opponentName: npc.name,
        })
        break
      }

      case 'gym-leader': {
        const leader = gymLeaders.find((g) => g.id === battleTarget.value?.id)

        if (!leader) {
          error.value = 'Líder de gimnasio no encontrado.'
          return
        }

        opponentName.value = leader.name
        opponentConfig = leader.team.map((p) => ({
          pokemonId: p.pokemonId,
          level: p.level,
        }))

        trainerInfo.value = {
          id: String(leader.id),
          name: leader.name,
          team: [],
        }

        battleStore.$patch({
          opponentType: 'gym-leader',
          opponentId: leader.id,
          opponentName: leader.name,
        })
        break
      }

      case 'wild': {
        opponentName.value = 'Pokémon Salvaje'
        opponentConfig = getWildPokemon()

        battleStore.$patch({
          opponentType: 'wild',
          opponentId: undefined,
          opponentName: 'Pokémon Salvaje',
        })
        break
      }
    }

    // 4. Hydrate opponent team from PokéAPI
    loadingMessage.value = `Cargando datos de ${opponentName.value}...`

    const hydratedOpponent = await hydrateTeam(opponentConfig)
    opponentTeam.value = hydratedOpponent

    // Update trainer info with hydrated team
    if (trainerInfo.value) {
      trainerInfo.value.team = hydratedOpponent
    }

    // 5. Start battle
    loadingMessage.value = '¡Preparando batalla!'
    await battleStore.startBattle(playerTeam.value, opponentTeam.value)

    console.log('[BattleView] Battle initialized:', {
      type: battleTarget.value.type,
      opponent: opponentName.value,
      playerTeamSize: playerTeam.value.length,
      opponentTeamSize: opponentTeam.value.length,
    })
  } catch (err) {
    console.error('[BattleView] Error initializing battle:', err)
    error.value = err instanceof Error ? err.message : 'Error al cargar la batalla.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle battle end (victory or defeat)
 */
function handleBattleEnd() {
  if (battleStore.winner === 'player') {
    handleVictory()
  } else if (battleStore.winner === 'npc') {
    handleDefeat()
  }
}

/**
 * Handle player victory
 * Flow: Victory modal → (Move Learning) → Auto-heal → Redirect
 */
function handleVictory() {
  console.log('[BattleView] Player won!')

  // Update progress based on opponent type
  const opponentType = battleStore.opponentType
  const opponentId = battleStore.opponentId

  if (opponentType === 'thematic-npc' && opponentId) {
    progressStore.defeatNpc(opponentId as string)
  } else if (opponentType === 'gym-leader' && opponentId) {
    const leader = gymLeaders.find((g) => g.id === opponentId)
    if (leader) {
      progressStore.defeatGymLeader(opponentId as number)
    }
  }

  // Auto-heal team using store action
  teamStore.healTeam()

  // TODO: Check for move learning eligibility and show UI
  // For now, just show victory modal
  showVictoryModal.value = true
}

/**
 * Handle player defeat
 * Flow: Defeat modal → User closes → Auto-heal → Redirect
 */
function handleDefeat() {
  console.log('[BattleView] Player lost!')

  // Show defeat modal first (heal happens when user closes)
  showDefeatModal.value = true
}

/**
 * Close victory modal and redirect
 */
function closeVictoryAndRedirect() {
  showVictoryModal.value = false
  router.replace('/')
}

/**
 * Close defeat modal and redirect
 */
function closeDefeatAndRedirect() {
  // Heal team on defeat too
  teamStore.healTeam()
  showDefeatModal.value = false
  router.replace('/')
}

/**
 * Retry loading battle
 */
function retryBattle() {
  error.value = null
  initializeBattle()
}

/**
 * Go back to lobby
 */
function goToLobby() {
  router.replace('/')
}

// Watch for battle end
const battleWinner = computed(() => battleStore.winner)

// Initialize on mount
onMounted(() => {
  initializeBattle()
})

// Watch for battle winner change
watch(battleWinner, (winner) => {
  if (winner) {
    handleBattleEnd()
  }
})
</script>

<template>
  <div class="w-full h-screen">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white"
    >
      <div class="text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"
        ></div>
        <p class="text-xl text-slate-400">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white"
    >
      <div class="text-center">
        <h2 class="text-3xl mb-4">Error</h2>
        <p class="text-red-400 mb-6">{{ error }}</p>
        <div class="flex gap-4 justify-center">
          <Button @click="retryBattle">Reintentar</Button>
          <Button variant="outline" class="" @click="goToLobby">Volver al Lobby</Button>
        </div>
      </div>
    </div>

    <!-- Battle Screen -->
    <BattleScreen
      v-else
      :trainer="trainerInfo ?? undefined"
      :player-team="opponentTeam"
    />

    <!-- Victory Modal -->
    <Dialog v-model:open="showVictoryModal">
      <DialogContent
        class="sm:max-w-md bg-linear-to-b from-green-950/95 to-slate-900/95 backdrop-blur-lg border-green-800/50"
      >
        <DialogHeader>
          <DialogTitle class="text-2xl font-bold text-green-400 text-center">
            🏆 ¡Victoria!
          </DialogTitle>
          <DialogDescription class="text-center text-slate-300 text-lg mt-2">
            Has derrotado a {{ opponentName }}.
          </DialogDescription>
        </DialogHeader>
        <div class="flex justify-center py-4">
          <div
            class="w-24 h-24 rounded-full bg-green-900/50 flex items-center justify-center border-2 border-green-600/50"
          >
            <span class="text-5xl">🏆</span>
          </div>
        </div>
        <DialogFooter class="sm:justify-center">
          <Button
            size="lg"
            class="w-full sm:w-auto px-8 bg-green-600 hover:bg-green-700"
            @click="closeVictoryAndRedirect"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Defeat Modal (using component) -->
    <DefeatModal
      :open="showDefeatModal"
      :opponent-name="opponentName"
      @close="closeDefeatAndRedirect"
    />
  </div>
</template>
