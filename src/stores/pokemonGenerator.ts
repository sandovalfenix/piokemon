// pokemonGenerator.ts
/**
 * Pokemon Generator
 * Feature: 007-wild-encounter-capture
 *
 * Generates random Pokémon for wild encounters.
 * Uses ENCOUNTER_WHITELIST (50 Pokémon) instead of hardcoded 6.
 *
 * IMPORTANT: This is a legacy generator for quick Pokemon data.
 * For full PokéAPI data, use the useEncounterStore or pokemonService.
 */

import { ENCOUNTER_WHITELIST, getRandomEncounterId } from '@/data/encounterWhitelist'

export interface GeneratedPokemon {
  id: number;
  name: string;
  region: string;
  level: number;
  sprite: string;
  maxHp: number;
  currentHp: number;
  baseCatchRate: number;
}

/**
 * Legacy Pokemon data - kept for backward compatibility
 * @deprecated Use ENCOUNTER_WHITELIST with PokéAPI fetch instead
 */
const LEGACY_POKEMON_DATA = [
  // Kanto starters (catch rate: 45)
  { id: 1, name: 'Bulbasaur', region: 'kanto', baseCatchRate: 45 },
  { id: 4, name: 'Charmander', region: 'kanto', baseCatchRate: 45 },
  { id: 7, name: 'Squirtle', region: 'kanto', baseCatchRate: 45 },
  // Johto starters (catch rate: 45)
  { id: 152, name: 'Chikorita', region: 'johto', baseCatchRate: 45 },
  { id: 155, name: 'Cyndaquil', region: 'johto', baseCatchRate: 45 },
  { id: 158, name: 'Totodile', region: 'johto', baseCatchRate: 45 },
] as const

/**
 * Extended Pokemon data for all 50 encounter whitelist Pokémon
 * Catch rates are approximate - actual values fetched from PokéAPI
 */
const POKEMON_DATA: Array<{ id: number; name: string; region: string; baseCatchRate: number }> = [
  // Kanto starters (catch rate: 45)
  { id: 1, name: 'Bulbasaur', region: 'kanto', baseCatchRate: 45 },
  { id: 4, name: 'Charmander', region: 'kanto', baseCatchRate: 45 },
  { id: 7, name: 'Squirtle', region: 'kanto', baseCatchRate: 45 },
  // Common early-game (catch rate: 255)
  { id: 10, name: 'Caterpie', region: 'kanto', baseCatchRate: 255 },
  { id: 13, name: 'Weedle', region: 'kanto', baseCatchRate: 255 },
  { id: 16, name: 'Pidgey', region: 'kanto', baseCatchRate: 255 },
  { id: 19, name: 'Rattata', region: 'kanto', baseCatchRate: 255 },
  { id: 21, name: 'Spearow', region: 'kanto', baseCatchRate: 255 },
  { id: 23, name: 'Ekans', region: 'kanto', baseCatchRate: 255 },
  { id: 25, name: 'Pikachu', region: 'kanto', baseCatchRate: 190 },
  { id: 27, name: 'Sandshrew', region: 'kanto', baseCatchRate: 255 },
  { id: 29, name: 'Nidoran♀', region: 'kanto', baseCatchRate: 235 },
  { id: 32, name: 'Nidoran♂', region: 'kanto', baseCatchRate: 235 },
  // Route encounters (varied)
  { id: 35, name: 'Clefairy', region: 'kanto', baseCatchRate: 150 },
  { id: 37, name: 'Vulpix', region: 'kanto', baseCatchRate: 190 },
  { id: 39, name: 'Jigglypuff', region: 'kanto', baseCatchRate: 170 },
  { id: 41, name: 'Zubat', region: 'kanto', baseCatchRate: 255 },
  { id: 43, name: 'Oddish', region: 'kanto', baseCatchRate: 255 },
  { id: 46, name: 'Paras', region: 'kanto', baseCatchRate: 190 },
  { id: 48, name: 'Venonat', region: 'kanto', baseCatchRate: 190 },
  { id: 50, name: 'Diglett', region: 'kanto', baseCatchRate: 255 },
  // Mid-rarity
  { id: 52, name: 'Meowth', region: 'kanto', baseCatchRate: 255 },
  { id: 54, name: 'Psyduck', region: 'kanto', baseCatchRate: 190 },
  { id: 56, name: 'Mankey', region: 'kanto', baseCatchRate: 190 },
  { id: 58, name: 'Growlithe', region: 'kanto', baseCatchRate: 190 },
  { id: 60, name: 'Poliwag', region: 'kanto', baseCatchRate: 255 },
  { id: 63, name: 'Abra', region: 'kanto', baseCatchRate: 200 },
  { id: 66, name: 'Machop', region: 'kanto', baseCatchRate: 180 },
  { id: 69, name: 'Bellsprout', region: 'kanto', baseCatchRate: 255 },
  { id: 72, name: 'Tentacool', region: 'kanto', baseCatchRate: 190 },
  { id: 74, name: 'Geodude', region: 'kanto', baseCatchRate: 255 },
  { id: 77, name: 'Ponyta', region: 'kanto', baseCatchRate: 190 },
  { id: 79, name: 'Slowpoke', region: 'kanto', baseCatchRate: 190 },
  { id: 81, name: 'Magnemite', region: 'kanto', baseCatchRate: 190 },
  { id: 84, name: 'Doduo', region: 'kanto', baseCatchRate: 190 },
  { id: 86, name: 'Seel', region: 'kanto', baseCatchRate: 190 },
  { id: 88, name: 'Grimer', region: 'kanto', baseCatchRate: 190 },
  { id: 90, name: 'Shellder', region: 'kanto', baseCatchRate: 190 },
  { id: 92, name: 'Gastly', region: 'kanto', baseCatchRate: 190 },
  // Rarer encounters
  { id: 96, name: 'Drowzee', region: 'kanto', baseCatchRate: 190 },
  { id: 98, name: 'Krabby', region: 'kanto', baseCatchRate: 225 },
  { id: 100, name: 'Voltorb', region: 'kanto', baseCatchRate: 190 },
  { id: 102, name: 'Exeggcute', region: 'kanto', baseCatchRate: 90 },
  { id: 104, name: 'Cubone', region: 'kanto', baseCatchRate: 190 },
  { id: 109, name: 'Koffing', region: 'kanto', baseCatchRate: 190 },
  { id: 111, name: 'Rhyhorn', region: 'kanto', baseCatchRate: 120 },
  { id: 116, name: 'Horsea', region: 'kanto', baseCatchRate: 225 },
  { id: 118, name: 'Goldeen', region: 'kanto', baseCatchRate: 225 },
  { id: 120, name: 'Staryu', region: 'kanto', baseCatchRate: 225 },
  // Special
  { id: 129, name: 'Magikarp', region: 'kanto', baseCatchRate: 255 },
]

