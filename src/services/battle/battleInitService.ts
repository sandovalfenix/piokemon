/**
 * Battle Init Service (PokéAPI Hydration)
 * Feature: 006-battle-module-update (Clarification: Lobby Flow Refactor)
 *
 * Service for initializing battles from various sources (NPC, Gym Leader, Wild)
 * All Pokemon data is hydrated from PokéAPI instead of using hardcoded stats
 */

import type { Pokemon } from '@/domain/battle/engine/entities'
import { gymLeaders } from '@/data/gymLeaders'
import { getNpcById } from '@/data/thematicNpcs'
import { selectWildPokemon } from '@/data/wildPokemonPool'
import { calculateWildPokemonLevel, calculateTeamAverageLevel } from '@/domain/battle/calc/levelScaling'
import { hydrateTeam, hydratePokemon, type PokemonIdEntry } from '@/services/pokeapi/pokemonHydrationService'
import type { OpponentType } from '@/models/battleOutcome'

// =============================================================================
// Types
// =============================================================================

export interface BattleTarget {
  type: OpponentType
  id?: string | number
}

export interface BattleInitResult {
  opponentTeam: Pokemon[]
  opponentName: string
  opponentType: OpponentType
  opponentId?: string | number
  quote?: string
}

// =============================================================================
// NPC Battle Init (Async - PokéAPI)
// =============================================================================

/**
 * Create battle context from NPC ID
 * Hydrates team from PokéAPI
 */
export async function initNpcBattle(npcId: string): Promise<BattleInitResult | null> {
  const npc = getNpcById(npcId)
  if (!npc) {
    console.error(`[BattleInitService] NPC not found: ${npcId}`)
    return null
  }

  try {
    console.log(`[BattleInitService] Hydrating NPC team for ${npc.name}...`)
    const opponentTeam = await hydrateTeam(npc.team)

    return {
      opponentTeam,
      opponentName: npc.name,
      opponentType: 'thematic-npc',
      opponentId: npc.id,
      quote: npc.quote,
    }
  } catch (error) {
    console.error(`[BattleInitService] Failed to hydrate NPC team:`, error)
    throw error // Re-throw for UI to handle
  }
}

// =============================================================================
// Gym Leader Battle Init (Async - PokéAPI)
// =============================================================================

/**
 * Create battle context from Gym Leader ID
 * Hydrates team from PokéAPI
 */
export async function initGymLeaderBattle(gymId: number): Promise<BattleInitResult | null> {
  const leader = gymLeaders.find(g => g.id === gymId)
  if (!leader) {
    console.error(`[BattleInitService] Gym Leader not found: ${gymId}`)
    return null
  }

  try {
    console.log(`[BattleInitService] Hydrating Gym Leader team for ${leader.name}...`)

    // Convert gym leader team to PokemonIdEntry format
    const teamEntries: PokemonIdEntry[] = leader.team.map(member => ({
      pokemonId: member.pokemonId,
      level: member.level,
    }))

    const opponentTeam = await hydrateTeam(teamEntries)

    return {
      opponentTeam,
      opponentName: leader.name,
      opponentType: 'gym-leader',
      opponentId: leader.id,
      quote: leader.quote,
    }
  } catch (error) {
    console.error(`[BattleInitService] Failed to hydrate Gym Leader team:`, error)
    throw error // Re-throw for UI to handle
  }
}

// =============================================================================
// Wild Battle Init (Async - PokéAPI)
// =============================================================================

/**
 * Create battle context for wild Pokemon encounter
 * @param playerTeam - Player's team for level scaling
 */
export async function initWildBattle(playerTeam: Pokemon[]): Promise<BattleInitResult> {
  const teamLevels = playerTeam.map(p => p.level)
  const avgLevel = calculateTeamAverageLevel(teamLevels)
  const wildLevel = calculateWildPokemonLevel(avgLevel)

  const wildEntry = selectWildPokemon()

  try {
    const wildPokemon = await hydratePokemon({
      pokemonId: wildEntry.pokemonId,
      level: wildLevel,
    })

    return {
      opponentTeam: [wildPokemon],
      opponentName: wildPokemon.name,
      opponentType: 'wild',
      quote: `¡Un ${wildPokemon.name} salvaje apareció!`,
    }
  } catch (error) {
    console.error(`[BattleInitService] Failed to hydrate wild Pokemon:`, error)
    throw error // Re-throw for UI to handle
  }
}

// =============================================================================
// Main Init Function (Async)
// =============================================================================

/**
 * Initialize battle from target specification
 * All init functions are now async due to PokéAPI hydration
 */
export async function initBattleFromTarget(
  target: BattleTarget,
  playerTeam?: Pokemon[]
): Promise<BattleInitResult | null> {
  switch (target.type) {
    case 'thematic-npc':
      return initNpcBattle(target.id as string)

    case 'gym-leader':
      return initGymLeaderBattle(target.id as number)

    case 'wild':
      if (!playerTeam || playerTeam.length === 0) {
        console.error('[BattleInitService] Player team required for wild battle')
        return null
      }
      console.log(playerTeam);

      return initWildBattle(playerTeam)

    default:
      console.error('[BattleInitService] Unknown target type:', target.type)
      return null
  }
}
