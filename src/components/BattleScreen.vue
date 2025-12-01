<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import MoveSelector from './MoveSelector.vue'
import BattleTeamSelector from './BattleTeamSelector.vue'
import PokemonTeamSwitcher from './PokemonTeamSwitcher.vue'
import TrainerWaitingScreen from './TrainerWaitingScreen.vue'
import LogPanel from './LogPanel.vue'
import StatusPanel from './StatusPanel.vue'
import { useBattleStore } from '@/stores/battle'
import { useTrainerBattle } from '../composables/useTrainerBattle'
import { useAudio } from '../composables/useAudio'
import { SAMPLE_NPC, PLAYER_TEAM } from '@/data/pokemon'
import { getPokemonFrontSpriteUrl, getPokemonBackSpriteUrl } from '@/utils/pokemonSpriteMap'
import { createHowlerAudio, DEFAULT_BATTLE_SOUNDS } from '@/services/audio/howlerAudio'
import { getRandomTrainer } from '@/data/trainersData'
import { getAttackEffect } from '@/utils/attackEffects'
import type { Trainer } from '@/data/trainers'
import type { Pokemon } from '@/domain/battle/engine/entities'
import type { TrainerData } from '@/data/trainersData'

// Props
interface Props {
  trainer?: Trainer
  playerTeam?: Pokemon[]
}

const props = defineProps<Props>()

// Stores
const battleStore = useBattleStore()
const { rivalRemainingPokemon, playerRemainingPokemon, startBattle: startTrainerBattle } = useTrainerBattle()

// Audio setup
const audioPort = createHowlerAudio(DEFAULT_BATTLE_SOUNDS)
const { play: playSound } = useAudio(audioPort)

// Estado de la batalla
const currentView = ref<'main' | 'fight' | 'bag' | 'pokemon' | 'trainer-waiting' | 'player-team-switch' | 'enemy-team-switch'>('main')
const damageEffect = ref<{ active: boolean; target: 'player' | 'enemy' }>({ active: false, target: 'player' })
const attackEffect = ref<{ active: boolean; target: 'player' | 'enemy'; type: string }>({ active: false, target: 'player', type: 'normal' })
const waitingTrainer = ref<TrainerData | null>(null)
const waitingForTrainerSwitch = ref(false)

