/**
 * useCapture Composable
 * Feature: 007-wild-encounter-capture
 *
 * Centralized capture state management and logic for wild battles.
 * Coordinates ball selection, capture attempts, and result handling.
 *
 * API:
 * - captureState: Reactive state (phase, shakes, success, selectedBall, savedTo)
 * - isCapturing: Whether capture UI is active
 * - openBallSelector: Show ball selection UI
 * - closeBallSelector: Hide ball selection UI
 * - attemptCapture: Execute capture with selected ball
 * - saveCapturedPokemon: Save to team or PC Box
 * - resetCapture: Reset state after capture flow
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type {
  CaptureState,
  CaptureResult,
  WildBattlePokemon,
  CapturedPokemon,
  BallType,
} from '@/models/capture'
import { generateInstanceId } from '@/models/capture'
import { attemptCapture as captureEngineAttempt } from '@/stores/captureEngine'
import { useTeamStore } from '@/stores/team'
import { usePCBoxStore } from '@/stores/pcBox'
import type { Pokemon as TeamBuilderPokemon } from '@/models/teamBuilder'

// ============================================================================
// Types
// ============================================================================

export interface UseCaptureReturn {
  // State (readonly)
  captureState: Ref<CaptureState>
  isCapturing: ComputedRef<boolean>

  // Actions
  openBallSelector: () => void
  closeBallSelector: () => void
  attemptCapture: (ballType: BallType, pokemon: WildBattlePokemon) => Promise<CaptureResult>
  saveCapturedPokemon: (pokemon: WildBattlePokemon, ballType: BallType) => 'team' | 'pcbox'
  resetCapture: () => void
}

// ============================================================================
// Default State
// ============================================================================

const DEFAULT_CAPTURE_STATE: CaptureState = {
  phase: 'idle',
  shakes: 0,
  success: false,
  selectedBall: null,
  savedTo: null,
}

// ============================================================================
// Composable
// ============================================================================

export function useCapture(): UseCaptureReturn {
  // State
  const captureState = ref<CaptureState>({ ...DEFAULT_CAPTURE_STATE })

  // Computed
  const isCapturing = computed(() => captureState.value.phase !== 'idle')

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Open ball selector UI
   */
  function openBallSelector(): void {
    captureState.value = {
      ...DEFAULT_CAPTURE_STATE,
      phase: 'selecting-ball',
    }
  }

  /**
   * Close ball selector UI without attempting capture
   */
  function closeBallSelector(): void {
    captureState.value = {
      ...captureState.value,
      phase: 'idle',
      selectedBall: null,
    }
  }

  /**
   * Attempt to capture wild Pokémon with selected ball
   * @param ballType - Type of Pokéball to use
   * @param pokemon - Wild Pokémon to capture
   * @returns Capture result with success, shakes, and save location
   */
  async function attemptCapture(
    ballType: BallType,
    pokemon: WildBattlePokemon
  ): Promise<CaptureResult> {
    // Update state to throwing
    captureState.value = {
      ...captureState.value,
      phase: 'throwing',
      selectedBall: ballType,
    }

    // Simulate throw animation delay
    await delay(500)

    // Convert to GeneratedPokemon format for captureEngine
    const generatedPokemon = {
      id: pokemon.pokemon.id,
      name: pokemon.pokemon.name,
      region: 'kanto',
      level: pokemon.level,
      sprite: pokemon.pokemon.sprite,
      maxHp: pokemon.maxHp,
      currentHp: pokemon.currentHp,
      baseCatchRate: pokemon.catchRate,
    }

    // Calculate capture result using Gen 3 formula (captureEngine.ts - PRESERVED)
    const result = captureEngineAttempt(generatedPokemon, ballType)

    // Update state to shaking
    captureState.value = {
      ...captureState.value,
      phase: 'shaking',
      shakes: result.shakes,
    }

    // Animate shakes (500ms per shake)
    await delay(result.shakes * 500 + 300)

    // Determine save location if successful
    let savedTo: 'team' | 'pcbox' | null = null
    if (result.success) {
      savedTo = saveCapturedPokemon(pokemon, ballType)
    }

    // Update to result phase
    captureState.value = {
      ...captureState.value,
      phase: 'result',
      success: result.success,
      savedTo,
    }

    return {
      success: result.success,
      shakes: result.shakes,
      savedTo,
    }
  }

  /**
   * Save captured Pokémon to team or PC Box
   * @param pokemon - Wild Pokémon that was captured
   * @param ballType - Ball type used for capture
   * @returns Where the Pokémon was saved
   */
  function saveCapturedPokemon(pokemon: WildBattlePokemon, ballType: BallType): 'team' | 'pcbox' {
    const teamStore = useTeamStore()
    const pcBoxStore = usePCBoxStore()

    // Create CapturedPokemon record for PC Box storage
    const capturedPokemon: CapturedPokemon = {
      instanceId: generateInstanceId(),
      pokemon: pokemon.pokemon,
      captureLevel: pokemon.level,
      capturedAt: new Date().toISOString(),
      ballType,
    }

    // Check team capacity - save to team if < 6
    if (teamStore.roster.length < 6) {
      // Convert to TeamMember format
      const teamMember = convertToTeamMember(pokemon, teamStore.roster.length)

      const result = teamStore.addPokemon(teamMember)

      if (result.valid) {
        // Save to localStorage (pokemon-team-v1)
        teamStore.saveTeam()
        return 'team'
      }
    }

    // Team full or add failed - add to PC Box
    pcBoxStore.addPokemon(capturedPokemon)
    return 'pcbox'
  }

  /**
   * Reset capture state after flow completion
   */
  function resetCapture(): void {
    captureState.value = { ...DEFAULT_CAPTURE_STATE }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  /**
   * Default move for captured Pokémon without moves
   */
  const DEFAULT_MOVE = {
    id: 33, // Tackle
    name: 'Tackle',
    type: 'Normal' as const,
    power: 40,
    accuracy: 100,
    category: 'Physical' as const,
    pp: 35,
  }

  /**
   * Convert WildBattlePokemon to TeamMember format
   * Ensures the Pokemon has proper structure for team storage
   */
  function convertToTeamMember(pokemon: WildBattlePokemon, position: number) {
    // Get moves from the wild pokemon, or use default if empty
    const pokemonMoves = pokemon.pokemon.moves ?? []

    // Create selectedMoves array - use existing moves or default to Tackle
    let selectedMoves = pokemonMoves.slice(0, 4).map((m) => ({
      id: typeof m.id === 'number' ? m.id : 0,
      name: m.name || 'Tackle',
      type: 'Normal' as const,
      power: 40 as number | null,
      accuracy: 100,
      category: 'Physical' as const,
      pp: 35,
    }))

    // Ensure at least one move (required by team validation)
    if (selectedMoves.length === 0) {
      selectedMoves = [DEFAULT_MOVE]
    }

    // Create proper Pokemon structure for TeamMember
    const teamPokemon: TeamBuilderPokemon = {
      id: pokemon.pokemon.id,
      name: pokemon.pokemon.name,
      types: pokemon.pokemon.types,
      stats: pokemon.pokemon.stats,
      sprite: pokemon.pokemon.sprite,
      moves: pokemonMoves.length > 0
        ? pokemonMoves.map(m => ({ id: typeof m.id === 'number' ? m.id : 0, name: m.name }))
        : [{ id: 33, name: 'Tackle' }],
    }

    return {
      pokemon: teamPokemon,
      selectedMoves,
      level: pokemon.level,
      currentHp: pokemon.maxHp, // Healed on capture
      maxHp: pokemon.maxHp,
      position,
    }
  }

  /**
   * Promise-based delay helper
   */
  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    captureState,
    isCapturing,
    openBallSelector,
    closeBallSelector,
    attemptCapture,
    saveCapturedPokemon,
    resetCapture,
  }
}
