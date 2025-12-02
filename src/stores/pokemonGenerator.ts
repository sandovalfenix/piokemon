// pokemonGenerator.ts

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

// Lista temporal mientras no exista BD
const POKEMON_DATA = [
  // Kanto
  { id: 1, name: 'Bulbasaur', region: 'kanto', sprite: 'bulbasaur.png', baseCatchRate: 45 },
  { id: 4, name: 'Charmander', region: 'kanto', sprite: 'charmander.png', baseCatchRate: 45 },
  { id: 7, name: 'Squirtle', region: 'kanto', sprite: 'squirtle.png', baseCatchRate: 45 },

  // Johto
  { id: 152, name: 'Chikorita', region: 'johto', sprite: 'chikorita.png', baseCatchRate: 45 },
  { id: 155, name: 'Cyndaquil', region: 'johto', sprite: 'cyndaquil.png', baseCatchRate: 45 },
  { id: 158, name: 'Totodile', region: 'johto', sprite: 'totodile.png', baseCatchRate: 45 }
];

// Función para generar nivel y HP simple
function generateLevel() {
  return Math.floor(Math.random() * 10) + 3; // nivel 3–12
}

function generateHp(level: number) {
  const base = 20 + level * 3;
  return base;
}

/**
 * Retorna un Pokémon de la región dada.
 * Si no se coloca región, retorna cualquiera.
 */
export function generateRandomPokemon(region?: string): GeneratedPokemon | null {
  let pool = POKEMON_DATA;

  if (region) {
    pool = pool.filter(p => p.region.toLowerCase() === region.toLowerCase());
  }

  // Si se especificó región y no hay coincidencias, retornar null
  if (pool.length === 0) return null;

  const base = pool[Math.floor(Math.random() * pool.length)];
  const level = generateLevel();
  const hp = generateHp(level);

  return {
    id: base.id,
    name: base.name,
    region: base.region,
    sprite: base.sprite,
    level,
    maxHp: hp,
    currentHp: hp,
    baseCatchRate: base.baseCatchRate
  };
}
