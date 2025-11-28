export interface Move {
  name: string
  type: PokemonType
  pp: number
  maxPp: number
  power: number
  accuracy: number
}

export interface Pokemon {
  id: number
  name: string
  level: number
  currentHp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  sprite: string
  spriteBack?: string
  moves: Move[]
  exp: number
  expToNext: number
  type: PokemonType[]
}

export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' 
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export type BattleAction = 'fight' | 'bag' | 'pokemon' | 'run'