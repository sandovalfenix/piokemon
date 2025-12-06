import { defineStore } from 'pinia'
import type { BattleState, Pokemon, Move } from '@/domain/battle/engine/entities'
import type { AI } from '@/domain/battle/ai/types'
import type { Rng } from '@/domain/battle/calc/rng'
import { createInitialState } from '@/domain/battle/engine/state'
import { createSeededRng } from '@/domain/battle/calc/rng'
import { createStrategicAI } from '@/domain/battle/ai/strategicAI'
import { computeTypeMultiplier } from '@/domain/battle/calc/typeChart'
import { calculateDamage } from '@/domain/battle/calc/damage'
import { calculateScaledLevel } from '@/domain/battle/calc/levelScaling'
import { filterUsableMoves } from '@/domain/battle/engine/moveFilter'
import { useTypeChartStore } from './typeChart'
import { useTeamStore } from './team'
import { useProgressStore } from './progress'
import { validatePokemonType } from '@/services/typeChart/typeChartService'
import { transformTeamMemberToBattlePokemon } from '@/services/teamBuilder'
import { applyMoveEffect, type BattlePokemon } from '@/services/battle/battleEffectService'

/**
 * Validate all types in a Pokemon
 */
function validatePokemonTypes(pokemon: Pokemon, typeChart: Record<string, Record<string, number>>): void {
  for (const type of pokemon.types) {
    if (type && !validatePokemonType(type, typeChart)) {
      console.warn(`[BattleStore] Invalid type "${type}" found in ${pokemon.name}, using fallback data`)
    }
  }
}

/**
 * Scale Pokemon stats based on level difference
 * Uses simplified stat scaling formula
 */
function scaleStatsForLevel(pokemon: Pokemon, newLevel: number): Pokemon {
  const originalLevel = pokemon.level
  if (originalLevel === newLevel) return pokemon

  // Scale factor based on level ratio (simplified formula)
  const scaleFactor = newLevel / originalLevel

  return {
    ...pokemon,
    level: newLevel,
    stats: {
      hp: Math.max(1, Math.floor(pokemon.stats.hp * scaleFactor)),
      atk: Math.max(1, Math.floor(pokemon.stats.atk * scaleFactor)),
      def: Math.max(1, Math.floor(pokemon.stats.def * scaleFactor)),
      spAtk: Math.max(1, Math.floor(pokemon.stats.spAtk * scaleFactor)),
      spDef: Math.max(1, Math.floor(pokemon.stats.spDef * scaleFactor)),
      speed: Math.max(1, Math.floor(pokemon.stats.speed * scaleFactor)),
    },
    currentHp: Math.max(1, Math.floor(pokemon.stats.hp * scaleFactor)),
  }
}

/**
 * Get the highest level among opponent team
 */
function getOpponentMaxLevel(team: Pokemon[]): number {
  if (team.length === 0) return 1
  return Math.max(...team.map(p => p.level))
}

const PLACEHOLDER_MOVE: Move = {
  id: 'placeholder-move',
  name: 'Esperar',
  type: 'Normal',
  power: 0,
  accuracy: 100,
  category: 'physical',
}

function createPlaceholderPokemon(): Pokemon {
  return {
    id: 'placeholder-player',
    name: 'Selecciona tu equipo',
    types: ['Normal'],
    level: 1,
    stats: { hp: 1, atk: 1, def: 1, spAtk: 1, spDef: 1, speed: 1 },
    currentHp: 1,
    moves: [PLACEHOLDER_MOVE],
  }
}

/**
 * Deep clone a Pokemon object safely without using structuredClone
 * This avoids issues with non-cloneable references
 */
function clonePokemon(pokemon: Pokemon): Pokemon {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: [...pokemon.types],
    level: pokemon.level,
    stats: { ...pokemon.stats },
    currentHp: pokemon.currentHp,
    moves: pokemon.moves.map(m => ({ ...m })),
  }
}

