<template>
  <div v-if="!pokemon" class="pokemon-item-empty">
    Vacío
  </div>

  <div v-else class="pokemon-item">
    <div class="pokemon-position">{{ position }}</div>
    
    <!-- Sprite del Pokémon -->
    <div v-if="pokemon.sprite" class="pokemon-sprite-container">
      <img 
        :src="pokemon.sprite" 
        :alt="pokemon.name"
        class="pokemon-sprite"
        @error="handleSpriteError"
      />
    </div>
    
    <!-- Información del Pokémon -->
    <div class="pokemon-info">
      <h3 class="pokemon-name">{{ pokemon.name }}</h3>
      <p class="pokemon-level">Nivel {{ pokemon.level }}</p>
      
      <!-- Barra de HP -->
      <div class="hp-container">
        <div class="hp-label">
          <span>HP</span>
          <span class="hp-values">{{ pokemon.hp }}/{{ pokemon.maxHp }}</span>
        </div>
        <div class="hp-bar-background">
          <div 
            class="hp-bar"
            :class="`hp-bar-${hpBarColor}`"
            :style="{ width: `${hpPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  pokemon: {
    type: Object,
    default: null
  },
  position: {
    type: Number,
    required: true
  }
});

// Calcular porcentaje de HP
const hpPercentage = computed(() => {
  if (!props.pokemon || props.pokemon.maxHp <= 0) return 0;
  return (props.pokemon.hp / props.pokemon.maxHp) * 100;
});

// Determinar color de la barra según HP
const hpBarColor = computed(() => {
  const percentage = hpPercentage.value;
  if (percentage > 50) return 'green';
  if (percentage > 25) return 'yellow';
  return 'red';
});

// Manejo de error en sprite
const handleSpriteError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
.pokemon-item {
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pokemon-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #4CAF50;
}

.pokemon-position {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #4CAF50;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.pokemon-sprite-container {
  text-align: center;
  margin-bottom: 12px;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokemon-sprite {
  max-width: 100%;
  max-height: 100px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.pokemon-info {
  padding-top: 8px;
}

.pokemon-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

.pokemon-level {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.hp-container {
  margin-top: 12px;
}

.hp-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.hp-values {
  font-weight: bold;
  color: #333;
}

.hp-bar-background {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #999;
}

.hp-bar {
  height: 100%;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
  font-size: 10px;
  color: white;
  font-weight: bold;
}

.hp-bar-green {
  background-color: #4CAF50;
}

.hp-bar-yellow {
  background-color: #FFC107;
}

.hp-bar-red {
  background-color: #f44336;
}

.pokemon-item-empty {
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px 15px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

@media (max-width: 480px) {
  .pokemon-item {
    padding: 12px;
  }

  .pokemon-name {
    font-size: 16px;
  }

  .pokemon-sprite {
    max-height: 80px;
  }
}
</style>
