<template>
  <div class="pokemon-battle-screen">
    <!-- Fondo de batalla con textura -->
    <div class="battle-background">
      <div class="sky-gradient"></div>
      <div class="ground-texture"></div>
      <div class="battle-platform enemy-platform-bg"></div>
      <div class="battle-platform player-platform-bg"></div>
    </div>

    <!-- Campo de batalla -->
    <div class="battle-field">
      <!-- Pokémon enemigo -->
      <div class="enemy-pokemon">
        <div class="enemy-info-box">
          <div class="info-header">
            <span class="pokemon-name">{{ enemyPokemon.name.toUpperCase() }}</span>
            <span class="pokemon-level">:L{{ enemyPokemon.level }}</span>
          </div>
          <div class="hp-display">
            <span class="hp-label">HP:</span>
            <div class="hp-bar-outer">
              <div 
                class="hp-bar-inner" 
                :class="getHpColorClass(enemyHpPercent)"
                :style="{ width: enemyHpPercent + '%' }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="enemy-sprite-container">
          <div class="battle-shadow"></div>
          <img 
            :src="enemyPokemon.sprite" 
            :alt="enemyPokemon.name"
            class="pokemon-sprite"
          >
        </div>
      </div>

      <!-- Pokémon jugador -->
      <div class="player-pokemon">
        <div class="player-sprite-container">
          <div class="battle-shadow"></div>
          <img 
            :src="playerPokemon.sprite" 
            :alt="playerPokemon.name"
            class="pokemon-sprite"
          >
        </div>

        <div class="player-info-box">
          <div class="info-header">
            <span class="pokemon-name">{{ playerPokemon.name.toUpperCase() }}</span>
            <span class="pokemon-level">:L{{ playerPokemon.level }}</span>
          </div>
          <div class="hp-display">
            <span class="hp-label">HP:</span>
            <div class="hp-bar-outer">
              <div 
                class="hp-bar-inner" 
                :class="getHpColorClass(playerHpPercent)"
                :style="{ width: playerHpPercent + '%' }"
              ></div>
            </div>
          </div>
          <div class="hp-numeric">{{ playerPokemon.currentHp }}/{{ playerPokemon.maxHp }}</div>
          <div class="exp-bar-container">
            <div class="exp-bar-outer">
              <div class="exp-bar-inner" :style="{ width: expPercent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interfaz de batalla inferior -->
    <div class="battle-interface">
      <!-- Diálogo -->
      <div class="dialogue-box" v-if="!showBagMenu">
        <p class="dialogue-text">{{ currentMessage }}</p>
        <div class="continue-arrow" v-if="showContinueArrow">▼</div>
      </div>

      <!-- Menú principal -->
      <div class="battle-menu" v-if="showBattleMenu && !showBagMenu">
        <button @click="chooseFight" class="battle-button">
          <span class="menu-arrow">►</span>FIGHT
        </button>
        <button @click="chooseBag" class="battle-button">BAG</button>
        <button @click="choosePokemon" class="battle-button">POKéMON</button>
        <button @click="chooseRun" class="battle-button">RUN</button>
      </div>
       <!-- Menú de mochila completo -->
<div class="full-bag-screen" v-if="showBagMenu">
  <div class="bag-header">
    <img 
      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berry-pouch.png" 
      alt="bag" 
      class="bag-sprite-icon"
    >
    <div class="bag-title-text">BAG</div>
  </div>

  <div class="bag-categories">
    <button 
      v-for="category in bagCategories" 
      :key="category.id"
      @click="selectedCategory = category.id"
      class="category-button"
      :class="{ active: selectedCategory === category.id }"
    >
      {{ category.name }}
    </button>
  </div>

  <div class="bag-items-area">
    <div class="items-list">
      <button 
        v-for="item in getCurrentItems()" 
        :key="item.id"
        @click="selectBagItem(item)"
        class="bag-item-row"
        :class="{ selected: selectedItem?.id === item.id }"
      >
        <img :src="item.sprite" :alt="item.name" class="item-icon-small">
        <span class="item-name-text">{{ item.name }}</span>
        <span class="item-quantity-text">×{{ item.quantity }}</span>
      </button>
    </div>

    <div class="item-description-panel">
      <div class="item-preview">
        <img 
          v-if="selectedItem" 
          :src="selectedItem.sprite" 
          :alt="selectedItem.name" 
          class="item-preview-image"
        >
      </div>
      <p class="item-description-text">
        {{ selectedItem?.description || 'Select an item' }}
      </p>
      <button 
        v-if="selectedItem"
        @click="useItem(selectedItem)" 
        class="use-item-button"
      >
        USE
      </button>
    </div>
  </div>

  <button @click="closeBag" class="bag-back-button">
    ◄ BACK
  </button>
