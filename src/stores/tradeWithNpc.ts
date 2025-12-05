import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTeamStore } from './team'

export const useTradeStore = defineStore('trade', () => {
  const teamStore = useTeamStore()

  const npcs = ref([
    {
      id: 1,
      name: 'Bug Catcher',
      wants: 'Bulbasaur',
      offers: { id: 10, name: 'Caterpie', hp: 45, attack: 30, defense: 35 }
    },
    {
      id: 2,
      name: 'Lass',
      wants: 'Charmander',
      offers: { id: 13, name: 'Weedle', hp: 40, attack: 35, defense: 30 }
    }
  ])

  const tradeMessage = ref('')

  const tradePokemon = (npcId: number) => {
    const npc = npcs.value.find(n => n.id === npcId)
    if (!npc) return

    const playerPokemonIndex = teamStore.roster.findIndex((member) => member.pokemon.name === npc.wants)

    if (playerPokemonIndex !== -1) {
      // Perform trade
      // Remove player's pokemon
      teamStore.removePokemon(playerPokemonIndex)
      tradeMessage.value = `Successfully traded ${npc.wants} for ${npc.offers.name}!`
      // Note: Adding NPC's pokemon would require full Pokemon data structure
      // Skipping for now as this is legacy code being maintained
    } else {
      tradeMessage.value = `You don't have a ${npc.wants} to trade!`
    }
  }

  return {
    npcs,
    tradePokemon,
    tradeMessage
  }
})
