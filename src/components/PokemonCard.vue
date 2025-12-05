<template>
  <div
    class="space-y-2 relative p-4 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl transition-transform duration-200"
    :class="{ 'attack-animation': isAttacking }"
  >
    <div>
      <h2 class="font-semibold text-lg text-gray-900 dark:text-white">{{ pokemon?.name }}</h2>
      <p class="text-sm text-gray-700 dark:text-gray-300">{{ pokemon?.types.join('/') }}</p>
    </div>

    <!-- HP Bar with smooth animation and gradient -->
    <div class="relative">
      <div class="h-4 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
        <div
          class="h-full transition-all duration-500 ease-out rounded-full"
          :class="getHPBarClass(hpPercent)"
          :style="{ width: `${hpPercent}%` }"
          role="progressbar"
          :aria-valuenow="pokemon?.currentHp"
          :aria-valuemin="0"
          :aria-valuemax="pokemon?.stats.hp"
          :aria-label="`${pokemon?.name} HP`"
        ></div>
      </div>
      <p class="text-xs mt-1 text-gray-800 dark:text-gray-200 font-medium">
        HP: {{ pokemon?.currentHp }} / {{ pokemon?.stats.hp }}
      </p>
    </div>

    <!-- Damage number animation -->
    <transition name="damage-float">
      <div
        v-if="damage > 0"
        class="absolute top-0 right-0 text-2xl font-bold text-red-600 pointer-events-none"
        @animationend="damage = 0"
      >
        -{{ damage }}
      </div>
    </transition>

    <!-- Fainted overlay -->
    <transition name="fade">
      <div
        v-if="pokemon?.currentHp === 0"
        class="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center"
      >
        <span class="text-white text-xl font-bold">Fainted</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Pokemon } from '@/domain/battle/engine/entities'

const props = defineProps<{
  pokemon: Pokemon | undefined
  isAttacking?: boolean
  isPlayer?: boolean
}>()

const damage = ref(0)
let previousHP = props.pokemon?.currentHp ?? 0

const hpPercent = computed(() => {
  if (!props.pokemon) return 0
  return Math.floor((props.pokemon.currentHp / props.pokemon.stats.hp) * 100)
})

watch(() => props.pokemon?.currentHp, (newHP) => {
  if (newHP !== undefined && newHP < previousHP) {
    damage.value = previousHP - newHP
    setTimeout(() => { damage.value = 0 }, 1000)
  }
  previousHP = newHP ?? 0
}, { immediate: true })

// Reset previousHP when pokemon changes (e.g. new battle)
watch(() => props.pokemon, (newPokemon) => {
  if (newPokemon) {
    previousHP = newPokemon.currentHp
  }
})

const getHPBarClass = (percent: number): string => {
  if (percent > 50) return 'bg-green-500'
  if (percent > 25) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>

<style scoped>
.attack-animation {
  animation: lunge 0.3s ease-in-out;
}

/* Dynamic keyframes are hard in scoped CSS, so we'll use a class based approach or CSS variable */
</style>

<style>
@keyframes lunge-right {
  0% { transform: translateX(0); }
  50% { transform: translateX(20px); }
  100% { transform: translateX(0); }
}

@keyframes lunge-left {
  0% { transform: translateX(0); }
  50% { transform: translateX(-20px); }
  100% { transform: translateX(0); }
}
</style>

<style scoped>
.attack-animation {
  animation: v-bind("props.isPlayer ? 'lunge-right' : 'lunge-left'") 0.3s ease-in-out;
}

/* Damage float animation */
.damage-float-enter-active {
  animation: float-up 1s ease-out;
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px) scale(1);
    opacity: 0;
  }
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