</div>
      <!-- Menú de ataques -->
      <div class="moves-interface" v-if="showMovesInterface">
        <div class="moves-container">
          <button 
            v-for="(move, index) in playerPokemon.moves" 
            :key="index"
            @click="selectMove(move)"
            @mouseenter="hoveredMove = move"
            class="move-button"
            :disabled="move.pp === 0"
            :class="{ 'no-pp': move.pp === 0 }"
          >
            <div class="move-name">{{ move.name.toUpperCase() }}</div>
            <div class="move-details">
              <span class="move-pp">PP {{ move.pp }}/{{ move.maxPp }}</span>
            </div>
          </button>
        </div>
        
        <div class="move-info-panel">
          <div class="pp-display">PP {{ hoveredMove?.pp || '13' }}/{{ hoveredMove?.maxPp || '15' }}</div>
          <div class="type-display">
            TYPE/<span class="type-value" :class="'type-' + (hoveredMove?.type.toLowerCase() || 'fire')">
              {{ hoveredMove?.type || 'FIRE' }}
            </span>
          </div>
        </div>

        <button @click="backToMainMenu" class="back-button">◄ BACK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Move {
  name: string
  type: string
  pp: number
  maxPp: number
  power: number
}

interface Pokemon {
  name: string
  level: number
  currentHp: number
  maxHp: number
  sprite: string
  moves: Move[]
}

interface BagItem {
  id: number
  name: string
  sprite: string
  quantity: number
  category: string
  description: string
}

interface BagCategory {
  id: string
  name: string
}

const enemyPokemon = ref<Pokemon>({
  name: 'Venusaur',
  level: 36,
  currentHp: 110,
  maxHp: 130,
  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png',
  moves: []
})

const playerPokemon = ref<Pokemon>({
  name: 'Charizard',
  level: 36,
  currentHp: 98,
  maxHp: 120,
  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/6.png',
  moves: [
    { name: 'Flamethrower', type: 'FIRE', pp: 13, maxPp: 15, power: 90 },
    { name: 'Air Slash', type: 'FLYING', pp: 15, maxPp: 15, power: 75 },
    { name: 'Dragon Claw', type: 'DRAGON', pp: 15, maxPp: 15, power: 80 },
    { name: 'Slash', type: 'NORMAL', pp: 20, maxPp: 20, power: 70 }
  ]
})

const bagCategories = ref<BagCategory[]>([
  { id: 'items', name: 'ITEMS' },
  { id: 'medicine', name: 'MEDICINE' },
  { id: 'balls', name: 'POKé BALLS' },
  { id: 'tms', name: 'TMs & HMs' },
  { id: 'berries', name: 'BERRIES' }
])

const bagItems = ref<BagItem[]>([
  { 
    id: 1, 
    name: 'POTION', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png', 
    quantity: 5,
    category: 'medicine',
    description: 'Restores 20 HP to one Pokémon.'
  },
  { 
    id: 2, 
    name: 'SUPER POTION', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png', 
    quantity: 3,
    category: 'medicine',
    description: 'Restores 50 HP to one Pokémon.'
  },
  { 
    id: 3, 
    name: 'ANTIDOTE', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/antidote.png', 
    quantity: 2,
    category: 'medicine',
    description: 'Cures a poisoned Pokémon.'
  },
  { 
    id: 4, 
    name: 'REVIVE', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png', 
    quantity: 1,
    category: 'medicine',
    description: 'Revives a fainted Pokémon with half HP.'
  },
  { 
    id: 5, 
    name: 'POKé BALL', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', 
    quantity: 10,
    category: 'balls',
    description: 'A device for catching wild Pokémon.'
  },
  { 
    id: 6, 
    name: 'GREAT BALL', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png', 
    quantity: 5,
    category: 'balls',
    description: 'A good ball with a higher catch rate.'
  },
  { 
    id: 7, 
    name: 'RARE CANDY', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png', 
    quantity: 2,
    category: 'items',
    description: 'Raises the level of a Pokémon by one.'
  },
  { 
    id: 8, 
    name: 'ORAN BERRY', 
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oran-berry.png', 
    quantity: 4,
    category: 'berries',
    description: 'A berry that restores 10 HP.'
  }
])

