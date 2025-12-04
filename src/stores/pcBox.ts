/**
 * PC Box Store
 * Feature: 007-wild-encounter-capture
 *
 * Pinia store for managing PC Box storage when team is full.
 * Captured Pokémon overflow to this store for later retrieval.
 */

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CapturedPokemon } from '@/models/capture'

const STORAGE_KEY = 'pcbox-pokemon'

export const usePCBoxStore = defineStore('pcBox', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** List of Pokémon stored in PC Box */
  const pokemonList = ref<CapturedPokemon[]>([])

  /** Error state for storage operations */
  const storageError = ref<string | null>(null)

  // ============================================================================
  // Computed
  // ============================================================================

  /** Total number of Pokémon in PC Box */
  const boxCount = computed(() => pokemonList.value.length)

  /** Whether the PC Box is empty */
  const isEmpty = computed(() => pokemonList.value.length === 0)

  // ============================================================================
  // Persistence
  // ============================================================================

  /**
   * Initialize store from localStorage
   * Should be called on app startup (main.ts)
   */
  function initialize(): void {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CapturedPokemon[]
        // Validate parsed data has required fields
        if (Array.isArray(parsed)) {
          pokemonList.value = parsed.filter(
            (p) => p && p.instanceId && p.pokemon && p.captureLevel && p.capturedAt && p.ballType
          )
          console.log(`[PCBoxStore] Loaded ${pokemonList.value.length} Pokémon from localStorage`)
        }
      } catch (error) {
        console.error('[PCBoxStore] Failed to parse localStorage data:', error)
        pokemonList.value = []
      }
    }
    storageError.value = null
  }

  /**
   * Persist to localStorage on changes
   */
  watch(
    pokemonList,
    (newList) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
        storageError.value = null
      } catch (error) {
        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          storageError.value = 'Storage quota exceeded. Cannot save more Pokémon to PC Box.'
          console.error('[PCBoxStore] localStorage quota exceeded')
        } else {
          storageError.value = 'Failed to save PC Box data'
          console.error('[PCBoxStore] Failed to save to localStorage:', error)
        }
      }
    },
    { deep: true }
  )

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Add a captured Pokémon to the PC Box
   * @param pokemon - The captured Pokémon to add
   * @returns True if successfully added, false if storage failed
   */
  function addPokemon(pokemon: CapturedPokemon): boolean {
    // Check for duplicate instanceId (shouldn't happen, but defensive)
    const exists = pokemonList.value.some((p) => p.instanceId === pokemon.instanceId)
    if (exists) {
      console.warn(`[PCBoxStore] Duplicate instanceId: ${pokemon.instanceId}`)
      return false
    }

    pokemonList.value.push(pokemon)
    console.log(`[PCBoxStore] Added ${pokemon.pokemon.name} to PC Box (${boxCount.value} total)`)

    // Check for storage error after push (watch handler sets it)
    return storageError.value === null
  }

  /**
   * Remove a Pokémon from the PC Box
   * @param instanceId - Unique instance ID of the Pokémon to remove
   * @returns The removed Pokémon, or null if not found
   */
  function removePokemon(instanceId: string): CapturedPokemon | null {
    const index = pokemonList.value.findIndex((p) => p.instanceId === instanceId)
    if (index === -1) {
      console.warn(`[PCBoxStore] Pokémon not found: ${instanceId}`)
      return null
    }

    const [removed] = pokemonList.value.splice(index, 1)
    if (removed) {
      console.log(`[PCBoxStore] Removed ${removed.pokemon.name} from PC Box`)
    }
    return removed ?? null
  }

  /**
   * Get a Pokémon by instance ID without removing it
   * @param instanceId - Unique instance ID
   * @returns The Pokémon or undefined if not found
   */
  function getPokemon(instanceId: string): CapturedPokemon | undefined {
    return pokemonList.value.find((p) => p.instanceId === instanceId)
  }

  /**
   * Clear all Pokémon from PC Box
   * Use with caution - this cannot be undone
   */
  function clearBox(): void {
    pokemonList.value = []
    console.log('[PCBoxStore] PC Box cleared')
  }

  /**
   * Get all Pokémon sorted by capture date (newest first)
   */
  function getSortedByDate(): CapturedPokemon[] {
    return [...pokemonList.value].sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    )
  }

  /**
   * Get all Pokémon sorted by name (alphabetically)
   */
  function getSortedByName(): CapturedPokemon[] {
    return [...pokemonList.value].sort((a, b) =>
      a.pokemon.name.localeCompare(b.pokemon.name)
    )
  }

  // ============================================================================
  // Exports
  // ============================================================================

  return {
    // State
    pokemonList,
    storageError,

    // Computed
    boxCount,
    isEmpty,

    // Actions
    initialize,
    addPokemon,
    removePokemon,
    getPokemon,
    clearBox,
    getSortedByDate,
    getSortedByName,
  }
})
