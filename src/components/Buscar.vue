<script setup lang="ts">
/**
 * Buscar Component
 * Feature: 007-wild-encounter-capture
 *
 * Animated search screen for wild Pokémon encounters.
 * Uses PokéAPI-integrated encounter store for real Pokémon data.
 */
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { useEncounterStore, type EncounteredPokemon } from '@/stores/useEncounterStore'

const props = defineProps<{ region?: string }>()

const emit = defineEmits<{
  /** Pokémon found - pass full data with types */
  'pokemon-encontrado': [pokemonData: EncounteredPokemon];
  /** No Pokémon found */
  'pokemon-no-encontrado': [];
  /** Close modal */
  'cerrar': [];
}>()

const buscando = ref<boolean>(true)
const encounterStore = useEncounterStore()
const foundPokemon = ref<EncounteredPokemon | null>(null)

onMounted((): void => {
  iniciarBusqueda()
})

const iniciarBusqueda = async (): Promise<void> => {
  buscando.value = true

  // Animate for 2-3 seconds while fetching from PokéAPI
  const animationPromise = new Promise<void>(resolve => setTimeout(resolve, Math.random() * 1000 + 2000))

  // Start encounter generation (async - fetches from PokéAPI)
  const encounterPromise = encounterStore.generateEncounter(props.region)

  // Wait for both animation and fetch
  await Promise.all([animationPromise, encounterPromise])

  decidirResultadoDeBusqueda()

  buscando.value = false
}

const decidirResultadoDeBusqueda = (): void => {
  // Check if encounter was successful by checking the store's wildPokemon
  // generateEncounter was already awaited in iniciarBusqueda
  const encontrado = encounterStore.wildPokemon !== null

  if (encontrado) {
    foundPokemon.value = encounterStore.wildPokemon as EncounteredPokemon
    if (foundPokemon.value) {
      console.log('[Buscar] Pokemon encontrado (store):', foundPokemon.value)
      emit('pokemon-encontrado', foundPokemon.value)
    } else {
      console.log('[Buscar] Error inesperado: se indico encuentro pero no hay Pokemon en el store')
      emit('pokemon-no-encontrado')
    }
  } else {
    // No se encontraron pokémons en POKEMON_DATA para la región solicitada
    console.log('[Buscar] No se encontraron pokemons en POKEMON_DATA para la region:', props.region)
    foundPokemon.value = null
    emit('pokemon-no-encontrado')
  }
}

const reiniciarBusqueda = (): void => {
  foundPokemon.value = null
  encounterStore.endEncounter()
  buscando.value = true
  iniciarBusqueda()
}

const cerrarModal = (): void => {
  encounterStore.endEncounter()
  emit('cerrar')
}
</script>
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <!-- Modal de búsqueda -->
    <Card class="w-full max-w-md mx-4 border border-border shadow-lg">
      <CardHeader class="border-b border-border">
        <CardTitle class="text-foreground">Buscar Pokémon</CardTitle>
      </CardHeader>

      <CardContent class="text-center pt-6">
        <div v-if="buscando" class="space-y-4">
          <div class="relative h-40 flex items-center justify-center rounded-lg bg-gradient-to-b from-green-900/30 to-green-950/50 border border-border overflow-hidden">
            <!-- Simple loading indicator -->
            <div class="flex flex-col items-center gap-4">
              <div class="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-lg font-semibold text-foreground">
              Buscando Pokémon...
            </p>
            <p class="text-sm text-muted-foreground">Explorando {{ region || 'la zona' }}...</p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <template v-if="foundPokemon">
            <div class="bg-primary/10 border border-primary rounded-lg p-4 space-y-2 text-left">
              <h3 class="font-bold text-base text-foreground flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                ¡Pokémon encontrado!
              </h3>
              <p class="text-sm text-muted-foreground">Nombre: <strong class="text-foreground capitalize">{{ foundPokemon.name }}</strong></p>
              <p class="text-sm text-muted-foreground">Nivel: <strong class="text-foreground">{{ foundPokemon.level }}</strong></p>
              <p class="text-sm text-muted-foreground">Tipos: <strong class="text-foreground capitalize">{{ foundPokemon.types?.join(' / ') ?? 'Normal' }}</strong></p>
            </div>
          </template>

          <template v-else>
            <div class="bg-destructive/10 border border-destructive rounded-lg p-4 space-y-2">
              <h3 class="font-bold text-base text-foreground flex items-center gap-2">
                <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                No se encontro ningun Pokemon
              </h3>
              <p class="text-sm text-muted-foreground">{{ encounterStore.fetchError ?? 'Intenta de nuevo o cambia la región' }}</p>
            </div>
          </template>
        </div>
      </CardContent>

      <CardFooter class="border-t border-border flex gap-2 pt-4">
        <Button
          v-if="!buscando"
          @click="reiniciarBusqueda"
          class="flex-1"
          variant="outline"
        >
          Buscar de Nuevo
        </Button>

        <Button
          @click="cerrarModal"
          class="flex-1"
          variant="destructive"
        >
          Cerrar
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
/* Simple spinner is handled by Tailwind animate-spin */
</style>
