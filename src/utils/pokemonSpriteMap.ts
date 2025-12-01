/**
 * Mapeo de nombres de Pokémon a sus IDs de Pokédex
 * Usado para construir URLs de sprites correctamente
 */
export const POKEMON_TO_DEX_ID: Record<string, number> = {
  // Gen 1 - Kanto
  'Charmeleon': 5,
  'Wartortle': 8,
  'Geodude': 74,
  'Onix': 95,
  'Steelix': 208,
  'Staryu': 120,
  'Starmie': 121,
  'Shellder': 90,
  'Cloyster': 91,
  'Voltorb': 100,
  'Electrode': 101,
  'Raichu': 26,
  'Magneton': 82,
  'Exeggcute': 102,
  'Exeggutor': 103,
  'Gloom': 69,
  'Vileplume': 71,
  'Bellossom': 182,
  'Growlithe': 58,
  'Arcanine': 59,
  'Ponyta': 77,
  'Rapidash': 78,
  'Slowbro': 80,
  'Seel': 86,
  'Dewgong': 87,
  'Shellos': 422,
  'Gastrodon': 423,
  'Lapras': 131,
  'Gyarados': 130,
  'Magikarp': 129,
  'Dragonite': 149,
  'Dragonair': 148,
  'Dratini': 147,
  'Arbok': 24,
  'Weezing': 110,
  'Weedle': 13,
  'Kakuna': 14,
  'Beedrill': 15,
  'Pidgeot': 18,
  'Pidgeotto': 17,
  'Pikachu': 25,
  'Charizard': 6,
  'Bulbasaur': 1,
  'Ivysaur': 2,
  'Venusaur': 3,
  'Squirtle': 7,
  'Blastoise': 9,
  'Moltres': 146,
  'Articuno': 144,
  'Zapdos': 145,
  'Mewtwo': 150,
  'Mew': 151,
}

/**
 * Obtiene el ID de Pokédex a partir del nombre del Pokémon
 * Si no se encuentra, retorna un ID de generador para la imagen en escala de grises
 */
export function getPokemonDexId(pokemonName: string): number {
  return POKEMON_TO_DEX_ID[pokemonName] ?? 0
}

/**
 * Construye la URL del sprite frontal de un Pokémon desde PokeAPI
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL de la imagen PNG desde PokeAPI
 */
export function getPokemonFrontSpriteUrl(pokemonName: string): string {
  const dexId = getPokemonDexId(pokemonName)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`
}

/**
 * Construye la URL del sprite trasero de un Pokémon desde PokeAPI
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL de la imagen PNG desde PokeAPI
 */
export function getPokemonBackSpriteUrl(pokemonName: string): string {
  const dexId = getPokemonDexId(pokemonName)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${dexId}.png`
}

/**
 * Construye la URL del sprite de un Pokémon (frontal)
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL de la imagen PNG desde PokeAPI
 */
export function getPokemonSpriteUrl(pokemonName: string): string {
  return getPokemonFrontSpriteUrl(pokemonName)
}

/**
 * Construye la URL del artwork oficial de un Pokémon
 * @param pokemonName - Nombre del Pokémon (ej: "Pikachu")
 * @returns URL del artwork oficial desde PokeAPI
 */
export function getPokemonOfficialArtworkUrl(pokemonName: string): string {
  const dexId = getPokemonDexId(pokemonName)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`
}
