// useEncounterStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeneratedPokemon } from '../stores/pokemonGenerator'
import { generateRandomPokemon } from '../stores/pokemonGenerator'
import { attemptCapture } from '../stores/captureEngine'

export const useEncounterStore = defineStore('encounter', () => {
  const wildPokemon = ref<GeneratedPokemon | null>(null)
  const currentPokemon = ref<GeneratedPokemon | null>(null)
  const isEncounterActive = ref(false)
  const isCaptureInProgress = ref(false)

  const capturedPokemons = ref<GeneratedPokemon[]>([])

  /**
   * region: string opcional
   * Ej: "kanto", "johto"
   */
  /**
   * Genera un encuentro. Retorna true si se encontró un Pokémon, false si no.
   */
  function generateEncounter(region?: string) {
    const pokemon = generateRandomPokemon(region)

    if (!pokemon) {
      // No se encontraron pokémons para la región solicitada
      wildPokemon.value = null
      isEncounterActive.value = false
      return false
    }

    wildPokemon.value = pokemon
    isEncounterActive.value = true
    return true
  }

  function setCurrentPokemon(pokemon: GeneratedPokemon) {
    currentPokemon.value = pokemon
  }

  function endEncounter() {
    wildPokemon.value = null
    isEncounterActive.value = false
    isCaptureInProgress.value = false
  }

  async function tryCapture(pokeballType: string) {
    if (!wildPokemon.value) return { success: false, shakes: 0 }

    isCaptureInProgress.value = true

    const result = attemptCapture(wildPokemon.value, pokeballType)

    if (result.success) {
      capturedPokemons.value.push(wildPokemon.value)
      endEncounter()
    } else {
      isCaptureInProgress.value = false
    }

    return result
  }

  return {
    wildPokemon,
    currentPokemon,
    isEncounterActive,
    isCaptureInProgress,
    capturedPokemons,

    generateEncounter,
    setCurrentPokemon,
    endEncounter,
    tryCapture
  }
})
