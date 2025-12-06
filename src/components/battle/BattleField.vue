<script setup lang="ts">
import { computed } from 'vue'
import StatusPanel from '../StatusPanel.vue'
import type { Pokemon } from '@/domain/battle/engine/entities'
import type { SpriteLoaderReturn } from '@/types/pokemonshowdown-sprite'

// Import all battlefield images
import cristoReyBattlefield from '@/assets/img/battle/battlefield/cristo-rey-battlefield.jpeg'
import laErmitaBattlefield from '@/assets/img/battle/battlefield/la-ermita-battlefield.jpeg'
import parqueCanaBattlefield from '@/assets/img/battle/battlefield/parque-cana-battlefield.jpeg'
import plazoletaJairoValeraBattlefield from '@/assets/img/battle/battlefield/plazoleta-jairo-varela-battlefield.jpeg'
import zooCaliBattlefield from '@/assets/img/battle/battlefield/zoo-cali-battlefield.jpeg'

// Mapping of zone slugs to battlefield images
const BATTLEFIELD_IMAGES: Record<string, string> = {
  'cristo-rey': cristoReyBattlefield,
  'la-ermita': laErmitaBattlefield,
  'parque-de-la-cana': parqueCanaBattlefield,
  'plazoleta-jairo-varela': plazoletaJairoValeraBattlefield,
  'zoo-de-cali': zooCaliBattlefield,
  'default': cristoReyBattlefield,
}

interface Props {
  playerPokemon: Pokemon
  npcPokemon: Pokemon
  playerSprite: SpriteLoaderReturn
  enemySprite: SpriteLoaderReturn
  playerHpPercent: number
  enemyHpPercent: number
  shakeEffect: { active: boolean; target: 'player' | 'enemy' }
  isTrainerBattle: boolean
  rivalRemainingPokemon: number
  npcTeamLength: number
  /** Zone slug for dynamic battlefield background */
  battleZona?: string
}

const props = defineProps<Props>()

// Computed battlefield background based on zone
const battlefieldBackground = computed(() => {
  const zone = props.battleZona || sessionStorage.getItem('lastZone') || 'default'
  return BATTLEFIELD_IMAGES[zone] || BATTLEFIELD_IMAGES['default']
})

const getHpColor = (percent: number) => {
  if (percent > 50) return '#10b981'
  if (percent > 25) return '#fbbf24'
  return '#ef4444'
}
</script>

