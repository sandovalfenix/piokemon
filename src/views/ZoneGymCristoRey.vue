<template>
  <div class="gym-zone">
    <!-- Header con info del gimnasio -->
    <div class="gym-header">
      <button class="back-btn" @click="goBack">
        ← Volver al Mapa
      </button>
      <div class="gym-info">
        <h1>Gimnasio Cristo Rey</h1>
        <p>Líder: <strong>José</strong> | Tipo: Roca/Tierra</p>
      </div>
      <div class="stats-bar">
        <span class="stat-item">Pasos: {{ stepCount }}</span>
        <span class="stat-item">Pokémon: {{ pokemonCaptured }}/3</span>
        <span class="stat-item">Objetos: {{ itemsFound }}/3</span>
      </div>
    </div>

    <!-- Área del mapa -->
    <div class="gym-map-container">
      <div ref="mapCanvas" class="map-canvas">
        <img
          ref="mapImg"
          :src="gymMapImage"
          alt="Gimnasio Cristo Rey"
          class="map-image"
        />

        <!-- Jugador -->
        <PlayerCharacter
          :x="playerPosition.x"
          :y="playerPosition.y"
          :is-moving="isMoving"
          :image-src="playerImage"
          label="Jugador"
        />

        <!-- Líder del Gimnasio (NPC Principal) -->
        <div
          class="npc gym-leader"
          :class="{ 'near-player': isNearLeader }"
          :style="leaderStyle"
          v-if="!leaderDefeated"
        >
          <div class="npc-sprite">
            <img :src="playerImage" alt="Líder José" class="npc-image" />
          </div>
          <div class="npc-label leader">Líder José</div>
        </div>

        <!-- NPC Entrenador 1 -->
        <div
          class="npc trainer"
          :style="trainer1Style"
          v-if="!trainersDefeated.trainer1"
        >
          <div class="npc-sprite">
            <img :src="playerImage" alt="Entrenador Carlos" class="npc-image small" />
          </div>
          <div class="npc-label trainer">Carlos</div>
        </div>

        <!-- NPC Entrenador 2 -->
        <div
          class="npc trainer"
          :style="trainer2Style"
          v-if="!trainersDefeated.trainer2"
        >
          <div class="npc-sprite">
            <img :src="playerImage" alt="Entrenador María" class="npc-image small" />
          </div>
          <div class="npc-label trainer">María</div>
        </div>
      </div>
    </div>

    <!-- Controles móviles -->
    <div class="mobile-controls">
      <div class="control-row">
        <button class="control-btn" @click="handleMove('up')">↑</button>
      </div>
      <div class="control-row">
        <button class="control-btn" @click="handleMove('left')">←</button>
        <button class="control-btn" @click="handleMove('down')">↓</button>
        <button class="control-btn" @click="handleMove('right')">→</button>
      </div>
    </div>

    <!-- Modal: Encuentro Pokémon Salvaje -->
    <div v-if="currentEncounter?.type === 'pokemon'" class="modal-overlay">
      <div class="modal pokemon-modal">
        <div class="modal-header pokemon">
          <h2>Pokémon Salvaje Encontrado</h2>
        </div>
        <div class="modal-content">
          <div class="encounter-info">
            <div class="encounter-name">{{ currentEncounter.data.name }}</div>
            <div class="encounter-level">Nivel {{ currentEncounter.data.level }}</div>
          </div>
          <p class="encounter-text">
            Un {{ currentEncounter.data.name }} salvaje apareció entre la hierba alta.
          </p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="fightPokemon">Pelear</button>
          <button class="btn-secondary" @click="fleePokemon">Huir</button>
        </div>
      </div>
    </div>

    <!-- Modal: Resultado Batalla Pokémon -->
    <div v-if="showPokemonResult" class="modal-overlay">
      <div class="modal result-modal">
        <div class="modal-header success">
          <h2>Victoria</h2>
        </div>
        <div class="modal-content">
          <p class="result-text">Has derrotado al Pokémon salvaje.</p>
          <p class="reward-text">+50 EXP obtenida</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="closePokemonResult">Continuar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Encuentro con Entrenador -->
    <div v-if="currentEncounter?.type === 'trainer'" class="modal-overlay">
      <div class="modal trainer-modal">
        <div class="modal-header trainer">
          <h2>Desafío de Entrenador</h2>
        </div>
        <div class="modal-content">
          <div class="encounter-info">
            <div class="encounter-name">{{ currentEncounter.data.name }}</div>
          </div>
          <p class="encounter-text">
            "{{ currentEncounter.data.dialogue }}"
          </p>
          <div class="trainer-pokemon">
            Pokémon: {{ currentEncounter.data.pokemon }} (Nv.{{ currentEncounter.data.pokemonLevel }})
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="fightTrainer">Aceptar Desafío</button>
        </div>
      </div>
    </div>

    <!-- Modal: Resultado Batalla Entrenador -->
    <div v-if="showTrainerResult" class="modal-overlay">
      <div class="modal result-modal">
        <div class="modal-header success">
          <h2>Victoria</h2>
        </div>
        <div class="modal-content">
          <p class="result-text">Has derrotado al entrenador {{ lastDefeatedTrainer }}.</p>
          <p class="reward-text">+100 EXP y $500 obtenidos</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="closeTrainerResult">Continuar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Objeto Encontrado -->
    <div v-if="currentEncounter?.type === 'item'" class="modal-overlay">
      <div class="modal item-modal">
        <div class="modal-header item">
          <h2>Objeto Encontrado</h2>
        </div>
        <div class="modal-content">
          <div class="item-info">
            <div class="item-name">{{ currentEncounter.data.name }}</div>
          </div>
          <p class="item-description">{{ currentEncounter.data.description }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="collectItem">Recoger</button>
        </div>
      </div>
    </div>

    <!-- Modal: Líder del Gimnasio -->
    <div v-if="showBattleModal" class="modal-overlay">
      <div class="modal leader-modal">
        <div class="modal-header leader">
          <h2>Desafío del Líder</h2>
        </div>
        <div class="modal-content">
          <div class="leader-preview">
            <img :src="playerImage" alt="Líder José" class="leader-avatar" />
            <div class="leader-title">Líder José</div>
          </div>
          <p class="encounter-text">
            "Bienvenido al Gimnasio Cristo Rey. Soy José, el líder de este gimnasio.
            Mi Tyranitar y yo hemos entrenado en las montañas de Cali.
            ¿Estás listo para el desafío?"
          </p>
          <div class="trainer-pokemon">
            Pokémon: Tyranitar (Nv.45)
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="startLeaderBattle">Pelear</button>
          <button class="btn-secondary" @click="showBattleModal = false">Huir</button>
        </div>
      </div>
    </div>

    <!-- Modal: Victoria contra Líder -->
    <div v-if="showVictoryModal" class="modal-overlay">
      <div class="modal victory-modal">
        <div class="modal-header victory">
          <h2>Victoria</h2>
        </div>
        <div class="modal-content">
          <p class="victory-text">
            Has derrotado al Líder José. Has demostrado ser un gran entrenador.
          </p>
          <div class="badge-reward">
            <div class="badge-name">Medalla Cristo Rey obtenida</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="claimVictory">Reclamar Medalla</button>
        </div>
      </div>
    </div>

    <!-- Modal: Nueva Zona Desbloqueada -->
    <div v-if="showUnlockedZoneModal && unlockedZone" class="modal-overlay">
      <div class="modal unlocked-modal">
        <div class="modal-header unlocked">
          <h2>Nueva Zona Desbloqueada</h2>
        </div>
        <div class="modal-content">
          <div class="unlocked-icon">
            <span class="unlock-symbol">&#9733;</span>
          </div>
          <p class="unlocked-text">
            Al entrar a esta zona, has desbloqueado una nueva área para explorar.
          </p>
          <div class="unlocked-zone-info">
            <div class="zone-name">{{ unlockedZone.name }}</div>
            <div class="zone-description">{{ unlockedZone.description }}</div>
          </div>
          <p class="unlocked-note">
            Esta zona estará disponible en el mapa mundial.
          </p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="closeUnlockedModal">Entendido</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import gymMapImage from '../assets/gym-cristo-rey.png'
import playerImage from '../assets/player.png'
import PlayerCharacter from '../components/PlayerCharacter.vue'
import { useKeyboardMovement } from '../composables/useKeyboardMovement'
import { useMapStore } from '../stores/mapStore'
import type { Zone } from '../types/zone'

const router = useRouter()
const mapStore = useMapStore()

// ID de esta zona (Cristo Rey = 4)
const CURRENT_ZONE_ID = 4

// Estado para zona desbloqueada
const showUnlockedZoneModal = ref(false)
const unlockedZone = ref<Zone | null>(null)

// Al montar, desbloquear la siguiente zona
onMounted(() => {
  const unlocked = mapStore.unlockNextZone(CURRENT_ZONE_ID)
  if (unlocked) {
    unlockedZone.value = unlocked
    // Mostrar modal después de un breve delay para mejor UX
    setTimeout(() => {
      showUnlockedZoneModal.value = true
    }, 500)
  }
})

const closeUnlockedModal = () => {
  showUnlockedZoneModal.value = false
}

// ========== DATOS DE ENCUENTROS ==========

// Pokémon salvajes disponibles (3)
const wildPokemon = [
  { id: 1, name: 'Geodude', level: 28, found: false },
  { id: 2, name: 'Onix', level: 32, found: false },
  { id: 3, name: 'Graveler', level: 35, found: false },
]

// Entrenadores (2)
const trainers = {
  trainer1: {
    name: 'Carlos',
    dialogue: '¡Hey! Soy Carlos. No dejaré que llegues al líder tan fácilmente.',
    pokemon: 'Sandshrew',
    pokemonLevel: 30,
    position: { x: 25, y: 50 },
  },
  trainer2: {
    name: 'María',
    dialogue: '¡Prepárate para perder! Mis Pokémon de tipo roca son invencibles.',
    pokemon: 'Rhyhorn',
    pokemonLevel: 33,
    position: { x: 35, y: 35 },
  },
}

// Objetos (3)
const items = [
  { id: 1, name: 'Poción', description: 'Restaura 20 PS de un Pokémon.', found: false },
  { id: 2, name: 'Pokéball', description: 'Una ball estándar para capturar Pokémon.', found: false },
  { id: 3, name: 'Revivir', description: 'Revive a un Pokémon debilitado con la mitad de PS.', found: false },
]

// ========== ESTADO ==========

// Contador de pasos
const stepCount = ref(0)

// Encuentros
const currentEncounter = ref<{ type: string; data: any } | null>(null)  // eslint-disable-line @typescript-eslint/no-explicit-any
const showPokemonResult = ref(false)
const showTrainerResult = ref(false)
const lastDefeatedTrainer = ref('')

// Progreso
const pokemonCaptured = ref(0)
const itemsFound = ref(0)
const pokemonDefeated = ref<number[]>([])
const itemsCollected = ref<number[]>([])
const trainersDefeated = ref({
  trainer1: false,
  trainer2: false,
})

// Líder
const showBattleModal = ref(false)
const showVictoryModal = ref(false)
const leaderDefeated = ref(false)

// Posiciones de NPCs
const leaderPosition = { x: 70, y: 30 }
const leaderStyle = computed(() => ({
  left: `${leaderPosition.x}%`,
  top: `${leaderPosition.y}%`,
}))

const trainer1Style = computed(() => ({
  left: `${trainers.trainer1.position.x}%`,
  top: `${trainers.trainer1.position.y}%`,
}))

const trainer2Style = computed(() => ({
  left: `${trainers.trainer2.position.x}%`,
  top: `${trainers.trainer2.position.y}%`,
}))

// ========== MOVIMIENTO ==========

const { position: playerPosition, isMoving, move } = useKeyboardMovement({
  initialPosition: { x: 50, y: 90 },
  speed: 2,
  bounds: { minX: 10, maxX: 90, minY: 15, maxY: 95 },
  onMove: () => {
    if (!currentEncounter.value) {
      stepCount.value++
      checkRandomEncounter()
      checkTrainerProximity()
    }
  },
})

const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (!currentEncounter.value && !showBattleModal.value && !showVictoryModal.value && !showPokemonResult.value && !showTrainerResult.value) {
    move(direction)
  }
}