import type { OpponentType } from '@/models/battleOutcome'
import type { MoveLearningModalState, MoveLearningCandidate } from '@/models/moveLearning'
import { DEFAULT_MOVE_LEARNING_STATE } from '@/models/moveLearning'
import type { WildBattlePokemon } from '@/models/capture'

/** Feature 006: Defeat modal state */
interface DefeatModalState {
  isOpen: boolean
  opponentName: string
}

const DEFAULT_DEFEAT_MODAL_STATE: DefeatModalState = {
  isOpen: false,
  opponentName: '',
}

// Extended battle state with opponent tracking for Feature 006
interface ExtendedBattleState extends BattleState {
  seed?: string | number
  ai: AI
  /** Feature 006: Track opponent type for victory/defeat handling */
  opponentType?: OpponentType
  /** Feature 006: Track opponent ID for progress updates */
  opponentId?: string | number
  /** Feature 006: Opponent display name */
  opponentName?: string
  /** Feature 006 T030: Move learning modal state */
  moveLearningState: MoveLearningModalState
  /** Feature 006 T036: Defeat modal state */
  defeatModalState: DefeatModalState
  /** Feature 007: Wild Pokémon battle data for capture mechanics */
  wildPokemonData?: WildBattlePokemon
  /** Feature: indicate player must choose next Pokemon after faint */
  playerSwitchRequired?: boolean
}

