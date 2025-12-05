<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-300 to-green-300 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-2">¡Batalla en progreso!</h1>
        <p class="text-muted-foreground">Derrota o captura el Pokémon salvaje</p>
      </div>

      <!-- Batalla Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Tu Pokémon (izquierda) -->
        <div class="bg-card rounded-lg border-2 border-blue-400 p-6 shadow-lg">
          <div class="text-center mb-4">
            <p class="text-sm font-semibold text-muted-foreground mb-2">Tu Pokémon</p>
            <p class="text-2xl font-bold text-foreground">Pikachu</p>
            <p class="text-xs text-muted-foreground">Nivel 5</p>
          </div>
          
          <div class="w-full h-48 bg-linear-to-br from-yellow-100 to-yellow-50 rounded-lg flex items-center justify-center border-2 border-yellow-300 mb-4">
            <span class="text-8xl">⚡</span>
          </div>

          <!-- HP Bar -->
          <div>
            <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>HP</span>
              <span class="font-semibold text-foreground">35 / 35</span>
            </div>
            <div class="w-full bg-muted/30 border border-border rounded-full h-4 overflow-hidden">
              <div class="h-full w-full bg-linear-to-r from-green-400 to-emerald-500"></div>
            </div>
          </div>
        </div>

        <!-- Pokémon Salvaje (derecha) -->
        <div class="bg-card rounded-lg border-2 border-red-400 p-6 shadow-lg">
          <div class="text-center mb-4">
            <p class="text-sm font-semibold text-muted-foreground mb-2">Pokémon Salvaje</p>
            <p class="text-2xl font-bold text-foreground">{{ currentPokemon?.name || 'Desconocido' }}</p>
            <p class="text-xs text-muted-foreground">Nivel {{ currentPokemon?.level || '-' }}</p>
          </div>

          <div class="w-full h-48 bg-linear-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center border-2 border-orange-300 mb-4">
            <img v-if="spriteUrl" :src="spriteUrl" alt="sprite" class="w-32 h-32 object-contain" />
            <span v-else class="text-8xl">🔥</span>
          </div>

          <!-- HP Bar -->
          <div>
            <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>HP</span>
              <span class="font-semibold text-foreground">{{ currentPokemon?.currentHp || 0 }} / {{ currentPokemon?.maxHp || 0 }}</span>
            </div>
            <div class="w-full bg-muted/30 border border-border rounded-full h-4 overflow-hidden">
              <div :style="{ width: hpPercent + '%' }" class="h-full bg-linear-to-r from-green-400 to-emerald-500"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="bg-card rounded-lg border border-border p-6 shadow-lg">
        <p class="text-sm font-semibold text-foreground mb-4">¿Qué deseas hacer?</p>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Atacar -->
          <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            ⚔️ Atacar
          </button>

          <!-- Pokébolas -->
          <button @click="mostrarInventario = true" class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            🎯 Pokébolas
          </button>

          <!-- Objeto -->
          <button class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            🧪 Objeto
          </button>

          <!-- Huir -->
          <button class="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
            💨 Huir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Inventario -->
    <InventarioBall
      v-if="mostrarInventario"
      @ball-seleccionada="handleBallSeleccionada"
      @cerrar="mostrarInventario = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InventarioBall from '@/components/inventarioball.vue'
import { useEncounterStore } from '@/stores/useEncounterStore'

const encounterStore = useEncounterStore()
const mostrarInventario = ref(false)

const currentPokemon = computed(() => encounterStore.currentPokemon)

const hpPercent = computed(() => {
	if (!currentPokemon.value) return 0
	const { currentHp, maxHp } = currentPokemon.value
	if (!maxHp) return 0
	return Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)))
})

const images = import.meta.glob('../assets/images/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }) as Record<string, string>
const defaultImage = images['../assets/images/personaje-selva.png'] ?? null

const spriteUrl = computed(() => {
	const sprite = currentPokemon.value?.sprite
	if (!sprite) return defaultImage

	const id = currentPokemon.value?.id
	if (id) {
		const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
		return url
	}

	const base = sprite.split('.')[0].toLowerCase()
	const matchKey = Object.keys(images).find(k => k.toLowerCase().includes('/' + base + '.'))
	if (matchKey) return images[matchKey]

	return defaultImage
})

function handleBallSeleccionada(ballData: { type: string; label: string; count: number }) {
	alert(`Has lanzado una ${ballData.label}`)
	mostrarInventario.value = false
}
</script>