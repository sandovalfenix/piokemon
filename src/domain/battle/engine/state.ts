import type { BattleState, Pokemon } from './entities'

/**
 * Crear el estado inicial de una batalla
 * @param playerTeam - Equipo del jugador
 * @param npcTeam - Equipo del entrenador rival
 * @returns Estado inicial de la batalla
 */
export function createInitialState(playerTeam: Pokemon[], npcTeam: Pokemon[]): BattleState {
  return {
    turn: 1,
    phase: 'select',
    player: playerTeam[0]!,
    npc: npcTeam[0]!,
    playerTeam,
    npcTeam,
    currentPlayerIndex: 0,
    currentNpcIndex: 0,
    winner: null,
    log: [],
  }
}
