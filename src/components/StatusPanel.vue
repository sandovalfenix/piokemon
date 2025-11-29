<template>
  <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded">
    <!-- Player Pokemon -->
    <div class="space-y-2 relative">
      <div>
        <h2 class="font-semibold text-lg dark:text-white">{{ battleStore.playerPokemon?.name }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ battleStore.playerPokemon?.types.join('/') }}</p>
      </div>

      <!-- HP Bar with smooth animation -->
      <div class="relative">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500 ease-out rounded-full"
            :class="getHPBarClass(battleStore.playerHPPercent)"
            :style="{ width: `${battleStore.playerHPPercent}%` }"
            role="progressbar"
            :aria-valuenow="battleStore.playerPokemon?.currentHp"
            :aria-valuemin="0"
            :aria-valuemax="battleStore.playerPokemon?.stats.hp"
            aria-label="Player HP"
          ></div>
        </div>
        <p class="text-xs mt-1 dark:text-gray-300">
          HP: {{ battleStore.playerPokemon?.currentHp }} / {{ battleStore.playerPokemon?.stats.hp }}
        </p>
      </div>

      <!-- Damage number animation for player -->
      <transition name="damage-float">
        <div
          v-if="playerDamage > 0"
          class="absolute top-0 right-0 text-2xl font-bold text-red-600 pointer-events-none"
          @animationend="playerDamage = 0"
        >
          -{{ playerDamage }}
        </div>
      </transition>

      <!-- Fainted overlay -->
      <transition name="fade">
        <div
          v-if="battleStore.playerPokemon?.currentHp === 0"
          class="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center"
        >
          <span class="text-white text-xl font-bold">Fainted</span>
        </div>
      </transition>
    </div>

    <!-- NPC Pokemon -->
    <div class="space-y-2 relative">
      <div>
        <h2 class="font-semibold text-lg dark:text-white">{{ battleStore.npcPokemon?.name }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ battleStore.npcPokemon?.types.join('/') }}</p>
      </div>

      <!-- HP Bar with smooth animation -->
      <div class="relative">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500 ease-out rounded-full"
            :class="getHPBarClass(battleStore.npcHPPercent)"
            :style="{ width: `${battleStore.npcHPPercent}%` }"
            role="progressbar"
            :aria-valuenow="battleStore.npcPokemon?.currentHp"
            :aria-valuemin="0"
            :aria-valuemax="battleStore.npcPokemon?.stats.hp"
            aria-label="NPC HP"
          ></div>
        </div>
        <p class="text-xs mt-1 dark:text-gray-300">
          HP: {{ battleStore.npcPokemon?.currentHp }} / {{ battleStore.npcPokemon?.stats.hp }}
        </p>
      </div>

      <!-- Damage number animation for NPC -->
      <transition name="damage-float">
        <div
          v-if="npcDamage > 0"
          class="absolute top-0 left-0 text-2xl font-bold text-red-600 pointer-events-none"
          @animationend="npcDamage = 0"
        >
          -{{ npcDamage }}
        </div>
      </transition>

      <!-- Fainted overlay -->
      <transition name="fade">
        <div
          v-if="battleStore.npcPokemon?.currentHp === 0"
          class="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center"
        >
          <span class="text-white text-xl font-bold">Fainted</span>
        </div>
      </transition>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBattleStore } from '@/stores/battle'

const battleStore = useBattleStore()

// Track damage numbers for animations
const playerDamage = ref(0)
const npcDamage = ref(0)

// Watch for HP changes to show damage numbers
let previousPlayerHP = battleStore.playerPokemon?.currentHp ?? 0
let previousNpcHP = battleStore.npcPokemon?.currentHp ?? 0

watch(() => battleStore.playerPokemon?.currentHp, (newHP) => {
  if (newHP !== undefined && newHP < previousPlayerHP) {
    playerDamage.value = previousPlayerHP - newHP
    setTimeout(() => { playerDamage.value = 0 }, 1000)
  }
  previousPlayerHP = newHP ?? 0
})

watch(() => battleStore.npcPokemon?.currentHp, (newHP) => {
  if (newHP !== undefined && newHP < previousNpcHP) {
    npcDamage.value = previousNpcHP - newHP
    setTimeout(() => { npcDamage.value = 0 }, 1000)
  }
  previousNpcHP = newHP ?? 0
})

/**
 * Get HP bar color class based on HP percentage
 * Green > 50%, Yellow 25-50%, Red < 25%
 */
const getHPBarClass = (hpPercent: number): string => {
  if (hpPercent > 50) {
    return 'bg-green-500'
  } else if (hpPercent > 25) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
}
</script>
<style scoped>
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

/* Fade transition for fainted overlay */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
