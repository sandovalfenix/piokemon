<script setup lang="ts">
import type { Pokemon } from '@/domain/battle/engine/entities'
import type { TrainerData } from '@/data/trainersData'

interface Props {
  trainer: TrainerData
  availablePokemon: Pokemon[]
  currentPokemonIndex: number
}

interface Emits {
  (e: 'pokemon-selected', index: number): void
}

defineProps<Props>()
defineEmits<Emits>()

const getHpPercent = (pokemon: Pokemon): number => {
  return (pokemon.currentHp / pokemon.stats.hp) * 100
}

const getHpColor = (pokemon: Pokemon): string => {
  const percent = getHpPercent(pokemon)
  if (percent > 50) return '#10b981'
  if (percent > 25) return '#fbbf24'
  return '#ef4444'
}
</script>

<template>
  <div class="trainer-waiting-screen">
    <!-- Fondo del entrenador -->
    <div class="trainer-background">
      <!-- Sprite grande del entrenador -->
      <div class="trainer-sprite-large">
        <img
          :src="trainer.imageUrl"
          :alt="trainer.name"
          class="trainer-image"
        />
      </div>

      <!-- Nombre y texto del entrenador -->
      <div class="trainer-text">
        <h2>{{ trainer.name }}</h2>
        <p>{{ trainer.description }}</p>
        <p class="choosing-text">Eligiendo su próximo Pokémon...</p>
      </div>
    </div>

    <!-- Panel de selección de Pokémon -->
    <div class="pokemon-selection-panel">
      <h3>Elige tu Pokémon</h3>

      <div class="pokemon-list">
        <button
          v-for="(pokemon, index) in availablePokemon"
          :key="pokemon.id"
          :disabled="pokemon.currentHp === 0"
          class="pokemon-option"
          @click="$emit('pokemon-selected', index)"
        >
          <div class="pokemon-option-card">
            <div class="pokemon-name-type">
              <h4>{{ pokemon.name }}</h4>
              <div class="types">
                <span v-for="type in pokemon.types" :key="type" class="type-badge">
                  {{ type }}
                </span>
              </div>
            </div>

            <div class="pokemon-stats-mini">
              <div class="stat-row">
                <span class="stat-label">Nv:</span>
                <span class="stat-value">{{ pokemon.level }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">HP:</span>
                <div class="hp-bar-inline">
                  <div
                    class="hp-fill"
                    :style="{
                      width: getHpPercent(pokemon) + '%',
                      backgroundColor: getHpColor(pokemon)
                    }"
                  />
                </div>
              </div>
              <div class="stat-row">
                <span class="stat-label">ATK:</span>
                <span class="stat-value">{{ pokemon.stats.atk }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">DEF:</span>
                <span class="stat-value">{{ pokemon.stats.def }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">SP:</span>
                <span class="stat-value">{{ pokemon.stats.speed }}</span>
              </div>
            </div>

            <span v-if="pokemon.currentHp === 0" class="fainted-badge">
              DEBILITADO
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trainer-waiting-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  height: 100%;
  background: oklch(var(--color-muted));
  overflow-y: auto;
}

.trainer-background {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: oklch(var(--color-card));
  border: 3px solid oklch(var(--color-border));
  border-radius: 8px;
}

.trainer-sprite-large {
  font-size: 120px;
  text-align: center;
  line-height: 1;
}

.trainer-image {
  width: 200px;
  height: 200px;
  image-rendering: pixelated;
  object-fit: contain;
}

.trainer-text {
  text-align: center;
}

.trainer-text h2 {
  font-size: 12px;
  font-weight: bold;
  margin: 0;
  color: oklch(var(--color-foreground));
}

.trainer-text p {
  font-size: 8px;
  color: oklch(var(--color-muted-foreground));
  margin: 4px 0 0 0;
}

.choosing-text {
  font-style: italic;
  margin-top: 8px !important;
  color: oklch(var(--color-accent)) !important;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.pokemon-selection-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: oklch(var(--color-card));
  border: 3px solid oklch(var(--color-border));
  border-radius: 8px;
  min-width: 0;
}

.pokemon-selection-panel h3 {
  font-size: 10px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: oklch(var(--color-foreground));
}

.pokemon-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.pokemon-option {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.1s ease;
}

.pokemon-option:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.pokemon-option:not(:disabled):hover {
  transform: scale(1.02);
}

.pokemon-option-card {
  position: relative;
  background: oklch(var(--color-background));
  border: 2px solid oklch(var(--color-border));
  border-radius: 4px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.1s ease;
}

.pokemon-option:not(:disabled):hover .pokemon-option-card {
  border: 2px solid oklch(var(--color-accent));
  box-shadow: 0 0 4px oklch(var(--color-accent));
}

.pokemon-option:disabled .pokemon-option-card {
  opacity: 0.5;
}

.pokemon-name-type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.pokemon-name-type h4 {
  font-size: 8px;
  font-weight: bold;
  margin: 0;
  color: oklch(var(--color-foreground));
}

.types {
  display: flex;
  gap: 2px;
}

.type-badge {
  font-size: 6px;
  padding: 1px 3px;
  background: oklch(var(--color-accent));
  color: white;
  border-radius: 2px;
  font-weight: bold;
}

.pokemon-stats-mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  font-size: 6px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  background: oklch(var(--color-muted));
  border-radius: 2px;
}

.stat-label {
  font-weight: bold;
  color: oklch(var(--color-accent));
  min-width: 20px;
}

.stat-value {
  color: oklch(var(--color-foreground));
}

.hp-bar-inline {
  flex: 1;
  height: 3px;
  background: oklch(var(--color-border));
  border-radius: 1px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.fainted-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 5px;
  font-weight: bold;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  padding: 1px 2px;
  border-radius: 2px;
}

@media (max-width: 600px) {
  .trainer-waiting-screen {
    grid-template-columns: 1fr;
  }
}
</style>
