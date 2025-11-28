<template>
  <div class="encounter-container">
    <h1>Encuentros Pokémon</h1>

    <!-- Botón para buscar Pokémon -->
    <button class="explore-btn" @click="buscarPokemon" :disabled="store.isCaptureInProgress">
      Buscar Pokémon
    </button>

    <!-- Si hay un encuentro -->
    <div v-if="store.isEncounterActive && store.wildPokemon" class="pokemon-card">
      <img
        :src="`/sprites/${store.wildPokemon.sprite}`"
        alt="pokemon"
        class="pokemon-sprite"
      />

      <h2>{{ store.wildPokemon.name }} (Nv. {{ store.wildPokemon.level }})</h2>

      <p><strong>Región:</strong> {{ store.wildPokemon.region }}</p>

      <p>
        <strong>HP:</strong>
        {{ store.wildPokemon.currentHp }} / {{ store.wildPokemon.maxHp }}
      </p>

      <!-- Resultado de captura -->
      <p v-if="message" class="result">{{ message }}</p>

      <!-- Shakes visuales -->
      <div v-if="shakes > 0" class="shake-box">
        <p>La Pokébola se agitó {{ shakes }} veces...</p>
      </div>

      <!-- Botones de pokébolas -->
      <div class="ball-buttons">
        <button @click="capturar('pokeball')" :disabled="store.isCaptureInProgress">Pokéball</button>
        <button @click="capturar('superball')" :disabled="store.isCaptureInProgress">Super Ball</button>
        <button @click="capturar('ultraball')" :disabled="store.isCaptureInProgress">Ultra Ball</button>
        <button @click="capturar('masterball')" :disabled="store.isCaptureInProgress">Master Ball</button>
      </div>
    </div>

    <!-- No hay encuentro -->
    <div v-else class="no-encounter">
      <p>No hay Pokémon encontrado todavía.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useEncounterStore } from "../stores/useEncounterStore";

const store = useEncounterStore();

const message = ref("");
const shakes = ref(0);

// Acción para generar encuentro
function buscarPokemon() {
  message.value = "";
  shakes.value = 0;
  store.generateEncounter("kanto"); // Puedes cambiar por "johto"
}

// Acción para capturar
async function capturar(tipo) {
  message.value = "";
  shakes.value = 0;

  const result = await store.tryCapture(tipo);

  shakes.value = result.shakes;

  if (result.success) {
    message.value = "¡Capturado!";
  } else {
    message.value = "¡El Pokémon escapó!";
  }
}
</script>

<style scoped>
.encounter-container {
  text-align: center;
  padding: 20px;
}

.explore-btn {
  padding: 10px 20px;
  background: #4ade80;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  margin-bottom: 20px;
}

.pokemon-card {
  margin-top: 20px;
  padding: 20px;
  background: #e5e7eb;
  border-radius: 12px;
  display: inline-block;
}

.pokemon-sprite {
  width: 150px;
  height: 150px;
}

.ball-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.ball-buttons button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.no-encounter {
  margin-top: 30px;
}

.result {
  margin-top: 10px;
  font-size: 20px;
  font-weight: bold;
}

.shake-box {
  margin-top: 10px;
  padding: 10px;
  background: #fde047;
  border-radius: 8px;
  display: inline-block;
}
</style>
