import type { Pokemon } from '@/domain/battle/engine/entities'
import { MOVES } from './moves'


export const SAMPLE_NPC: Pokemon = {
  id: 'n1',
  name: 'Wartortle',
  types: ['Water'],
  level: 5,
  stats: { hp: 1000, atk: 2, def: 100, spAtk: 24, spDef: 100, speed: 58 },
  currentHp: 118,
  moves: [MOVES[0]!, MOVES[2]!],
}
