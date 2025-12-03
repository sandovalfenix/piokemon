import { ref, computed } from 'vue'
import { useBattleStore } from '@/stores/battle'
import type { Trainer } from '@/data/gymLadders'
import type { Pokemon } from '@/domain/battle/engine/entities'

/**
 * Composable para gestionar batallas contra entrenadores Pokémon
 * Maneja la inicialización de la batalla, equipo rival y recompensas
 */
export function useTrainerBattle() {
  const battleStore = useBattleStore()
  const currentTrainer = ref<Trainer | null>(null)
  const battleStarted = ref(false)

  /**
   * Iniciar batalla contra un entrenador específico
   */
  async function startBattle(trainer: Trainer, playerTeam: Pokemon[]) {
    currentTrainer.value = trainer
    battleStarted.value = true

    // Inicializar la batalla con el equipo del jugador y del entrenador
    const trainerTeam = trainer.team.map(p => structuredClone(p)) as Pokemon[]
    await battleStore.startBattle(playerTeam, trainerTeam)
  }

  /**
   * Obtener el nombre completo del entrenador con su título
   */
  const trainerFullName = computed(() => {
    if (!currentTrainer.value) return ''
    return `${currentTrainer.value.title} ${currentTrainer.value.name}`
  })

  /**
   * Obtener la recompensa de la batalla
   */
  const battleReward = computed(() => currentTrainer.value?.reward ?? 0)

  /**
   * Verificar si el jugador ganó
   */
  const playerWon = computed(() => battleStore.winner === 'player')

  /**
   * Verificar si el jugador perdió
   */
  const playerLost = computed(() => battleStore.winner === 'npc')

  /**
   * Obtener Pokémon restantes del rival
   */
  const rivalRemainingPokemon = computed(() => battleStore.npcTeamRemaining)

  /**
   * Obtener Pokémon restantes del jugador
   */
  const playerRemainingPokemon = computed(() => battleStore.playerTeamRemaining)

  /**
   * Reiniciar la batalla
   */
  function resetBattle() {
    battleStarted.value = false
    currentTrainer.value = null
    battleStore.endBattle()
  }

  return {
    // Estado
    currentTrainer,
    battleStarted,
    battleStore,

    // Computados
    trainerFullName,
    battleReward,
    playerWon,
    playerLost,
    rivalRemainingPokemon,
    playerRemainingPokemon,

    // Métodos
    startBattle,
    resetBattle,
  }
}
