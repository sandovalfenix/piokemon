/**
 * Pokemon Sprite URL Builder
 * Uses PokemonShowdown sprites (animated GIFs) as primary source
 */

import { normalizePokemonName } from './spriteNormalizer'

const POKEMONSHOWDOWN_BASE_URL = 'https://play.pokemonshowdown.com/sprites'

/**
 * Construye la URL del sprite frontal animado de un Pokémon desde PokemonShowdown
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu", "Mr. Mime")
 * @returns URL de la imagen GIF animada desde PokemonShowdown
 */
export function getPokemonFrontSpriteUrl(pokemonName: string): string {
  const normalizedName = normalizePokemonName(pokemonName)
  return `${POKEMONSHOWDOWN_BASE_URL}/ani/${normalizedName}.gif`
}

/**
 * Construye la URL del sprite trasero animado de un Pokémon desde PokemonShowdown
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu", "Mr. Mime")
 * @returns URL de la imagen GIF animada desde PokemonShowdown
 */
export function getPokemonBackSpriteUrl(pokemonName: string): string {
  const normalizedName = normalizePokemonName(pokemonName)
  return `${POKEMONSHOWDOWN_BASE_URL}/ani-back/${normalizedName}.gif`
}

/**
 * Construye la URL del sprite de un Pokémon (frontal animado)
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL de la imagen GIF animada desde PokemonShowdown
 */
export function getPokemonSpriteUrl(pokemonName: string): string {
  return getPokemonFrontSpriteUrl(pokemonName)
}

/**
 * Construye la URL del sprite estático de un Pokémon desde PokemonShowdown
 * Usado como fallback cuando el GIF animado no está disponible
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL de la imagen PNG desde PokemonShowdown
 */
export function getPokemonStaticSpriteUrl(pokemonName: string): string {
  const normalizedName = normalizePokemonName(pokemonName)
  return `${POKEMONSHOWDOWN_BASE_URL}/dex/${normalizedName}.png`
}

/**
 * Construye la URL del artwork oficial de un Pokémon desde PokemonShowdown
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL del artwork desde PokemonShowdown (dex sprite)
 */
export function getPokemonOfficialArtworkUrl(pokemonName: string): string {
  return getPokemonStaticSpriteUrl(pokemonName)
}
