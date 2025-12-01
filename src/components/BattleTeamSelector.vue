<script setup lang="ts">
import { computed } from 'vue'
import type { Pokemon } from '@/domain/battle/engine/entities'
import { getPokemonBackSpriteUrl } from '@/utils/pokemonSpriteMap'

interface Props {
  team: Pokemon[]
  currentPokemonId: string
  trainerName?: string
  trainerSprite?: string
}

interface Emits {
  (e: 'switch-pokemon', index: number): void
  (e: 'back'): void
}

defineProps<Props>()
defineEmits<Emits>()

const showTrainer = computed(() => true)
</script>

<template>
  <div class="team-selector-container">
    <div class="trainer-section" v-if="showTrainer">
      <div class="trainer-card">
        <div class="trainer-info">
          <h2 class="trainer-name">{{ trainerName || 'Entrenador' }}</h2>
          <p class="trainer-title">Tu equipo Pokémon</p>
        </div>
        <div class="trainer-sprite">
          <span class="trainer-avatar">👨‍💼</span>
        </div>
      </div>
    </div>

    <div class="team-grid">
      <button
        v-for="(pokemon, index) in team"
        :key="pokemon.id"
        :disabled="pokemon.currentHp === 0"
        :class="[
          'pokemon-team-btn',
          { 'active': pokemon.id === currentPokemonId },
          { 'fainted': pokemon.currentHp === 0 }
        ]"
        @click="$emit('switch-pokemon', index)"
      >
        <div class="pokemon-team-card">
          <img
            :src="getPokemonBackSpriteUrl(pokemon.name)"
            :alt="pokemon.name"
            class="pokemon-team-sprite"
          />
          <div class="pokemon-team-info">
            <h3>{{ pokemon.name }}</h3>
            <p class="level">Nv. {{ pokemon.level }}</p>
            <div class="hp-bar-small">
              <div
                class="hp-bar-fill"
                :style="{
                  width: (pokemon.currentHp / pokemon.stats.hp) * 100 + '%',
                  backgroundColor: pokemon.currentHp / pokemon.stats.hp > 0.5
                    ? '#10b981'
                    : pokemon.currentHp / pokemon.stats.hp > 0.25
                    ? '#fbbf24'
                    : '#ef4444'
                }"
              />
            </div>
            <p class="hp-text">{{ pokemon.currentHp }}/{{ pokemon.stats.hp }}</p>
          </div>
          <span v-if="pokemon.id === currentPokemonId" class="active-badge">✓</span>
          <span v-if="pokemon.currentHp === 0" class="fainted-text">DEBILITADO</span>
        </div>
      </button>
    </div>

    <button class="back-button" @click="$emit('back')">
      <span class="back-arrow">←</span> ATRÁS
    </button>
  </div>
</template>

<style scoped>
.team-selector-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  height: 100%;
  overflow-y: auto;
  background: oklch(var(--color-muted));
}

.trainer-section {
  margin-bottom: 8px;
}

.trainer-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: oklch(var(--color-card));
  border: 2px solid oklch(var(--color-border));
  border-radius: 6px;
  padding: 12px;
}

.trainer-info {
  flex: 1;
}

.trainer-name {
  font-size: 10px;
  font-weight: bold;
  margin: 0;
  color: oklch(var(--color-foreground));
}

.trainer-title {
  font-size: 8px;
  color: oklch(var(--color-muted-foreground));
  margin: 4px 0 0 0;
}

.trainer-sprite {
  font-size: 32px;
  text-align: center;
}

.trainer-avatar {
  display: inline-block;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.pokemon-team-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.1s ease;
}

.pokemon-team-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.pokemon-team-btn:not(:disabled):hover {
  transform: scale(1.02);
}

.pokemon-team-card {
  position: relative;
  background: oklch(var(--color-card));
  border: 2px solid oklch(var(--color-border));
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.1s ease;
}

.pokemon-team-btn.active .pokemon-team-card {
  border: 3px solid oklch(var(--color-accent));
  box-shadow: 0 0 8px oklch(var(--color-accent));
}

.pokemon-team-btn.fainted .pokemon-team-card {
  opacity: 0.5;
}

.pokemon-team-sprite {
  width: 60px;
  height: 60px;
  image-rendering: pixelated;
  align-self: center;
}

.pokemon-team-info {
  text-align: left;
}

.pokemon-team-info h3 {
  font-size: 8px;
  font-weight: bold;
  margin: 0;
  color: oklch(var(--color-foreground));
}

.level {
  font-size: 7px;
  color: oklch(var(--color-muted-foreground));
  margin: 2px 0;
}

.hp-bar-small {
  height: 4px;
  background: oklch(var(--color-border));
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #000;
}

.hp-bar-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.hp-text {
  font-size: 6px;
  color: oklch(var(--color-muted-foreground));
  margin: 2px 0 0 0;
}

.active-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: oklch(var(--color-accent));
  color: white;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
}

.fainted-text {
  position: absolute;
  bottom: 2px;
  left: 2px;
  font-size: 6px;
  font-weight: bold;
  color: #ef4444;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
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
  transform: translate(1px, 1px);
}

.back-arrow {
  font-size: 11px;
}
</style>
