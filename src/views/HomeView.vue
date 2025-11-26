<script setup lang="ts">
import TradeWithNpc from '@/components/TradeWithNpc.vue'
import MyTeam from '@/components/MyTeam.vue'

import PokemonBattle from '@/components/PokemonBattle.vue';

</script>

<template>
  <main>
    <PokemonBattle />
    <TradeWithNpc />
    <MyTeam />
  </main>
</template>

<style scoped>
main {
  text-align: center;
  padding: 2rem;
}

.battle-section {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
}

.pokemon-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  width: 200px;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #369870;
}

.gameOver {
  background-color: #ffdddd;
  border: 1px solid #ff5c5c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  color: #a70000;
}
</style>
