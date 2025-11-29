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
