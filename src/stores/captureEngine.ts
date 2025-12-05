// captureEngine.ts

import type { GeneratedPokemon } from "./pokemonGenerator";

// Multiplicadores de pokébolas
const BALL_MODIFIERS: Record<string, number> = {
  pokeball: 1,
  superball: 1.75,
  ultraball: 2.5,
  masterball: 255 // captura garantizada
};

/**
 * Fórmula estilo Pokémon Gen 3 simplificada:
 * https://bulbapedia.bulbagarden.net/wiki/Catch_rate
 */
function calculateCaptureChance(pokemon: GeneratedPokemon, pokeballType: string) {
  const ball = BALL_MODIFIERS[pokeballType] ?? 1;

  if (ball >= 255) return 1; // Master Ball

  const { maxHp, currentHp, baseCatchRate } = pokemon;

  let a =
    ((3 * maxHp - 2 * currentHp) * baseCatchRate * ball * 1.5) /
    (3 * maxHp);

  a = Math.max(1, Math.min(a, 255));
  let chance = a / 255;

  if (chance < 0.2) chance = 0.2; // mínimo 20%

  return chance;
}

function calculateShakes(prob: number) {
  const thresholds = [0.15, 0.33, 0.55, 0.80];
  let shakes = 0;

  for (const t of thresholds) {
    const roll = Math.random();
    if (prob > roll * t) {
      shakes++;
    } else {
      break;
    }
  }

  return shakes;
}

/**
 * Intentar captura. Devuelve:
 *  - success: boolean
 *  - shakes: número de sacudidas (0–3)
 */
export function attemptCapture(pokemon: GeneratedPokemon, pokeballType: string) {
  const chance = calculateCaptureChance(pokemon, pokeballType);

  if (pokeballType === 'masterball') {
    return { success: true, shakes: 3 };
  }

  const shakes = calculateShakes(chance);
  const success = shakes >= 3;

  return {
    success,
    shakes: Math.min(shakes, 3)
  };
}