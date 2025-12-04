<script setup lang="ts">
/**
 * Capturar Component
 * Feature: 007-wild-encounter-capture
 *
 * Preview screen for wild Pokémon encounters.
 * Shows Pokémon info with real types from PokéAPI.
 * Provides "¡Batalla!" and "Huir" buttons for player decision.
 */
import { computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import type { GeneratedPokemon } from '@/stores/pokemonGenerator'

/**
 * Extended Pokemon data with real types from PokéAPI
 */
interface CapturarPokemon extends GeneratedPokemon {
  types?: string[]
}

const props = defineProps<{
  /** Pokemon data from encounter store */
  pokemonData: CapturarPokemon | null
  /** Whether a Pokemon was found */
  estadoBusqueda: 'encontrado' | 'no encontrado'
}>()

const emit = defineEmits<{
  /** User wants to continue searching */
  'seguir-buscando': []
  /** User wants to battle the wild Pokemon */
  'battle': []
  /** User wants to flee from encounter */
  'flee': []
}>()

const titulo = computed(() => {
  return props.estadoBusqueda === 'encontrado'
    ? `¡Apareció un ${props.pokemonData?.name ?? 'Pokémon'} salvaje!`
    : 'No se encontró ningún Pokémon'
})

const isEncontrado = computed(() => props.estadoBusqueda === 'encontrado' && !!props.pokemonData)

const hpPercent = computed(() => {
  if (!props.pokemonData) return 0
  const { currentHp, maxHp } = props.pokemonData
  if (!maxHp) return 0
  return Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)))
})

/**
 * Get the Pokémon types from API data, or derive from name as fallback
 */
const pokemonTypes = computed(() => {
  // Use real types from PokéAPI if available
  if (props.pokemonData?.types && props.pokemonData.types.length > 0) {
    return props.pokemonData.types
  }

  // Fallback: derive type from name (legacy behavior)
  const name = props.pokemonData?.name?.toLowerCase() ?? ''
  if (!name) return ['Normal']
  if (name.includes('char') || name.includes('cynda') || name.includes('growlithe') || name.includes('vulpix') || name.includes('ponyta')) return ['Fire']
  if (name.includes('squir') || name.includes('toto') || name.includes('psyduck') || name.includes('poliwag') || name.includes('magikarp')) return ['Water']
  if (name.includes('bulba') || name.includes('chiko') || name.includes('oddish') || name.includes('bellsprout')) return ['Grass']
  if (name.includes('pikachu') || name.includes('magnemite') || name.includes('voltorb')) return ['Electric']
  if (name.includes('geodude') || name.includes('sandshrew') || name.includes('cubone') || name.includes('rhyhorn')) return ['Ground']
  if (name.includes('gastly') || name.includes('haunter')) return ['Ghost']
  if (name.includes('abra') || name.includes('drowzee')) return ['Psychic']
  if (name.includes('machop') || name.includes('mankey')) return ['Fighting']
  if (name.includes('zubat') || name.includes('pidgey') || name.includes('spearow')) return ['Flying']
  if (name.includes('caterpie') || name.includes('weedle') || name.includes('paras')) return ['Bug']
  return ['Normal']
})

/**
 * Get type badge color based on Pokemon type
 */
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Normal: 'bg-gray-400 hover:bg-gray-500',
    Fire: 'bg-red-500 hover:bg-red-600',
    Water: 'bg-blue-500 hover:bg-blue-600',
    Grass: 'bg-green-500 hover:bg-green-600',
    Electric: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    Ground: 'bg-amber-600 hover:bg-amber-700',
    Rock: 'bg-stone-500 hover:bg-stone-600',
    Flying: 'bg-indigo-400 hover:bg-indigo-500',
    Psychic: 'bg-pink-500 hover:bg-pink-600',
    Bug: 'bg-lime-500 hover:bg-lime-600',
    Poison: 'bg-purple-500 hover:bg-purple-600',
    Ghost: 'bg-purple-700 hover:bg-purple-800',
    Fighting: 'bg-orange-600 hover:bg-orange-700',
    Ice: 'bg-cyan-400 hover:bg-cyan-500',
    Dragon: 'bg-violet-600 hover:bg-violet-700',
    Dark: 'bg-neutral-700 hover:bg-neutral-800',
    Steel: 'bg-slate-400 hover:bg-slate-500',
    Fairy: 'bg-pink-300 hover:bg-pink-400',
  }
  return colors[type] ?? colors.Normal!
}

