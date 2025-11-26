import { ref, computed, type Ref, isRef } from 'vue'
import { defineStore } from 'pinia'
import { useTeamStore } from './team'

interface Pokemon {
  id: number
  name: string
  hp: number
  attack: number
  defense: number
}

export const useBattleStore = defineStore('battle', () => {
  const teamStore = useTeamStore()
  // my pokemons (now from team store)

  // opponent pokemons
  const opponentPokemons = ref<Pokemon[]>([{ id: 4, name: 'Charmander', hp: 10, attack: 52, defense: 43 }])

  const isPlayerTurn = ref(true)

  // attack function
  const attackPokemon = (pokemonAttack: Ref<Pokemon[]> | Pokemon[], pokemonDefense: Ref<Pokemon[]> | Pokemon[]) => {
    // tolerate both: refs passed from script (have `.value`) and unwrapped arrays passed from templates
    const attackArr = isRef(pokemonAttack) ? pokemonAttack.value : pokemonAttack
    const defendArr = isRef(pokemonDefense) ? pokemonDefense.value : pokemonDefense

    // validate
    if (!attackArr || !defendArr || !attackArr[0] || !defendArr[0]) return

    if (gameOver.value) return

    const attackerStats = attackArr[0]
    const defenderStats = defendArr[0]

    // calculate damage (at least 1)
    const damage = Math.max(1, attackerStats.attack - defenderStats.defense)

    defenderStats.hp = Math.max(0, defenderStats.hp - damage)

    // switch turn
    isPlayerTurn.value = !isPlayerTurn.value

    // if game is not over and it is now the opponent's turn, schedule their attack
    if (!gameOver.value && !isPlayerTurn.value) {
      setTimeout(() => {
        attackPokemon(opponentPokemons, teamStore.pokemons)
      }, 1000)
    }
  }

  const gameOver = computed(() => {
    if (!teamStore.pokemons[0] || !opponentPokemons.value[0]) return true
    return teamStore.pokemons[0].hp <= 0 || opponentPokemons.value[0].hp <= 0
  })

  const winner = computed(() => {
    if (!teamStore.pokemons[0] || !opponentPokemons.value[0]) return null
    if (teamStore.pokemons[0].hp <= 0) return 'opponent'
    if (opponentPokemons.value[0].hp <= 0) return 'player'
    return null
  })

  return { opponentPokemons, isPlayerTurn, attackPokemon, gameOver, winner }
})
