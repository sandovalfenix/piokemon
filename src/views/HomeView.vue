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
      @pokemon-encontrado="handlePokemonEncontrado"
      @pokemon-no-encontrado="handlePokemonNoEncontrado"
    />

    <!-- Componente Capturar -->
    <Capturar
      v-if="mostrarCapturar"
      :pokemonData="pokemonData"
      :estadoBusqueda="estadoBusqueda"
      @ir-a-batalla="handleIrABatalla"
      @huir="handleHuir"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BuscarPokemon from '../components/Buscar.vue'
import Capturar from '@/components/Capturar.vue'
import type { GeneratedPokemon } from '@/stores/pokemonGenerator'

const mostrarBuscar = ref(false)
const mostrarCapturar = ref(false)
const estadoBusqueda = ref<'encontrado' | 'no encontrado'>('no encontrado')
const pokemonData = ref<GeneratedPokemon | null>(null)

const router = useRouter()

function handlePokemonEncontrado (p: GeneratedPokemon) {
  pokemonData.value = p
  estadoBusqueda.value = 'encontrado'
  mostrarBuscar.value = false
  mostrarCapturar.value = true
}

function handlePokemonNoEncontrado () {
  pokemonData.value = null
  estadoBusqueda.value = 'no encontrado'
  mostrarBuscar.value = false
  mostrarCapturar.value = true
}

async function handleIrABatalla (p: GeneratedPokemon) {
  // Intentar navegar a la ruta "batalla" si existe
  mostrarCapturar.value = false
  try {
    await router.push({ path: '/batalla', query: { name: p.name } })
  } catch (e) {
    // Si la ruta no existe, solo cerramos la ventana y dejamos la consola informando
    console.warn('Ruta /batalla no encontrada — emitiendo acción abierta localmente', e)
  }
}

function handleHuir () {
  // Volver al estado inicial
  mostrarCapturar.value = false
  mostrarBuscar.value = false
  pokemonData.value = null
  estadoBusqueda.value = 'no encontrado'
}

// DEV helper para probar la vista Capturar con un Pokémon conocido (Charmander id=4)
// removed: development helper forceCharmander
</script>