import type { BattleState, TurnResult, Move, Pokemon } from './entities'
import type { Rng } from '../calc/rng'
import type { AI } from '../ai/types'
import { calculateDamage } from '../calc/damage'
import { computeTypeMultiplier } from '../calc/typeChart'

export function resolveTurn(
  state: BattleState,
  playerMoveId: string,
  rng: Rng,
  ai?: AI,
): TurnResult[] {
  const results: TurnResult[] = []

  const playerMove = state.player.moves.find((m) => m.id === playerMoveId)
  if (!playerMove) return results

  // Determine turn order by speed
  const playerFirst = state.player.stats.speed >= state.npc.stats.speed

  const executeAttack = (
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    attackerLabel: 'player' | 'npc',
  ): TurnResult => {
    // Accuracy check
    const accuracyRoll = rng.next() * 100
    const hit = accuracyRoll <= move.accuracy

    let damage = 0
    let effectiveness: 0 | 0.5 | 1 | 2 = 1

    if (hit) {
      effectiveness = computeTypeMultiplier(
        move.type,
        defender.types.length === 1 ? defender.types[0]! : [defender.types[0]!, defender.types[1]]
      )
      const atk = move.category === 'physical' ? attacker.stats.atk : attacker.stats.spAtk
      const def = move.category === 'physical' ? defender.stats.def : defender.stats.spDef

      damage = calculateDamage({
        level: attacker.level,
        power: move.power,
        atk,
        def,
        category: move.category,
        multiplier: effectiveness,
        rng,
      })

      defender.currentHp = Math.max(0, defender.currentHp - damage)
    }

    return {
      attacker: attackerLabel,
      moveId: move.id,
      hit,
      damage,
      effectiveness,
    }
  }

  if (playerFirst) {
    results.push(executeAttack(state.player, state.npc, playerMove, 'player'))
    if (state.npc.currentHp > 0 && state.npc.moves.length > 0) {
      // Use AI to choose NPC move if provided, otherwise pick first move
      const npcMoveId = ai ? ai.chooseMove({ attacker: state.npc, defender: state.player, rng }) : state.npc.moves[0]!.id
      const npcMove = state.npc.moves.find(m => m.id === npcMoveId) ?? state.npc.moves[0]!
      results.push(executeAttack(state.npc, state.player, npcMove, 'npc'))
    }
  } else {
    if (state.npc.moves.length > 0) {
      // Use AI to choose NPC move if provided, otherwise pick first move
      const npcMoveId = ai ? ai.chooseMove({ attacker: state.npc, defender: state.player, rng }) : state.npc.moves[0]!.id
      const npcMove = state.npc.moves.find(m => m.id === npcMoveId) ?? state.npc.moves[0]!
      results.push(executeAttack(state.npc, state.player, npcMove, 'npc'))
    }
    if (state.player.currentHp > 0) {
      results.push(executeAttack(state.player, state.npc, playerMove, 'player'))
    }
  }

  // Check win/lose
  if (state.player.currentHp <= 0) state.winner = 'npc'
  if (state.npc.currentHp <= 0) state.winner = 'player'

  state.turn++
  state.phase = state.winner ? 'ended' : 'select'

  return results
}
