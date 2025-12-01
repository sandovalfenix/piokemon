import type { Pokemon } from '@/domain/battle/engine/entities'
import { MOVES } from './moves'

export const SAMPLE_PLAYER: Pokemon = {
  id: 'p1',
  name: 'Charmeleon',
  types: ['Fire'],
  level: 30,
  stats: { hp: 120, atk: 64, def: 58, spAtk: 80, spDef: 65, speed: 80 },
  currentHp: 120,
  moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
}

export const SAMPLE_NPC: Pokemon = {
  id: 'n1',
  name: 'Wartortle',
  types: ['Water'],
  level: 30,
  stats: { hp: 118, atk: 63, def: 80, spAtk: 65, spDef: 80, speed: 58 },
  currentHp: 118,
  moves: [MOVES[0]!, MOVES[2]!],
}

// Equipo de ejemplo del jugador - 6 Pokémon
export const PLAYER_TEAM: Pokemon[] = [
  SAMPLE_PLAYER, // Charmeleon (ID: p1)
  {
    id: 'p2',
    name: 'Pikachu',
    types: ['Electric'],
    level: 28,
    stats: { hp: 95, atk: 55, def: 40, spAtk: 50, spDef: 50, speed: 90 },
    currentHp: 95,
    moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
  },
  {
    id: 'p3',
    name: 'Bulbasaur',
    types: ['Grass', 'Poison'],
    level: 28,
    stats: { hp: 110, atk: 55, def: 48, spAtk: 65, spDef: 65, speed: 45 },
    currentHp: 110,
    moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
  },
  {
    id: 'p4',
    name: 'Squirtle',
    types: ['Water'],
    level: 28,
    stats: { hp: 110, atk: 48, def: 65, spAtk: 50, spDef: 64, speed: 43 },
    currentHp: 110,
    moves: [MOVES[0]!, MOVES[2]!, MOVES[3]!, MOVES[1]!],
  },
  {
    id: 'p5',
    name: 'Geodude',
    types: ['Rock', 'Ground'],
    level: 27,
    stats: { hp: 100, atk: 120, def: 100, spAtk: 55, spDef: 65, speed: 35 },
    currentHp: 100,
    moves: [MOVES[1]!, MOVES[2]!, MOVES[3]!, MOVES[0]!],
  },
  {
    id: 'p6',
    name: 'Dragonair',
    types: ['Dragon'],
    level: 30,
    stats: { hp: 120, atk: 84, def: 65, spAtk: 70, spDef: 70, speed: 70 },
    currentHp: 120,
    moves: [MOVES[0]!, MOVES[1]!, MOVES[2]!, MOVES[3]!],
  },
]
