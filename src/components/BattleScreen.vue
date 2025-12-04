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
import PokemonSwitchModal from './battle/PokemonSwitchModal.vue'
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
import { createHowlerAudio, DEFAULT_BATTLE_SOUNDS } from '@/services/audio/howlerAudio'
import { BattleType } from '@/data/battleTypes'
import { gymLeaders } from '@/data/gymLeaders'
import type { Trainer } from '@/data/trainers'
import type { Pokemon } from '@/domain/battle/engine/entities'
import type { TeamMember, Move as TeamBuilderMove } from '@/models/teamBuilder'
import type { Item } from '@/models/item'

// Props
interface Props {
  trainer?: Trainer
  playerTeam?: Pokemon[]
  gymLeaderId?: number
}

const props = defineProps<Props>()

// Stores
const battleStore = useBattleStore()
const teamStore = useTeamStore()
const router = useRouter()
const { rivalRemainingPokemon, startBattle: startTrainerBattle } = useTrainerBattle()

// Gym battle state
const currentBattleType = ref<BattleType>(BattleType.WILD)
const currentGymLeader = ref<number | null>(null)

const currentGymLeaderInfo = computed(() => {
  if (currentGymLeader.value !== null) {
    return gymLeaders.find(l => l.id === currentGymLeader.value)
  }
  return null
})

const isGymBattle = computed(() => currentBattleType.value === BattleType.GYM_LEADER)

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
const waitingForTrainerSwitch = ref(false)
const isAttacking = ref(false)
const isBattleReady = ref(false) // Track if battle is fully initialized
const battleError = ref<string | null>(null) // T008: Track battle initialization errors

// Pokemon switch modal state
const showSwitchModal = ref(false)
const isForcedSwitch = ref(false) // True when Pokemon fainted

// Trainer waiting screen state
const waitingTrainer = ref<import('@/data/trainersData').TrainerData | null>(null)

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
  if (isGymBattle.value && currentGymLeaderInfo.value) {
    return `${currentGymLeaderInfo.value.name} - Líder de ${currentGymLeaderInfo.value.city}`
  }
  if (isTrainerBattle.value && props.trainer) {
    return `${props.trainer.title} ${props.trainer.name}`
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
  // Open modal for voluntary switch
  isForcedSwitch.value = false
  showSwitchModal.value = true
}

const handleRun = () => {
  if (isGymBattle.value) {
    battleStore.log.push('¡No puedes escapar de un desafío de gimnasio!')
    return
  }

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

  // Close modal and return to main view
  showSwitchModal.value = false
  isForcedSwitch.value = false
  currentView.value = 'main'
}

/**
 * Handle closing the switch modal (voluntary switch only)
 */
