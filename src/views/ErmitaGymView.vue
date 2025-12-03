<template>
  <div class="gym-zone">
    <div class="gym-header">
      <button class="back-btn" @click="goBack">
        ← Volver al Mapa
      </button>
      <div class="gym-info">
        <h1>⛪ Gimnasio La Ermita</h1>
        <p>Líder: <strong>Sofía</strong> | Tipo: Roca/Volador</p>
      </div>
      <div class="controls-hint">
        <span>🎮 W-A-S-D o ↑ ↓ ← → para moverte</span>
      </div>
    </div>

    <div class="gym-map-container">
      <div ref="mapCanvas" class="map-canvas">
        <img
          ref="mapImg"
          :src="gymMapImage"
          alt="Gimnasio La Ermita"
          class="map-image"
        />

        <PlayerCharacter
          :x="playerPosition.x"
          :y="playerPosition.y"
          :is-moving="isMoving"
          :image-src="playerImage"
          label="Jugador"
        />

        <div
          class="gym-leader"
          :class="{ 'near-player': isNearLeader }"
          :style="leaderStyle"
        >
          <div class="leader-sprite">
            <img :src="sofiaSpriteImage" alt="Líder Sofía" class="leader-image" />
            <span class="leader-shadow"></span>
          </div>
          <div class="leader-label">Líder Sofía</div>
        </div>

        <div class="pokemon-deco pokemon-1">✨</div>
        <div class="pokemon-deco pokemon-2">🦇</div>
      </div>
    </div>

    <div class="mobile-controls">
      <div class="control-row">
        <button class="control-btn" @click="move('up')">⬆️</button>
      </div>
      <div class="control-row">
        <button class="control-btn" @click="move('left')">⬅️</button>
        <button class="control-btn" @click="move('down')">⬇️</button>
        <button class="control-btn" @click="move('right')">➡️</button>
      </div>
    </div>

    <div v-if="showBattleModal" class="battle-modal-overlay" @click.self="showBattleModal = false">
      <div class="battle-modal">
        <div class="battle-header">
          <h2>⚔️ ¡Desafío Gótico!</h2>
        </div>
        <div class="battle-content">
          <div class="leader-preview">
            <img :src="sofiaSpriteImage" alt="Líder Sofía" class="leader-avatar-img" />
            <div class="leader-name">Líder Sofía</div>
          </div>
          <p class="battle-dialogue">
            "Bienvenido al Bulevar... La brisa trae secretos antiguos hoy.
            Mi Gárgoluz despertó con una tormenta eléctrica para proteger este templo.
            ¿Crees que tu espíritu brilla lo suficiente para desafiar nuestra historia?"
          </p>
          <div class="leader-pokemon">
            <span class="pokemon-icon">🦅</span> 
            <span class="pokemon-name">Gárgoluz Lv.42</span>
          </div>
        </div>
        <div class="battle-actions">
          <button class="btn-battle" @click="startBattle">
            ⚔️ ¡Pelear!
          </button>
          <button class="btn-cancel" @click="showBattleModal = false">
            🏃 Huir
          </button>
        </div>
      </div>
    </div>

    <div v-if="showVictoryModal" class="battle-modal-overlay">
      <div class="battle-modal victory">
        <div class="battle-header victory">
          <h2>🏆 ¡Victoria Iluminada!</h2>
        </div>
        <div class="battle-content">
          <p class="victory-text">
            ¡Impresionante! Has resistido el peso de la historia y la luz de mis vitrales.
            Eres digno de proteger el patrimonio de Cali.
          </p>
          <div class="badge-reward">
            <div class="badge-icon">💠</div>
            <div class="badge-name">Medalla Vitral</div>
          </div>
        </div>
        <div class="battle-actions">
          <button class="btn-battle" @click="claimVictory">
            ✨ Reclamar Medalla
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// --- IMPORTACIÓN DE ASSETS ---
// Asegúrate de cambiar estas rutas por las reales de tu proyecto
import gymMapImage from '@/assets/images/backgrounds/ermita-bg.png' 
import playerImage from '@/assets/images/characters/player-sprite.png'
import sofiaSpriteImage from '@/assets/images/characters/sofia-sprite.png' 
import PlayerCharacter from '@/components/PlayerCharacter.vue'
import { useKeyboardMovement } from '@/composables/useKeyboardMovement' // Asumiendo que tienes este composable

