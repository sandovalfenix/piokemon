import type { BattleState, Pokemon } from './entities'

export function createInitialState(player: Pokemon, npc: Pokemon): BattleState {
  return {
    turn: 1,
    phase: 'select',
    player,
    npc,
    winner: null,
    log: [],
  }
}