<template>
  <div
    class="battlefield"
    :style="{ backgroundImage: `url(${battlefieldBackground})` }"
  >
    <!-- Información del Pokémon enemigo -->
    <div class="enemy-info-panel">
      <div class="info-box enemy-box">
        <div class="name-level-row">
          <span class="pokemon-name">{{ props.npcPokemon.name }}</span>
        </div>
        <div class="level-row">:L{{ props.npcPokemon.level }}</div>
        <div class="hp-display">
          <span class="hp-text">HP</span>
          <div class="hp-bar-outer">
            <div
              class="hp-bar-inner"
              :style="{
                width: props.enemyHpPercent + '%',
                backgroundColor: getHpColor(props.enemyHpPercent),
              }"
            />
          </div>
        </div>
        <!-- Equipo rival disponible -->
        <div v-if="props.isTrainerBattle" class="team-indicator">
          Equipo: {{ props.rivalRemainingPokemon }}/{{ props.npcTeamLength }}
        </div>
      </div>
    </div>

    <!-- Sprite enemigo -->
    <div class="enemy-sprite-area">
      <!-- Loading skeleton for enemy sprite -->
      <div
        v-if="props.enemySprite.isLoading.value"
        class="animate-pulse bg-gray-200/50 w-40 h-40 rounded-full absolute enemy-sprite-pos"
      ></div>
      <!-- Enemy sprite with error fallback -->
      <img
        v-else-if="!props.enemySprite.error.value"
        :src="props.enemySprite.spriteUrl.value"
        :alt="props.npcPokemon.name"
        :class="[
          'pokemon-sprite enemy-sprite',
          { shake: props.shakeEffect.active && props.shakeEffect.target === 'enemy' },
        ]"
      />
      <!-- Error fallback: show Pokemon name -->
      <div v-else class="flex flex-col items-center justify-center w-40 h-40 absolute enemy-sprite-pos">
        <div class="text-2xl text-white">?</div>
        <div class="text-sm text-white/70">{{ props.npcPokemon.name }}</div>
      </div>
    </div>

    <!-- Sprite jugador -->
    <div class="player-sprite-area">
      <!-- Loading skeleton for player sprite -->
      <div
        v-if="props.playerSprite.isLoading.value"
        class="animate-pulse bg-gray-200/50 w-40 h-40 rounded-full absolute player-sprite-pos"
      ></div>
      <!-- Player sprite with error fallback -->
      <img
        v-else-if="!props.playerSprite.error.value"
        :src="props.playerSprite.spriteUrl.value"
        :alt="props.playerPokemon.name"
        :class="[
          'pokemon-sprite player-sprite',
          { shake: props.shakeEffect.active && props.shakeEffect.target === 'player' },
        ]"
      />
      <!-- Error fallback: show Pokemon name -->
      <div v-else class="flex flex-col items-center justify-center w-40 h-40 absolute player-sprite-pos">
        <div class="text-2xl text-white font-bold">?</div>
        <div class="text-sm text-white/70">{{ props.playerPokemon.name }}</div>
      </div>
    </div>

    <!-- Información del Pokémon jugador -->
    <div class="player-info-panel">
      <div class="info-box player-box">
        <div class="name-level-row">
          <span class="pokemon-name">{{ props.playerPokemon.name }}</span>
        </div>
        <div class="level-row">:L{{ props.playerPokemon.level }}</div>
        <div class="hp-display">
          <span class="hp-text">HP</span>
          <div class="hp-bar-outer">
            <div
              class="hp-bar-inner"
              :style="{
                width: props.playerHpPercent + '%',
                backgroundColor: getHpColor(props.playerHpPercent),
              }"
            />
          </div>
        </div>
        <div class="hp-numbers">{{ props.playerPokemon.currentHp }} / {{ props.playerPokemon.stats.hp }}</div>
      </div>
    </div>

    <!-- StatusPanel -->
    <StatusPanel
      v-if="props.playerPokemon && props.npcPokemon"
      :player-pokemon="props.playerPokemon"
      :enemy-pokemon="props.npcPokemon"
      class="status-overlay"
    />
  </div>
</template>

<style scoped>
.battlefield {
  flex: 1;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  min-height: 450px;
}

.enemy-sprite-area,
.player-sprite-area {
  position: absolute;
}

.enemy-sprite-area {
  top: 58%;
  right: 24%;
}

.player-sprite-area {
  bottom: -4%;
  left: 16%;
}

.pokemon-sprite {
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.7));
  position: relative;
}

.enemy-sprite {
  width: auto;
  height: 98px;
}

.enemy-sprite-pos {
  width: 160px;
  height: 160px;
}

.player-sprite {
  width: auto;
  height: 172px;
  transform: scaleX(-1);
}

.player-sprite-pos {
  width: 240px;
  height: 240px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-8px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(8px);
  }
}

.shake {
  animation: shake 0.4s ease-in-out;
}

.info-box {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.enemy-info-panel {

  position: absolute;
  top: 12%;
  right: 18%;
}

.enemy-box {
  min-width: 180px;
}

.player-info-panel {
  position: absolute;
  bottom: 2%;
  left: 4%;
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
  font-size: 12px;
  font-weight: bold;
  color: white;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.level-row {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.hp-display {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.hp-text {
  font-size: 9px;
  color: #fbbf24;
  font-weight: bold;
}

.hp-bar-outer {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.hp-bar-inner {
  height: 100%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
}

.hp-numbers {
  font-size: 11px;
  color: white;
  text-align: right;
  margin-top: 3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.team-indicator {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  font-weight: bold;
}

.status-overlay {
  opacity: 0;
  pointer-events: none;
}
</style>