// ========== PROXIMIDAD ==========

const isNearLeader = computed(() => {
  const distance = Math.sqrt(
    Math.pow(playerPosition.value.x - leaderPosition.x, 2) +
    Math.pow(playerPosition.value.y - leaderPosition.y, 2)
  )
  return distance < 15
})

const checkTrainerProximity = () => {
  // Trainer 1
  if (!trainersDefeated.value.trainer1) {
    const dist1 = Math.sqrt(
      Math.pow(playerPosition.value.x - trainers.trainer1.position.x, 2) +
      Math.pow(playerPosition.value.y - trainers.trainer1.position.y, 2)
    )
    if (dist1 < 10) {
      currentEncounter.value = { type: 'trainer', data: { ...trainers.trainer1, id: 'trainer1' } }
      return
    }
  }

  // Trainer 2
  if (!trainersDefeated.value.trainer2) {
    const dist2 = Math.sqrt(
      Math.pow(playerPosition.value.x - trainers.trainer2.position.x, 2) +
      Math.pow(playerPosition.value.y - trainers.trainer2.position.y, 2)
    )
    if (dist2 < 10) {
      currentEncounter.value = { type: 'trainer', data: { ...trainers.trainer2, id: 'trainer2' } }
      return
    }
  }
}

watch(isNearLeader, (near) => {
  if (near && !leaderDefeated.value && !showBattleModal.value && !currentEncounter.value) {
    showBattleModal.value = true
  }
})

