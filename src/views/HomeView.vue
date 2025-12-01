<script setup lang="ts">
import { useRouter } from 'vue-router'
import TradeWithNpc from '@/components/TradeWithNpc.vue'
import MyTeam from '@/components/MyTeam.vue'

const router = useRouter()

function navigateToTeamBuilder() {
  router.push('/team-builder')
}
</script>

<template>
  <main>
    <h1>Pokémon MMO</h1>
    <p>Welcome! Visit the Battle page to test the battle system.</p>

    <div class="navigation-buttons">
      <button class="nav-button team-builder-button" @click="navigateToTeamBuilder">
        🎯 Team Builder
      </button>
    </div>

    <TradeWithNpc />
    <MyTeam />
  </main>
</template>

<style scoped>
main {
  text-align: center;
  padding: 2rem;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
}

.nav-button {
  padding: 16px 32px;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  color: #fff;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.team-builder-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
