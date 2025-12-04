<!--
  StarterSelectionView
  Pokemon Starter Selection Screen

  A classic Pokemon-style intro screen where users can choose their
  first Pokemon from the Gen 1 starters (Bulbasaur, Charmander, Squirtle)
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import StarterPokemonCard from '@/components/teamBuilder/StarterPokemonCard.vue'
import { useTeamStore } from '@/stores/team'
import { fetchStarterPokemon } from '@/services/teamBuilder/starterService'
import { fetchMovesBatch } from '@/services/teamBuilder/moveService'
import type { Pokemon, Move, TeamMember } from '@/models/teamBuilder'
import Bulbasaur from '@/assets/images/pokemon/bulbasaur.png'
import Charmander from '@/assets/images/pokemon/charmander.png'
import Squirtle from '@/assets/images/pokemon/squirtle.png'
import Pikachu from '@/assets/images/pokemon/pikachu.png'
import ProfesorOak from '@/assets/images/ProfesorOak.png'


const router = useRouter()
const teamStore = useTeamStore()
const { roster } = storeToRefs(teamStore)

// State
const starters = ref<Pokemon[]>([])
const selectedStarter = ref<Pokemon | null>(null)
const isLoading = ref(true)
const isConfirming = ref(false)
const error = ref<string | null>(null)
const showIntro = ref(true)

/**
 * Load starter Pokemon from PokeAPI
 */
