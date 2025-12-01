<script setup lang="ts">
import type { Pokemon } from '@/domain/battle/engine/entities'
import { getPokemonOfficialArtworkUrl } from '@/utils/pokemonSpriteMap'

interface Props {
  team: Pokemon[]
  currentPokemonId: string
  isEnemyTeam?: boolean
  trainerName?: string
}

interface Emits {
  (e: 'select', index: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="team-switcher-container">
    <div class="team-switcher-header">
      <h2 v-if="!isEnemyTeam" class="header-title">¡Elige un Pokémon!</h2>
      <h2 v-else class="header-title">{{ trainerName }} eligió a...</h2>
    </div>

    <div class="team-grid">
      <button
        v-for="(pokemon, index) in team"
        :key="pokemon.id"
        :disabled="pokemon.currentHp === 0 || (isEnemyTeam && pokemon.id === currentPokemonId)"
        :class="[
          'pokemon-card-btn',
          { 'active': pokemon.id === currentPokemonId && !isEnemyTeam },
          { 'fainted': pokemon.currentHp === 0 },
          { 'disabled': pokemon.id === currentPokemonId && isEnemyTeam }
        ]"
        @click="$emit('select', index)"
      >
        <div class="pokemon-card">
          <div class="pokemon-image-wrapper">
            <img
              :src="getPokemonOfficialArtworkUrl(pokemon.name)"
              :alt="pokemon.name"
              class="pokemon-image"
            />
          </div>

          <div class="pokemon-details">
            <h3 class="pokemon-name">{{ pokemon.name }}</h3>
            <p class="pokemon-level">Nv. {{ pokemon.level }}</p>

            <div class="hp-section">
              <div class="hp-bar-container">
                <div
                  class="hp-bar"
                  :style="{
                    width: (pokemon.currentHp / pokemon.stats.hp) * 100 + '%',
                    backgroundColor: 
                      pokemon.currentHp / pokemon.stats.hp > 0.5
                        ? '#10b981'
                        : pokemon.currentHp / pokemon.stats.hp > 0.25
                        ? '#fbbf24'
                        : '#ef4444'
                  }"
                />
              </div>
              <p class="hp-text">{{ pokemon.currentHp }}/{{ pokemon.stats.hp }}</p>
            </div>

            <div v-if="pokemon.currentHp === 0" class="fainted-badge">
              ⚠️ DEBILITADO
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.team-switcher-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  height: 100%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  overflow-y: auto;
}

.team-switcher-header {
  text-align: center;
}

.header-title {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  flex: 1;
  min-height: 0;
}

.pokemon-card-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  perspective: 1000px;
}

.pokemon-card-btn:hover:not(:disabled) {
  transform: translateY(-5px);
}

.pokemon-card-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.pokemon-card-btn.fainted {
  opacity: 0.5;
}

.pokemon-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border: 3px solid #333;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.pokemon-card-btn.active .pokemon-card {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-color: #ff6b35;
  box-shadow: 0 0 15px #ff6b35;
}

.pokemon-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  overflow: hidden;
}

.pokemon-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  image-rendering: crisp-edges;
}

.pokemon-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pokemon-name {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.pokemon-level {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.hp-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hp-bar-container {
  width: 100%;
  height: 16px;
  background: #ccc;
  border: 1px solid #666;
  border-radius: 3px;
  overflow: hidden;
}

.hp-bar {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.hp-text {
  margin: 0;
  font-size: 10px;
  color: #666;
  text-align: center;
}

.fainted-badge {
  margin: 0;
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  border-radius: 4px;
}
</style>
