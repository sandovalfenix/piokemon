/**
 * Team Builder Services Barrel Export
 * Feature: 003-pokemon-team-builder
 * Updated: 005-battle-fixes-status-moves
 */

// PokeAPI types and validation
export type {
  PokeAPIResponse,
  PokeAPIMoveResponse,
  PokeAPIPokemonListResponse,
} from './types'
export { isPokeAPIResponse, isPokeAPIMoveResponse, extractIdFromUrl } from './types'

// Pokemon service
export {
  transformPokeAPIToPokemon,
  fetchPokemon,
  fetchPokemonList,
  fetchPokemonBatch,
  transformTeamMemberToBattlePokemon,
} from './pokemonService'

// Move service
export type { MoveWithEffect } from './moveService'
export {
  transformPokeAPIToMove,
  fetchMove,
  fetchMovesBatch,
  fetchMoveByName,
} from './moveService'

// Move effect service (Feature 005)
export {
  extractMoveEffect,
  hasMoveEffect,
  getEffectDescription,
  createMoveWithEffect,
} from './moveEffectService'

// Team cache
export {
  saveTeamToLocalStorage,
  loadTeamFromLocalStorage,
  clearTeamFromLocalStorage,
  hasTeamInLocalStorage,
} from './teamCache'

// Starter service
export {
  GEN1_STARTERS,
  STARTER_INFO,
  fetchStarterPokemon,
  getStarterInfo,
} from './starterService'
export type { StarterName, StarterInfo } from './starterService'
