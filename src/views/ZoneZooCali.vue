<template>
  <div class="gym-zone">
    <div class="gym-header">
      <button class="back-btn" @click="goBack">← Volver al Mapa</button>
      <div class="gym-info">
        <h1>Zoológico de Cali</h1>
        <p>Tipo: Normal/Agua</p>
      </div>
      <div class="stats-bar">
        <span class="stat-item">Pasos: {{ stepCount }}</span>
        <span class="stat-item">Pokémon: {{ pokemonCaptured }}/2</span>
        <span class="stat-item">Objetos: {{ itemsFound }}/2</span>
      </div>
    </div>

    <div class="gym-map-container">
      <div ref="mapCanvas" class="map-canvas">
        <img ref="mapImg" :src="zoneImage" alt="Zoológico de Cali" class="map-image" />

        <PlayerCharacter :x="playerPosition.x" :y="playerPosition.y" :is-moving="isMoving" :image-src="playerImage" label="Jugador" />

        <div class="npc trainer" :style="trainer1Style" v-if="!trainersDefeated.trainer1">
          <div class="npc-sprite"><img :src="playerImage" alt="Guía Laura" class="npc-image small" /></div>
          <div class="npc-label trainer">Guía Laura</div>
        </div>

        <div class="npc trainer" :style="trainer2Style" v-if="!trainersDefeated.trainer2">
          <div class="npc-sprite"><img :src="playerImage" alt="Guardián Diego" class="npc-image small" /></div>
          <div class="npc-label trainer">Guardián Diego</div>
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
          <div class="encounter-info">
            <div class="encounter-name">{{ currentEncounter.data.name }}</div>
            <div class="encounter-level">Nivel {{ currentEncounter.data.level }}</div>
          </div>
          <p class="encounter-text">Un {{ currentEncounter.data.name }} apareció cerca del estanque.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="fightPokemon">Pelear</button>
          <button class="btn-secondary" @click="fleePokemon">Huir</button>
        </div>
      </div>
    </div>

    <div v-if="showPokemonResult" class="modal-overlay">
      <div class="modal result-modal">
        <div class="modal-header success"><h2>Victoria</h2></div>
        <div class="modal-content"><p class="result-text">Has derrotado al Pokémon salvaje.</p></div>
        <div class="modal-actions"><button class="btn-primary" @click="closePokemonResult">Continuar</button></div>
      </div>
    </div>

    <div v-if="currentEncounter?.type === 'item'" class="modal-overlay">
      <div class="modal item-modal">
        <div class="modal-header item"><h2>Objeto Encontrado</h2></div>
        <div class="modal-content">
          <div class="item-info"><div class="item-name">{{ currentEncounter.data.name }}</div></div>
          <p class="item-description">{{ currentEncounter.data.description }}</p>
        </div>
        <div class="modal-actions"><button class="btn-primary" @click="collectItem">Recoger</button></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import zoneImage from '../assets/zoologicocali.png'
import playerImage from '../assets/player.png'
import PlayerCharacter from '../components/PlayerCharacter.vue'
import { useKeyboardMovement } from '../composables/useKeyboardMovement'

const router = useRouter()

const wildPokemon = [
  { id: 1, name: 'Psyduck', level: 18, found: false },
  { id: 2, name: 'Zigzagoon', level: 16, found: false },
]

const items = [
  { id: 1, name: 'Antídoto', description: 'Cura el envenenamiento.', found: false },
  { id: 2, name: 'Super Poción', description: 'Restaura 50 PS.', found: false },
]

type Encounter =
  | { type: 'pokemon'; data: { id: number; name: string; level: number; found: boolean } }
  | { type: 'item'; data: { id: number; name: string; description: string; found: boolean } }

const stepCount = ref(0)
const currentEncounter = ref<Encounter | null>(null)
const showPokemonResult = ref(false)
const pokemonCaptured = ref(0)
const itemsFound = ref(0)
const pokemonDefeated = ref<number[]>([])
const itemsCollected = ref<number[]>([])

const trainersDefeated = ref({ trainer1: false, trainer2: false })
const trainers = {
  trainer1: { name: 'Guía Laura', dialogue: 'Conozcamos los hábitats.', pokemon: 'Bidoof', pokemonLevel: 17, position: { x: 30, y: 55 } },
  trainer2: { name: 'Guardián Diego', dialogue: 'Respeta a los Pokémon.', pokemon: 'Wingull', pokemonLevel: 19, position: { x: 65, y: 40 } },
}

