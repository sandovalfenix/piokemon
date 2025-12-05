/**
 * Pokemon Hydration Service
 * Feature: 006-battle-module-update (Clarification: Lobby Flow Refactor)
 *
 * Fetches real Pokemon data from PokéAPI and caches results.
 * Converts ID-only team configurations into full Pokemon objects with stats/moves.
 */

import type { Pokemon, Move, Type, Category } from '@/domain/battle/engine/entities'

// =============================================================================
// Types
// =============================================================================

export interface PokemonIdEntry {
  pokemonId: number
  level: number
}

interface CachedPokemonData {
  baseStats: {
    hp: number
    atk: number
    def: number
    spAtk: number
    spDef: number
    speed: number
  }
  types: Type[]
  name: string
  moves: CachedMoveData[]
}

interface CachedMoveData {
  id: string
  name: string
  type: Type
  power: number
  accuracy: number
  category: Category
  learnLevel: number
}

interface PokeAPIPokemonResponse {
  id: number
  name: string
  types: { type: { name: string } }[]
  stats: { stat: { name: string }; base_stat: number }[]
  moves: {
    move: { name: string; url: string }
    version_group_details: {
      level_learned_at: number
      move_learn_method: { name: string }
    }[]
  }[]
}

interface PokeAPIMoveResponse {
  id: number
  name: string
  type: { name: string }
  power: number | null
  accuracy: number | null
  damage_class: { name: string }
}

// =============================================================================
// Cache (Memory + LocalStorage)
// =============================================================================

const CACHE_KEY = 'pokeapi-pokemon-cache'
const CACHE_VERSION = '1.0'

interface CacheStore {
  version: string
  pokemon: Record<number, CachedPokemonData>
  moves: Record<string, CachedMoveData>
}

let memoryCache: CacheStore = {
  version: CACHE_VERSION,
  pokemon: {},
  moves: {},
}

/**
 * Load cache from LocalStorage
 */
function loadCache(): void {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as CacheStore
      if (parsed.version === CACHE_VERSION) {
        memoryCache = parsed
        console.log('[PokemonHydration] Cache loaded from LocalStorage')
      }
    }
  } catch (error) {
    console.warn('[PokemonHydration] Failed to load cache:', error)
  }
}

/**
 * Save cache to LocalStorage
 */
function saveCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache))
  } catch (error) {
    console.warn('[PokemonHydration] Failed to save cache:', error)
  }
}

// Initialize cache on module load
loadCache()

// =============================================================================
// Type Mapping
// =============================================================================

const TYPE_MAP: Record<string, Type> = {
  normal: 'Normal',
  fire: 'Fire',
  water: 'Water',
  electric: 'Electric',
  grass: 'Grass',
  ice: 'Ice',
  fighting: 'Fighting',
  poison: 'Poison',
  ground: 'Ground',
  flying: 'Flying',
  psychic: 'Psychic',
  bug: 'Bug',
  rock: 'Rock',
  ghost: 'Ghost',
  dragon: 'Dragon',
  dark: 'Dark',
  steel: 'Steel',
  fairy: 'Fairy',
}

const CATEGORY_MAP: Record<string, Category> = {
  physical: 'physical',
  special: 'special',
  status: 'status',
}

// =============================================================================
// API Fetching
// =============================================================================

/**
 * Fetch Pokemon data from PokéAPI with retry logic
 */
async function fetchPokemonFromAPI(pokemonId: number): Promise<PokeAPIPokemonResponse> {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      lastError = error as Error
      console.warn(`[PokemonHydration] Attempt ${attempt}/${maxRetries} failed for Pokemon ${pokemonId}:`, error)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw new Error(`Failed to fetch Pokemon ${pokemonId} after ${maxRetries} attempts: ${lastError?.message}`)
}

/**
 * Fetch Move data from PokéAPI
 */
async function fetchMoveFromAPI(moveUrl: string): Promise<PokeAPIMoveResponse> {
  const response = await fetch(moveUrl)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return await response.json()
}

// =============================================================================
// Data Processing
// =============================================================================

/**
 * Process raw API response into cached format
 */
