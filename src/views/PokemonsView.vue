<template>
  <div class="pokemons-view">
    <h1>Mis Pokémon</h1>

    <PokemonCard
      v-for="pokemon in pokemons"
      :key="pokemon.nombre"
      :nombre="pokemon.nombre"
      :tipo="pokemon.tipo"
    />
  </div>
</template>

<script lang="ts">
import PokemonCard from "../components/PokemonCard.vue";

export default {
  name: "PokemonsView",
  components: { PokemonCard },

  data() {
    return {
      pokemons: [
        { nombre: "Pikachu", tipo: "Eléctrico" },
        { nombre: "Bulbasaur", tipo: "Planta" },
        { nombre: "Charmander", tipo: "Fuego" }
      ]
    };
  }
};
</script>

<style scoped>
.pokemons-view {
  padding: 20px;
}
</style>
