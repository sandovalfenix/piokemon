/**
 * Encounter Store
 * Feature: 007-wild-encounter-capture
 *
 * Manages wild Pokémon encounters with PokéAPI integration.
 * Replaced deprecated store with new implementation.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GeneratedPokemon } from '../stores/pokemonGenerator'
import { generateRandomEncounter } from '../stores/pokemonGenerator'
import { getRandomEncounterId } from '@/data/encounterWhitelist'
import { attemptCapture } from '../stores/captureEngine'
import { useProgressStore } from './progress'
import type { Pokemon as TeamBuilderPokemon } from '@/models/teamBuilder'

/**
 * Interface for full Pokémon data from PokéAPI
 * Includes types fetched from API instead of derived from name
 */
export interface EncounteredPokemon extends GeneratedPokemon {
  types: string[]
  catchRate: number
}

/**
 * PokéAPI Pokemon response (minimal interface for encounter needs)
 */
interface PokeAPIPokemonResponse {
  id: number
  name: string
  types: { type: { name: string } }[]
  stats: { stat: { name: string }; base_stat: number }[]
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
  }
}

/**
 * PokéAPI Species response (for catch rate)
 */
interface PokeAPISpeciesResponse {
  capture_rate: number
}

export const useEncounterStore = defineStore('encounter', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** Current wild Pokémon in encounter (basic data from generator) */
  const wildPokemon = ref<GeneratedPokemon | null>(null)

  /** Current Pokémon with full PokéAPI data including types */
  const currentPokemon = ref<EncounteredPokemon | null>(null)

  /** Whether an encounter is active */
  const isEncounterActive = ref(false)

  /** Whether a capture attempt is in progress */
  const isCaptureInProgress = ref(false)

  /** Loading state for PokéAPI fetch */
  const isLoading = ref(false)

  /** Error state for fetch failures */
  const fetchError = ref<string | null>(null)

  /** List of captured Pokémon (legacy - use pcBoxStore instead) */
  const capturedPokemons = ref<GeneratedPokemon[]>([])

  // ============================================================================
  // Computed
  // ============================================================================

  /** Wild Pokémon level based on gym badges */
  const encounterLevel = computed(() => {
    const progressStore = useProgressStore()
    const badges = progressStore.currentGym ?? 0
    // Formula from spec: gym badges * 5 + 5 (minimum 5)
    return Math.max(5, badges * 5 + 5)
  })

  // ============================================================================
  // PokéAPI Fetch Functions
  // ============================================================================

  /**
   * Fetch Pokémon data from PokéAPI
   * @param pokemonId - PokéAPI Pokémon ID
   * @returns Pokémon data or null on failure
   */
  async function fetchPokemonFromAPI(pokemonId: number): Promise<PokeAPIPokemonResponse | null> {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`[EncounterStore] Failed to fetch Pokemon ${pokemonId}:`, error)
      return null
    }
  }

  /**
   * Fetch Pokémon species data from PokéAPI (for catch rate)
   * @param pokemonId - PokéAPI Pokémon ID
   * @returns Species data or null on failure
   */
  async function fetchSpeciesFromAPI(pokemonId: number): Promise<PokeAPISpeciesResponse | null> {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`[EncounterStore] Failed to fetch species ${pokemonId}:`, error)
      return null
    }
  }

  /**
   * Capitalize first letter of string
   */
  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Calculate HP based on level (simplified formula)
   */
  function calculateHp(level: number, baseHp: number = 45): number {
    // Simplified HP formula: base + level * 2
    return baseHp + level * 2
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Generate a new wild encounter using encounter whitelist and PokéAPI
   * @param _region - Optional region filter (ignored in new implementation)
   * @returns True if encounter generated successfully
   */
  async function generateEncounter(_region?: string): Promise<boolean> {
    isLoading.value = true
    fetchError.value = null

    try {
      // Get random Pokemon ID from whitelist
      const pokemonId = getRandomEncounterId()
      const level = encounterLevel.value

      // Fetch from PokéAPI
      const [pokemonData, speciesData] = await Promise.all([
        fetchPokemonFromAPI(pokemonId),
        fetchSpeciesFromAPI(pokemonId),
      ])

      if (!pokemonData) {
        // Fallback to local generator if API fails
        console.warn('[EncounterStore] PokéAPI unavailable, using local data')
        const localPokemon = generateRandomEncounter()
        wildPokemon.value = localPokemon
        currentPokemon.value = {
          ...localPokemon,
          types: ['Normal'], // Fallback type
          catchRate: localPokemon.baseCatchRate,
        }
        isEncounterActive.value = true
        return true
      }

      // Extract types from API response
      const types = pokemonData.types.map(t => capitalize(t.type.name))

      // Get catch rate from species data (default to 45 if unavailable)
      const catchRate = speciesData?.capture_rate ?? 45

      // Get HP from stats
      const baseHp = pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 45
      const hp = calculateHp(level, baseHp)

      // Get sprite URL
      const sprite = pokemonData.sprites.front_default ??
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`

      // Create generated pokemon
      const generatedPokemon: GeneratedPokemon = {
        id: pokemonData.id,
        name: capitalize(pokemonData.name),
        region: 'kanto', // Default region
        level,
        sprite,
        maxHp: hp,
        currentHp: hp,
        baseCatchRate: catchRate,
      }

      // Create full encountered pokemon with types
      const encounteredPokemon: EncounteredPokemon = {
        ...generatedPokemon,
        types,
        catchRate,
      }

      wildPokemon.value = generatedPokemon
      currentPokemon.value = encounteredPokemon
      isEncounterActive.value = true

      console.log(`[EncounterStore] Encounter started: ${encounteredPokemon.name} (Lv.${level}, Types: ${types.join('/')}, Catch Rate: ${catchRate})`)
      return true
    } catch (error) {
      console.error('[EncounterStore] Failed to generate encounter:', error)
      fetchError.value = 'Failed to fetch Pokémon data. Please try again.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set current Pokémon (legacy support)
   */
  function setCurrentPokemon(pokemon: GeneratedPokemon) {
    wildPokemon.value = pokemon
    // Convert to EncounteredPokemon with default type
    currentPokemon.value = {
      ...pokemon,
      types: ['Normal'],
      catchRate: pokemon.baseCatchRate,
    }
  }

  /**
   * End the current encounter
   */
  function endEncounter() {
    wildPokemon.value = null
    currentPokemon.value = null
    isEncounterActive.value = false
    isCaptureInProgress.value = false
    fetchError.value = null
    console.log('[EncounterStore] Encounter ended')
  }

  /**
   * Attempt to capture the wild Pokémon
   * @param pokeballType - Type of Pokéball to use
   * @returns Capture result with success and shakes
   */
  async function tryCapture(pokeballType: string): Promise<{ success: boolean; shakes: number }> {
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

  /**
   * Convert current encounter to TeamBuilder Pokemon format
   * @returns Pokemon in TeamBuilder format, or null if no encounter
   */
  function toTeamBuilderPokemon(): TeamBuilderPokemon | null {
    if (!currentPokemon.value) return null

    const pokemon = currentPokemon.value
    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types as TeamBuilderPokemon['types'],
      stats: {
        hp: pokemon.maxHp,
        attack: 50, // Default - actual stats from PokéAPI if needed
        defense: 50,
        spAttack: 50,
        spDefense: 50,
        speed: 50,
      },
      sprite: pokemon.sprite,
      moves: [], // Moves added separately via move selection
    }
  }

  // ============================================================================
  // Exports
  // ============================================================================

  return {
    // State
    wildPokemon,
    currentPokemon,
    isEncounterActive,
    isCaptureInProgress,
    isLoading,
    fetchError,
    capturedPokemons,

    // Computed
    encounterLevel,

    // Actions
    generateEncounter,
    setCurrentPokemon,
    endEncounter,
    tryCapture,
    toTeamBuilderPokemon,
  }
})
