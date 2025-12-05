<template>
  <div class="gym-zone">
    <div class="gym-header">
      <button class="back-btn" @click="goBack">← Volver al Mapa</button>
      <div class="gym-info">
        <h1>Parque de la Caña</h1>
        <p>Exploración y misiones</p>
      </div>
      <div class="stats-bar">
        <span class="stat-item">Pasos: {{ stepCount }}</span>
        <span class="stat-item">Pokémon: {{ pokemonCaptured }}/3</span>
        <span class="stat-item">Objetos: {{ itemsFound }}/3</span>
      </div>
    </div>

    <div class="gym-map-container">
      <div ref="mapCanvas" class="map-canvas">
        <img ref="mapImg" :src="zoneImage" alt="Parque de la Caña" class="map-image" />

        <PlayerCharacter :x="playerPosition.x" :y="playerPosition.y" :is-moving="isMoving" :image-src="playerImage" label="Jugador" />

        <div class="npc trainer" :style="trainer1Style" v-if="!trainersDefeated.trainer1">
          <div class="npc-sprite"><img :src="playerImage" alt="Explorador Ana" class="npc-image small" /></div>
          <div class="npc-label trainer">Explorador Ana</div>
        </div>

        <div class="npc trainer" :style="trainer2Style" v-if="!trainersDefeated.trainer2">
          <div class="npc-sprite"><img :src="playerImage" alt="Guardaparque Luis" class="npc-image small" /></div>
          <div class="npc-label trainer">Guardaparque Luis</div>
        </div>
      </div>
    </div>

    <div class="mobile-controls">
      <div class="control-row"><button class="control-btn" @click="handleMove('up')">↑</button></div>
      <div class="control-row">
        <button class="control-btn" @click="handleMove('left')">←</button>
        <button class="control-btn" @click="handleMove('down')">↓</button>
        <button class="control-btn" @click="handleMove('right')">→</button>
      </div>
    </div>

    <div v-if="currentEncounter?.type === 'pokemon'" class="modal-overlay">
      <div class="modal pokemon-modal">
        <div class="modal-header pokemon"><h2>Pokémon Salvaje</h2></div>
        <div class="modal-content">
          <div class="encounter-info"><div class="encounter-name">{{ currentEncounter.data.name }}</div><div class="encounter-level">Nivel {{ currentEncounter.data.level }}</div></div>
          <p class="encounter-text">Un {{ currentEncounter.data.name }} apareció entre los árboles del parque.</p>
        </div>
        <div class="modal-actions"><button class="btn-primary" @click="fightPokemon">Pelear</button><button class="btn-secondary" @click="fleePokemon">Huir</button></div>
      </div>
    </div>

    <div v-if="showPokemonResult" class="modal-overlay">
      <div class="modal result-modal">
        <div class="modal-header success"><h2>Victoria</h2></div>
        <div class="modal-content"><p class="result-text">Has derrotado al Pokémon salvaje.</p><p class="reward-text">+50 EXP obtenida</p></div>
        <div class="modal-actions"><button class="btn-primary" @click="closePokemonResult">Continuar</button></div>
      </div>
    </div>

    <div v-if="currentEncounter?.type === 'item'" class="modal-overlay">
      <div class="modal item-modal">
        <div class="modal-header item"><h2>Objeto Encontrado</h2></div>
        <div class="modal-content"><div class="item-info"><div class="item-name">{{ currentEncounter.data.name }}</div></div><p class="item-description">{{ currentEncounter.data.description }}</p></div>
        <div class="modal-actions"><button class="btn-primary" @click="collectItem">Recoger</button></div>
      </div>
    </div>

    <div v-if="currentEncounter?.type === 'trainer'" class="modal-overlay">
      <div class="modal trainer-modal">
        <div class="modal-header trainer"><h2>Desafío de Entrenador</h2></div>
        <div class="modal-content">
          <div class="encounter-info"><div class="encounter-name">{{ currentEncounter.data.name }}</div></div>
          <p class="encounter-text">"{{ currentEncounter.data.dialogue }}"</p>
          <div class="trainer-pokemon">Pokémon: {{ currentEncounter.data.pokemon }} (Nv.{{ currentEncounter.data.pokemonLevel }})</div>
        </div>
        <div class="modal-actions"><button class="btn-primary" @click="fightTrainer">Aceptar Desafío</button></div>
      </div>
    </div>

    <div v-if="showTrainerResult" class="modal-overlay">
      <div class="modal result-modal">
        <div class="modal-header success"><h2>Victoria</h2></div>
        <div class="modal-content"><p class="result-text">Has derrotado al entrenador {{ lastDefeatedTrainer }}.</p><p class="reward-text">+100 EXP y $500 obtenidos</p></div>
        <div class="modal-actions"><button class="btn-primary" @click="closeTrainerResult">Continuar</button></div>
      </div>
    </div>

    <div v-if="showUnlockedZoneModal && unlockedZone" class="modal-overlay">
      <div class="modal unlocked-modal">
        <div class="modal-header unlocked"><h2>Nueva Zona Desbloqueada</h2></div>
        <div class="modal-content">
          <div class="unlocked-icon"><span class="unlock-symbol">★</span></div>
          <p class="unlocked-text">Al entrar a esta zona, has desbloqueado una nueva área para explorar.</p>
          <div class="unlocked-zone-info"><div class="zone-name">{{ unlockedZone.name }}</div><div class="zone-description">{{ unlockedZone.description }}</div></div>
          <p class="unlocked-note">Disponible en el mapa mundial.</p>
        </div>
        <div class="modal-actions"><button class="btn-primary" @click="closeUnlockedModal">Entendido</button></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import zoneImage from '../assets/parquecana.png'
