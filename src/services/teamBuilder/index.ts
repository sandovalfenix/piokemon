/**
 * Team Builder Services Barrel Export
 * Feature: 003-pokemon-team-builder
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
export {
  transformPokeAPIToMove,
  fetchMove,
  fetchMovesBatch,
} from './moveService'

// Team cache
export {
  saveTeamToLocalStorage,
  loadTeamFromLocalStorage,
  clearTeamFromLocalStorage,
  hasTeamInLocalStorage,
} from './teamCache'
