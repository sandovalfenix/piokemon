import { defineStore } from 'pinia'
import type { BattleState } from '@/domain/battle/engine/entities'
import type { AI } from '@/domain/battle/ai/types'
import { createInitialState } from '@/domain/battle/engine/state'
import { createSeededRng } from '@/domain/battle/calc/rng'
import { resolveTurn } from '@/domain/battle/engine/resolveTurn'
import { createBasicAI } from '@/domain/battle/ai/basicAI'
import { createStrategicAI } from '@/domain/battle/ai/strategicAI'
import { SAMPLE_PLAYER, SAMPLE_NPC } from '@/data/pokemon'

export type AIType = 'basic' | 'strategic'

export const useBattleStore = defineStore('battle', {
  state: (): BattleState & { seed?: string | number; aiType: AIType; ai: AI } => ({
    ...createInitialState(SAMPLE_PLAYER, SAMPLE_NPC),
    seed: undefined,
    aiType: 'basic',
    ai: createBasicAI(),
  }),

  getters: {
    playerPokemon: (state) => state.player,
    npcPokemon: (state) => state.npc,
    isResolved: (state) => state.phase === 'ended',
    playerHPPercent: (state) =>
      Math.floor((state.player.currentHp / state.player.stats.hp) * 100),
    npcHPPercent: (state) => Math.floor((state.npc.currentHp / state.npc.stats.hp) * 100),
  },

  actions: {
    startBattle(seed?: string | number, aiType: AIType = 'basic') {
      const initial = createInitialState(
        structuredClone(SAMPLE_PLAYER),
        structuredClone(SAMPLE_NPC),
      )

      // Create AI based on type
      const ai = aiType === 'strategic' ? createStrategicAI() : createBasicAI()

      this.$patch({ ...initial, seed, aiType, ai, log: [] })
    },

    selectPlayerMove(moveId: string) {
      if (this.phase !== 'select' || this.winner) return

      this.phase = 'resolving'
      const rng = createSeededRng(this.seed ?? Date.now())
      const results = resolveTurn(this, moveId, rng, this.ai)

      // Generate log messages
      for (const result of results) {
        const attacker = result.attacker === 'player' ? this.player : this.npc
        const defender = result.attacker === 'player' ? this.npc : this.player
        const move = attacker.moves.find((m) => m.id === result.moveId)

        if (!result.hit) {
          this.log.push(`${attacker.name}'s attack missed!`)
        } else {
          this.log.push(`${attacker.name} used ${move?.name}!`)
          if (result.effectiveness === 2) this.log.push("It's super effective!")
          if (result.effectiveness === 0.5) this.log.push("It's not very effective...")
          if (result.effectiveness === 0) this.log.push('It has no effect...')
          this.log.push(`${defender.name} took ${result.damage} damage!`)
        }
      }

      if (this.winner) {
        this.log.push(this.winner === 'player' ? 'You win!' : 'You lose!')
        this.phase = 'ended'
      }
    },

    endBattle() {
      this.$reset()
    },
  },
})
