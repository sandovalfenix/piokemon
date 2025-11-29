import { defineStore } from 'pinia'
import type { BattleState, Pokemon, Move } from '@/domain/battle/engine/entities'
import type { AI } from '@/domain/battle/ai/types'
import type { Rng } from '@/domain/battle/calc/rng'
import { createInitialState } from '@/domain/battle/engine/state'
import { createSeededRng } from '@/domain/battle/calc/rng'
import { createStrategicAI } from '@/domain/battle/ai/strategicAI'
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'
import { calculateDamage } from '@/domain/battle/calc/damage'
import { SAMPLE_PLAYER, SAMPLE_NPC } from '@/data/pokemon'
import { useTypeChartStore } from './typeChart'

export const useBattleStore = defineStore('battle', {
  state: (): BattleState & { seed?: string | number; ai: AI } => ({
    ...createInitialState(SAMPLE_PLAYER, SAMPLE_NPC),
    seed: undefined,
    ai: createStrategicAI(),
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
    async startBattle(seed?: string | number) {
      // Load type chart on first battle access
      const typeChartStore = useTypeChartStore()
      if (!typeChartStore.lastUpdated) {
        await typeChartStore.loadTypeChart()
      }

      // Deep clone to ensure we have fresh Pokemon with full HP
      const playerClone = structuredClone(SAMPLE_PLAYER)
      const npcClone = structuredClone(SAMPLE_NPC)

      // Reset HP to max (in case objects were mutated)
      playerClone.currentHp = playerClone.stats.hp
      npcClone.currentHp = npcClone.stats.hp

      const initial = createInitialState(playerClone, npcClone)
      const ai = createStrategicAI()

      this.$patch({ ...initial, seed, ai, log: [], turn: 1, phase: 'select', winner: null })
    },

    async selectPlayerMove(moveId: string) {
      if (this.phase !== 'select' || this.winner) return

      this.phase = 'resolving'
      const rng = createSeededRng(this.seed ?? Date.now())

      // Get player move
      const playerMove = this.player.moves.find((m) => m.id === moveId)
      if (!playerMove) return

      // Determine turn order by speed
      const playerFirst = this.player.stats.speed >= this.npc.stats.speed

      // Get NPC move
      const npcMoveId = this.ai.chooseMove({
        attacker: this.npc,
        defender: this.player,
        rng
      })
      const npcMove = this.npc.moves.find(m => m.id === npcMoveId) ?? this.npc.moves[0]!

      // Execute attacks sequentially based on speed
      if (playerFirst) {
        // Player attacks first
        await this.executeAttack(this.player, this.npc, playerMove, 'player', rng)

        // Check if NPC can still attack
        if (this.npc.currentHp > 0 && !this.winner) {
          await new Promise(resolve => setTimeout(resolve, 800))
          await this.executeAttack(this.npc, this.player, npcMove, 'npc', rng)
        }
      } else {
        // NPC attacks first
        await this.executeAttack(this.npc, this.player, npcMove, 'npc', rng)

        // Check if player can still attack
        if (this.player.currentHp > 0 && !this.winner) {
          await new Promise(resolve => setTimeout(resolve, 800))
          await this.executeAttack(this.player, this.npc, playerMove, 'player', rng)
        }
      }

      // Small delay before showing win/lose message
      if (this.winner) {
        await new Promise(resolve => setTimeout(resolve, 500))
        this.log.push(this.winner === 'player' ? 'You win!' : 'You lose!')
        this.phase = 'ended'
      } else {
        // Increment turn and return to select phase
        this.turn++
        this.phase = 'select'
      }
    },

    async executeAttack(
      attacker: Pokemon,
      defender: Pokemon,
      move: Move,
      attackerLabel: 'player' | 'npc',
      rng: Rng
    ) {
      // Accuracy check
      const accuracyRoll = rng.next() * 100
      const hit = accuracyRoll <= move.accuracy

      if (!hit) {
        // Miss: show message + play miss sound (triggered by log watch)
        this.log.push(`${attacker.name}'s attack missed!`)
        await new Promise(resolve => setTimeout(resolve, 600)) // Wait for miss animation
      } else {
        // Hit sequence - announce attack
        this.log.push(`${attacker.name} used ${move.name}!`)
        await new Promise(resolve => setTimeout(resolve, 300))

        // Calculate damage and effectiveness
        const defenderType: import('@/domain/battle/engine/entities').Type | [import('@/domain/battle/engine/entities').Type, import('@/domain/battle/engine/entities').Type?] =
          defender.types.length === 1
            ? defender.types[0]!
            : [defender.types[0]!, defender.types[1]]

        const effectiveness = computeTypeMultiplier(move.type, defenderType)

        // Show effectiveness
        if (effectiveness === 2) this.log.push("It's super effective!")
        if (effectiveness === 0.5) this.log.push("It's not very effective...")
        if (effectiveness === 0) this.log.push('It has no effect...')

        await new Promise(resolve => setTimeout(resolve, 200))

        // Calculate and apply damage NOW (sequentially)
        const atk = move.category === 'physical' ? attacker.stats.atk : attacker.stats.spAtk
        const def = move.category === 'physical' ? defender.stats.def : defender.stats.spDef

        const damage = calculateDamage({
          level: attacker.level,
          power: move.power,
          atk,
          def,
          category: move.category,
          multiplier: effectiveness,
          rng,
        })

        // Apply damage to defender
        defender.currentHp = Math.max(0, defender.currentHp - damage)

        // Show damage message + hit sound (triggered by log watch)
        this.log.push(`${defender.name} took ${damage} damage!`)
        await new Promise(resolve => setTimeout(resolve, 500)) // Wait for hit animation

        // Check for winner after damage is applied
        if (defender.currentHp <= 0) {
          this.winner = attackerLabel === 'player' ? 'player' : 'npc'
        }
      }
    },

    endBattle() {
      this.$reset()
    },
  },
})
