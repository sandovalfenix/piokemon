<template>
  <div class="team-list-container">
    <h2>Mi Equipo</h2>
    
    <div v-if="!team || team.length === 0" class="team-list-empty">
      <p>No hay Pokémon en el equipo</p>
    </div>

    <div v-else class="team-list">
      <PokemonItem 
        v-for="(pokemon, index) in team" 
        :key="index"
        :pokemon="pokemon"
        :position="index + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import PokemonItem from './PokemonItem.vue';

defineProps({
  team: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.team-list-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.team-list-container h2 {
  margin-top: 0;
  color: #333;
  font-size: 24px;
  margin-bottom: 15px;
}

.team-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.team-list-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

@media (max-width: 768px) {
  .team-list {
    grid-template-columns: 1fr;
  }
}
</style>