const playerExp = ref(2547)
const playerExpToNext = ref(3000)

const showBattleMenu = ref(true)
const showMovesInterface = ref(false)
const showBagMenu = ref(false)
const showContinueArrow = ref(false)
const currentMessage = ref(`What will ${playerPokemon.value.name.toUpperCase()} do?`)
const hoveredMove = ref<Move | null>(playerPokemon.value.moves[0])
const selectedCategory = ref('medicine')
const selectedItem = ref<BagItem | null>(null)

const playerHpPercent = computed(() => 
  Math.round((playerPokemon.value.currentHp / playerPokemon.value.maxHp) * 100)
)

const enemyHpPercent = computed(() => 
  Math.round((enemyPokemon.value.currentHp / enemyPokemon.value.maxHp) * 100)
)

const expPercent = computed(() => 
  Math.round((playerExp.value / playerExpToNext.value) * 100)
)

const getHpColorClass = (percent: number): string => {
  if (percent > 50) return 'hp-green'
  if (percent > 20) return 'hp-yellow'
  return 'hp-red'
}

const getCurrentItems = () => {
  return bagItems.value.filter(item => item.category === selectedCategory.value)
}

const selectBagItem = (item: BagItem) => {
  selectedItem.value = item
}

const chooseFight = () => {
  showBattleMenu.value = false
  showMovesInterface.value = true
  currentMessage.value = ''
}

const chooseBag = () => {
  showBattleMenu.value = false
  showBagMenu.value = true
  selectedItem.value = bagItems.value.find(i => i.category === 'medicine') || null
}

const closeBag = () => {
  showBagMenu.value = false
  showBattleMenu.value = true
  selectedItem.value = null
  currentMessage.value = `What will ${playerPokemon.value.name.toUpperCase()} do?`
}

const useItem = (item: BagItem) => {
  if (item.quantity === 0) return
  
  showBagMenu.value = false
  currentMessage.value = `Used ${item.name}!`
  item.quantity--

  if (item.name === 'POTION' || item.name === 'SUPER POTION') {
    const healAmount = item.name === 'POTION' ? 20 : 50
    setTimeout(() => {
      playerPokemon.value.currentHp = Math.min(
        playerPokemon.value.maxHp, 
        playerPokemon.value.currentHp + healAmount
      )
      currentMessage.value = `${playerPokemon.value.name.toUpperCase()} restored ${healAmount} HP!`
      
      setTimeout(() => {
        enemyAttack()
      }, 1500)
    }, 1000)
  }
}

const choosePokemon = () => {
  showBattleMenu.value = false
  showContinueArrow.value = false
  currentMessage.value = 'No other POKéMON available!'
  setTimeout(() => {
    showBattleMenu.value = true
    currentMessage.value = `What will ${playerPokemon.value.name.toUpperCase()} do?`
  }, 2000)
}

const chooseRun = () => {
  showBattleMenu.value = false
  showContinueArrow.value = false
  currentMessage.value = 'Got away safely!'
  setTimeout(() => {
    showBattleMenu.value = true
    currentMessage.value = `What will ${playerPokemon.value.name.toUpperCase()} do?`
  }, 2000)
}

const selectMove = (move: Move) => {
  if (move.pp === 0) {
    currentMessage.value = `No PP left for this move!`
    return
  }

  showMovesInterface.value = false
  currentMessage.value = `${playerPokemon.value.name.toUpperCase()} used ${move.name.toUpperCase()}!`
  
  move.pp--

  setTimeout(() => {
    const damage = Math.floor(Math.random() * 25) + 15
    enemyPokemon.value.currentHp = Math.max(0, enemyPokemon.value.currentHp - damage)

    const effectiveness = Math.random()
    if (effectiveness > 0.75) {
      currentMessage.value = "It's super effective!"
    } else if (effectiveness < 0.25) {
      currentMessage.value = "It's not very effective..."
    }

    if (enemyPokemon.value.currentHp === 0) {
      setTimeout(() => {
        currentMessage.value = `Wild ${enemyPokemon.value.name.toUpperCase()} fainted!`
        showContinueArrow.value = true
      }, 1500)
    } else {
      setTimeout(() => {
        enemyAttack()
      }, 1500)
    }
  }, 1500)
}