// Get sprite URL from PokéAPI official artwork
const spriteUrl = computed(() => {
  const id = props.pokemonData?.id
  if (id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }
  // Fallback to sprite in data
  return props.pokemonData?.sprite ?? null
})

function seguirBuscando() {
  emit('seguir-buscando')
}

function handleBattle() {
  emit('battle')
}

function handleFlee() {
  emit('flee')
}
</script>

<template>
  <!-- Pokemon Found - Preview Screen -->
  <div v-if="isEncontrado" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    <Card class="w-full max-w-md mx-4 border border-border shadow-2xl animate__animated animate__fadeInUp">
      <CardHeader class="border-b border-border text-center">
        <CardTitle class="text-foreground text-xl">{{ titulo }}</CardTitle>
      </CardHeader>

      <CardContent class="pt-6">
        <!-- Pokemon Sprite -->
        <div class="flex justify-center mb-4">
          <div class="w-48 h-48 relative">
            <img
              v-if="spriteUrl"
              :src="spriteUrl"
              :alt="pokemonData?.name ?? 'Pokemon'"
              class="w-full h-full object-contain drop-shadow-lg"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-muted rounded-lg">
              <i class="pi pi-question text-6xl text-muted-foreground"></i>
            </div>
          </div>
        </div>

        <!-- Pokemon Info -->
        <div class="text-center space-y-3">
          <!-- Name -->
          <h3 class="text-2xl font-bold text-foreground">{{ pokemonData?.name ?? 'Unknown' }}</h3>

          <!-- Level -->
          <p class="text-sm text-muted-foreground">Nivel {{ pokemonData?.level ?? '?' }}</p>

          <!-- Types -->
          <div class="flex justify-center gap-2">
            <Badge
              v-for="type in pokemonTypes"
              :key="type"
              :class="['text-white font-semibold', getTypeColor(type)]"
            >
              {{ type }}
            </Badge>
          </div>

          <!-- HP Bar -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-muted-foreground mb-1">
              <span>HP</span>
              <span>{{ pokemonData?.currentHp ?? 0 }} / {{ pokemonData?.maxHp ?? 0 }}</span>
            </div>
            <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 transition-all duration-300"
                :style="{ width: `${hpPercent}%` }"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter class="border-t border-border flex gap-3 pt-4">
        <!-- Battle Button -->
        <Button
          class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-6"
          @click="handleBattle"
        >
          ¡Batalla!
        </Button>

        <!-- Flee Button -->
        <Button
          variant="outline"
          class="flex-1 font-bold text-lg py-6"
          @click="handleFlee"
        >
          Huir
        </Button>
      </CardFooter>
    </Card>
  </div>

  <!-- No Pokemon Found -->
  <div v-else class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
    <Card class="w-full max-w-md mx-4 border border-border shadow-2xl animate__animated animate__fadeInUp">
      <CardHeader class="border-b border-border">
        <CardTitle class="text-foreground">No se encontró Pokémon</CardTitle>
      </CardHeader>

      <CardContent class="pt-6 text-center">
        <div class="text-6xl mb-4">
          <i class="pi pi-search text-muted-foreground"></i>
        </div>
        <p class="text-sm text-muted-foreground">
          No hay encuentros en este momento. Sigue explorando para encontrar un Pokémon salvaje.
        </p>
      </CardContent>

      <CardFooter class="border-t border-border flex gap-2 pt-4">
        <Button class="flex-1" variant="default" @click="seguirBuscando">
          <i class="pi pi-search mr-2"></i>Seguir buscando
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