export const useBattleStore = defineStore('battle', {
  state: (): ExtendedBattleState => ({
    turn: 1,
    phase: 'select',
    player: createPlaceholderPokemon(),
    npc: createPlaceholderPokemon(),
    playerTeam: [],
    npcTeam: [],
    currentPlayerIndex: 0,
    currentNpcIndex: 0,
    winner: null,
    log: [],
    seed: undefined,
    ai: createStrategicAI(),
    opponentType: undefined,
    opponentId: undefined,
    opponentName: undefined,
    moveLearningState: { ...DEFAULT_MOVE_LEARNING_STATE },
    defeatModalState: { ...DEFAULT_DEFEAT_MODAL_STATE },
    wildPokemonData: undefined,
    playerSwitchRequired: false,
  }),

  getters: {
    playerPokemon: (state) => state.player,
    npcPokemon: (state) => state.npc,
    isResolved: (state) => state.phase === 'ended',
    playerHPPercent: (state) =>
      Math.floor((state.player.currentHp / state.player.stats.hp) * 100),
    npcHPPercent: (state) => Math.floor((state.npc.currentHp / state.npc.stats.hp) * 100),
    playerTeamRemaining: (state) =>
      state.playerTeam.filter(p => p.currentHp > 0).length,
    npcTeamRemaining: (state) =>
      state.npcTeam.filter(p => p.currentHp > 0).length,
    /** Feature 006: Check if move learning modal should be shown */
    shouldShowMoveLearning: (state) => state.moveLearningState.isOpen,
    /** Feature 006: Check if defeat modal should be shown */
    shouldShowDefeatModal: (state) => state.defeatModalState.isOpen,
    /** Feature 007: Check if this is a wild Pokémon battle (capture available) */
    isWildBattle: (state) => state.opponentType === 'wild',
  },

  actions: {
    async startBattle(playerTeam: Pokemon[], npcTeam: Pokemon[], seed?: string | number) {
      // Load type chart on first battle access
      const typeChartStore = useTypeChartStore()
      if (!typeChartStore.lastUpdated) {
        await typeChartStore.loadTypeChart()
      }

      // Deep clone teams to ensure we have fresh Pokemon with full HP
      let playerTeamClone = playerTeam.map(p => clonePokemon(p))
      const npcTeamClone = npcTeam.map(p => clonePokemon(p))

      if (playerTeamClone.length === 0) {
        throw new Error('Cannot start battle: player team is empty')
      }
      if (npcTeamClone.length === 0) {
        throw new Error('Cannot start battle: NPC team is empty')
      }

      // Feature 006: Apply dynamic level scaling
      // Player Pokemon scale to (opponent max level - 2)
      const opponentMaxLevel = getOpponentMaxLevel(npcTeamClone)
      const scaledPlayerLevel = calculateScaledLevel(opponentMaxLevel)

      playerTeamClone = playerTeamClone.map(p => {
        const scaled = scaleStatsForLevel(p, scaledPlayerLevel)
        // Filter out status moves (only Physical/Special allowed)
        scaled.moves = filterUsableMoves(scaled.moves)
        // Ensure at least one move (fallback to Struggle-like move)
        if (scaled.moves.length === 0) {
          scaled.moves = [PLACEHOLDER_MOVE]
        }
        return scaled
      })

      console.log(`[BattleStore] Level scaling applied: opponent max ${opponentMaxLevel} -> player scaled to ${scaledPlayerLevel}`)

      // Validate all Pokemon types
      const allPokemon = [...playerTeamClone, ...npcTeamClone]
      for (const pokemon of allPokemon) {
        validatePokemonTypes(pokemon, typeChartStore.typeChart)
        pokemon.currentHp = pokemon.stats.hp
      }

      const initial = createInitialState(playerTeamClone, npcTeamClone)
      const ai = createStrategicAI()

      this.$patch({
        ...initial,
        seed,
        ai,
        log: [],
        turn: 1,
        phase: 'select',
        winner: null,
      })
    },

    /**
     * Start battle with custom team from team builder
     * Feature: 003-pokemon-team-builder
     * User Story 4: Start Battle with Custom Team
     *
     * Updated Feature 006: Apply dynamic level scaling
     *
     * @param seed - Optional RNG seed for deterministic battles
     * @throws Error if team is empty or lead Pokemon has no moves
     */
    async startBattleWithCustomTeam(seed?: string | number) {
      // Load type chart on first battle access
      const typeChartStore = useTypeChartStore()
      if (!typeChartStore.lastUpdated) {
        await typeChartStore.loadTypeChart()
      }

      // Get team lead from team store
      const teamStore = useTeamStore()
      if (teamStore.roster.length === 0) {
        throw new Error('Cannot start battle: team is empty')
      }

      let convertedTeam = teamStore.roster
        .map(transformTeamMemberToBattlePokemon)
        .map(pokemon => {
          // Manual deep clone to avoid structuredClone issues with complex objects
          const clone: Pokemon = {
            id: pokemon.id,
            name: pokemon.name,
            types: [...pokemon.types],
            level: pokemon.level,
            stats: { ...pokemon.stats },
            currentHp: pokemon.stats.hp, // Reset HP to max
            moves: pokemon.moves.map(m => ({ ...m })),
          }
          return clone
        })

      if (convertedTeam.length === 0) {
        throw new Error('Cannot start battle: team is empty')
      }

      // Feature 006: This method is deprecated
      // Battles should now be initialized via battleInitService which uses PokéAPI
      // This fallback creates a placeholder battle for testing only
      console.warn('[BattleStore] startBattleWithCustomTeam is deprecated. Use battleInitService instead.')

      const placeholderNpc: Pokemon = {
        id: 'placeholder-opponent',
        name: 'Entrenador',
        types: ['Normal'],
        level: 5,
        stats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
        currentHp: 50,
        moves: [PLACEHOLDER_MOVE],
      }
      const npcTeam = [placeholderNpc]

      // Feature 006: Apply dynamic level scaling
      // Player Pokemon scale to (opponent max level - 2)
      const opponentMaxLevel = getOpponentMaxLevel(npcTeam)
      const scaledPlayerLevel = calculateScaledLevel(opponentMaxLevel)

      convertedTeam = convertedTeam.map(p => {
        const scaled = scaleStatsForLevel(p, scaledPlayerLevel)
        // Filter out status moves (only Physical/Special allowed)
        scaled.moves = filterUsableMoves(scaled.moves)
        // Ensure at least one move (fallback to Struggle-like move)
        if (scaled.moves.length === 0) {
          scaled.moves = [PLACEHOLDER_MOVE]
        }
        return scaled
      })

      console.log(`[BattleStore] Level scaling applied: opponent max ${opponentMaxLevel} -> player scaled to ${scaledPlayerLevel}`)

      // Validate Pokemon types for both teams
      for (const pokemon of convertedTeam) {
        validatePokemonTypes(pokemon, typeChartStore.typeChart)
      }
      validatePokemonTypes(npcTeam[0]!, typeChartStore.typeChart)

      const initial = createInitialState(convertedTeam, npcTeam)
      const ai = createStrategicAI()

      this.$patch({ ...initial, seed, ai, log: [], turn: 1, phase: 'select', winner: null })

      console.log(`[BattleStore] Started battle with custom team lead: ${initial.player.name}`)
    },

    async selectPlayerMove(moveId: string) {
      console.log('[BattleStore] selectPlayerMove called:', {
        moveId,
        phase: this.phase,
        winner: this.winner,
        playerMoves: this.player.moves.map(m => ({ id: m.id, name: m.name }))
      })

      if (this.phase !== 'select' || this.winner) {
        console.log('[BattleStore] selectPlayerMove blocked:', { phase: this.phase, winner: this.winner })
        return
      }

      this.phase = 'resolving'
      const rng = createSeededRng(this.seed ?? Date.now())

      // Get player move
      const playerMove = this.player.moves.find((m) => m.id === moveId)
      if (!playerMove) {
        console.error('[BattleStore] Move not found:', moveId)
        this.phase = 'select' // Reset phase if move not found
        return
      }

      console.log('[BattleStore] Found player move:', playerMove)

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

        // Check if NPC fainted and switch if needed
        if (this.npc.currentHp <= 0 && !this.winner) {
          await this.switchNpcPokemon()
        }

        // Check if NPC can still attack
        if (this.npc.currentHp > 0 && !this.winner) {
          await new Promise(resolve => setTimeout(resolve, 800))
          await this.executeAttack(this.npc, this.player, npcMove, 'npc', rng)

          // Check if player fainted and switch if needed
          if (this.player.currentHp <= 0 && !this.winner) {
            await this.switchPlayerPokemon()
          }
        }
      } else {
        // NPC attacks first
        await this.executeAttack(this.npc, this.player, npcMove, 'npc', rng)

        // Check if player fainted and switch if needed
        if (this.player.currentHp <= 0 && !this.winner) {
          await this.switchPlayerPokemon()
        }

        // Check if player can still attack
        if (this.player.currentHp > 0 && !this.winner) {
          await new Promise(resolve => setTimeout(resolve, 800))
          await this.executeAttack(this.player, this.npc, playerMove, 'player', rng)

          // Check if NPC fainted and switch if needed
          if (this.npc.currentHp <= 0 && !this.winner) {
            await this.switchNpcPokemon()
          }
        }
      }

      // Check for overall battle winner
      if (this.winner) {
        await new Promise(resolve => setTimeout(resolve, 500))
        this.log.push(this.winner === 'player' ? '¡Ganaste la batalla!' : '¡Perdiste la batalla!')

        // Feature 006: Update progress on player victory
        if (this.winner === 'player') {
          this.handleVictory()
        }

        this.phase = 'ended'
      } else {
        // Increment turn and return to select phase
        this.turn++
        this.phase = 'select'
      }
    },

    async switchNpcPokemon() {
      // Guard: Ensure current NPC is actually fainted before switching
      if (this.npc.currentHp > 0) {
        console.warn('[BattleStore] switchNpcPokemon called but current NPC is not fainted')
        return
      }

      // Find next alive NPC Pokémon (search entire team, not just after current index)
      // This handles edge cases where Pokemon at lower indices might still be alive
      const nextIndex = this.npcTeam.findIndex(
        (p, idx) => idx !== this.currentNpcIndex && p.currentHp > 0
      )

      if (nextIndex !== -1) {
        // Set flag to indicate trainer needs to switch (will be handled by UI)
        this.currentNpcIndex = nextIndex
        this.npc = this.npcTeam[nextIndex]!
        this.log.push(`¡El rival envió a ${this.npc.name}!`)
        await new Promise(resolve => setTimeout(resolve, 600))
      } else {
        // No more Pokémon for NPC - player wins
        this.winner = 'player'
      }
    },

    async switchPlayerPokemon() {
      // Check if there are any alive player Pokémon left (search entire team, not just after current index)
      const aliveCount = this.playerTeam.filter(p => p.currentHp > 0).length

      console.log('[BattleStore] switchPlayerPokemon called:', {
        aliveCount,
        currentPlayerIndex: this.currentPlayerIndex,
        teamHP: this.playerTeam.map(p => ({ name: p.name, hp: p.currentHp })),
      })

      if (aliveCount > 0) {
        // Instead of auto-switching, mark that player must choose and wait
        this.playerSwitchRequired = true

        // Create a promise that will be resolved when UI confirms the selection
        // We keep the resolver in a module-scoped variable
        return await new Promise<void>((resolve) => {
          // store resolver for confirmPlayerSwitch to call
          ;(this as any).__playerSwitchResolver = resolve
        })
      } else {
        // No more Pokémon for player - NPC wins
        this.winner = 'npc'
        this.log.push('¡Todos tus Pokémon han sido derrotados!')
      }
    },

    /**
     * Confirm player's switch choice (called from UI). Performs the switch and resumes battle.
     */
    confirmPlayerSwitch(pokemonIndex: number) {
      const newPokemon = this.playerTeam[pokemonIndex]

      if (!newPokemon || newPokemon.currentHp === 0) {
        this.log.push('¡No puedes usar ese Pokémon!')
        return
      }

      if (newPokemon.id === this.player.id) {
        this.log.push(`¡${newPokemon.name} ya está en combate!`)
        return
      }

      const oldPokemonName = this.player.name
      this.currentPlayerIndex = pokemonIndex
      this.player = newPokemon

      this.log.push(`¡Vuelve, ${oldPokemonName}!`)
      this.log.push(`¡Adelante, ${newPokemon.name}!`)

      // Clear the required flag
      this.playerSwitchRequired = false

      // Resolve the awaiting promise if present
      const resolver = (this as any).__playerSwitchResolver
      if (typeof resolver === 'function') {
        resolver()
        ;(this as any).__playerSwitchResolver = undefined
      }
    },

    /**
     * Feature 007: Execute only NPC's turn (used when player wastes turn on failed capture)
     * This allows the wild Pokémon to attack after a capture attempt fails
     */
    async executeNpcTurn() {
      if (this.phase !== 'select' || this.winner) {
        console.log('[BattleStore] executeNpcTurn blocked:', { phase: this.phase, winner: this.winner })
        return
      }

      this.phase = 'resolving'
      const rng = createSeededRng(this.seed ?? Date.now())

      // Get NPC move
      const npcMoveId = this.ai.chooseMove({
        attacker: this.npc,
        defender: this.player,
        rng
      })
      const npcMove = this.npc.moves.find(m => m.id === npcMoveId) ?? this.npc.moves[0]!

      // Execute NPC attack
      await this.executeAttack(this.npc, this.player, npcMove, 'npc', rng)

      // Check if player fainted and switch if needed
      if (this.player.currentHp <= 0 && !this.winner) {
        await this.switchPlayerPokemon()
      }

      // Check for overall battle winner
      if (this.winner) {
        await new Promise(resolve => setTimeout(resolve, 500))
        this.log.push(this.winner === 'player' ? '¡Ganaste la batalla!' : '¡Perdiste la batalla!')
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
      console.log('[BattleStore] executeAttack:', {
        attacker: attacker.name,
        defender: defender.name,
        move: { id: move.id, name: move.name, power: move.power, category: move.category },
        attackerLabel
      })

      // Accuracy check
      const accuracyRoll = rng.next() * 100
      const hit = accuracyRoll <= move.accuracy

      if (!hit) {
        // Miss: show message + play miss sound (triggered by log watch)
        this.log.push(`¡${attacker.name} falló el ataque!`)
        await new Promise(resolve => setTimeout(resolve, 600)) // Wait for miss animation
      } else {
        // Hit sequence - announce attack
        this.log.push(`¡${attacker.name} usó ${move.name}!`)
        await new Promise(resolve => setTimeout(resolve, 300))

        // Handle status moves (no damage, only effects)
        if (move.category === 'status' || move.power === 0) {
          // Status move: apply effect only
          if (move.effect) {
            const effectResult = applyMoveEffect(
              move.effect,
              attacker as BattlePokemon,
              defender as BattlePokemon,
              rng
            )
            if (effectResult.applied && effectResult.message) {
              this.log.push(effectResult.message)
            }
          }
          await new Promise(resolve => setTimeout(resolve, 400))
        } else {
          // Damaging move: calculate damage and apply effect
          const defenderType: import('@/domain/battle/engine/entities').Type | [import('@/domain/battle/engine/entities').Type, import('@/domain/battle/engine/entities').Type?] =
            defender.types.length === 1
              ? defender.types[0]!
              : [defender.types[0]!, defender.types[1]]

          const effectiveness = computeTypeMultiplier(move.type, defenderType)

          // Show effectiveness
          if (effectiveness === 2) this.log.push('¡Es súper efectivo!')
          if (effectiveness === 0.5) this.log.push('No es muy efectivo...')
          if (effectiveness === 0) this.log.push('¡No tiene efecto!')

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

          console.log('[BattleStore] Damage calculation:', {
            level: attacker.level,
            power: move.power,
            atk,
            def,
            category: move.category,
            effectiveness,
            damage,
            defenderHpBefore: defender.currentHp
          })

          // Apply damage to defender
          defender.currentHp = Math.max(0, defender.currentHp - damage)

          // IMPORTANT: Also update the store state directly to ensure reactivity
          // AND sync to team arrays to prevent HP desync bugs
          if (attackerLabel === 'player') {
            this.npc.currentHp = defender.currentHp
            // Sync to npcTeam array to ensure switchNpcPokemon sees correct HP
            const npcPokemon = this.npcTeam[this.currentNpcIndex]
            if (npcPokemon) {
              npcPokemon.currentHp = defender.currentHp
            }
          } else {
            this.player.currentHp = defender.currentHp
            // Sync to playerTeam array to ensure switchPlayerPokemon sees correct HP
            const playerPokemon = this.playerTeam[this.currentPlayerIndex]
            if (playerPokemon) {
              playerPokemon.currentHp = defender.currentHp
            }
          }

          console.log('[BattleStore] After damage:', {
            defenderHpAfter: defender.currentHp,
            storePlayerHp: this.player.currentHp,
            storeNpcHp: this.npc.currentHp
          })

          // Show damage message + hit sound (triggered by log watch)
          this.log.push(`¡${defender.name} recibió ${damage} puntos de daño!`)
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait for hit animation

          // Apply move effect after damage (e.g., Thunderbolt's 10% paralysis)
          // Feature 005: Status moves support via PokeAPI data
          if (move.effect) {
            const effectResult = applyMoveEffect(
              move.effect,
              attacker as BattlePokemon,
              defender as BattlePokemon,
              rng
            )
            if (effectResult.applied && effectResult.message) {
              this.log.push(effectResult.message)
              await new Promise(resolve => setTimeout(resolve, 400))
            }
          }

          // Check if defender fainted
          if (defender.currentHp <= 0) {
            this.log.push(`¡${defender.name} se debilitó!`)
          }
        }
      }
    },

    /**
     * Feature 006: Handle victory - update progress based on opponent type
     */
    handleVictory() {
      const progressStore = useProgressStore()

      if (this.opponentType === 'thematic-npc' && this.opponentId) {
        progressStore.defeatNpc(this.opponentId as string)
        console.log(`[BattleStore] Progress updated: Defeated NPC ${this.opponentId}`)
      } else if (this.opponentType === 'gym-leader' && this.opponentId) {
        progressStore.defeatGymLeader(this.opponentId as number)
        console.log(`[BattleStore] Progress updated: Defeated Gym Leader ${this.opponentId}`)
      }
      // Wild battles don't update progress
    },

    /**
     * Feature 006: Set opponent info for progress tracking
     */
    setOpponentInfo(type: OpponentType, id?: string | number, name?: string) {
      this.opponentType = type
      this.opponentId = id
      this.opponentName = name
    },

    /**
     * Feature 007: Set wild Pokémon data for capture mechanics
     * @param data - Wild Pokémon battle data (null to clear)
     */
    setWildPokemonData(data: WildBattlePokemon | undefined) {
      this.wildPokemonData = data
      if (data) {
        console.log(`[BattleStore] Wild Pokémon data set: ${data.pokemon.name} (Lv.${data.level}, HP: ${data.currentHp}/${data.maxHp})`)
      } else {
        console.log('[BattleStore] Wild Pokémon data cleared')
      }
    },

    /**
     * Feature 007: Update wild Pokémon HP during battle (for capture formula)
     */
    updateWildPokemonHp(currentHp: number) {
      if (this.wildPokemonData) {
        this.wildPokemonData.currentHp = Math.max(0, currentHp)
      }
    },

    // =========================================================================
    // Feature 006 T030: Move Learning Actions
    // =========================================================================

    /**
     * Open move learning modal with candidates
     */
    openMoveLearning(candidates: MoveLearningCandidate[]) {
      if (candidates.length === 0) return

      this.moveLearningState = {
        isOpen: true,
        candidates,
        currentIndex: 0,
        selectedSlot: null,
        hasDecided: false,
      }
    },

    /**
     * Select a move slot to replace (0-3)
     */
    selectMoveSlot(slot: number) {
      if (slot >= 0 && slot < 4) {
        this.moveLearningState.selectedSlot = slot
      }
    },

    /**
     * Confirm move replacement and advance to next candidate or close
     */
    confirmMoveReplacement() {
      const state = this.moveLearningState
      if (state.selectedSlot === null) return

      const candidate = state.candidates[state.currentIndex]
      if (candidate) {
        // Replace the move in player team
        const pokemon = this.playerTeam.find(p => p.id === candidate.pokemonId)
        if (pokemon && state.selectedSlot < pokemon.moves.length) {
          const oldMove = pokemon.moves[state.selectedSlot]
          pokemon.moves[state.selectedSlot] = candidate.newMove
          console.log(`[BattleStore] ${pokemon.name} forgot ${oldMove?.name} and learned ${candidate.newMove.name}`)
        }
      }

      this.advanceMoveLearning()
    },

    /**
     * Skip learning current move and advance
     */
    skipMoveLearning() {
      const state = this.moveLearningState
      const candidate = state.candidates[state.currentIndex]
      if (candidate) {
        console.log(`[BattleStore] ${candidate.pokemonName} did not learn ${candidate.newMove.name}`)
      }
      this.advanceMoveLearning()
    },

    /**
     * Advance to next candidate or close modal
     */
    advanceMoveLearning() {
      const state = this.moveLearningState
      if (state.currentIndex < state.candidates.length - 1) {
        state.currentIndex++
        state.selectedSlot = null
        state.hasDecided = false
      } else {
        this.closeMoveLearning()
      }
    },

    /**
     * Close move learning modal
     */
    closeMoveLearning() {
      this.moveLearningState = { ...DEFAULT_MOVE_LEARNING_STATE }
    },

    // =========================================================================
    // Feature 006 T036-37: Defeat Modal Actions
    // =========================================================================

    /**
     * Open defeat modal
     */
    openDefeatModal(opponentName: string) {
      this.defeatModalState = {
        isOpen: true,
        opponentName,
      }
    },

    /**
     * Close defeat modal
     */
    closeDefeatModal() {
      this.defeatModalState = { ...DEFAULT_DEFEAT_MODAL_STATE }
    },

    endBattle() {
      this.$reset()
    },
  },
})
