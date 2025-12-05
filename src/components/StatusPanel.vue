<template>
  <div class="relative w-full h-80 bg-slate-200 dark:bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-800">
    <!-- Arena Floor Effect -->
    <div class="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-black pointer-events-none"></div>

    <!-- NPC HUD (Top Left) -->
    <div class="absolute top-8 left-8 z-10 w-72">
      <PokemonCard
        :pokemon="battleStore.npcPokemon"
        :is-player="false"
        :is-attacking="attackingSide === 'npc'"
        class="shadow-xl border-l-4 border-red-500"
      />
    </div>

    <!-- Player HUD (Bottom Right) -->
    <div class="absolute bottom-8 right-8 z-10 w-72">
      <PokemonCard
        :pokemon="battleStore.playerPokemon"
        :is-player="true"
        :is-attacking="attackingSide === 'player'"
        class="shadow-xl border-r-4 border-blue-500"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBattleStore } from '@/stores/battle'
import PokemonCard from './PokemonCard.vue'

defineProps<{
  attackingSide?: 'player' | 'npc' | null
}>()

const battleStore = useBattleStore()
</script>
