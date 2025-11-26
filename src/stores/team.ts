import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTeamStore = defineStore('team', () => {
  const pokemons = ref([
    { id: 1, name: 'Bulbasaur', hp: 45, attack: 49, defense: 49 },
    { id: 4, name: 'Charmander', hp: 39, attack: 52, defense: 43 },
    { id: 7, name: 'Squirtle', hp: 44, attack: 48, defense: 65 },
    { id: 25, name: 'Pikachu', hp: 35, attack: 55, defense: 40 },
    { id: 133, name: 'Eevee', hp: 55, attack: 55, defense: 50 },
    { id: 152, name: 'Infernape', hp: 45, attack: 49, defense: 65 }
  ])

  const addPokemon = (pokemon: { id: number; name: string; hp: number; attack: number; defense: number }) => {
    if (pokemons.value.length >= 6) {
      return false
    }
    pokemons.value.push(pokemon)
    return true
  }

  return {
    pokemons,
    addPokemon
  }
})