const router = useRouter()

// --- ESTADO ---
const showBattleModal = ref(false)
const showVictoryModal = ref(false)
const leaderDefeated = ref(false)

// --- POSICIÓN DE SOFÍA ---
// La colocamos un poco más centrada y arriba, frente a la iglesia
const leaderPosition = { x: 50, y: 45 }

const leaderStyle = computed(() => ({
  left: `${leaderPosition.x}%`,
  top: `${leaderPosition.y}%`,
}))

// --- SISTEMA DE MOVIMIENTO ---
// Usamos el mismo composable que en Cristo Rey
const { position: playerPosition, isMoving, move } = useKeyboardMovement({
  initialPosition: { x: 50, y: 90 }, // Empieza abajo
  speed: 2,
  bounds: { minX: 10, maxX: 90, minY: 30, maxY: 95 }, // Ajustar límites según la imagen de fondo
})

// --- DETECCIÓN DE PROXIMIDAD ---
const isNearLeader = computed(() => {
  const distance = Math.sqrt(
    Math.pow(playerPosition.value.x - leaderPosition.x, 2) +
    Math.pow(playerPosition.value.y - leaderPosition.y, 2)
  )
  return distance < 12 // Distancia de interacción
})

// Trigger del modal al acercarse
watch(isNearLeader, (near) => {
  if (near && !leaderDefeated.value && !showBattleModal.value) {
    showBattleModal.value = true
  }
})

// --- ACCIONES ---
const goBack = () => {
  router.push('/mapa')
}

const startBattle = () => {
  showBattleModal.value = false
  // Aquí iría la transición a la escena de batalla real
  // Por ahora simulamos una victoria rápida
  setTimeout(() => {
    showVictoryModal.value = true
    leaderDefeated.value = true
  }, 1500)
}

const claimVictory = () => {
  showVictoryModal.value = false
  // Aquí guardas el estado en Pinia
  // store.addBadge('medalla-vitral')
  alert('¡Has obtenido la Medalla Vitral Sagrado! 💠')
  router.push('/mapa')
}
</script>

<style scoped>
/* --- ESTILOS PRINCIPALES --- */
/* Adaptados a la paleta Gótica/Atardecer de La Ermita */

.gym-zone {
  width: 100%;
  min-height: 100vh;
  /* Gradiente Morado Oscuro a Naranja (Atardecer caleño/Gótico) */
  background: linear-gradient(135deg, #2c1e4a 0%, #5b3a7d 50%, #ff8c42 100%);
  position: relative;
  overflow: hidden;
}

.gym-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  /* Header oscuro con toque azulado */
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.5), transparent);
  z-index: 100;
}

.back-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.back-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: #a78bfa; /* Borde lila al hover */
}

.gym-info {
  text-align: center;
  color: white;
}

.gym-info h1 {
  font-size: 1.3rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  font-family: 'serif'; /* Toque más gótico/elegante */
  letter-spacing: 1px;
}

.gym-info p {
  font-size: 0.85rem;
  margin: 4px 0 0;
  opacity: 0.9;
  color: #e9d5ff; /* Texto lila claro */
}

.controls-hint {
  padding: 6px 12px;
  background: rgba(0,0,0,0.6);
  border-radius: 15px;
  color: #ddd;
  font-size: 0.75rem;
}

/* --- MAPA Y CANVAS --- */
/* Idéntico estructuralmente al ejemplo */
.gym-map-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 20px;
}

.map-canvas {
  position: relative;
  width: min(600px, 90vw);
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  border: 2px solid #4c1d95; /* Borde morado oscuro */
}

.map-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Asegúrate que la imagen de fondo cubra todo */
  pointer-events: none;
}

