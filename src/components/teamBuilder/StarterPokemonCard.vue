<!--
  StarterPokemonCard
  Component for displaying a starter Pokemon in the selection screen
  Uses PokeAPI data with shadcn Card components
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Pokemon } from '@/models/teamBuilder'
import { getStarterInfo } from '@/services/teamBuilder/starterService'

interface Props {
  pokemon: Pokemon
  isSelected: boolean
  isLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [pokemon: Pokemon]
}>()

const starterInfo = computed(() => getStarterInfo(props.pokemon.id))

const cardClasses = computed(() => {
  const base = 'relative overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105'
  const selected = props.isSelected
    ? 'ring-4 ring-yellow-400 shadow-2xl scale-105'
    : 'hover:shadow-xl'
  return `${base} ${selected}`
})

const gradientClasses = computed(() => {
  if (!starterInfo.value) return 'bg-gradient-to-br from-gray-400 to-gray-600'
  return `bg-gradient-to-br ${starterInfo.value.gradientFrom} ${starterInfo.value.gradientTo}`
})

const typeColor = computed(() => {
  const type = props.pokemon.types[0]?.toLowerCase() || 'normal'
  const colors: Record<string, string> = {
    grass: 'bg-green-500',
    fire: 'bg-orange-500',
    water: 'bg-blue-500',
    normal: 'bg-gray-500',
  }
  return colors[type] || colors.normal
})

function handleSelect() {
  if (!props.isLoading) {
    emit('select', props.pokemon)
  }
}
</script>

<template>
  <Card
    :class="cardClasses"
    @click="handleSelect"
  >
    <!-- Gradient Background -->
    <div :class="['absolute inset-0 opacity-90', gradientClasses]" />

    <!-- Pokeball Pattern Background -->
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="3"/>
        <line x1="5" y1="50" x2="95" y2="50" stroke="white" stroke-width="3"/>
        <circle cx="50" cy="50" r="12" fill="white"/>
        <circle cx="50" cy="50" r="8" fill="none" stroke="white" stroke-width="2"/>
      </svg>
    </div>

    <CardContent class="relative z-10 p-6 flex flex-col items-center">
      <!-- Pokemon Sprite -->
      <div class="relative mb-4">
        <div class="absolute inset-0 bg-white/20 rounded-full blur-xl transform scale-150" />
        <img
          :src="pokemon.sprite"
          :alt="pokemon.name"
          class="relative w-32 h-32 object-contain drop-shadow-lg pixelated transition-transform duration-300"
          :class="{ 'animate-bounce': isSelected }"
          style="image-rendering: pixelated;"
        />
      </div>

      <!-- Pokemon Name -->
      <h3 class="text-2xl font-bold text-white mb-2 drop-shadow-md">
        {{ pokemon.name }}
      </h3>

      <!-- Pokemon Types -->
      <div class="flex gap-2 mb-3">
        <span
          v-for="type in pokemon.types"
          :key="type"
          :class="typeColor"
          class="px-3 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wide shadow-md"
        >
          {{ type }}
        </span>
      </div>

      <!-- Description -->
      <p
        v-if="starterInfo"
        class="text-white/90 text-sm text-center mb-4 leading-relaxed max-w-48"
      >
        {{ starterInfo.description }}
      </p>

      <!-- Stats Preview -->
      <div class="w-full bg-black/20 rounded-lg p-3 mb-4">
        <div class="grid grid-cols-2 gap-2 text-xs text-white/90">
          <div class="flex justify-between">
            <span>HP:</span>
            <span class="font-bold">{{ pokemon.stats.hp }}</span>
          </div>
          <div class="flex justify-between">
            <span>ATK:</span>
            <span class="font-bold">{{ pokemon.stats.attack }}</span>
          </div>
          <div class="flex justify-between">
            <span>DEF:</span>
            <span class="font-bold">{{ pokemon.stats.defense }}</span>
          </div>
          <div class="flex justify-between">
            <span>SPD:</span>
            <span class="font-bold">{{ pokemon.stats.speed }}</span>
          </div>
        </div>
      </div>

      <!-- Select Button -->
      <Button
        :variant="isSelected ? 'default' : 'secondary'"
        :disabled="isLoading"
        class="w-full font-bold"
        :class="isSelected ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-white/90 hover:bg-white text-gray-800'"
        @click.stop="handleSelect"
      >
        {{ isSelected ? '✓ Selected!' : 'Choose Me!' }}
      </Button>
    </CardContent>

    <!-- Selection Glow Effect -->
    <div
      v-if="isSelected"
      class="absolute inset-0 pointer-events-none"
    >
      <div class="absolute inset-0 bg-yellow-400/20 animate-pulse" />
    </div>
  </Card>
</template>

<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
