<template>
  <div class="team-panel-view">
    <div class="panel-header">
      <h1>🎮 Pokémon Center - Panel de Equipo</h1>
    </div>
    
    <main class="panel-content">
      <TeamList :team="team" />
    </main>
  </div>
</template>

<script setup lang="ts">
import TeamList from '@/components/TeamList.vue'
import { ref } from 'vue'

interface Pokemon {
  id: number
  name: string
  level: number
  hp: number
  maxHp: number
  sprite?: string
}

const team = ref<Pokemon[]>([
  {
    id: 1,
    name: 'Pikachu',
    level: 45,
    hp: 95,
    maxHp: 120,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
  },
  {
    id: 2,
    name: 'Charizard',
    level: 50,
    hp: 120,
    maxHp: 150,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
  },
  {
    id: 3,
    name: 'Blastoise',
    level: 50,
    hp: 140,
    maxHp: 160,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png'
  },
  {
    id: 4,
    name: 'Venusaur',
    level: 48,
    hp: 110,
    maxHp: 140,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png'
  },
  {
    id: 5,
    name: 'Dragonite',
    level: 55,
    hp: 160,
    maxHp: 180,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png'
  },
  {
    id: 6,
    name: 'Alakazam',
    level: 52,
    hp: 80,
    maxHp: 100,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png'
  }
])
</script>

<style scoped>
.team-panel-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 25%, #3d6b4d 50%, #2d5a3d 75%, #1a472a 100%);
  padding: 20px;
  position: relative;
}

.panel-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.panel-header h1 {
  font-size: 32px;
  margin-bottom: 0;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.panel-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .panel-header h1 {
    font-size: 24px;
  }

  .panel-content {
    padding: 15px;
  }
}
</style>