import playerImage from '../assets/player.png'
import PlayerCharacter from '../components/PlayerCharacter.vue'
import { useKeyboardMovement } from '../composables/useKeyboardMovement'
import { useMapStore } from '../stores/mapStore'
import type { Zone } from '../types/zone'

const router = useRouter()
const mapStore = useMapStore()

const CURRENT_ZONE_ID = 5

const showUnlockedZoneModal = ref(false)
const unlockedZone = ref<Zone | null>(null)

onMounted(() => {
  const unlocked = mapStore.unlockNextZone(CURRENT_ZONE_ID)
  if (unlocked) {
    unlockedZone.value = unlocked
    setTimeout(() => { showUnlockedZone.value = true }, 500)
  }
})

const showUnlockedZone = ref(false)
const closeUnlockedModal = () => { showUnlockedZone.value = false }

const wildPokemon = [
  { id: 1, name: 'Oddish', level: 16, found: false },
  { id: 2, name: 'Lotad', level: 18, found: false },
  { id: 3, name: 'Buizel', level: 20, found: false },
]

const trainers = {
  trainer1: { name: 'Ana', dialogue: 'Sigue la ruta del río y aprende.', pokemon: 'Lotad', pokemonLevel: 18, position: { x: 30, y: 58 } },
  trainer2: { name: 'Luis', dialogue: 'Cuida la flora del parque.', pokemon: 'Oddish', pokemonLevel: 20, position: { x: 65, y: 40 } },
}

const items = [
  { id: 1, name: 'Cuerda Huida', description: 'Escapa de cuevas y zonas cerradas.', found: false },
  { id: 2, name: 'Super Ball', description: 'Mayor probabilidad de captura.', found: false },
  { id: 3, name: 'Poción', description: 'Restaura 20 PS.', found: false },
]

const stepCount = ref(0)
type Encounter =
  | { type: 'pokemon'; data: { id: number; name: string; level: number; found: boolean } }
  | { type: 'item'; data: { id: number; name: string; description: string; found: boolean } }
  | { type: 'trainer'; data: { id?: string; name: string; dialogue: string; pokemon: string; pokemonLevel: number } }
