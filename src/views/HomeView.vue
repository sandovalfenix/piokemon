<script lang="ts">
import EncounterView from '@/components/EncounterView.vue';
</script>
<template>
  <main class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-4">Bienvenido a Piokemon</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Proyecto Vue 3 + Vite + Tailwind CSS + shadcn-vue configurado correctamente.
    </p>
    <div class="flex gap-4">
      <RouterLink
        to="/dashboard"
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        Ir al Dashboard
      </RouterLink>
      
      <button
        @click="mostrarBuscar = true"
        class="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-green-700"
      >
        Explorar
      </button>
    </div>

    <!-- Componente Buscar -->
    <BuscarPokemon 
      v-if="mostrarBuscar" 
      @cerrar="mostrarBuscar = false"
    />
    <EncounterView />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BuscarPokemon from '../components/Buscar.vue'

const mostrarBuscar = ref(false)
</script>