const trainer1Style = computed(() => ({ left: `${trainers.trainer1.position.x}%`, top: `${trainers.trainer1.position.y}%` }))
const trainer2Style = computed(() => ({ left: `${trainers.trainer2.position.x}%`, top: `${trainers.trainer2.position.y}%` }))

const { position: playerPosition, isMoving, move } = useKeyboardMovement({
  initialPosition: { x: 50, y: 85 },
  speed: 2,
  bounds: { minX: 10, maxX: 90, minY: 15, maxY: 95 },
  onMove: () => {
    if (!currentEncounter.value) {
      stepCount.value++
      checkRandomEncounter()
    }
  },
})

const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => { if (!currentEncounter.value) move(direction) }

const checkRandomEncounter = () => {
  if (stepCount.value % 6 !== 0) return
  const chance = Math.random()
  if (chance < 0.2 && pokemonDefeated.value.length < 2) {
    const available = wildPokemon.filter(p => !pokemonDefeated.value.includes(p.id))
    if (available.length > 0) currentEncounter.value = { type: 'pokemon', data: available[Math.floor(Math.random() * available.length)]! }
    return
  }
  if (chance >= 0.2 && chance < 0.3 && itemsCollected.value.length < 2) {
    const available = items.filter(i => !itemsCollected.value.includes(i.id))
    if (available.length > 0) currentEncounter.value = { type: 'item', data: available[Math.floor(Math.random() * available.length)]! }
  }
}

const fightPokemon = () => { if (currentEncounter.value?.type === 'pokemon') { pokemonDefeated.value.push(currentEncounter.value.data.id); pokemonCaptured.value++; currentEncounter.value = null; showPokemonResult.value = true } }
const fleePokemon = () => { currentEncounter.value = null }
const closePokemonResult = () => { showPokemonResult.value = false }
const collectItem = () => { if (currentEncounter.value?.type === 'item') { itemsCollected.value.push(currentEncounter.value.data.id); itemsFound.value++; currentEncounter.value = null } }
const goBack = () => { router.push('/mapa') }
</script>

<style scoped>
.gym-zone{width:100%;min-height:100vh;background:linear-gradient(135deg,#1b5e20 0%,#4caf50 50%,#1b5e20 100%);position:relative;overflow:hidden}
.gym-header{position:fixed;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:linear-gradient(to bottom,rgba(0,0,0,0.85),rgba(0,0,0,0.5),transparent);z-index:100}
.back-btn{padding:8px 16px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;border-radius:20px;cursor:pointer;font-weight:500}
.gym-info{text-align:center;color:white}
.stats-bar{display:flex;gap:12px}
.stat-item{padding:6px 12px;background:rgba(0,0,0,0.6);border-radius:15px;color:white;font-size:.75rem;font-weight:500}
.gym-map-container{width:100%;height:100vh;display:flex;align-items:center;justify-content:center;padding:80px 20px 20px}
.map-canvas{position:relative;width:min(600px,90vw);aspect-ratio:2/3;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.map-image{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.npc{position:absolute;transform:translate(-50%,-50%);z-index:40;display:flex;flex-direction:column;align-items:center}
.npc-sprite{position:relative}
.npc-image{width:100px;height:120px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5))}
.npc-image.small{width:80px;height:100px}
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
.modal-header.item{background:linear-gradient(135deg,#ff8f00,#e65100)}
.modal-header.success{background:linear-gradient(135deg,#43a047,#2e7d32)}
.modal-content{padding:20px;text-align:center}
.encounter-info{margin-bottom:12px}
.encounter-name{font-size:1.3rem;font-weight:bold;color:#333}
.encounter-level{font-size:.9rem;color:#666}
.encounter-text{font-size:.95rem;color:#555;line-height:1.5;margin-bottom:12px}
.modal-actions{display:flex;gap:10px;padding:16px;background:rgba(0,0,0,.05)}
.btn-primary,.btn-secondary{flex:1;padding:12px;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer}
.btn-primary{background:linear-gradient(135deg,#43a047,#2e7d32);color:white}
.btn-secondary{background:linear-gradient(135deg,#757575,#424242);color:white}
</style>