const currentEncounter = ref<Encounter | null>(null)
const showPokemonResult = ref(false)
const showTrainerResult = ref(false)
const lastDefeatedTrainer = ref('')
const pokemonCaptured = ref(0)
const itemsFound = ref(0)
const pokemonDefeated = ref<number[]>([])
const itemsCollected = ref<number[]>([])
const trainersDefeated = ref({ trainer1: false, trainer2: false })

const trainer1Style = computed(() => ({ left: `${trainers.trainer1.position.x}%`, top: `${trainers.trainer1.position.y}%` }))
const trainer2Style = computed(() => ({ left: `${trainers.trainer2.position.x}%`, top: `${trainers.trainer2.position.y}%` }))

const { position: playerPosition, isMoving, move } = useKeyboardMovement({
  initialPosition: { x: 50, y: 85 },
  speed: 2,
  bounds: { minX: 10, maxX: 90, minY: 15, maxY: 95 },
  onMove: () => { if (!currentEncounter.value) { stepCount.value++; checkRandomEncounter(); checkTrainerProximity() } },
})

const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => { if (!currentEncounter.value) move(direction) }

const checkTrainerProximity = () => {
  if (!trainersDefeated.value.trainer1) {
    const d1 = Math.sqrt(Math.pow(playerPosition.value.x - trainers.trainer1.position.x, 2) + Math.pow(playerPosition.value.y - trainers.trainer1.position.y, 2))
    if (d1 < 10) { currentEncounter.value = { type: 'trainer', data: { ...trainers.trainer1, id: 'trainer1' } } }
  }
  if (!trainersDefeated.value.trainer2) {
    const d2 = Math.sqrt(Math.pow(playerPosition.value.x - trainers.trainer2.position.x, 2) + Math.pow(playerPosition.value.y - trainers.trainer2.position.y, 2))
    if (d2 < 10) { currentEncounter.value = { type: 'trainer', data: { ...trainers.trainer2, id: 'trainer2' } } }
  }
}

const checkRandomEncounter = () => {
  if (stepCount.value % 6 !== 0) return
  const chance = Math.random()
  if (chance < 0.2 && pokemonDefeated.value.length < 3) {
    const available = wildPokemon.filter(p => !pokemonDefeated.value.includes(p.id))
    if (available.length > 0) { const pokemon = available[Math.floor(Math.random() * available.length)]!; currentEncounter.value = { type: 'pokemon', data: pokemon } }
    return
  }
  if (chance >= 0.2 && chance < 0.35 && itemsCollected.value.length < 3) {
    const available = items.filter(i => !itemsCollected.value.includes(i.id))
    if (available.length > 0) { const item = available[Math.floor(Math.random() * available.length)]!; currentEncounter.value = { type: 'item', data: item } }
  }
}

const fightPokemon = () => { if (currentEncounter.value?.type === 'pokemon') { pokemonDefeated.value.push(currentEncounter.value.data.id); pokemonCaptured.value++; currentEncounter.value = null; showPokemonResult.value = true } }
const fleePokemon = () => { currentEncounter.value = null }
const closePokemonResult = () => { showPokemonResult.value = false }

const fightTrainer = () => { if (currentEncounter.value?.type === 'trainer') { const id = currentEncounter.value.data.id as 'trainer1' | 'trainer2'; lastDefeatedTrainer.value = currentEncounter.value.data.name; trainersDefeated.value[id] = true; currentEncounter.value = null; showTrainerResult.value = true } }
const closeTrainerResult = () => { showTrainerResult.value = false }
const collectItem = () => { if (currentEncounter.value?.type === 'item') { itemsCollected.value.push(currentEncounter.value.data.id); itemsFound.value++; currentEncounter.value = null } }

const goBack = () => { router.push('/mapa') }
</script>

