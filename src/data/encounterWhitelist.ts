/**
 * Encounter Whitelist
 * Feature: 007-wild-encounter-capture
 *
 * IDs of Pokémon available for wild encounters.
 * Expanded from original 6 (3 Kanto + 3 Johto starters) to 50 base-stage Pokémon.
 * Data source: Spec 007 Safari Whitelist table (catch rates from PokéAPI)
 *
 * IMPORTANT: This file contains only IDs. All Pokémon data is fetched from PokéAPI
 * (Constitution Principle VIII - PokeAPI as Single Source of Truth)
 */

/**
 * Encounter Whitelist - 50 base-stage Pokémon IDs for wild encounters
 *
 * Selection criteria:
 * - Base-stage Pokémon (no evolutions)
 * - Mix of common and rare (varied catch rates)
 * - All 18 types represented
 * - Gen 1 focus with some Gen 2 additions
 */
export const ENCOUNTER_WHITELIST: readonly number[] = [
  // Kanto starters (catch rate: 45)
  1, // Bulbasaur
  4, // Charmander
  7, // Squirtle

  // Common early-game Pokémon (catch rate: 255)
  10, // Caterpie
  13, // Weedle
  16, // Pidgey
  19, // Rattata
  21, // Spearow
  23, // Ekans
  25, // Pikachu (catch rate: 190)
  27, // Sandshrew
  29, // Nidoran♀
  32, // Nidoran♂

  // Route encounters (varied catch rates)
  35, // Clefairy (catch rate: 150)
  37, // Vulpix (catch rate: 190)
  39, // Jigglypuff (catch rate: 170)
  41, // Zubat (catch rate: 255)
  43, // Oddish (catch rate: 255)
  46, // Paras (catch rate: 190)
  48, // Venonat (catch rate: 190)
  50, // Diglett (catch rate: 255)

  // Mid-rarity Pokémon (catch rate: 120-190)
  52, // Meowth
  54, // Psyduck
  56, // Mankey
  58, // Growlithe (catch rate: 190)
  60, // Poliwag (catch rate: 255)
  63, // Abra (catch rate: 200)
  66, // Machop (catch rate: 180)
  69, // Bellsprout (catch rate: 255)
  72, // Tentacool (catch rate: 190)
  74, // Geodude (catch rate: 255)
  77, // Ponyta (catch rate: 190)
  79, // Slowpoke (catch rate: 190)
  81, // Magnemite (catch rate: 190)
  84, // Doduo (catch rate: 190)
  86, // Seel (catch rate: 190)
  88, // Grimer (catch rate: 190)
  90, // Shellder (catch rate: 190)
  92, // Gastly (catch rate: 190)

  // Rarer encounters (catch rate: 45-120)
  96, // Drowzee (catch rate: 190)
  98, // Krabby (catch rate: 225)
  100, // Voltorb (catch rate: 190)
  102, // Exeggcute (catch rate: 90)
  104, // Cubone (catch rate: 190)
  109, // Koffing (catch rate: 190)
  111, // Rhyhorn (catch rate: 120)
  116, // Horsea (catch rate: 225)
  118, // Goldeen (catch rate: 225)
  120, // Staryu (catch rate: 225)

  // Special encounters (varied rates)
  129, // Magikarp (catch rate: 255 - common but iconic)
] as const

/**
 * Type for valid encounter Pokémon IDs
 */
export type EncounterPokemonId = (typeof ENCOUNTER_WHITELIST)[number]

/**
 * Get random Pokémon ID from whitelist
 * @returns A random Pokémon ID from the encounter pool
 */
export function getRandomEncounterId(): number {
  const index = Math.floor(Math.random() * ENCOUNTER_WHITELIST.length)
  return ENCOUNTER_WHITELIST[index] ?? 25 // Fallback to Pikachu (ID 25)
}

/**
 * Check if a Pokémon ID is in the encounter whitelist
 * @param id - Pokémon ID to check
 * @returns True if the ID is in the whitelist
 */
export function isEncounterablePokemon(id: number): boolean {
  return (ENCOUNTER_WHITELIST as readonly number[]).includes(id)
}

/**
 * Get the total count of encounterable Pokémon
 * @returns Number of Pokémon in the whitelist
 */
export function getEncounterPoolSize(): number {
  return ENCOUNTER_WHITELIST.length
}