// ========== ENCUENTROS ALEATORIOS ==========

const checkRandomEncounter = () => {
  // Solo cada ciertos pasos y con probabilidad
  if (stepCount.value % 5 !== 0) return

  const chance = Math.random()

  // 15% probabilidad de Pokémon salvaje
  if (chance < 0.15 && pokemonDefeated.value.length < 3) {
    const available = wildPokemon.filter(p => !pokemonDefeated.value.includes(p.id))
    if (available.length > 0) {
      const pokemon = available[Math.floor(Math.random() * available.length)]
      currentEncounter.value = { type: 'pokemon', data: pokemon }
      return
    }
  }

  // 10% probabilidad de objeto
  if (chance >= 0.15 && chance < 0.25 && itemsCollected.value.length < 3) {
    const available = items.filter(i => !itemsCollected.value.includes(i.id))
    if (available.length > 0) {
      const item = available[Math.floor(Math.random() * available.length)]
      currentEncounter.value = { type: 'item', data: item }
    }
  }
}

// ========== ACCIONES ==========

const fightPokemon = () => {
  if (currentEncounter.value?.type === 'pokemon') {
    pokemonDefeated.value.push(currentEncounter.value.data.id)
    pokemonCaptured.value++
    currentEncounter.value = null
    showPokemonResult.value = true
  }
}

