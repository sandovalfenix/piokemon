/**
 * Thematic NPCs Data (ID-Only Format)
 * Feature: 006-battle-module-update (Clarification: Lobby Flow Refactor)
 *
 * Trainers that must be defeated before challenging each Gym Leader.
 * Teams are defined using Pokemon IDs only - stats/moves are hydrated from PokéAPI.
 */

import type { PokemonIdEntry } from '@/services/pokeapi/pokemonHydrationService'

// =============================================================================
// Interface
// =============================================================================

export interface ThematicNpc {
  /** Unique identifier (e.g., "npc-jose-1") */
  id: string

  /** Display name */
  name: string

  /** Associated Gym Leader ID (1-5) */
  gymId: number

  /** Order within gym's NPC sequence (1-based) */
  order: number

  /** Team definition (ID + Level only, hydrated from PokéAPI) */
  team: PokemonIdEntry[]

  /** Pre-battle quote */
  quote: string

  /** Trainer sprite URL */
  spriteUrl?: string
}

// =============================================================================
// Pokemon ID Reference (from PokéAPI)
// =============================================================================
// Gen 1 IDs used in NPC teams:
// Geodude: 74, Sandshrew: 27, Onix: 95
// Poliwag: 60, Oddish: 43, Psyduck: 54, Bellsprout: 69
// Voltorb: 100, Pikachu: 25, Magnemite: 81, Jigglypuff: 39
// Pidgey: 16, Spearow: 21, Pidgeotto: 17, Electabuzz: 125
// Bulbasaur: 1, Ivysaur: 2, Venusaur: 3, Cubone: 104, Marowak: 105

// =============================================================================
// Thematic NPCs Data
// =============================================================================