async function loadStarters() {
  isLoading.value = true
  error.value = null

  try {
    const pokemonData = await fetchStarterPokemon()

    if (pokemonData.length === 0) {
      error.value = 'Failed to load starter Pokemon. Please try again.'
      return
    }

    starters.value = pokemonData
  } catch (err) {
    console.error('[StarterSelection] Error loading starters:', err)
    error.value = 'An error occurred while loading Pokemon data.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle starter selection
 */
function handleSelectStarter(pokemon: Pokemon) {
  selectedStarter.value = pokemon
}

/**
 * Calculate max HP based on Pokemon stats and level
 */
function calculateMaxHp(baseHp: number, level: number): number {
  const iv = 31
  const ev = 0
  return Math.floor(((2 * baseHp + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
}

/**
 * Confirm selection and add to team
 */
async function confirmSelection() {
  if (!selectedStarter.value) return

  isConfirming.value = true

  try {
    // Fetch the first 4 moves for the starter
    const moveIds = selectedStarter.value.moves.slice(0, 4).map((m) => m.id)
    const moves = await fetchMovesBatch(moveIds)

    // Filter out any null results
    const validMoves = moves.filter((m): m is Move => m !== null)

    if (validMoves.length === 0) {
      error.value = 'Failed to load Pokemon moves. Please try again.'
      isConfirming.value = false
      return
    }

    const level = 5 // Starting level for new trainers
    const maxHp = calculateMaxHp(selectedStarter.value.stats.hp, level)

    // Create team member
    const teamMember: TeamMember = {
      pokemon: selectedStarter.value,
      selectedMoves: validMoves.slice(0, 4),
      level,
      currentHp: maxHp,
      maxHp,
      position: 0,
    }

    // Clear existing team and add starter
    teamStore.clearTeam()
    teamStore.addPokemon(teamMember)
    teamStore.saveTeam()

    // Feature 006: Set hasStarter flag
    teamStore.setHasStarter(true)

    // Navigate to home or team builder
    router.push({ name: 'home' })
  } catch (err) {
    console.error('[StarterSelection] Error confirming selection:', err)
    error.value = 'Failed to confirm selection. Please try again.'
  } finally {
    isConfirming.value = false
  }
}

/**
 * Skip intro animation
 */
function skipIntro() {
  showIntro.value = false
}

/**
 * Check if user already has a team
 * Feature 006: Also check hasStarter flag
 */
onMounted(async () => {
  teamStore.loadTeam()

  // Feature 006: If player already has starter, redirect to home with message
  if (teamStore.hasStarter) {
    console.log('[StarterSelection] Player already has starter, redirecting...')
    router.replace({ name: 'home' })
    return
  }

  // If user already has a team, redirect to home
  if (roster.value.length > 0) {
    router.push({ name: 'home' })
    return
  }

  // Show intro for 3 seconds then load starters
  setTimeout(() => {
    showIntro.value = false
    loadStarters()
  }, 3000)
})
</script>

<template>
  <div
    class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
  >
    <!-- Animated Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Floating Pokeballs -->
      <div class="absolute top-20 left-10 w-16 h-16 opacity-10 animate-float">
        <img :src="Bulbasaur" class="w-full h-full" />
      </div>
      <div class="absolute top-40 right-14  w-24 h-24 opacity-10 animate-float-delayed">
        <img :src="Charmander" class="w-full h-full" />
      </div>
      <div class="absolute bottom-32 left-10 w-20 h-20 opacity-10 animate-float">
        <img :src="Squirtle" class="w-full h-full" />
      </div>

      <div class="absolute bottom-40 right-14 w-20 h-20 opacity-10 animate-float">
        <img :src="Pikachu" class="w-full h-full" />
      </div>

      <!-- Sparkles -->
      <div class="absolute top-1/3 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle" />
      <div
        class="absolute top-1/4 right-16 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle-delayed"
      />
      <div
        class="absolute bottom-1/3 right-14 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
      />
    </div>

    <!-- Intro Screen -->
    <Transition
      enter-active-class="transition-all duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showIntro"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 cursor-pointer"
        @click="skipIntro"
      >
        <!-- Professor Welcome -->
        <div class="text-center animate-fade-in-up">
          <div class="mb-8">
            <div
              class="w-32 h-32 mx-auto bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl"
            >
              <img class="" :src="ProfesorOak"/>
            </div>
          </div>

          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 animate-pulse">
            Welcome, Trainer!
          </h1>

          <p class="text-xl text-slate-300 max-w-md mx-auto mb-8 px-4">
            I am Professor Oak. I study Pokémon. Your very own Pokémon adventure is about to unfold!
          </p>

          <div class="flex flex-col items-center gap-2">
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" />
            <p class="text-sm text-slate-400">Click anywhere to continue</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <div v-if="!showIntro" class="relative z-10 container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Choose Your Partner!
        </h1>
        <p class="text-xl text-slate-300 max-w-2xl mx-auto">
          These are the three Pokémon I have prepared for new trainers. Choose wisely - this Pokémon
          will be your loyal companion!
        </p>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="relative">
          <div
            class="w-24 h-24 border-4 border-slate-600 border-t-yellow-400 rounded-full animate-spin"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl">🔴</span>
          </div>
        </div>
        <p class="mt-6 text-slate-400 text-lg">Loading Pokémon data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <div class="text-6xl mb-4">😢</div>
        <p class="text-red-400 text-lg mb-4">{{ error }}</p>
        <Button
          variant="outline"
          @click="loadStarters"
          class="bg-white/10 text-white border-white/20 hover:bg-white/20"
        >
          Try Again
        </Button>
      </div>

      <!-- Starter Selection Grid -->
      <div v-else class="space-y-12">
        <!-- Pokemon Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          <StarterPokemonCard
            v-for="pokemon in starters"
            :key="pokemon.id"
            :pokemon="pokemon"
            :is-selected="selectedStarter?.id === pokemon.id"
            :is-loading="isConfirming"
            @select="handleSelectStarter"
          />
        </div>

        <!-- Confirm Button -->
        <div class="flex flex-col items-center gap-4">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 transform translate-y-4"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="selectedStarter" class="text-center">
              <p class="text-slate-300 mb-4">
                You selected
                <span class="text-yellow-400 font-bold">{{ selectedStarter.name }}</span
                >!
              </p>

              <Button
                size="lg"
                :disabled="isConfirming"
                class="bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-12 py-6 text-lg shadow-lg transform hover:scale-105 transition-all"
                @click="confirmSelection"
              >
                <span v-if="isConfirming" class="flex items-center gap-2">
                  <span
                    class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                  />
                  Starting Adventure...
                </span>
                <span v-else class="flex items-center gap-2"> Begin Adventure! </span>
              </Button>
            </div>
          </Transition>

          <p v-if="!selectedStarter" class="text-slate-400 animate-pulse">
            Click on a Pokémon to select it
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 8s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

.animate-sparkle-delayed {
  animation: sparkle 2s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out;
}
</style>
