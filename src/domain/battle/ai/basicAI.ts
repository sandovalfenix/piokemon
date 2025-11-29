import type { AI, AIContext } from './types'

/**
 * Basic AI that simply picks the first available move
 * No strategic thinking - just a placeholder for testing
 */
export function createBasicAI(): AI {
  return {
    chooseMove(ctx: AIContext): string {
      // MVP: pick first available move
      const moves = ctx.attacker.moves
      if (moves.length === 0) {
        throw new Error('No moves available for AI')
      }
      return moves[0]!.id
    },
  }
}
