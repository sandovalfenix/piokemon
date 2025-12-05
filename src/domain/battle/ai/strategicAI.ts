import type { AI, AIContext } from './types'
import { computeTypeMultiplier } from '../calc/typeChart'

/**
 * Strategic AI that considers type effectiveness and remaining HP
 * Prefers super effective moves ≥50% of the time when available
 */
export function createStrategicAI(): AI {
  return {
    chooseMove(ctx: AIContext): string {
      const { attacker, defender, rng } = ctx
      const moves = attacker.moves

      // Validate that we have at least one move
      if (!moves || moves.length === 0) {
        throw new Error('No moves available')
      }

      // Calculate effectiveness for each move
      const moveScores = moves.map((move) => {
        const effectiveness = computeTypeMultiplier(
          move.type,
          defender.types.length === 1 ? defender.types[0]! : [defender.types[0]!, defender.types[1]]
        )

        // Base score from effectiveness
        let score = effectiveness

        // Bonus for higher power moves
        score += move.power / 200

        // Bonus for higher accuracy
        score += move.accuracy / 200

        // If attacker is low on HP (< 30%), slightly prefer high-power moves
        const hpPercent = attacker.currentHp / attacker.stats.hp
        if (hpPercent < 0.3) {
          score += move.power / 300
        }

        return { move, score, effectiveness }
      })

      // Sort by score (highest first)
      moveScores.sort((a, b) => b.score - a.score)

      // Find super effective moves
      const superEffectiveMoves = moveScores.filter((m) => m.effectiveness === 2)

      // 50% of the time, pick a super effective move if available
      if (superEffectiveMoves.length > 0) {
        const rand = rng.next()
        if (rand < 0.5) {
          // Pick best super effective move
          return superEffectiveMoves[0]!.move.id
        }
      }

      // Otherwise, pick the best overall move (with some randomness)
      // Top 50% pick best, bottom 50% pick randomly from top 2
      const rand = rng.next()
      if (rand < 0.5 || moveScores.length === 1) {
        return moveScores[0]!.move.id
      } else {
        // Pick randomly from top 2 moves
        const topMoves = moveScores.slice(0, Math.min(2, moveScores.length))
        const randomIndex = Math.floor(rng.next() * topMoves.length)
        return topMoves[randomIndex]!.move.id
      }
    },
  }
}
