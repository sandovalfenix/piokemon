// captureEngine.ts

import type { GeneratedPokemon } from "./pokemonGenerator";

// Multiplicadores de pokébolas
const BALL_MODIFIERS: Record<string, number> = {
  pokeball: 1,
  superball: 1.5,
  ultraball: 2,
  masterball: 255 // captura garantizada
};

/**
 * Fórmula estilo Pokémon Gen 3 simplificada:
 * https://bulbapedia.bulbagarden.net/wiki/Catch_rate
 *
 * catchChance ≈ (((3 * maxHP - 2 * currentHP) * baseCatchRate * ball) / (3 * maxHP))
 */
function calculateCaptureChance(pokemon: GeneratedPokemon, pokeballType: string) {
  const ball = BALL_MODIFIERS[pokeballType] ?? 1;

  if (ball >= 255) return 1; // Master Ball

  const { maxHp, currentHp, baseCatchRate } = pokemon;

  let a =
    ((3 * maxHp - 2 * currentHp) * baseCatchRate * ball) /
    (3 * maxHp);

  // Clamp to max 255 (como en los juegos)
  if (a > 255) a = 255;
  if (a < 1) a = 1;

  // Convertimos a probabilidad real:
  const chance = a / 255;

  return chance;
}

function calculateShakes(prob: number) {
  // Cada “shake” tiene que superar una barrera como en el juego real
  // simplificado: a mayor probabilidad → más shakes

  const thresholds = [
    0.15, // shake 1
    0.33, // shake 2
    0.55, // shake 3
    0.80  // captura
  ];

  let shakes = 0;

  for (const t of thresholds) {
    if (prob > Math.random() * t) {
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

  // Master Ball check
  if (pokeballType === 'masterball') {
    return { success: true, shakes: 3 };
  }

  const shakes = calculateShakes(chance);
  const success = shakes === 4 || Math.random() < chance;

  return { success, shakes: Math.min(shakes, 3) };
}