const fleePokemon = () => {
  currentEncounter.value = null
}

const closePokemonResult = () => {
  showPokemonResult.value = false
}

const fightTrainer = () => {
  if (currentEncounter.value?.type === 'trainer') {
    const trainerId = currentEncounter.value.data.id as 'trainer1' | 'trainer2'
    lastDefeatedTrainer.value = currentEncounter.value.data.name
    trainersDefeated.value[trainerId] = true
    currentEncounter.value = null
    showTrainerResult.value = true
  }
}

const closeTrainerResult = () => {
  showTrainerResult.value = false
}

const collectItem = () => {
  if (currentEncounter.value?.type === 'item') {
    itemsCollected.value.push(currentEncounter.value.data.id)
    itemsFound.value++
    currentEncounter.value = null
  }
}

const startLeaderBattle = () => {
  showBattleModal.value = false
  setTimeout(() => {
    showVictoryModal.value = true
    leaderDefeated.value = true
  }, 1000)
}

const claimVictory = () => {
  showVictoryModal.value = false
  router.push('/mapa')
}

const goBack = () => {
  router.push('/mapa')
}
</script>

<style scoped>
.gym-zone {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #2d5016 0%, #4a7c23 50%, #2d5016 100%);
  position: relative;
  overflow: hidden;
}