// Watch para sonidos sincronizados
watch(
  () => battleStore.log[battleStore.log.length - 1],
  (newMessage) => {
    if (!newMessage) return

    // Detectar ataques y aplicar efectos
    if (newMessage.includes('usó')) {
      // Extraer tipo de ataque del mensaje o usar el del movimiento
      const moveMatch = newMessage.match(/usó (.+)!/)
      if (moveMatch) {
        const moveName = moveMatch[1]
        // Buscar el movimiento para obtener su tipo
        const playerMove = battleStore.player.moves.find(m => m.name === moveName)
        const npcMove = battleStore.npc.moves.find(m => m.name === moveName)
        const moveType = playerMove?.type || npcMove?.type || 'normal'

        // Determinar quién atacó
        if (newMessage.includes(battleStore.player.name)) {
          triggerAttackEffect('enemy', moveType)
        } else if (newMessage.includes(battleStore.npc.name)) {
          triggerAttackEffect('player', moveType)
        }
      }
    }

    // Sonidos de ataques y daño
    if (newMessage.includes('recibió')) {
      playSound('hit')
      // Detectar quién recibió daño
      if (newMessage.includes(battleStore.npc.name)) {
        triggerDamageEffect('enemy')
      } else if (newMessage.includes(battleStore.player.name)) {
        triggerDamageEffect('player')
      }
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

// Efecto de daño
const triggerDamageEffect = (target: 'player' | 'enemy') => {
  damageEffect.value = { active: true, target }
  setTimeout(() => {
    damageEffect.value = { active: false, target }
  }, 300)
}

// Efecto de ataque especial
const triggerAttackEffect = (target: 'player' | 'enemy', moveType: string) => {
  attackEffect.value = { active: true, target, type: moveType }
  const effect = getAttackEffect(moveType)
  setTimeout(() => {
    attackEffect.value = { active: false, target, type: 'normal' }
  }, effect.duration)
}

// Computed
const playerHpPercent = computed(() =>
  (battleStore.player.currentHp / battleStore.player.stats.hp) * 100
)

const enemyHpPercent = computed(() =>
  (battleStore.npc.currentHp / battleStore.npc.stats.hp) * 100
)

const getHpColor = (percent: number) => {
  if (percent > 50) return '#10b981'
  if (percent > 25) return '#fbbf24'
  return '#ef4444'
}

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
  await battleStore.selectPlayerMove(moveId)
  currentView.value = 'main'
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

// Inicializar batalla
onMounted(async () => {
  // Usar props.playerTeam si se proporciona, si no, usar PLAYER_TEAM como equipo por defecto
  const team = props.playerTeam || PLAYER_TEAM.map(p => structuredClone(p))

  if (isTrainerBattle.value && props.trainer) {
    // Batalla contra entrenador
    await startTrainerBattle(props.trainer, team)
    battleStore.log.push(`¡${enemyTrainerName.value} quiere luchar!`)
    battleStore.log.push(`¡${props.trainer.name} envió a ${battleStore.npc.name}!`)
    battleStore.log.push(`¡Adelante, ${battleStore.player.name}!`)
  } else {
    // Batalla salvaje - crear equipo por defecto si es necesario
    const playerTeamToUse = team
    const npcTeamToUse = [structuredClone(SAMPLE_NPC)]

    await battleStore.startBattle(playerTeamToUse, npcTeamToUse)
    battleStore.log.push('¡Un Pokémon salvaje apareció!')
    battleStore.log.push(`¡Adelante, ${battleStore.player.name}!`)
  }
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
    <div class="battle-screen">
      <!-- Campo de batalla -->
      <div class="battlefield">
        <!-- Información del Pokémon enemigo -->
        <div class="enemy-info-panel">
          <div class="info-box enemy-box">
            <div class="name-level-row">
              <span class="pokemon-name">{{ battleStore.npc.name }}</span>
            </div>
            <div class="level-row">:L{{ battleStore.npc.level }}</div>
            <div class="hp-display">
              <span class="hp-text">HP</span>
              <div class="hp-bar-outer">
                <div
                  class="hp-bar-inner"
                  :style="{
                    width: enemyHpPercent + '%',
                    backgroundColor: getHpColor(enemyHpPercent)
                  }"
                />
              </div>
            </div>
            <!-- Equipo rival disponible -->
            <div v-if="isTrainerBattle" class="team-indicator">
              Equipo: {{ rivalRemainingPokemon }}/{{ battleStore.npcTeam.length }}
            </div>
          </div>
        </div>

        <!-- Sprite enemigo -->
        <div class="enemy-sprite-area">
          <div class="sprite-platform enemy-platform"></div>
          <img
            :src="getPokemonFrontSpriteUrl(battleStore.npc.name)"
            :alt="battleStore.npc.name"
            :class="[
              'pokemon-sprite enemy-sprite',
              { 'damage-hit': damageEffect.active && damageEffect.target === 'enemy' },
              { 'attack-effect': attackEffect.active && attackEffect.target === 'enemy', [`attack-${attackEffect.type}`]: attackEffect.active && attackEffect.target === 'enemy' }
            ]"
          >
          <!-- Efecto de ataque -->
          <div
            v-if="attackEffect.active && attackEffect.target === 'enemy'"
            :class="['attack-effect-overlay', `effect-${attackEffect.type}`]"
            :style="{ backgroundColor: getAttackEffect(attackEffect.type).color }"
          />
        </div>

        <!-- Sprite jugador -->
        <div class="player-sprite-area">
          <div class="sprite-platform player-platform"></div>
          <img
            :src="getPokemonBackSpriteUrl(battleStore.player.name)"
            :alt="battleStore.player.name"
            :class="[
              'pokemon-sprite player-sprite',
              { 'damage-hit': damageEffect.active && damageEffect.target === 'player' },
              { 'attack-effect': attackEffect.active && attackEffect.target === 'player', [`attack-${attackEffect.type}`]: attackEffect.active && attackEffect.target === 'player' }
            ]"
          >
          <!-- Efecto de ataque -->
          <div
            v-if="attackEffect.active && attackEffect.target === 'player'"
            :class="['attack-effect-overlay', `effect-${attackEffect.type}`]"
            :style="{ backgroundColor: getAttackEffect(attackEffect.type).color }"
          />
        </div>

        <!-- Información del Pokémon jugador -->
        <div class="player-info-panel">
          <div class="info-box player-box">
            <div class="name-level-row">
              <span class="pokemon-name">{{ battleStore.player.name }}</span>
            </div>
            <div class="level-row">:L{{ battleStore.player.level }}</div>
            <div class="hp-display">
              <span class="hp-text">HP</span>
              <div class="hp-bar-outer">
                <div
                  class="hp-bar-inner"
                  :style="{
                    width: playerHpPercent + '%',
                    backgroundColor: getHpColor(playerHpPercent)
                  }"
                />
              </div>
            </div>
            <div class="hp-numbers">{{ battleStore.player.currentHp }} / {{ battleStore.player.stats.hp }}</div>
            <!-- Equipo disponible -->
            <div class="team-indicator">
              Equipo: {{ playerRemainingPokemon }}/{{ battleStore.playerTeam.length }}
            </div>
          </div>
        </div>

        <!-- StatusPanel (componente enlazado) -->
        <StatusPanel
          v-if="battleStore.player && battleStore.npc"
          :player-pokemon="battleStore.player"
          :enemy-pokemon="battleStore.npc"
          class="status-overlay"
        />
      </div>

      <!-- Panel de control - AGRANDADO -->
      <div class="control-area">
        <!-- Vista principal -->
        <template v-if="currentView === 'main'">
          <!-- Contenedor de Log y Botones lado a lado -->
          <div class="main-layout">
            <!-- LogPanel en el lado izquierdo -->
            <div class="log-section">
              <LogPanel
                :messages="battleStore.log"
                :max-messages="8"
                :is-battle-style="true"
              />
            </div>

            <!-- Botones de acciones en el lado derecho -->
            <div class="action-panel">
              <button class="action-btn" @click="handleFight">
                <span class="action-text">FIGHT</span>
              </button>
              <button class="action-btn" @click="handleBag">
                <span class="action-text">BAG</span>
              </button>
              <button class="action-btn" @click="handlePokemon">
                <span class="action-text">POKéMON</span>
              </button>
              <button class="action-btn" @click="handleRun">
                <span class="action-text">RUN</span>
              </button>
            </div>
          </div>
        </template>

        <!-- MoveSelector con LogPanel a su lado -->
        <template v-else-if="currentView === 'fight'">
          <div class="fight-layout">
            <!-- LogPanel en el lado izquierdo -->
            <div class="log-section">
              <LogPanel
                :messages="battleStore.log"
                :max-messages="8"
                :is-battle-style="true"
              />
            </div>

            <!-- MoveSelector en el lado derecho -->
            <div class="move-section">
              <MoveSelector
                :moves="battleStore.player.moves"
                :is-battle-style="true"
                @select-move="handleMoveSelected"
                @back="handleBack"
              />
              <button class="back-button" @click="handleBack">
                <span class="back-arrow">←</span> ATRÁS
              </button>
            </div>
          </div>
        </template>

        <!-- Vista de mochila -->
        <div v-else-if="currentView === 'bag'" class="bag-panel">
          <div class="bag-header">MOCHILA</div>
          <div class="bag-items">
            <div class="bag-item">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png"
                alt="Potion"
                class="item-sprite"
              />
              <span class="item-label">Poción</span>
              <span class="item-qty">x3</span>
            </div>
            <div class="bag-item">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                alt="Pokeball"
                class="item-sprite"
              />
              <span class="item-label">Poké Ball</span>
              <span class="item-qty">x5</span>
            </div>
            <div class="bag-item disabled">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png"
                alt="Super Potion"
                class="item-sprite"
              />
              <span class="item-label">Superpoción</span>
              <span class="item-qty">x0</span>
            </div>
            <div class="bag-item disabled">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png"
                alt="Revive"
                class="item-sprite"
              />
              <span class="item-label">Revivir</span>
              <span class="item-qty">x0</span>
            </div>
          </div>
          <button class="back-button" @click="handleBack">
            <span class="back-arrow">←</span> ATRÁS
          </button>
        </div>

        <!-- MyTeam enlazado -->
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

<style scoped>
.battle-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, oklch(var(--color-background)) 0%, oklch(var(--color-muted)) 100%);
  padding: 20px;
}

