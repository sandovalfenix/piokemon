<!--
  PokemonCard Component
  Feature: 003-pokemon-team-builder
  User Story 1: Browse Pokemon Catalog

  Displays single Pokemon with sprite, name, types, and stats
-->
<script setup lang="ts">
import type { Pokemon } from '@/models/teamBuilder'

interface Props {
  pokemon: Pokemon
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="pokemon-card" :class="{ 'loading': loading }">
    <div v-if="loading" class="loading-skeleton">
      <div class="skeleton-sprite"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>
    <div v-else class="card-content">
      <img
        :src="pokemon.sprite"
        :alt="pokemon.name"
        class="pokemon-sprite"
        loading="lazy"
      />
      <h3 class="pokemon-name">{{ pokemon.name }}</h3>
      <div class="pokemon-types">
        <span
          v-for="type in pokemon.types"
          :key="type"
          :class="['type-badge', `type-${type.toLowerCase()}`]"
        >
          {{ type }}
        </span>
      </div>
      <div class="pokemon-stats">
        <div class="stat-row">
          <span class="stat-label">HP:</span>
          <span class="stat-value">{{ pokemon.stats.hp }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Attack:</span>
          <span class="stat-value">{{ pokemon.stats.attack }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Defense:</span>
          <span class="stat-value">{{ pokemon.stats.defense }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Sp. Atk:</span>
          <span class="stat-value">{{ pokemon.stats.spAttack }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Sp. Def:</span>
          <span class="stat-value">{{ pokemon.stats.spDefense }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Speed:</span>
          <span class="stat-value">{{ pokemon.stats.speed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}

.pokemon-card:not(.loading):hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.pokemon-card:not(.loading):hover::after {
  content: 'Click to select';
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
}

.pokemon-card.loading {
  cursor: default;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pokemon-sprite {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.pokemon-name {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  text-transform: capitalize;
}

.pokemon-types {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
}

/* Type colors matching Pokemon games */
.type-normal { background: #A8A878; }
.type-fire { background: #F08030; }
.type-water { background: #6890F0; }
.type-electric { background: #F8D030; }
.type-grass { background: #78C850; }
.type-ice { background: #98D8D8; }
.type-fighting { background: #C03028; }
.type-poison { background: #A040A0; }
.type-ground { background: #E0C068; }
.type-flying { background: #A890F0; }
.type-psychic { background: #F85888; }
.type-bug { background: #A8B820; }
.type-rock { background: #B8A038; }
.type-ghost { background: #705898; }
.type-dragon { background: #7038F8; }
.type-dark { background: #705848; }
.type-steel { background: #B8B8D0; }
.type-fairy { background: #EE99AC; }

.pokemon-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-value {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Loading skeleton */
.loading-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.skeleton-sprite {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text {
  width: 100px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text.short {
  width: 60px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