const handleCloseSwitchModal = () => {
  if (!isForcedSwitch.value) {
    showSwitchModal.value = false
  }
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
  const selectedPokemon = battleStore.npcTeam[pokemonIndex]
  if (selectedPokemon) {
    battleStore.currentNpcIndex = pokemonIndex
    battleStore.npc = selectedPokemon
    const trainerName = waitingTrainer.value?.name ?? 'El rival'
    battleStore.log.push(`¡${trainerName} envió a ${selectedPokemon.name}!`)

    waitingForTrainerSwitch.value = false
    waitingTrainer.value = null
    currentView.value = 'main'

    await new Promise(resolve => setTimeout(resolve, 600))
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

  // Detectar si es batalla de gimnasio
  if (props.gymLeaderId !== undefined) {
    const leader = gymLeaders.find(l => l.id === props.gymLeaderId)
    if (!leader) {
      battleError.value = 'Líder de gimnasio no encontrado'
      return
    }

    currentGymLeader.value = props.gymLeaderId
    currentBattleType.value = BattleType.GYM_LEADER

    // Crear entrenador temporal con datos del líder
    const gymTrainer: Trainer = {
      id: leader.id.toString(),
      name: leader.name,
      title: `Líder de ${leader.city}`,
      team: [], // Se llenará con tu lógica existente si es necesario
    }
    await startTrainerBattle(gymTrainer, team)
    battleStore.log.push(`¡${leader.name} te desafía!`)
    battleStore.log.push(`"¡Soy ${leader.name}, líder de ${leader.city}!"`)
    battleStore.log.push(`"¡Especialista en tipo ${leader.type}!"`)
    battleStore.log.push(`¡${leader.name} envió a ${battleStore.npc.name}!`)
    battleStore.log.push(`¡Adelante, ${battleStore.player.name}!`)
  } else if (isTrainerBattle.value && props.trainer) {
    // Batalla contra entrenador
    currentBattleType.value = BattleType.TRAINER
    await startTrainerBattle(props.trainer, team)
    battleStore.log.push(`¡${enemyTrainerName.value} quiere luchar!`)
    battleStore.log.push(`¡${props.trainer.name} envió a ${battleStore.npc.name}!`)
    battleStore.log.push(`¡Adelante, ${battleStore.player.name}!`)
  } else {
    // Batalla salvaje - usar equipo del jugador
    // Feature 006: Wild battle team should be hydrated externally in BattleView
    currentBattleType.value = BattleType.WILD

    // The NPC team should already be set up by BattleView before this component loads
    // If no trainer team provided, we expect the battle to be initialized via props.playerTeam
    if (!props.playerTeam || props.playerTeam.length === 0) {
      console.error('[BattleScreen] Wild battle requires pre-hydrated teams')
      return
    }

    await battleStore.startBattle(team, props.playerTeam)
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
      // Mostrar modal de cambio de Pokémon (forzado)
      setTimeout(() => {
        isForcedSwitch.value = true
        showSwitchModal.value = true
        battleStore.log.push('¡Elige tu próximo Pokémon!')
      }, 1000)
    }
  }

  // Detectar si el enemigo necesita cambiar Pokémon
  if (lastMessage?.includes('se debilitó') && lastMessage.includes(battleStore.npc.name)) {
    // El Pokémon del enemigo se debilitó
    if (battleStore.npcTeamRemaining > 0 && battleStore.winner === null) {
      // La IA elige automáticamente el siguiente Pokémon vivo
      setTimeout(() => {
        const trainerName = battleStore.opponentName ?? 'El rival'

        // Encontrar el siguiente Pokémon vivo en el equipo del NPC
        const nextAliveIndex = battleStore.npcTeam.findIndex(
          (p, idx) => idx !== battleStore.currentNpcIndex && p.currentHp > 0
        )

        const nextPokemon = nextAliveIndex !== -1 ? battleStore.npcTeam[nextAliveIndex] : undefined
        if (nextPokemon) {
          battleStore.currentNpcIndex = nextAliveIndex
          battleStore.npc = nextPokemon
          battleStore.log.push(`¡${trainerName} envió a ${nextPokemon.name}!`)
        }

        currentView.value = 'main'
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
      <!-- Banner de batalla de gimnasio -->
      <div v-if="isGymBattle && currentGymLeaderInfo" class="gym-battle-banner">
        <div class="gym-badge-icon">🏅</div>
        <div class="gym-info">
          <span class="gym-leader-name">{{ currentGymLeaderInfo.name }}</span>
          <span class="gym-type">Tipo {{ currentGymLeaderInfo.type }}</span>
        </div>
      </div>

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

    <!-- Pokemon Switch Modal -->
    <PokemonSwitchModal
      :open="showSwitchModal"
      :team="battleStore.playerTeam"
      :current-pokemon-id="battleStore.player.id"
      :forced-switch="isForcedSwitch"
      @select="handleSwitchPokemon"
      @close="handleCloseSwitchModal"
    />
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

/* Estilos para banner de gimnasio */
.gym-battle-banner {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 3px solid oklch(0.3 0.1 40);
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-family: 'Press Start 2P', 'Courier New', monospace;
}

.gym-badge-icon {
  font-size: 24px;
  animation: pulse 2s infinite;
}

.gym-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gym-leader-name {
  font-size: 10px;
  font-weight: bold;
  color: oklch(0.3 0.1 40);
}

.gym-type {
  font-size: 7px;
  color: oklch(0.4 0.08 40);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
