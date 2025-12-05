/**
 * Team Builder Data Models
 * Feature: 003-pokemon-team-builder
 *
 * TypeScript interfaces for Pokemon Team Builder entities
 */

/**
 * Pokemon type enumeration (18 types)
 */
export type PokemonType =
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Grass'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dragon'
  | 'Dark'
  | 'Steel'
  | 'Fairy'

/**
 * Move category enumeration
 */
export type MoveCategory = 'Physical' | 'Special' | 'Status'

/**
 * Pokemon base stats structure
 */
export interface PokemonStats {
  hp: number // Hit Points (1-255)
  attack: number // Physical attack (1-255)
  defense: number // Physical defense (1-255)
  spAttack: number // Special attack (1-255)
  spDefense: number // Special defense (1-255)
  speed: number // Speed stat (1-255)
}

/**
 * Move reference (minimal data for Pokemon's learnable moves list)
 */
export interface MoveReference {
  id: number // Move ID for fetching details
  name: string // Move name
}

/**
 * Pokemon entity from PokeAPI
 * Represents a Pokemon species with stats and learnable moves
 */
export interface Pokemon {
  id: number // PokeAPI unique identifier
  name: string // Display name (e.g., "Pikachu")
  types: PokemonType[] // 1-2 types
  stats: PokemonStats // Base stats
  sprite: string // Front sprite URL
  moves: MoveReference[] // Learnable moves (id + name only)
}

/**
 * Move entity from PokeAPI
 * Represents a Pokemon move with damage, accuracy, and type information
 */
export interface Move {
  id: number // PokeAPI unique identifier
  name: string // Display name (e.g., "Thunderbolt")
  type: PokemonType // Move type (for type effectiveness)
  power: number | null // Damage value (null for status moves)
  accuracy: number // Hit chance percentage (0-100, 0 = always hit)
  category: MoveCategory // Physical/Special/Status
  pp: number // Power Points (1-64, informational only)
  effect?: string // Brief description (optional)
}

/**
 * Team member entity (user-customized Pokemon)
 * Represents a Pokemon with selected moves ready for battle
 */
export interface TeamMember {
  pokemon: Pokemon // Base Pokemon data
  selectedMoves: Move[] // User-selected moves (1-4)
  level: number // Battle level (default 50)
  currentHp: number // Current HP (initialized to max)
  maxHp: number // Maximum HP (computed from stats + level)
  position: number // Team position (0-5, 0 is lead)
}

/**
 * Team entity (user collection)
 * Collection of TeamMembers representing player's battle roster
 */
export interface Team {
  members: TeamMember[] // Team roster (1-6 Pokemon)
  createdAt: number // Unix timestamp (milliseconds)
  updatedAt: number // Unix timestamp (milliseconds)
  version: number // Schema version for localStorage migration
}

/**
 * Team building state enumeration
 */
export enum TeamBuildingState {
  Empty = 'empty', // No Pokemon in roster
  Building = 'building', // 1-5 Pokemon, can add more
  Full = 'full', // 6 Pokemon, cannot add (can remove/reorder)
  ReadyForBattle = 'ready', // ≥1 Pokemon with ≥1 move each
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}