/* AGRANDADO: Mayor tamaño */
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
  font-family: 'Press Start 2P', 'Courier New', monospace;
}

.battlefield {
  flex: 1;
  position: relative;
  background: linear-gradient(
    to bottom,
    #87CEEB 0%,
    #87CEEB 40%,
    #90EE90 40%,
    #90EE90 55%,
    #8B7355 55%,
    #8B7355 100%
  );
  overflow: hidden;
}

.sprite-platform {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.enemy-platform {
  width: 80px;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.2), transparent);
  top: 42%;
  right: 22%;
}

.player-platform {
  width: 90px;
  height: 25px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.25), transparent);
  bottom: 22%;
  left: 12%;
}

.pokemon-sprite {
  position: absolute;
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
}

.enemy-sprite {
  width: 150px;
  height: 150px;
  top: 15%;
  right: 15%;
  animation-delay: 0s;
}

.player-sprite {
  width: 180px;
  height: 180px;
  bottom: 10%;
  left: 5%;
  animation-delay: 1.5s;
  transform: scaleX(-1);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes damageHit {
  0% {
    filter: brightness(1) drop-shadow(0 0 0 rgba(255, 0, 0, 0));
    transform: translateX(0) rotate(0deg);
  }
  25% {
    filter: brightness(0.7) drop-shadow(0 0 8px rgba(255, 0, 0, 0.8));
    transform: translateX(-5px) rotate(-2deg);
  }
  50% {
    filter: brightness(0.7) drop-shadow(0 0 8px rgba(255, 0, 0, 0.8));
    transform: translateX(5px) rotate(2deg);
  }
  100% {
    filter: brightness(1) drop-shadow(0 0 0 rgba(255, 0, 0, 0));
    transform: translateX(0) rotate(0deg);
  }
}

.damage-hit {
  animation: damageHit 0.3s ease-in-out;
}

.attack-effect {
  animation: attackPulse 0.6s ease-out;
}

.attack-effect-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
  animation: effectPulse 0.6s ease-out;
  opacity: 0.3;
}