// Función para generar nivel y HP simple
function generateLevel() {
  return Math.floor(Math.random() * 10) + 3; // nivel 3–12
}

function generateHp(level: number) {
  const base = 20 + level * 3;
  return base;
}

/**
 * Get Pokemon data by ID from local cache
 * @param id - Pokemon ID
 * @returns Pokemon data or undefined if not in whitelist
 */
function getPokemonDataById(id: number) {
  return POKEMON_DATA.find(p => p.id === id)
}

/**
 * Retorna un Pokémon de la región dada.
 * Si no se coloca región, retorna cualquiera.
 *
 * @deprecated For full PokéAPI data, use useEncounterStore instead
 */
export function generateRandomPokemon(region?: string): GeneratedPokemon | null {
  let pool = POKEMON_DATA;

  if (region) {
    pool = pool.filter(p => p.region.toLowerCase() === region.toLowerCase());
  }

  // Si se especificó región y no hay coincidencias, retornar null
  if (pool.length === 0) return null;

  const base = pool[Math.floor(Math.random() * pool.length)];
  if (!base) return null;

  const level = generateLevel();
  const hp = generateHp(level);

  // Generate sprite URL using PokéAPI format
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${base.id}.png`

  return {
    id: base.id,
    name: base.name,
    region: base.region,
    sprite,
    level,
    maxHp: hp,
    currentHp: hp,
    baseCatchRate: base.baseCatchRate
  };
}

/**
 * Generate a random Pokemon from the encounter whitelist
 * Uses the full 50-Pokemon pool from Feature 007
 *
 * @returns GeneratedPokemon from whitelist, or fallback Pikachu
 */
export function generateRandomEncounter(): GeneratedPokemon {
  const randomId = getRandomEncounterId()
  const data = getPokemonDataById(randomId)

  // Fallback to Pikachu if ID not found
  if (!data) {
    const level = generateLevel()
    const hp = generateHp(level)
    return {
      id: 25,
      name: 'Pikachu',
      region: 'kanto',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      level,
      maxHp: hp,
      currentHp: hp,
      baseCatchRate: 190,
    }
  }

  const level = generateLevel()
  const hp = generateHp(level)
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`

  return {
    id: data.id,
    name: data.name,
    region: data.region,
    sprite,
    level,
    maxHp: hp,
    currentHp: hp,
    baseCatchRate: data.baseCatchRate,
  }
}

/**
 * Get the total number of encounterable Pokémon
 * @returns Number of Pokémon in the encounter pool
 */
export function getEncounterPoolSize(): number {
  return ENCOUNTER_WHITELIST.length
}