/* --- LÍDER (NPC) --- */
.gym-leader {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 40;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gym-leader.near-player {
  animation: pulse-leader 1s infinite;
}

@keyframes pulse-leader {
  0%, 100% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 0 rgba(168, 85, 247, 0)); }
  50% { transform: translate(-50%, -50%) scale(1.1); filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.6)); } /* Resplandor morado */
}

.leader-sprite {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.leader-image {
  width: 180px; /* Ajusta según el tamaño de tu imagen */
  height: 180px;
  object-fit: contain;
  /* filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); */
}

.leader-shadow {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 16px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
  border-radius: 50%;
}

.leader-label {
  margin-top: 4px;
  padding: 4px 14px;
  /* Gradiente Morado Elegante */
  background: linear-gradient(135deg, #4c1d95, #312e81);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.2);
}

/* --- DECORACIÓN --- */
.pokemon-deco {
  position: absolute;
  font-size: 1.5rem;
  animation: float 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
  opacity: 0.8;
}

.pokemon-1 { left: 20%; top: 20%; animation-delay: 0s; font-size: 1.2rem; } /* Estrellitas/Brillos */
.pokemon-2 { right: 20%; top: 30%; animation-delay: 1.5s; font-size: 1.5rem; } /* Murciélagos */

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* --- CONTROLES MÓVILES --- */
.mobile-controls {
  display: none; /* Se muestra con media query */
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  flex-direction: column;
  gap: 4px;
}

.control-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-btn:active {
  background: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px), (hover: none) {
  .mobile-controls {
    display: flex;
  }
}

/* --- MODALES --- */
.battle-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 5, 20, 0.85); /* Fondo más oscuro y morado */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(3px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.battle-modal {
  background: linear-gradient(145deg, #f3e8ff, #e9d5ff); /* Fondo lila muy claro */
  border-radius: 16px;
  width: min(400px, 90vw);
  overflow: hidden;
  box-shadow: 0 0 30px rgba(109, 40, 217, 0.5); /* Glow morado */
  animation: slideUp 0.3s ease;
  border: 1px solid #a78bfa;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.battle-header {
  /* Header de Batalla: Morado Oscuro */
  background: linear-gradient(135deg, #4c1d95, #6d28d9);
  color: white;
  padding: 16px;
  text-align: center;
  border-bottom: 2px solid #312e81;
}

.battle-header.victory {
  /* Header de Victoria: Dorado/Naranja (Igual que antes pero adaptado) */
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-bottom: 2px solid #b45309;
}

.battle-header h2 {
  margin: 0;
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.battle-content {
  padding: 24px 20px;
  text-align: center;
}

.leader-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.leader-avatar-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #6d28d9;
  margin-bottom: 10px;
  background: #2e1065;
}

.leader-name {
  font-weight: 800;
  font-size: 1.2rem;
  color: #4c1d95;
}

.battle-dialogue {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 20px;
  font-style: italic;
  font-family: serif;
}

.leader-pokemon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: rgba(109, 40, 217, 0.1);
  border-radius: 12px;
  border: 1px dashed #8b5cf6;
}

.pokemon-icon {
  font-size: 2rem;
}

.pokemon-name {
  font-weight: 700;
  color: #5b21b6;
}

.battle-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #faf5ff; /* Fondo muy claro al final */
  border-top: 1px solid #e9d5ff;
}

.btn-battle, .btn-cancel {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-battle {
  /* Botón de Pelear: Morado vibrante */
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  box-shadow: 0 4px 0 #4c1d95;
}

.btn-cancel {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  color: white;
  box-shadow: 0 4px 0 #475569;
}

.btn-battle:active, .btn-cancel:active {
  transform: translateY(4px);
  box-shadow: none;
}

/* Estilos de Victoria */
.victory-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 24px;
}

.badge-reward {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 16px;
  border: 2px solid #f59e0b;
}

.badge-icon {
  font-size: 4.5rem;
  animation: bounce-badge 2s infinite ease-in-out;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2));
}

@keyframes bounce-badge {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.badge-name {
  font-weight: 900;
  font-size: 1.2rem;
  color: #b45309;
  text-transform: uppercase;
}
</style>