@keyframes effectPulse {
  0% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes attackPulse {
  0% {
    filter: brightness(1) saturate(1);
  }
  25% {
    filter: brightness(1.3) saturate(1.5);
  }
  50% {
    filter: brightness(1.2) saturate(1.3);
  }
  100% {
    filter: brightness(1) saturate(1);
  }
}

.info-box {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #000;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
}

.enemy-info-panel {
  position: absolute;
  top: 8%;
  left: 6%;
}

.enemy-box {
  min-width: 180px;
}

.player-info-panel {
  position: absolute;
  bottom: 8%;
  right: 6%;
}

.player-box {
  min-width: 200px;
}

.name-level-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.pokemon-name {
  font-size: 11px;
  font-weight: bold;
  color: #2d2d2d;
  letter-spacing: 0.5px;
}

.gender-icon {
  font-size: 13px;
  font-weight: bold;
}

.gender-icon.male { color: #3b82f6; }
.gender-icon.female { color: #ec4899; }

.level-row {
  font-size: 9px;
  color: #666;
  margin-bottom: 5px;
}

.hp-display {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.hp-text {
  font-size: 8px;
  color: #f59e0b;
  font-weight: bold;
}

.hp-bar-outer {
  flex: 1;
  height: 7px;
  background: #2d2d2d;
  border-radius: 3px;
  border: 1px solid #000;
  overflow: hidden;
}

.hp-bar-inner {
  height: 100%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.hp-numbers {
  font-size: 10px;
  color: #2d2d2d;
  text-align: right;
  margin-top: 2px;
}

.team-indicator {
  font-size: 8px;
  color: #666;
  margin-top: 3px;
  padding-top: 3px;
  border-top: 1px solid #ddd;
  text-align: center;
  font-weight: bold;
}

.exp-display {
  margin-top: 4px;
}

.exp-bar-outer {
  width: 100%;
  height: 5px;
  background: #2d2d2d;
  border-radius: 2px;
  border: 1px solid #000;
  overflow: hidden;
}

.exp-bar-inner {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-overlay {
  opacity: 0;
  pointer-events: none;
}

/* AGRANDADO: Más altura para el panel */
.control-area {
  height: 150px;
  background: oklch(var(--color-muted));
  border-top: 3px solid oklch(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
}

.action-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-btn {
  background: oklch(var(--color-card));
  border: 3px solid oklch(var(--color-border));
  border-radius: 6px;
  padding: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: oklch(var(--color-accent));
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
}

.action-text {
  font-size: 10px;
  font-weight: bold;
  color: oklch(var(--color-foreground));
  letter-spacing: 0.5px;
}

.bag-panel {
  grid-column: 1 / -1;
  background: oklch(var(--color-card));
  border: 3px solid oklch(var(--color-border));
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bag-header {
  font-size: 11px;
  font-weight: bold;
  color: oklch(var(--color-foreground));
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 2px solid oklch(var(--color-border));
}

.bag-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  flex: 1;
}

.bag-item {
  background: oklch(var(--color-muted));
  border: 2px solid oklch(var(--color-border));
  border-radius: 4px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.bag-item:hover:not(.disabled) {
  background: oklch(var(--color-accent));
  transform: scale(1.05);
}

.bag-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-sprite {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
}

.item-label {
  font-size: 7px;
  text-align: center;
  color: oklch(var(--color-foreground));
  line-height: 1.2;
}

.item-qty {
  font-size: 6px;
  color: oklch(var(--color-muted-foreground));
  font-weight: bold;
}

.back-button {
  background: oklch(var(--color-card));
  border: 2px solid oklch(var(--color-border));
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 9px;
  font-weight: bold;
  color: oklch(var(--color-foreground));
  cursor: pointer;
  align-self: flex-start;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.1s ease;
}

.back-button:hover {
  background: oklch(var(--color-accent));
}

.back-arrow {
  font-size: 11px;
}

/* New Layout Styles */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100%;
  padding: 8px;
}

.log-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.move-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.fight-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100%;
  padding: 8px;
}

@media (max-width: 800px) {
  .main-layout,
  .fight-layout {
    grid-template-columns: 1fr;
    gap: 8px;
  }
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

  .control-area {
    height: 200px;
  }
}
</style>