/* Header */
.gym-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.5), transparent);
  z-index: 100;
}

.back-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.25);
}

.gym-info {
  text-align: center;
  color: white;
}

.gym-info h1 {
  font-size: 1.2rem;
  margin: 0;
}

.gym-info p {
  font-size: 0.8rem;
  margin: 4px 0 0;
  opacity: 0.9;
}

.stats-bar {
  display: flex;
  gap: 12px;
}

.stat-item {
  padding: 6px 12px;
  background: rgba(0,0,0,0.6);
  border-radius: 15px;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Mapa */
.gym-map-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 20px;
}

.map-canvas {
  position: relative;
  width: min(600px, 90vw);
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.map-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* NPCs */
.npc {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

.npc.near-player {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.npc-sprite {
  position: relative;
}

.npc-image {
  width: 120px;
  height: 140px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
}

.npc-image.small {
  width: 80px;
  height: 100px;
}

.npc-label {
  margin-top: 4px;
  padding: 3px 10px;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 10px;
  text-align: center;
}

.npc-label.leader {
  background: linear-gradient(135deg, #c62828, #8e0000);
}

.npc-label.trainer {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
}

/* Controles móviles */
.mobile-controls {
  display: none;
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
  background: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px), (hover: none) {
  .mobile-controls {
    display: flex;
  }
}

/* Modal base */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #f5f5f5;
  border-radius: 12px;
  width: min(380px, 90vw);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 16px;
  text-align: center;
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.modal-header.pokemon {
  background: linear-gradient(135deg, #7cb342, #558b2f);
}

.modal-header.trainer {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
}

.modal-header.item {
  background: linear-gradient(135deg, #ff8f00, #e65100);
}

.modal-header.leader {
  background: linear-gradient(135deg, #c62828, #8e0000);
}

.modal-header.success {
  background: linear-gradient(135deg, #43a047, #2e7d32);
}

.modal-header.victory {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
}

.modal-content {
  padding: 20px;
  text-align: center;
}

.encounter-info {
  margin-bottom: 12px;
}

.encounter-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.encounter-level {
  font-size: 0.9rem;
  color: #666;
}

.encounter-text {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 12px;
}

.trainer-pokemon {
  padding: 10px;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  font-weight: 500;
  color: #444;
}

.item-info {
  margin-bottom: 12px;
}

.item-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #e65100;
}

.item-description {
  font-size: 0.9rem;
  color: #555;
}

.result-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 8px;
}

.reward-text {
  font-size: 0.9rem;
  color: #43a047;
  font-weight: 600;
}

.leader-preview {
  margin-bottom: 16px;
}

.leader-avatar {
  width: 100px;
  height: 120px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.leader-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: #c62828;
  margin-top: 8px;
}

.victory-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 16px;
}

.badge-reward {
  padding: 16px;
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  border-radius: 10px;
}

.badge-name {
  font-weight: bold;
  font-size: 1rem;
  color: #ff8f00;
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: rgba(0,0,0,0.05);
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #757575, #424242);
  color: white;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: scale(1.02);
}

/* Modal: Zona Desbloqueada */
.modal-header.unlocked {
  background: linear-gradient(135deg, #7b1fa2, #4a148c);
}

.unlocked-icon {
  margin-bottom: 16px;
}

.unlock-symbol {
  font-size: 3rem;
  color: #7b1fa2;
  display: inline-block;
  animation: spin-star 2s ease-in-out infinite;
}

@keyframes spin-star {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

.unlocked-text {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 16px;
}

.unlocked-zone-info {
  padding: 16px;
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  border-radius: 10px;
  margin-bottom: 12px;
}

.zone-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4a148c;
  margin-bottom: 8px;
}

.zone-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.unlocked-note {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

.unlocked-modal .btn-primary {
  background: linear-gradient(135deg, #7b1fa2, #4a148c);
}
</style>
