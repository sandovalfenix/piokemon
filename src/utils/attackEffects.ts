/**
 * Efectos visuales de ataque según el tipo de Pokémon
 */

export type AttackEffectType = 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'normal' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export interface AttackEffect {
  animation: string
  color: string
  particles?: string
  duration: number
}

export const ATTACK_EFFECTS: Record<AttackEffectType, AttackEffect> = {
  fire: {
    animation: 'attackFire',
    color: '#ff6b35',
    particles: 'fire',
    duration: 600,
  },
  water: {
    animation: 'attackWater',
    color: '#0077be',
    particles: 'water',
    duration: 600,
  },
  electric: {
    animation: 'attackElectric',
    color: '#ffdc00',
    particles: 'electric',
    duration: 500,
  },
  grass: {
    animation: 'attackGrass',
    color: '#52b788',
    particles: 'grass',
    duration: 600,
  },
  ice: {
    animation: 'attackIce',
    color: '#a8dadc',
    particles: 'ice',
    duration: 600,
  },
  normal: {
    animation: 'attackNormal',
    color: '#a9a9a9',
    particles: 'normal',
    duration: 400,
  },
  fighting: {
    animation: 'attackFighting',
    color: '#d62828',
    particles: 'fighting',
    duration: 500,
  },
  poison: {
    animation: 'attackPoison',
    color: '#9d4edd',
    particles: 'poison',
    duration: 600,
  },
  ground: {
    animation: 'attackGround',
    color: '#8b7355',
    particles: 'ground',
    duration: 600,
  },
  flying: {
    animation: 'attackFlying',
    color: '#90e0ef',
    particles: 'flying',
    duration: 500,
  },
  psychic: {
    animation: 'attackPsychic',
    color: '#f72585',
    particles: 'psychic',
    duration: 600,
  },
  bug: {
    animation: 'attackBug',
    color: '#7cb342',
    particles: 'bug',
    duration: 500,
  },
  rock: {
    animation: 'attackRock',
    color: '#6d4c41',
    particles: 'rock',
    duration: 600,
  },
  ghost: {
    animation: 'attackGhost',
    color: '#7851a9',
    particles: 'ghost',
    duration: 600,
  },
  dragon: {
    animation: 'attackDragon',
    color: '#ff006e',
    particles: 'dragon',
    duration: 600,
  },
  dark: {
    animation: 'attackDark',
    color: '#264653',
    particles: 'dark',
    duration: 500,
  },
  steel: {
    animation: 'attackSteel',
    color: '#c0c0c0',
    particles: 'steel',
    duration: 500,
  },
  fairy: {
    animation: 'attackFairy',
    color: '#f1a6ff',
    particles: 'fairy',
    duration: 600,
  },
}

/**
 * Obtener efecto de ataque según tipo
 */
export function getAttackEffect(type: string): AttackEffect {
  const normalizedType = type.toLowerCase() as AttackEffectType
  return ATTACK_EFFECTS[normalizedType] || ATTACK_EFFECTS.normal
}