const enemyAttack = () => {
  currentMessage.value = `Wild ${enemyPokemon.value.name.toUpperCase()} used VINE WHIP!`
  
  setTimeout(() => {
    const damage = Math.floor(Math.random() * 18) + 8
    playerPokemon.value.currentHp = Math.max(0, playerPokemon.value.currentHp - damage)
    
    setTimeout(() => {
      showBattleMenu.value = true
      currentMessage.value = `What will ${playerPokemon.value.name.toUpperCase()} do?`
    }, 1500)
  }, 1500)
}

const backToMainMenu = () => {
  showMovesInterface.value = false
  showBattleMenu.value = true
  currentMessage.value = `What will ${playerPokemon.value.name.toUpperCase()} do?`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.pokemon-battle-screen {
  width: 100%;
  max-width: 960px;
  height: 640px;
  margin: 0 auto;
  position: relative;
  font-family: 'Press Start 2P', monospace;
  border: 6px solid #000;
  overflow: hidden;
  image-rendering: pixelated;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
}

/* Fondo de batalla mejorado */
.battle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 420px;
  z-index: 0;
}

.sky-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom,
    #88d0f8 0%,
    #70c0e8 30%,
    #68b8e0 60%,
    #90c8a0 100%
  );
}

.ground-texture {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    linear-gradient(to bottom,
      #98c898 0%,
      #88b888 40%,
      #78a878 100%
    );
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px);
}

.battle-platform {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  z-index: 1;
}

.enemy-platform-bg {
  top: 150px;
  right: 180px;
  width: 200px;
  height: 60px;
  background: radial-gradient(ellipse, rgba(80, 60, 100, 0.5), transparent);
}

.player-platform-bg {
  bottom: 120px;
  left: 100px;
  width: 240px;
  height: 70px;
  background: radial-gradient(ellipse, rgba(100, 80, 60, 0.6), transparent);
}

/* Campo de batalla */
.battle-field {
  width: 100%;
  height: 420px;
  position: relative;
  z-index: 2;
}

/* Pokémon enemigo */
.enemy-pokemon {
  position: absolute;
  top: 40px;
  right: 100px;
}

.enemy-info-box {
  background: linear-gradient(to bottom, #f8f8f8, #e0e0e0);
  border: 4px solid #000;
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 260px;
  box-shadow: 
    4px 4px 0 rgba(0,0,0,0.3),
    inset -2px -2px 4px rgba(0,0,0,0.1),
    inset 2px 2px 4px rgba(255,255,255,0.7);
  margin-bottom: 15px;
}

.enemy-sprite-container {
  position: relative;
  width: 200px;
  height: 180px;
  margin-left: 30px;
}

/* Pokémon jugador */
.player-pokemon {
  position: absolute;
  bottom: 40px;
  left: 60px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.player-sprite-container {
  position: relative;
  width: 200px;
  height: 160px;
}

.battle-shadow {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 40px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.35), transparent);
  z-index: 1;
}

.pokemon-sprite {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 160px;
  z-index: 2;
  image-rendering: pixelated;
  filter: drop-shadow(3px 3px 2px rgba(0,0,0,0.25));
}