<style scoped>
.gym-zone{width:100%;min-height:100vh;background:linear-gradient(135deg,#0e4d4c 0%,#1b8a72 50%,#0e4d4c 100%);position:relative;overflow:hidden}
.gym-header{position:fixed;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:linear-gradient(to bottom,rgba(0,0,0,0.85),rgba(0,0,0,0.5),transparent);z-index:100}
.back-btn{padding:8px 16px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;border-radius:20px;cursor:pointer;font-weight:500}
.gym-info{text-align:center;color:white}
.stats-bar{display:flex;gap:12px}
.stat-item{padding:6px 12px;background:rgba(0,0,0,0.6);border-radius:15px;color:white;font-size:.75rem;font-weight:500}
.gym-map-container{width:100%;height:100vh;display:flex;align-items:center;justify-content:center;padding:80px 20px 20px}
.map-canvas{position:relative;width:min(600px,90vw);aspect-ratio:2/3;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.map-image{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.npc{position:absolute;transform:translate(-50%,-50%);z-index:40;display:flex;flex-direction:column;align-items:center}
.npc-image{width:80px;height:100px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5))}
.npc-label{margin-top:4px;padding:3px 10px;color:white;font-size:.7rem;font-weight:600;border-radius:10px;text-align:center}
.npc-label.trainer{background:linear-gradient(135deg,#1565c0,#0d47a1)}
.mobile-controls{display:none;position:fixed;bottom:20px;right:20px;z-index:100;flex-direction:column;gap:4px}
.control-row{display:flex;justify-content:center;gap:4px}
.control-btn{width:50px;height:50px;border:none;border-radius:12px;background:rgba(255,255,255,.9);font-size:1.2rem;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15)}
@media (max-width:768px),(hover:none){.mobile-controls{display:flex}}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:200}
.modal{background:#f5f5f5;border-radius:12px;width:min(380px,90vw);overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.modal-header{padding:16px;text-align:center;color:white}
.modal-header.pokemon{background:linear-gradient(135deg,#7cb342,#558b2f)}
.modal-header.trainer{background:linear-gradient(135deg,#1565c0,#0d47a1)}
.modal-header.item{background:linear-gradient(135deg,#ff8f00,#e65100)}
.modal-header.success{background:linear-gradient(135deg,#43a047,#2e7d32)}
.modal-content{padding:20px;text-align:center}
.encounter-info{margin-bottom:12px}
.encounter-name{font-size:1.3rem;font-weight:bold;color:#333}
.encounter-level{font-size:.9rem;color:#666}
.encounter-text{font-size:.95rem;color:#555;line-height:1.5;margin-bottom:12px}
.trainer-pokemon{padding:10px;background:rgba(0,0,0,0.05);border-radius:8px;font-weight:500;color:#444}
.result-text{font-size:1rem;color:#333;margin-bottom:8px}
.reward-text{font-size:.9rem;color:#43a047;font-weight:600}
.modal-actions{display:flex;gap:10px;padding:16px;background:rgba(0,0,0,.05)}
.btn-primary,.btn-secondary{flex:1;padding:12px;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer}
.btn-primary{background:linear-gradient(135deg,#43a047,#2e7d32);color:white}
.btn-secondary{background:linear-gradient(135deg,#757575,#424242);color:white}
.unlocked-modal .modal-header.unlocked{background:linear-gradient(135deg,#7b1fa2,#4a148c)}
.unlocked-icon{margin-bottom:16px}
.unlock-symbol{font-size:3rem;color:#7b1fa2}
.unlocked-zone-info{padding:16px;background:linear-gradient(135deg,#f3e5f5,#e1bee7);border-radius:10px;margin-bottom:12px}
.zone-name{font-size:1.2rem;font-weight:bold;color:#4a148c;margin-bottom:8px}
.zone-description{font-size:.9rem;color:#666;line-height:1.4}
.unlocked-note{font-size:.8rem;color:#888;font-style:italic}
</style>
