import type { BattleState, TurnResult, Move, Pokemon } from './entities'
import type { Rng } from '../calc/rng'
import type { AI } from '../ai/types'
import { calculateDamage } from '../calc/damage'
import { computeTypeMultiplier } from '../calc/typeChart'
import { applyMoveEffect, type BattlePokemon } from '@/services/battle/battleEffectService'

/**
 * Extended turn result with effect information
 */
export interface ExtendedTurnResult extends TurnResult {
  /** Effect result message if move had an effect */
  effectMessage?: string
  /** Whether the move effect was successfully applied */
  effectApplied?: boolean
}

export function resolveTurn(
  state: BattleState,
  playerMoveId: string,
  rng: Rng,
  ai?: AI,
): ExtendedTurnResult[] {
  const results: ExtendedTurnResult[] = []

  const playerMove = state.player.moves.find((m) => m.id === playerMoveId)
  if (!playerMove) return results

  // Determine turn order by speed
  const playerFirst = state.player.stats.speed >= state.npc.stats.speed

  const executeAttack = (
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    attackerLabel: 'player' | 'npc',
  ): ExtendedTurnResult => {
    // Accuracy check
    const accuracyRoll = rng.next() * 100
    const hit = accuracyRoll <= move.accuracy

    let damage = 0
    let effectiveness: 0 | 0.5 | 1 | 2 = 1
    let effectMessage: string | undefined
    let effectApplied = false

    if (hit) {
      // Handle status moves (no damage, only effects)
      if (move.category === 'status' || move.power === 0) {
        damage = 0
        effectiveness = 1
      } else {
        // Calculate damage for damaging moves
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

      // Apply move effect (stat changes, status conditions) after damage
      // Feature 005: Status moves support via PokeAPI data
      if (move.effect) {
        const effectResult = applyMoveEffect(
          move.effect,
          attacker as BattlePokemon,
          defender as BattlePokemon,
          rng
        )
        if (effectResult.applied) {
          effectMessage = effectResult.message
          effectApplied = true
        }
      }
    }

    return {
      attacker: attackerLabel,
      moveId: move.id,
      hit,
      damage,
      effectiveness,
      effectMessage,
      effectApplied,
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

  // Check win/lose: only declare a winner when the whole team is defeated
  const playerAlive = state.playerTeam.some(p => p.currentHp > 0)
  const npcAlive = state.npcTeam.some(p => p.currentHp > 0)

  if (!playerAlive) {
    state.winner = 'npc'
  } else if (!npcAlive) {
    state.winner = 'player'
  }

  state.turn++
  state.phase = state.winner ? 'ended' : 'select'

  return results
}