async function processPokemonData(apiData: PokeAPIPokemonResponse): Promise<CachedPokemonData> {
  // Extract base stats
  const statMap: Record<string, number> = {}
  for (const stat of apiData.stats) {
    statMap[stat.stat.name] = stat.base_stat
  }

  // Extract types
  const types = apiData.types.map(t => TYPE_MAP[t.type.name] ?? 'Normal') as Type[]

  // Get level-up moves (non-status, with power)
  const levelUpMoves = apiData.moves.filter(m => {
    const levelUpDetail = m.version_group_details.find(
      d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
    )
    return levelUpDetail !== undefined
  })

  // Fetch move details (limit to first 20 to avoid rate limiting)
  const movesToFetch = levelUpMoves.slice(0, 20)
  const moveDetails: CachedMoveData[] = []

  for (const moveEntry of movesToFetch) {
    const levelDetail = moveEntry.version_group_details.find(
      d => d.move_learn_method.name === 'level-up'
    )
    if (!levelDetail) continue

    try {
      // Check cache first
      const moveId = moveEntry.move.name
      if (memoryCache.moves[moveId]) {
        moveDetails.push({
          ...memoryCache.moves[moveId]!,
          learnLevel: levelDetail.level_learned_at,
        })
        continue
      }

      // Fetch from API
      const moveData = await fetchMoveFromAPI(moveEntry.move.url)

      // Skip status moves and moves without power
      if (moveData.damage_class.name === 'status' || !moveData.power) {
        continue
      }

      const cachedMove: CachedMoveData = {
        id: moveData.name,
        name: formatMoveName(moveData.name),
        type: TYPE_MAP[moveData.type.name] ?? 'Normal',
        power: moveData.power ?? 0,
        accuracy: moveData.accuracy ?? 100,
        category: CATEGORY_MAP[moveData.damage_class.name] ?? 'physical',
        learnLevel: levelDetail.level_learned_at,
      }

      memoryCache.moves[moveId] = cachedMove
      moveDetails.push(cachedMove)
    } catch (error) {
      console.warn(`[PokemonHydration] Failed to fetch move ${moveEntry.move.name}:`, error)
    }
  }

  return {
    name: formatPokemonName(apiData.name),
    types,
    baseStats: {
      hp: statMap['hp'] ?? 50,
      atk: statMap['attack'] ?? 50,
      def: statMap['defense'] ?? 50,
      spAtk: statMap['special-attack'] ?? 50,
      spDef: statMap['special-defense'] ?? 50,
      speed: statMap['speed'] ?? 50,
    },
    moves: moveDetails,
  }
}

/**
 * Format Pokemon name (capitalize first letter)
 */
function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Format move name (capitalize and replace hyphens)
 */
function formatMoveName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Calculate stats for a specific level using Gen III+ formula
 * IVs = 0, EVs = 0 per spec (no IV/EV system in this game)
 */
function calculateStatsForLevel(
  baseStats: CachedPokemonData['baseStats'],
  level: number
): Pokemon['stats'] {
  // IVs and EVs are 0 per spec (no IV/EV system)
  const iv = 0
  const ev = 0

  // HP = floor((2 * base + IV + floor(EV/4)) * level / 100) + level + 10
  const calcHp = (base: number) =>
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10

  // Other stats = floor((2 * base + IV + floor(EV/4)) * level / 100) + 5
  const calcStat = (base: number) =>
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5

  return {
    hp: calcHp(baseStats.hp),
    atk: calcStat(baseStats.atk),
    def: calcStat(baseStats.def),
    spAtk: calcStat(baseStats.spAtk),
    spDef: calcStat(baseStats.spDef),
    speed: calcStat(baseStats.speed),
  }
}

/**
 * Select 4 random moves from available pool (filtered by level)
 */
function selectMoves(allMoves: CachedMoveData[], pokemonLevel: number): Move[] {
  // Filter moves by learn level (must be <= Pokemon's level)
  const availableMoves = allMoves.filter(m => m.learnLevel <= pokemonLevel)

  if (availableMoves.length === 0) {
    // Fallback: use Tackle if no moves available
    return [{
      id: 'tackle',
      name: 'Tackle',
      type: 'Normal',
      power: 40,
      accuracy: 100,
      category: 'physical',
    }]
  }

  // Shuffle and pick up to 4
  const shuffled = [...availableMoves].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 4)

  return selected.map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    power: m.power,
    accuracy: m.accuracy,
    category: m.category,
  }))
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Hydrate a single Pokemon from ID + Level
 * Fetches data from PokéAPI (cached) and returns a full Pokemon object
 */
