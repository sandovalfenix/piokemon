<script setup lang="ts">
/**
 * BattleScreen - Battle System Orchestrator
 * Feature: 005-battle-fixes-status-moves
 *
 * This component serves as the main orchestrator for the battle system,
 * coordinating between modular child components:
 *
 * ## Child Components (T016-T019 verified)
 *
 * - **BattleField.vue** - Visual battlefield rendering
 *   Props: playerPokemon, npcPokemon, playerSprite, enemySprite, playerHpPercent,
 *          enemyHpPercent, shakeEffect, isTrainerBattle, rivalRemainingPokemon, npcTeamLength
 *
 * - **BattleActionMenu.vue** - Control panel (Fight/Bag/Pokemon/Run + MoveSelector)
 *   Props: currentView, logMessages, playerMoves, isAttacking
 *   Events: @fight, @bag, @pokemon, @run, @select-move, @back
 *
 * - **BagScreen.vue** - Items display and usage
 *   Events: @use-item, @back
 *
 * - **BattleTeamSelector.vue** - Pokemon team selection for switching
 *   Props: team, currentPokemonId, trainerName
 *   Events: @switch-pokemon, @back
 *
 * - **PokemonTeamSwitcher.vue** - Enhanced team switcher with sprites
 *   Props: team, currentPokemonId, trainerName, isEnemyTeam?
 *   Events: @select
 *
 * ## Key Responsibilities
 * - Initialize battle from Team Builder or props
 * - Load team from localStorage on mount (T007 fix)
 * - Manage view state transitions
 * - Handle all child component events
 * - Coordinate audio and visual effects
 * - Detect faint/switch scenarios
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BattleTeamSelector from './battle/BattleTeamSelector.vue'
import PokemonTeamSwitcher from './battle/PokemonTeamSwitcher.vue'
import TrainerWaitingScreen from './TrainerWaitingScreen.vue'
import BagScreen from './battle/BagScreen.vue'
import BattleField from './battle/BattleField.vue'
import BattleActionMenu from './battle/BattleActionMenu.vue'
import { useBattleStore } from '@/stores/battle'
import { useTeamStore } from '@/stores/team'
import { useTrainerBattle } from '../composables/useTrainerBattle'
import { useAudio } from '../composables/useAudio'
import { useSpriteLoader } from '../composables/useSpriteLoader'
import { itemService } from '@/services/itemService'
import { SAMPLE_NPC } from '@/data/pokemon'
import { createHowlerAudio, DEFAULT_BATTLE_SOUNDS } from '@/services/audio/howlerAudio'
import { getRandomTrainer } from '@/data/trainersData'
import type { Trainer } from '@/data/gymLadders'
import type { Pokemon } from '@/domain/battle/engine/entities'
import type { TrainerData } from '@/data/trainersData'
import type { TeamMember, Move as TeamBuilderMove } from '@/models/teamBuilder'
import type { Item } from '@/models/item'

// Props
interface Props {
  trainer?: Trainer
  playerTeam?: Pokemon[]
}

const props = defineProps<Props>()

// Stores
const battleStore = useBattleStore()
const teamStore = useTeamStore()
const router = useRouter()
const { rivalRemainingPokemon, startBattle: startTrainerBattle } = useTrainerBattle()

// Convert Team Builder Pokemon to Battle Engine format (T027)
const convertTeamMemberToBattlePokemon = (teamMember: TeamMember): Pokemon => {
  return {
    id: teamMember.pokemon.id.toString(),
    name: teamMember.pokemon.name,
    types: teamMember.pokemon.types,
    level: teamMember.level || 50,
    stats: {
      hp: teamMember.maxHp || teamMember.pokemon.stats.hp,
      atk: teamMember.pokemon.stats.attack,
      def: teamMember.pokemon.stats.defense,
      spAtk: teamMember.pokemon.stats.spAttack,
      spDef: teamMember.pokemon.stats.spDefense,
      speed: teamMember.pokemon.stats.speed,
    },
    currentHp: teamMember.currentHp || teamMember.maxHp || teamMember.pokemon.stats.hp,
    moves: teamMember.selectedMoves.map((move: TeamBuilderMove) => {
      // Battle engine only supports 'physical' | 'special', convert 'status' to 'special'
      const category = move.category?.toLowerCase() === 'status'
        ? 'special'
        : (move.category?.toLowerCase() as 'physical' | 'special' || 'physical')

      return {
        id: move.id.toString(),
        name: move.name,
        type: move.type,
        power: move.power || 0,
        accuracy: move.accuracy || 100,
        category,
        pp: move.pp || 15,
      }
    }),
  }
}

// Get player team from Team Builder or use fallback (T026, T028)
const getPlayerTeam = computed(() => {
  // FR-003: Validate team has at least 1 Pokemon with moves
  if (teamStore.roster.length > 0) {
    const convertedTeam = teamStore.roster.map(convertTeamMemberToBattlePokemon)
    // Validate that at least the lead Pokémon has moves
    if (convertedTeam[0] && convertedTeam[0].moves.length > 0) {
      console.log('[BattleScreen] Using Team Builder team:', convertedTeam.length, 'Pokemon')
      return convertedTeam
    }
    console.warn('[BattleScreen] Team Builder team invalid (no moves), aborting battle start')
    return []
  }

  console.warn('[BattleScreen] No Team Builder roster available')
  return []
})

// Audio setup
const audioPort = createHowlerAudio(DEFAULT_BATTLE_SOUNDS)
const { play: playSound } = useAudio(audioPort)

// Sprite loading with fallback - reactive refs that update when Pokemon changes
const playerPokemonName = computed(() => battleStore.player.name)
const enemyPokemonName = computed(() => battleStore.npc.name)

const playerSprite = useSpriteLoader({
  pokemonName: playerPokemonName,
  view: 'back',
  timeout: 3000,
})

const enemySprite = useSpriteLoader({
  pokemonName: enemyPokemonName,
  view: 'front',
  timeout: 3000,
})

// Estado de la batalla
const currentView = ref<'main' | 'fight' | 'bag' | 'pokemon' | 'trainer-waiting' | 'player-team-switch' | 'enemy-team-switch'>('main')
const battleMenuView = computed(() => currentView.value as 'main' | 'fight')
const shakeEffect = ref<{ active: boolean; target: 'player' | 'enemy' }>({ active: false, target: 'player' })
const waitingTrainer = ref<TrainerData | null>(null)
const waitingForTrainerSwitch = ref(false)
const isAttacking = ref(false)
const isBattleReady = ref(false) // Track if battle is fully initialized
const battleError = ref<string | null>(null) // T008: Track battle initialization errors

// Watch para sonidos sincronizados
watch(
  () => battleStore.log[battleStore.log.length - 1],
  (newMessage) => {
    if (!newMessage) return

    // Detectar ataques y aplicar efecto de sacudida
    if (newMessage.includes('usó')) {
      if (newMessage.includes(battleStore.player.name)) {
        triggerShake('enemy')
      } else if (newMessage.includes(battleStore.npc.name)) {
        triggerShake('player')
      }
    }

    // Sonidos de ataques y daño
    if (newMessage.includes('recibió')) {
      playSound('hit')
    }
    // Sonidos de fallos
    if (newMessage.includes('falló')) {
      playSound('miss')
    }
    // Sonidos de debilitamiento
    if (newMessage.includes('debilitó')) {
      playSound('defeat')
    }
    // Sonidos de victoria
    if (newMessage.includes('Ganaste') || newMessage.includes('Perdiste')) {
      playSound('victory')
    }
  }
)

// Efecto de sacudida simple
const triggerShake = (target: 'player' | 'enemy') => {
  shakeEffect.value = { active: true, target }
  setTimeout(() => {
    shakeEffect.value = { active: false, target }
  }, 400)
}

// Computed
const playerHpPercent = computed(() =>
  (battleStore.player.currentHp / battleStore.player.stats.hp) * 100
)

const enemyHpPercent = computed(() =>
  (battleStore.npc.currentHp / battleStore.npc.stats.hp) * 100
)


const isTrainerBattle = computed(() => props.trainer !== undefined)

const trainerName = computed(() => {
  if (isTrainerBattle.value && props.trainer) {
    return props.trainer.name
  }
  return 'Ash'
})

const enemyTrainerName = computed(() => {
  if (isTrainerBattle.value) {
    return `${props.trainer!.title} ${props.trainer!.name}`
  }
  return 'Pokémon Salvaje'
})

// Handlers
const handleFight = () => {
  currentView.value = 'fight'
}

const handleBag = () => {
  currentView.value = 'bag'
}

const handlePokemon = () => {
  currentView.value = 'pokemon'
}

const handleRun = () => {
  if (isTrainerBattle.value) {
    battleStore.log.push('¡No puedes escapar de una batalla con un entrenador!')
    return
  }

  const canRun = Math.random() > 0.5
  if (canRun) {
    battleStore.log.push('¡Has huido con éxito de la batalla!')
    setTimeout(() => {
      alert('¡Escapaste de la batalla!')
    }, 800)
  } else {
    battleStore.log.push('¡No puedes escapar!')
  }
}

const handleMoveSelected = async (moveId: string) => {
  if (isAttacking.value) return

  isAttacking.value = true
  await battleStore.selectPlayerMove(moveId)

  // Esperar un momento antes de volver a la vista principal
  setTimeout(() => {
    isAttacking.value = false
    currentView.value = 'main'
  }, 400)
}

const handleSwitchPokemon = async (pokemonIndex: number) => {
  const newPokemon = battleStore.playerTeam[pokemonIndex]

  if (!newPokemon || newPokemon.currentHp === 0) {
    battleStore.log.push('¡No puedes usar ese Pokémon!')
    return
  }

  if (newPokemon.id === battleStore.player.id) {
    battleStore.log.push(`¡${newPokemon.name} ya está en combate!`)
    return
  }

  const oldPokemonName = battleStore.player.name
  battleStore.currentPlayerIndex = pokemonIndex
  battleStore.player = newPokemon

  battleStore.log.push(`¡Vuelve, ${oldPokemonName}!`)
  battleStore.log.push(`¡Adelante, ${newPokemon.name}!`)

  currentView.value = 'main'
}

const handleUseItem = (item: Item) => {
  if (itemService.useItem(item.id)) {
    battleStore.log.push(`¡Has usado ${item.name}!`)
    // Here we would implement the actual item effect logic
    // For now, just simulate a turn usage
    setTimeout(() => {
      currentView.value = 'main'
      // Trigger enemy turn or whatever comes next
    }, 1000)
  }
}

const handleTrainerPokemonSelected = async (pokemonIndex: number) => {
  if (waitingForTrainerSwitch.value && waitingTrainer.value) {
    const selectedPokemon = battleStore.npcTeam[pokemonIndex]
    if (selectedPokemon) {
      battleStore.currentNpcIndex = pokemonIndex
      battleStore.npc = selectedPokemon
      battleStore.log.push(`¡${waitingTrainer.value.name} envió a ${selectedPokemon.name}!`)

      waitingForTrainerSwitch.value = false
      waitingTrainer.value = null
      currentView.value = 'main'

      await new Promise(resolve => setTimeout(resolve, 600))
    }
  }
}

const handleBack = () => {
  currentView.value = 'main'
}

// T008: Navigate to Team Builder when no team available
const goToTeamBuilder = () => {
  router.push('/team-builder')
}

// Inicializar batalla
onMounted(async () => {
  // CRITICAL FIX (T007): Load team from localStorage BEFORE accessing roster
  // This ensures teamStore.roster is populated before getPlayerTeam computed runs
  teamStore.loadTeam()

  // FR-002: Load team from localStorage before battle initialization
  // T027: Use team from Team Builder if available, otherwise use props or fallback
  // FR-003: Validate team before using
  const team = props.playerTeam || getPlayerTeam.value

  // Final validation (T008: User-friendly error handling)
  if (!team || team.length === 0) {
    console.error('[BattleScreen] CRITICAL: No valid team available!')
    battleError.value = '¡No tienes un equipo Pokémon! Ve al Team Builder para crear tu equipo.'
    return
  }

  if (isTrainerBattle.value && props.trainer) {
    // Batalla contra entrenador
    await startTrainerBattle(props.trainer, team)
    battleStore.log.push(`¡${enemyTrainerName.value} quiere luchar!`)
    battleStore.log.push(`¡${props.trainer.name} envió a ${battleStore.npc.name}!`)
    battleStore.log.push(`¡Adelante, ${battleStore.player.name}!`)
  } else {
    // Batalla salvaje - usar equipo del jugador
    const npcTeamToUse = [structuredClone(SAMPLE_NPC)]

    await battleStore.startBattle(team, npcTeamToUse)
    battleStore.log.push('¡Un Pokémon salvaje apareció!')
    battleStore.log.push(`¡Adelante, ${battleStore.player.name}!`)
  }

  // Mark battle as ready
  isBattleReady.value = true
})

// Watch para el log
watch(() => battleStore.log, () => {
  const lastMessage = battleStore.log[battleStore.log.length - 1]

  // Detectar si el jugador necesita cambiar Pokémon
  if (lastMessage?.includes('se debilitó') && lastMessage.includes(battleStore.player.name)) {
    // El Pokémon del jugador se debilitó
    if (battleStore.playerTeamRemaining > 0 && battleStore.winner === null) {
      // Mostrar selector de Pokémon automáticamente con imágenes
      setTimeout(() => {
        currentView.value = 'player-team-switch'
        battleStore.log.push('¡Elige tu próximo Pokémon!')
      }, 1000)
    }
  }

  // Detectar si el enemigo necesita cambiar Pokémon
  if (lastMessage?.includes('se debilitó') && lastMessage.includes(battleStore.npc.name)) {
    // El Pokémon del enemigo se debilitó
    if (battleStore.npcTeamRemaining > 0 && battleStore.winner === null) {
      // Mostrar equipo del enemigo con imágenes
      setTimeout(() => {
        const randomTrainer = getRandomTrainer()
        waitingTrainer.value = randomTrainer
        waitingForTrainerSwitch.value = true
        currentView.value = 'enemy-team-switch'
        battleStore.log.push(`¡${randomTrainer.name} elige su próximo Pokémon!`)
      }, 1000)
    }
  }
}, { deep: true })

</script>

<template>
  <div class="battle-container">
    <!-- T008: Error state when no team available -->
    <div v-if="battleError" class="error-screen">
      <div class="error-content">
        <h2 class="error-title">¡Error!</h2>
        <p class="error-message">{{ battleError }}</p>
        <button class="error-button" @click="goToTeamBuilder">
          Ir al Team Builder
        </button>
      </div>
    </div>

    <div v-else class="battle-screen">
      <!-- Campo de batalla -->
      <BattleField
        :player-pokemon="battleStore.player"
        :npc-pokemon="battleStore.npc"
        :player-sprite="playerSprite"
        :enemy-sprite="enemySprite"
        :player-hp-percent="playerHpPercent"
        :enemy-hp-percent="enemyHpPercent"
        :shake-effect="shakeEffect"
        :is-trainer-battle="isTrainerBattle"
        :rival-remaining-pokemon="rivalRemainingPokemon"
        :npc-team-length="battleStore.npcTeam.length"
      />

      <!-- Panel de control -->
      <div class="control-area-wrapper">
        <BattleActionMenu
          v-if="currentView === 'main' || currentView === 'fight'"
          :current-view="battleMenuView"
          :log-messages="battleStore.log"
          :player-moves="battleStore.player.moves"
          :is-attacking="isAttacking"
          @fight="handleFight"
          @bag="handleBag"
          @pokemon="handlePokemon"
          @run="handleRun"
          @select-move="handleMoveSelected"
          @back="handleBack"
        />

        <!-- Vista de mochila -->
        <BagScreen
          v-else-if="currentView === 'bag'"
          @use-item="handleUseItem"
          @back="handleBack"
        />

        <!-- Vista de Pokémon -->
        <BattleTeamSelector
          v-else-if="currentView === 'pokemon'"
          :team="battleStore.playerTeam"
          :current-pokemon-id="battleStore.player.id"
          :trainer-name="trainerName"
          @switch-pokemon="handleSwitchPokemon"
          @back="handleBack"
        />

        <!-- Entrenador esperando cambio de Pokémon -->
        <TrainerWaitingScreen
          v-else-if="currentView === 'trainer-waiting' && waitingTrainer"
          :trainer="waitingTrainer"
          :available-pokemon="battleStore.npcTeam"
          :current-pokemon-index="battleStore.currentNpcIndex"
          @pokemon-selected="handleTrainerPokemonSelected"
        />

        <!-- Selector de equipo del jugador con imágenes grandes -->
        <PokemonTeamSwitcher
          v-else-if="currentView === 'player-team-switch'"
          :team="battleStore.playerTeam"
          :current-pokemon-id="battleStore.player.id"
          :trainer-name="trainerName"
          @select="handleSwitchPokemon"
        />

        <!-- Selector de equipo del enemigo con imágenes grandes -->
        <PokemonTeamSwitcher
          v-else-if="currentView === 'enemy-team-switch' && waitingTrainer"
          :team="battleStore.npcTeam"
          :current-pokemon-id="battleStore.npc.id"
          :trainer-name="waitingTrainer.name"
          is-enemy-team
          @select="handleTrainerPokemonSelected"
        />
      </div>
    </div>
  </div>
</template>

<style>
.battle-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, oklch(var(--color-background)) 0%, oklch(var(--color-muted)) 100%);
  padding: 20px;
}

.battle-screen {
  width: 720px;
  height: 480px;
  display: flex;
  flex-direction: column;
  background: oklch(var(--color-card));
  border: 4px solid oklch(var(--color-border));
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.control-area-wrapper {
  height: 150px;
  position: relative;
}

@media (max-width: 800px) {
  .battle-screen {
    width: 95vw;
    height: auto;
    aspect-ratio: 3 / 2;
  }
}

@media (min-width: 1200px) {
  .battle-screen {
    width: 960px;
    height: 640px;
  }

  .control-area-wrapper {
    height: 200px;
  }
}

/* T008: Error screen styles */
.error-screen {
  width: 720px;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(var(--color-card));
  border: 4px solid oklch(var(--color-border));
  border-radius: 8px;
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 18px;
  color: oklch(var(--color-destructive));
  margin-bottom: 16px;
}

.error-message {
  font-size: 10px;
  color: oklch(var(--color-foreground));
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 400px;
}

.error-button {
  background: oklch(var(--color-primary));
  color: oklch(var(--color-primary-foreground));
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.error-button:hover {
  opacity: 0.9;
}

@media (max-width: 800px) {
  .error-screen {
    width: 95vw;
    height: auto;
    aspect-ratio: 3 / 2;
  }
}
</style>
