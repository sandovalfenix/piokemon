<template>
  <section class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">Equipo</h2>

      <button class="bg-red-500 text-white px-4 py-2 rounded-lg">
        Curar equipo
      </button>
    </div>

    <div class="space-y-3">
      <PokemonCard />
      <PokemonCard />
      <PokemonCard />
    </div>
  </section>
</template>

<script setup lang="ts">
import PokemonCard from './PokemonCard.vue'
</script>
