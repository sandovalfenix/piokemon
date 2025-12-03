<script setup lang="ts">
import StatusPanel from '../StatusPanel.vue'
import type { Pokemon } from '@/domain/battle/engine/entities'
import type { SpriteLoaderReturn } from '@/types/pokemonshowdown-sprite'

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
}

const props = defineProps<Props>()

const getHpColor = (percent: number) => {
  if (percent > 50) return '#10b981'
  if (percent > 25) return '#fbbf24'
  return '#ef4444'
}
</script>

<template>
  <div class="battlefield">
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
      <div class="sprite-platform enemy-platform"></div>
      <!-- Loading skeleton for enemy sprite -->
      <div
        v-if="props.enemySprite.isLoading.value"
        class="animate-pulse bg-gray-200 w-40 h-40 rounded-full"
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
      <div v-else class="flex flex-col items-center justify-center w-40 h-40">
        <div class="text-2xl">❓</div>
        <div class="text-sm text-gray-600">{{ props.npcPokemon.name }}</div>
      </div>
    </div>

    <!-- Sprite jugador -->
    <div class="player-sprite-area">
      <div class="sprite-platform player-platform"></div>
      <!-- Loading skeleton for player sprite -->
      <div
        v-if="props.playerSprite.isLoading.value"
        class="animate-pulse bg-gray-200 w-40 h-40 rounded-full"
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
      <div v-else class="flex flex-col items-center justify-center w-40 h-40">
        <div class="text-2xl">❓</div>
        <div class="text-sm text-gray-600">{{ props.playerPokemon.name }}</div>
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
  background-image: url('@/assets/battlefield.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.sprite-platform {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.enemy-platform {
  width: 240px;
  height: 60px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.8), transparent);
  top: 50%;
  right: 12%;
}

.player-platform {
  width: 220px;
  height: 48px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.7), transparent);
  bottom: -2%;
  left: 16%;
}

.pokemon-sprite {
  position: absolute;
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
}

.enemy-sprite {
  width: 150px;
  height: 150px;
  top: 26%;
  right: 20%;
  animation-delay: 0s;
}

.player-sprite {
  width: 220px;
  height: 220px;
  bottom: -4%;
  left: 10%;
  animation-delay: 1.5s;
  transform: scaleX(-1);
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

.status-overlay {
  opacity: 0;
  pointer-events: none;
}
</style>