.player-info-box {
  background: linear-gradient(to bottom, #f8f8f8, #e0e0e0);
  border: 4px solid #000;
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 280px;
  box-shadow: 
    4px 4px 0 rgba(0,0,0,0.3),
    inset -2px -2px 4px rgba(0,0,0,0.1),
    inset 2px 2px 4px rgba(255,255,255,0.7);
}

/* Info boxes */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pokemon-name {
  font-size: 13px;
  letter-spacing: 1px;
  font-weight: bold;
}

.pokemon-level {
  font-size: 11px;
  background: #000;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}

.hp-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.hp-label {
  font-size: 10px;
  color: #ff6600;
  font-weight: bold;
  min-width: 28px;
}

.hp-bar-outer {
  flex: 1;
  height: 8px;
  background: #d8d8d8;
  border: 2px solid #000;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 3px rgba(0,0,0,0.3);
}

.hp-bar-inner {
  height: 100%;
  transition: width 0.6s ease;
  box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2);
}

.hp-green { background: linear-gradient(to bottom, #58f858, #38d838); }
.hp-yellow { background: linear-gradient(to bottom, #f8d830, #f0b800); }
.hp-red { background: linear-gradient(to bottom, #f83838, #d02020); }

.hp-numeric {
  text-align: right;
  font-size: 10px;
  margin-top: 4px;
  letter-spacing: 1px;
}

.exp-bar-container {
  margin-top: 8px;
}

.exp-bar-outer {
  height: 5px;
  background: #a8a8a8;
  border: 1px solid #606060;
  border-radius: 3px;
  overflow: hidden;
}

.exp-bar-inner {
  height: 100%;
  background: linear-gradient(to bottom, #58c8f8, #3898d8);
  transition: width 0.5s ease;
}

/* Interfaz de batalla */
.battle-interface {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 220px;
  background: #f8f8f8;
  border-top: 6px solid #000;
  display: flex;
  z-index: 10;
}

.dialogue-box {
  flex: 1;
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #ffffff, #f0f0f0);
  border-right: 4px solid #000;
}

.dialogue-text {
  font-size: 18px;
  line-height: 1.7;
  white-space: pre-line;
}

.continue-arrow {
  position: absolute;
  bottom: 16px;
  right: 20px;
  font-size: 16px;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Menú de batalla */
.battle-menu {
  width: 380px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-content: center;
  background: linear-gradient(to bottom, #e8e8e8, #d0d0d0);
}

.battle-button {
  padding: 20px 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  background: linear-gradient(to bottom, #ffffff, #e0e0e0);
  border: 4px solid #000;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 
    inset -2px -2px 4px rgba(0,0,0,0.2),
    inset 2px 2px 4px rgba(255,255,255,0.8),
    3px 3px 0 rgba(0,0,0,0.3);
  position: relative;
  text-align: left;
  padding-left: 40px;
}

.battle-button:hover {
  background: linear-gradient(to bottom, #ffffd0, #f8e880);
  transform: translateY(-2px);
}

.battle-button:active {
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0,0,0,0.3);
}

.menu-arrow {
  position: absolute;
  left: 16px;
  font-size: 14px;
}

/* Pantalla completa de mochila */
back-arrow

/* Mochila visual CSS */
.bag-visual {
  position: relative;
  width: 50px;
  height: 50px;
}

.bag-body {
  position: absolute;
  width: 45px;
  height: 40px;
  background: linear-gradient(to bottom, #f8d860, #e0b840);
  border: 3px solid #000;
  border-radius: 8px;
  box-shadow: inset -2px -2px 3px rgba(0,0,0,0.2);
}

.bag-pocket {position: absolute;
top: 8px;
left: 8px;
width: 30px;
height: 25px;
background: linear-gradient(to bottom, #e8c050, #d0a830);
border: 2px solid #000;
border-radius: 4px;
}
.bag-strap {
position: absolute;
top: -5px;
left: 10px;
width: 25px;
height: 8px;
background: #a08040;
border: 2px solid #000;
border-radius: 4px;
}
.bag-buckle {
position: absolute;
top: 15px;
right: 5px;
width: 8px;
height: 8px;
background: #d82828;
border: 2px solid #000;
border-radius: 50%;
box-shadow: inset 1px 1px 2px rgba(255,255,255,0.5);
}
.bag-title-text {
font-size: 22px;
font-weight: bold;
color: #fff;
text-shadow: 3px 3px 0 #000;
}
.bag-categories {
display: flex;
gap: 6px;
margin-bottom: 10px;
overflow-x: auto;
}
.category-button {
padding: 8px 12px;
font-family: 'Press Start 2P', monospace;
font-size: 8px;
background: linear-gradient(to bottom, #d8d8d8, #c0c0c0);
border: 3px solid #000;
border-radius: 6px;
cursor: pointer;
transition: all 0.1s;
white-space: nowrap;
box-shadow: inset -1px -1px 2px rgba(0,0,0,0.2);
}
.category-button:hover {
background: linear-gradient(to bottom, #e8e8e8, #d0d0d0);
}
.category-button.active {
background: linear-gradient(to bottom, #f8d860, #e0c040);
color: #fff;
text-shadow: 1px 1px 0 #000;
transform: translateY(-2px);
}
.bag-items-area {
flex: 1;
display: flex;
gap: 10px;
min-height: 0;
}
.items-list {
flex: 1;
background: #fff;
border: 3px solid #000;
border-radius: 8px;
padding: 8px;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 4px;
}
.bag-item-row {
display: flex;
align-items: center;
gap: 10px;
padding: 8px;
background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
border: 2px solid #000;
border-radius: 6px;
cursor: pointer;
transition: all 0.1s;
font-family: 'Press Start 2P', monospace;
font-size: 10px;
}
.bag-item-row:hover {
background: linear-gradient(to bottom, #fff8d0, #f8e8a0);
}
.bag-item-row.selected {
background: linear-gradient(to bottom, #f8d060, #e0c040);
border-color: #d82828;
box-shadow: 0 0 0 2px #fff, 0 0 0 4px #d82828;
}
.item-icon-small {
width: 24px;
height: 24px;
image-rendering: pixelated;
}
.item-name-text {
flex: 1;
}
.item-quantity-text {
color: #666;
font-size: 9px;
}
.item-description-panel {
width: 200px;
background: #fff;
border: 3px solid #000;
border-radius: 8px;
padding: 12px;
display: flex;
flex-direction: column;
gap: 10px;
}
.item-preview {
width: 100%;
height: 80px;
display: flex;
align-items: center;
justify-content: center;
background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
border: 2px solid #000;
border-radius: 6px;
}
.item-preview-image {
width: 64px;
height: 64px;
image-rendering: pixelated;
}
.item-description-text {
flex: 1;
font-size: 9px;
line-height: 1.5;
color: #333;
}
.use-item-button {
padding: 10px;
font-family: 'Press Start 2P', monospace;
font-size: 11px;
background: linear-gradient(to bottom, #60d860, #40c040);
color: white;
border: 3px solid #000;
border-radius: 6px;
cursor: pointer;
transition: all 0.1s;
text-shadow: 1px 1px 0 #000;
}
.use-item-button:hover {
background: linear-gradient(to bottom, #70e870, #50d050);
transform: translateY(-1px);
}
.bag-back-button {
margin-top: 10px;
padding: 12px;
font-family: 'Press Start 2P', monospace;
font-size: 12px;
background: linear-gradient(to bottom, #f88888, #e86868);
color: white;
border: 3px solid #000;
border-radius: 8px;
cursor: pointer;
transition: all 0.1s;
text-shadow: 1px 1px 0 #000;
box-shadow: inset -1px -1px 3px rgba(0,0,0,0.2);
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
}
.bag-back-button:hover {
background: linear-gradient(to bottom, #ff9898, #f87878);
transform: translateY(-1px);
}
.back-arrow {
font-size: 14px;
}
/* Interfaz de movimientos */
.moves-interface {
width: 380px;
padding: 16px;
display: flex;
flex-direction: column;
gap: 10px;
background: linear-gradient(to bottom, #e8e8e8, #d0d0d0);
}
.moves-container {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 10px;
flex: 1;
}
.move-button {
padding: 14px 12px;
font-family: 'Press Start 2P', monospace;
background: linear-gradient(to bottom, #ffffff, #e8e8e8);
border: 3px solid #000;
border-radius: 8px;
cursor: pointer;
transition: all 0.1s;
display: flex;
flex-direction: column;
justify-content: space-between;
gap: 8px;
box-shadow: inset -1px -1px 3px rgba(0,0,0,0.2);
}
.move-button:hover:not(:disabled) {
background: linear-gradient(to bottom, #ffffff, #f0f0f0);
transform: translateY(-1px);
}
.move-button:disabled {
opacity: 0.4;
cursor: not-allowed;
}
.move-name {
font-size: 11px;
}
.move-details {
display: flex;
justify-content: space-between;
align-items: center;
font-size: 8px;
}
.move-pp {
color: #404040;
}
.move-info-panel {
background: linear-gradient(to bottom, #f8f8f8, #e0e0e0);
border: 3px solid #000;
border-radius: 6px;
padding: 10px 12px;
display: flex;
justify-content: space-between;
align-items: center;
font-size: 10px;
box-shadow: inset -1px -1px 3px rgba(0,0,0,0.2);
}
.pp-display, .type-display {
font-weight: bold;
}
.type-value {
color: #f85030;
text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
}
.type-value.type-fire { color: #f08030; }
.type-value.type-water { color: #6890f0; }
.type-value.type-grass { color: #78c850; }
.type-value.type-electric { color: #f8d030; }
.type-value.type-normal { color: #a8a878; }
.type-value.type-flying { color: #a890f0; }
.type-value.type-dragon { color: #7038f8; }
.back-button {
padding: 14px;
font-family: 'Press Start 2P', monospace;
font-size: 14px;
background: linear-gradient(to bottom, #f8c8c8, #e8a8a8);
border: 3px solid #000;
border-radius: 8px;
cursor: pointer;
transition: all 0.1s;
box-shadow: inset -1px -1px 3px rgba(0,0,0,0.2);
}
.back-button:hover {
background: linear-gradient(to bottom, #ffd0d0, #f0b8b8);
transform: translateY(-1px);
}
</style>