export async function hydratePokemon(entry: PokemonIdEntry): Promise<Pokemon> {
  const { pokemonId, level } = entry

  // Check memory cache
  let cachedData = memoryCache.pokemon[pokemonId]

  if (!cachedData) {
    // Fetch from API
    console.log(`[PokemonHydration] Fetching Pokemon ${pokemonId} from PokéAPI...`)
    const apiData = await fetchPokemonFromAPI(pokemonId)
    cachedData = await processPokemonData(apiData)

    // Store in cache
    memoryCache.pokemon[pokemonId] = cachedData
    saveCache()
    console.log(`[PokemonHydration] Cached Pokemon ${cachedData.name}`)
  }

  // Build Pokemon object
  const stats = calculateStatsForLevel(cachedData.baseStats, level)
  const moves = selectMoves(cachedData.moves, level)

  return {
    id: `pokemon-${pokemonId}-${Date.now()}`,
    name: cachedData.name,
    types: cachedData.types,
    level,
    stats,
    currentHp: stats.hp,
    moves,
  }
}

/**
 * Hydrate a full team from ID-only entries
 */
export async function hydrateTeam(entries: PokemonIdEntry[]): Promise<Pokemon[]> {
  const team: Pokemon[] = []

  for (const entry of entries) {
    try {
      const pokemon = await hydratePokemon(entry)
      team.push(pokemon)
    } catch (error) {
      console.error(`[PokemonHydration] Failed to hydrate Pokemon ${entry.pokemonId}:`, error)
      throw error // Re-throw to trigger error UI
    }
  }

  return team
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  memoryCache = {
    version: CACHE_VERSION,
    pokemon: {},
    moves: {},
  }
  localStorage.removeItem(CACHE_KEY)
  console.log('[PokemonHydration] Cache cleared')
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { pokemonCount: number; moveCount: number } {
  return {
    pokemonCount: Object.keys(memoryCache.pokemon).length,
    moveCount: Object.keys(memoryCache.moves).length,
  }
}

// =============================================================================
// Wild Encounter API (Feature: 007-wild-encounter-capture)
// =============================================================================

/**
 * Data needed for wild encounter display
 */
export interface WildPokemonData {
  id: number
  name: string
  types: string[]
  sprite: string
  stats: {
    hp: number
    attack: number
    defense: number
    spAttack: number
    spDefense: number
    speed: number
  }
}

/**
 * Fetch Pokemon data for wild encounter (minimal data, fast)
 * Only fetches what's needed for capture: name, types, sprite, base stats
 * Does NOT fetch moves (not needed for capture)
 *
 * @param pokemonId - PokéAPI Pokemon ID
 * @returns WildPokemonData for encounter display
 */
export async function fetchWildPokemon(pokemonId: number): Promise<WildPokemonData> {
  // Check memory cache first
  const cached = memoryCache.pokemon[pokemonId]

  if (cached) {
    console.log(`[PokemonHydration] Using cached data for Pokemon ${pokemonId}`)
    return {
      id: pokemonId,
      name: cached.name,
      types: cached.types,
      sprite: getOfficialArtwork(pokemonId),
      stats: {
        hp: cached.baseStats.hp,
        attack: cached.baseStats.atk,
        defense: cached.baseStats.def,
        spAttack: cached.baseStats.spAtk,
        spDefense: cached.baseStats.spDef,
        speed: cached.baseStats.speed,
      },
    }
  }

  // Fetch from API
  console.log(`[PokemonHydration] Fetching wild Pokemon ${pokemonId} from PokéAPI...`)
  const apiData = await fetchPokemonFromAPI(pokemonId)

  // Extract base stats
  const statMap: Record<string, number> = {}
  for (const stat of apiData.stats) {
    statMap[stat.stat.name] = stat.base_stat
  }

  // Extract types
  const types = apiData.types.map(t => TYPE_MAP[t.type.name] ?? 'Normal')

  // Cache the base data (without moves for now)
  const cachedData: CachedPokemonData = {
    name: formatPokemonName(apiData.name),
    types: types as Type[],
    baseStats: {
      hp: statMap['hp'] ?? 50,
      atk: statMap['attack'] ?? 50,
      def: statMap['defense'] ?? 50,
      spAtk: statMap['special-attack'] ?? 50,
      spDef: statMap['special-defense'] ?? 50,
      speed: statMap['speed'] ?? 50,
    },
    moves: [], // Moves not needed for wild encounters
  }

  memoryCache.pokemon[pokemonId] = cachedData
  saveCache()

  return {
    id: pokemonId,
    name: cachedData.name,
    types: types,
    sprite: getOfficialArtwork(pokemonId),
    stats: {
      hp: cachedData.baseStats.hp,
      attack: cachedData.baseStats.atk,
      defense: cachedData.baseStats.def,
      spAttack: cachedData.baseStats.spAtk,
      spDefense: cachedData.baseStats.spDef,
      speed: cachedData.baseStats.speed,
    },
  }
}

/**
 * Get official artwork URL for a Pokemon
 * Uses the official-artwork sprites from PokéAPI
 */
function getOfficialArtwork(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
}
