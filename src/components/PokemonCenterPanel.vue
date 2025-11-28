
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <header class="text-center">
      <h1 class="text-2xl font-bold">Pokémon Center</h1>
    </header>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sección izquierda: Equipo Pokémon -->
      <section class="md:col-span-2 bg-white rounded-lg shadow p-4">
        <Button class="bg-red-500 text-white hover:bg-red-600 mb-4">
          Curar equipo
        </Button>
        <div class="space-y-4">
          <div
            v-for="(pokemon, index) in team"
            :key="index"
            class="flex items-center gap-4 border rounded p-2"
          >
            pokemon.sprite
            <div>
              <p class="font-semibold">{{ pokemon.name }}</p>
              <p>Nivel: {{ pokemon.level }}</p>
              <p>HP: {{ pokemon.hp }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección derecha: Inventario -->
      <aside class="bg-gray-50 rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2">Inventario</h2>
        <p class="mb-4">Pokéballs: {{ pokeballs }}</p>
        <Button variant="secondary" disabled class="cursor-not-allowed">
          Usar Pokéball
        </Button>
      </aside>
    </div>

    <!-- Footer -->
    <footer class="text-center text-sm text-gray-500">
      Versión 1.0 - Módulo en desarrollo
    </footer>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button"; // shadcn-vue

const team = [
  {
    name: "Pikachu",
    level: 25,
    hp: "35/35",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  },
  {
    name: "Charmander",
    level: 18,
    hp: "28/28",
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
  },
];

const pokeballs = 10;
</script>
