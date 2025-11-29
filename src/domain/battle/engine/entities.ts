export type Type =
  | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy'

export type Category = 'physical' | 'special'

export interface Move {
  id: string
  name: string
  type: Type
  power: number
  accuracy: number // 0-100
  category: Category
}

export interface Stats {
  hp: number
  atk: number
  def: number
  spAtk: number
  spDef: number
  speed: number
}

export interface Pokemon {
  id: string
  name: string
  types: Type[]
  level: number
  stats: Stats
  currentHp: number
  moves: Move[]
}

export type Phase = 'select' | 'resolving' | 'ended'

export interface BattleState {
  turn: number
  phase: Phase
  player: Pokemon
  npc: Pokemon
  winner: 'player' | 'npc' | null
  log: string[]
}

export interface TurnResult {
  attacker: 'player' | 'npc'
  moveId: string
  hit: boolean
  damage: number
  effectiveness: 0 | 0.5 | 1 | 2
}
