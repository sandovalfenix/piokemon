import type { Pokemon } from '../engine/entities'
import type { Rng } from '../calc/rng'

export interface AIContext {
  attacker: Pokemon
  defender: Pokemon
  rng: Rng
}

export interface AI {
  chooseMove(ctx: AIContext): string // Returns move ID
}
