<script setup lang="ts">
import { useTeamStore } from '@/stores/team'
import { storeToRefs } from 'pinia'

const teamStore = useTeamStore()
const { pokemons } = storeToRefs(teamStore)
</script>

<template>
  <div class="team-container">
    <h2 class="title">My Pokémon Team</h2>
    <div v-if="pokemons.length === 0" class="empty-team">
      <p>You have no Pokémon in your team.</p>
    </div>
    <div v-else class="pokemon-list">
      <div v-for="pokemon in pokemons" :key="pokemon.id" class="pokemon-card">
        <h3>{{ pokemon.name }}</h3>
        <div class="stats">
          <p><strong>HP:</strong> {{ pokemon.hp }}</p>
          <p><strong>Attack:</strong> {{ pokemon.attack }}</p>
          <p><strong>Defense:</strong> {{ pokemon.defense }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  color: #fff;
}
.team-container {
  color: #2c3e50;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 20px;
  background-color: #61a6e2;
}

.pokemon-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.pokemon-card {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  min-width: 150px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pokemon-card h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.stats p {
  margin: 5px 0;
  font-size: 0.9em;
}

.empty-team {
  font-style: italic;
  color: #666;
}
</style>
