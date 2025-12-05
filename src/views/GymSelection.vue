<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { gymLeaders } from '@/data/gymLeaders'
const router = useRouter()
const selectedLeader = ref<number | null>(null)
const hoveredLeader = ref<number | null>(null)

const challengeLeader = (gymLeaderId: number) => {
  selectedLeader.value = gymLeaderId

  // Navegación a batalla con pequeña animación
  setTimeout(() => {
    router.push({
      name: 'battle',
      query: {
        gymLeaderId: gymLeaderId.toString()
      }
    })
  }, 300)
}

// Sprites de Pokémon desde PokeAPI
const getPokemonSprite = (pokemonId: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${pokemonId}.png`
}

const getPokemonSpriteFallback = (pokemonId: number) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
}

const getDifficultyStars = (difficulty: number) => {
  return Array(8).fill(0).map((_, i) => i < difficulty ? '★' : '☆').join('')
}
</script>

<template>
  <div class="gym-selection-container">
    <!-- Header -->
    <div class="gym-header">
      <div class="title-bar">
        <div class="pokeball-icon"></div>
        <h1 class="main-title">LIGA POKÉMON DE KANTO</h1>
        <div class="pokeball-icon"></div>
      </div>
      <p class="subtitle">Derrota a los 8 Líderes de Gimnasio y obtén sus medallas</p>
    </div>

    <!-- Grid de líderes -->
    <div class="gym-grid">
      <div
        v-for="leader in gymLeaders"
        :key="leader.id"
        class="gym-card"
        :class="{
          selected: selectedLeader === leader.id,
          hovered: hoveredLeader === leader.id
        }"
        :data-type="leader.type"
        @mouseenter="hoveredLeader = leader.id"
        @mouseleave="hoveredLeader = null"
      >
        <!-- Badge y dificultad -->
        <div class="card-header">
          <div class="badge-container">
            <img
              :src="leader.badgeImage"
              :alt="leader.badge"
              class="badge-image"
            />
          </div>
          <div class="difficulty-container">
            <span class="difficulty-label">GIMNASIO Nº{{ leader.id }}</span>
            <div class="stars">{{ getDifficultyStars(leader.difficulty) }}</div>
          </div>
        </div>

        <!-- Sprite del entrenador -->
        <div class="trainer-display">
          <div class="trainer-sprite-box">
            <img
              :src="leader.spriteUrl"
              :alt="leader.name"
              class="trainer-sprite"
            />
            <div class="trainer-placeholder">{{ leader.name[0] }}</div>
          </div>
          <div class="trainer-info-box">
            <span class="trainer-class">{{ leader.trainerClass }}</span>
            <h2 class="trainer-name">{{ leader.name }}</h2>
            <span class="trainer-city">{{ leader.city }}</span>
          </div>
        </div>

        <!-- Tipo especialista -->
        <div class="type-container">
          <div class="type-badge">
            <span class="type-label">TIPO</span>
            <span class="type-name">{{ leader.type.toUpperCase() }}</span>
          </div>
        </div>

        <!-- Frase -->
        <div class="quote-box">
          <p class="quote-text">{{ leader.quote }}</p>
        </div>

        <!-- Equipo Pokémon -->
        <div class="team-display">
          <div class="team-header">
            <span class="team-label">EQUIPO POKÉMON ({{ leader.team.length }})</span>
          </div>
          <div class="team-grid">
            <div
              v-for="(pokemon, index) in leader.team"
              :key="index"
              class="pokemon-slot"
            >
              <div class="pokemon-frame">
                <img
                  :src="getPokemonSprite(pokemon.pokemonId)"
                  :alt="pokemon.pokemon"
                  class="pokemon-sprite"
                  @error="(e: Event) => {
                    const target = e.target as HTMLImageElement
                    target.src = getPokemonSpriteFallback(pokemon.pokemonId)
                  }"
                />
              </div>
              <span class="pokemon-level">Nv. {{ pokemon.level }}</span>
            </div>
          </div>
        </div>

        <!-- Botón desafío - FUNCIONAL -->
        <button
          class="challenge-btn"
          @click="challengeLeader(leader.id)"
        >
          <span class="btn-text">DESAFIAR</span>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="info-panel">
      <p class="info-text">
        Los Líderes de Gimnasio son entrenadores poderosos que protegen medallas.
        Derrota a los 8 para acceder a la Liga Pokémon.
      </p>
    </div>
  </div>
</template>

<style scoped>
.gym-selection-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  font-family: 'Press Start 2P', monospace;
}

.gym-header {
  max-width: 1200px;
  margin: 0 auto 40px;
  text-align: center;
}

.title-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #2d3561 0%, #1f2544 100%);
  border: 4px solid #ffd700;
  border-radius: 12px;
  box-shadow: 0 8px 0 #c5a000, 0 12px 20px rgba(0, 0, 0, 0.5);
}

.pokeball-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(to bottom, #ff0000 50%, #ffffff 50%);
  border-radius: 50%;
  border: 4px solid #000;
  position: relative;
}

.pokeball-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #fff;
  border: 3px solid #000;
  border-radius: 50%;
}

.main-title {
  font-size: clamp(12px, 3vw, 20px);
  color: #ffd700;
  text-shadow:
    2px 2px 0 #c5a000,
    4px 4px 0 #000;
  letter-spacing: 2px;
}

.subtitle {
  font-size: clamp(7px, 1.5vw, 10px);
  color: #b0b0b0;
  padding: 0 20px;
  line-height: 1.8;
}

.gym-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 20px;
}

.gym-card {
  background: linear-gradient(135deg, #2d3561 0%, #1f2544 100%);
  border: 4px solid transparent;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.4);
  position: relative;
}

/* Colores por tipo usando data-type */
.gym-card[data-type="Roca"].hovered {
  border-color: #B8A038;
}

.gym-card[data-type="Agua"].hovered {
  border-color: #6890F0;
}

.gym-card[data-type="Eléctrico"].hovered {
  border-color: #F8D030;
}

.gym-card[data-type="Planta"].hovered {
  border-color: #78C850;
}

.gym-card[data-type="Veneno"].hovered {
  border-color: #A040A0;
}

.gym-card[data-type="Psíquico"].hovered {
  border-color: #F85888;
}

.gym-card[data-type="Fuego"].hovered {
  border-color: #F08030;
}

.gym-card[data-type="Tierra"].hovered {
  border-color: #E0C068;
}

.gym-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  border-radius: 12px;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.gym-card[data-type="Roca"]::before {
  background: #B8A038;
}

.gym-card[data-type="Agua"]::before {
  background: #6890F0;
}

.gym-card[data-type="Eléctrico"]::before {
  background: #F8D030;
}

.gym-card[data-type="Planta"]::before {
  background: #78C850;
}

.gym-card[data-type="Veneno"]::before {
  background: #A040A0;
}

.gym-card[data-type="Psíquico"]::before {
  background: #F85888;
}

.gym-card[data-type="Fuego"]::before {
  background: #F08030;
}

.gym-card[data-type="Tierra"]::before {
  background: #E0C068;
}

.gym-card.hovered {
  transform: translateY(-8px);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 12px 30px rgba(0, 0, 0, 0.5);
}

.gym-card.hovered::before {
  opacity: 0.1;
}

.gym-card.selected {
  animation: pulse-select 0.3s ease;
}

@keyframes pulse-select {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.98); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 3px solid rgba(255, 215, 0, 0.3);
}

.badge-container {
  width: 60px;
  height: 60px;
  background: #1a1a2e;
  border: 3px solid #ffd700;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.difficulty-container {
  text-align: right;
}

.difficulty-label {
  display: block;
  font-size: 7px;
  color: #ffd700;
  margin-bottom: 6px;
}

.stars {
  font-size: 12px;
  color: #ffd700;
  letter-spacing: 2px;
}

.trainer-display {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.trainer-sprite-box {
  width: 80px;
  height: 80px;
  background: #1a1a2e;
  border: 3px solid #555;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.trainer-sprite {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  position: relative;
  z-index: 2;
}

.trainer-placeholder {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #ffd700;
  font-weight: bold;
  z-index: 1;
}

.trainer-sprite:not([src=""]) ~ .trainer-placeholder {
  display: none;
}

.trainer-info-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trainer-class {
  font-size: 7px;
  color: #888;
}

.trainer-name {
  font-size: 14px;
  color: #ffd700;
  text-transform: uppercase;
}

.trainer-city {
  font-size: 8px;
  color: #b0b0b0;
}

.type-container {
  margin-bottom: 15px;
}

.type-badge {
  display: inline-flex;
  flex-direction: column;
  padding: 10px 20px;
  border-radius: 8px;
  border: 3px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3);
}

.gym-card[data-type="Roca"] .type-badge {
  background-color: #B8A038;
}

.gym-card[data-type="Agua"] .type-badge {
  background-color: #6890F0;
}

.gym-card[data-type="Eléctrico"] .type-badge {
  background-color: #F8D030;
}

.gym-card[data-type="Planta"] .type-badge {
  background-color: #78C850;
}

.gym-card[data-type="Veneno"] .type-badge {
  background-color: #A040A0;
}

.gym-card[data-type="Psíquico"] .type-badge {
  background-color: #F85888;
}

.gym-card[data-type="Fuego"] .type-badge {
  background-color: #F08030;
}

.gym-card[data-type="Tierra"] .type-badge {
  background-color: #E0C068;
}

.type-label {
  font-size: 6px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.type-name {
  font-size: 10px;
  color: #fff;
  font-weight: bold;
}

.quote-box {
  background: rgba(0, 0, 0, 0.4);
  border-left: 4px solid #ffd700;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.quote-text {
  font-size: 7px;
  color: #e0e0e0;
  line-height: 1.6;
  font-style: italic;
}

.team-display {
  margin-bottom: 15px;
}

.team-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  margin-bottom: 12px;
  border-radius: 4px;
  text-align: center;
}

.team-label {
  font-size: 8px;
  color: #ffd700;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pokemon-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pokemon-frame {
  width: 60px;
  height: 60px;
  background: #1a1a2e;
  border: 3px solid #555;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pokemon-slot:hover .pokemon-frame {
  border-color: #ffd700;
  transform: scale(1.05);
}

.pokemon-sprite {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.pokemon-level {
  font-size: 7px;
  color: #b0b0b0;
  font-weight: bold;
}

.challenge-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.3), 0 6px 15px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
  letter-spacing: 1px;
}

.gym-card[data-type="Roca"] .challenge-btn {
  background-color: #B8A038;
}

.gym-card[data-type="Agua"] .challenge-btn {
  background-color: #6890F0;
}

.gym-card[data-type="Eléctrico"] .challenge-btn {
  background-color: #F8D030;
}

.gym-card[data-type="Planta"] .challenge-btn {
  background-color: #78C850;
}

.gym-card[data-type="Veneno"] .challenge-btn {
  background-color: #A040A0;
}

.gym-card[data-type="Psíquico"] .challenge-btn {
  background-color: #F85888;
}

.gym-card[data-type="Fuego"] .challenge-btn {
  background-color: #F08030;
}

.gym-card[data-type="Tierra"] .challenge-btn {
  background-color: #E0C068;
}

.challenge-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.challenge-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.4);
}

.info-panel {
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 20px;
  background: linear-gradient(135deg, #2d3561 0%, #1f2544 100%);
  border: 4px solid #ffd700;
  border-radius: 12px;
  text-align: center;
}

.info-text {
  font-size: 8px;
  color: #e0e0e0;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .gym-grid {
    grid-template-columns: 1fr;
  }

  .main-title {
    font-size: 10px;
  }

  .subtitle {
    font-size: 7px;
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
