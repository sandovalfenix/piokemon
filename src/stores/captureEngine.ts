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
function calculateCaptureChance(pokemon: GeneratedPokemon, pokeballType: string, status?: string) {
  const ball = BALL_MODIFIERS[pokeballType] ?? 1;

  if (ball >= 255) return 1; // Master Ball

  const { maxHp, currentHp, baseCatchRate } = pokemon;

  // Estado que ayuda a la captura (sleep/freeze más efectivo que paralisis/poison/burn)
  const STATUS_MULTIPLIERS: Record<string, number> = {
    sleep: 2.5,
    freeze: 2.5,
    paralysis: 1.5,
    poison: 1.5,
    burn: 1.5,
    none: 1
  };

  const statusKey = (status ?? 'none').toLowerCase();
  const statusMultiplier = STATUS_MULTIPLIERS[statusKey] ?? 1;

  // Fórmula estilo Pokémon (simplificada): baja vida -> mayor a
  let a = ((3 * maxHp - 2 * currentHp) * baseCatchRate * ball) / (3 * maxHp);

  // Aplicar multiplicador por estado
  a = a * statusMultiplier;

  // Clamp to [1,255]
  if (a > 255) a = 255;
  if (a < 1) a = 1;

  // Probabilidad base (0..1)
  const chance = a / 255;

  return chance;
}

function calculateShakes(prob: number) {
  // Versión simplificada y coherente: cada sacudida ocurre con probabilidad 'prob'.
  // Se realizan hasta 4 comprobaciones (3 sacudidas + captura final equivalente a 4).
  let shakes = 0;
  for (let i = 0; i < 4; i++) {
    if (Math.random() < prob) {
      shakes++;
    } else {
      break;
    }
  }
  return shakes; // 0..4 (4 indica captura completa)
}

/**
 * Intentar captura. Devuelve:
 *  - success: boolean
 *  - shakes: número de sacudidas (0–3)
 */
export function attemptCapture(pokemon: GeneratedPokemon, pokeballType: string, status?: string) {
  // Master Ball shortcut
  if (pokeballType === 'masterball') {
    return { success: true, shakes: 4 };
  }

  const chance = calculateCaptureChance(pokemon, pokeballType, status);

  const shakes = calculateShakes(chance);
  const success = shakes >= 4 || Math.random() < chance;

  // Normalizamos shakes a 0..3 para compatibilidad con UI que espera 0-3
  return { success, shakes: Math.min(shakes, 3) };
}