export const THEMATIC_NPCS: ThematicNpc[] = [
  // =========================================================================
  // Gym 1: José (Rock/Ground) - Cristo Rey
  // =========================================================================
  {
    id: 'npc-jose-1',
    name: 'Excursionista Carlos',
    gymId: 1,
    order: 1,
    quote: '¡Las piedras del cerro son mi fortaleza! ¿Crees poder superarlas?',
    team: [
      { pokemonId: 74, level: 8 }, // Geodude
    ],
  },
  {
    id: 'npc-jose-2',
    name: 'Montañista María',
    gymId: 1,
    order: 2,
    quote: 'En Cristo Rey aprendí que la tierra nos protege.',
    team: [
      { pokemonId: 27, level: 9 }, // Sandshrew
    ],
  },
  {
    id: 'npc-jose-3',
    name: 'Guardián del Cerro',
    gymId: 1,
    order: 3,
    quote: '¡Solo los dignos pueden enfrentar a José!',
    team: [
      { pokemonId: 74, level: 9 },  // Geodude
      { pokemonId: 27, level: 10 }, // Sandshrew
    ],
  },

  // =========================================================================
  // Gym 2: Manuel (Water/Grass) - Parque de la Caña
  // =========================================================================
  {
    id: 'npc-manuel-1',
    name: 'Nadador Pablo',
    gymId: 2,
    order: 1,
    quote: '¡Las aguas del parque me dan fuerza!',
    team: [
      { pokemonId: 60, level: 16 }, // Poliwag
    ],
  },
  {
    id: 'npc-manuel-2',
    name: 'Jardinera Lucía',
    gymId: 2,
    order: 2,
    quote: 'Las plantas y el agua trabajan juntas.',
    team: [
      { pokemonId: 43, level: 17 }, // Oddish
    ],
  },
  {
    id: 'npc-manuel-3',
    name: 'Guía del Acuaparque',
    gymId: 2,
    order: 3,
    quote: '¡Prepárate para Manuel, guardián del agua!',
    team: [
      { pokemonId: 54, level: 18 }, // Psyduck
      { pokemonId: 69, level: 17 }, // Bellsprout
    ],
  },

  // =========================================================================
  // Gym 3: Rafael (Electric/Normal) - Plazoleta Jairo Varela
  // =========================================================================
  {
    id: 'npc-rafael-1',
    name: 'Músico Andrés',
    gymId: 3,
    order: 1,
    quote: '¡El ritmo eléctrico de la salsa fluye en mis venas!',
    team: [
      { pokemonId: 100, level: 24 }, // Voltorb
    ],
  },
  {
    id: 'npc-rafael-2',
    name: 'Bailarina Carmen',
    gymId: 3,
    order: 2,
    quote: 'La energía de la música me da poder.',
    team: [
      { pokemonId: 25, level: 25 }, // Pikachu
    ],
  },
  {
    id: 'npc-rafael-3',
    name: 'DJ de la Plazoleta',
    gymId: 3,
    order: 3,
    quote: '¡Solo los que sienten el ritmo pueden enfrentar a Rafael!',
    team: [
      { pokemonId: 81, level: 25 }, // Magnemite
      { pokemonId: 39, level: 26 }, // Jigglypuff
    ],
  },

  // =========================================================================
  // Gym 4: Sofía (Flying/Electric) - La Ermita
  // =========================================================================
  {
    id: 'npc-sofia-1',
    name: 'Ornitóloga Elena',
    gymId: 4,
    order: 1,
    quote: '¡Las aves de La Ermita vuelan conmigo!',
    team: [
      { pokemonId: 16, level: 30 }, // Pidgey
    ],
  },
  {
    id: 'npc-sofia-2',
    name: 'Guardián del Templo',
    gymId: 4,
    order: 2,
    quote: 'El cielo sagrado protege este lugar.',
    team: [
      { pokemonId: 21, level: 31 }, // Spearow
      { pokemonId: 25, level: 30 }, // Pikachu
    ],
  },
  {
    id: 'npc-sofia-3',
    name: 'Sacerdotisa del Aire',
    gymId: 4,
    order: 3,
    quote: '¡Sofía te espera en las alturas!',
    team: [
      { pokemonId: 17, level: 32 },  // Pidgeotto
      { pokemonId: 125, level: 31 }, // Electabuzz
    ],
  },

  // =========================================================================
  // Gym 5: Valeria (Grass/Ground) - Zoológico de Cali
  // =========================================================================
  {
    id: 'npc-valeria-1',
    name: 'Cuidador del Zoo',
    gymId: 5,
    order: 1,
    quote: '¡Los animales de la selva me acompañan!',
    team: [
      { pokemonId: 1, level: 36 }, // Bulbasaur
    ],
  },
  {
    id: 'npc-valeria-2',
    name: 'Bióloga Marina',
    gymId: 5,
    order: 2,
    quote: 'La naturaleza es nuestra mayor aliada.',
    team: [
      { pokemonId: 2, level: 37 },   // Ivysaur
      { pokemonId: 104, level: 36 }, // Cubone
    ],
  },
  {
    id: 'npc-valeria-3',
    name: 'Guardián de la Selva',
    gymId: 5,
    order: 3,
    quote: '¡Solo los que respetan la naturaleza pueden enfrentar a Valeria!',
    team: [
      { pokemonId: 3, level: 38 },   // Venusaur
      { pokemonId: 105, level: 37 }, // Marowak
    ],
  },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all NPCs for a specific gym
 * @param gymId - Gym Leader ID (1-5)
 * @returns Array of NPCs for that gym, sorted by order
 */
export function getNpcsByGym(gymId: number): ThematicNpc[] {
  return THEMATIC_NPCS.filter((npc) => npc.gymId === gymId).sort(
    (a, b) => a.order - b.order
  )
}

/**
 * Check if all NPCs for a gym have been defeated
 * @param gymId - Gym Leader ID (1-5)
 * @param defeatedIds - Array of defeated NPC IDs
 * @returns true if all gym NPCs are defeated
 */
export function areGymNpcsDefeated(
  gymId: number,
  defeatedIds: string[]
): boolean {
  const gymNpcs = getNpcsByGym(gymId)
  return gymNpcs.every((npc) => defeatedIds.includes(npc.id))
}

/**
 * Get the next undefeated NPC for a gym
 * @param gymId - Gym Leader ID (1-5)
 * @param defeatedIds - Array of defeated NPC IDs
 * @returns Next NPC to challenge, or undefined if all defeated
 */
export function getNextNpcForGym(
  gymId: number,
  defeatedIds: string[]
): ThematicNpc | undefined {
  const gymNpcs = getNpcsByGym(gymId)
  return gymNpcs.find((npc) => !defeatedIds.includes(npc.id))
}

/**
 * Get NPC by ID
 * @param npcId - NPC unique identifier
 * @returns NPC data or undefined if not found
 */
export function getNpcById(npcId: string): ThematicNpc | undefined {
  return THEMATIC_NPCS.find((npc) => npc.id === npcId)
}

/**
 * Get a random NPC from the pool (for first battle)
 * @returns Random NPC from all available NPCs
 */
export function getRandomNpc(): ThematicNpc {
  const randomIndex = Math.floor(Math.random() * THEMATIC_NPCS.length)
  return THEMATIC_NPCS[randomIndex]!
}

/**
 * Get a random undefeated NPC
 * @param defeatedIds - Array of defeated NPC IDs
 * @returns Random undefeated NPC, or undefined if all defeated
 */
export function getRandomUndefeatedNpc(defeatedIds: string[]): ThematicNpc | undefined {
  const undefeated = THEMATIC_NPCS.filter((npc) => !defeatedIds.includes(npc.id))
  if (undefeated.length === 0) return undefined
  const randomIndex = Math.floor(Math.random() * undefeated.length)
  return undefeated[randomIndex]
}

/**
 * Get a random undefeated NPC from the current gym only
 * Enforces strict progression: players can only battle NPCs from their current gym
 * @param currentGym - Current gym ID (1-5)
 * @param defeatedIds - Array of defeated NPC IDs
 * @returns Random undefeated NPC from current gym, or undefined if all defeated
 */
export function getRandomUndefeatedNpcFromGym(currentGym: number, defeatedIds: string[]): ThematicNpc | undefined {
  const gymNpcs = getNpcsByGym(currentGym)
  const undefeated = gymNpcs.filter((npc) => !defeatedIds.includes(npc.id))
  if (undefeated.length === 0) return undefined
  const randomIndex = Math.floor(Math.random() * undefeated.length)
  return undefeated[randomIndex]
}
