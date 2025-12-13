<template>
  <div id="app-container">
    <header class="main-nav">
      <nav>
        <RouterLink to="/map">Mapa</RouterLink>
        <RouterLink to="/zone/2">Zona 2</RouterLink>
        <RouterLink to="/missions">Misiones</RouterLink>
        <RouterLink to="/pvp">PvP</RouterLink>
        <RouterLink to="/pokemons">Pokémon</RouterLink>
      </nav>
    </header>
    <main class="router-area">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router';
</script>

<style>
/* Estilos globales */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

#app-container {
  width: 100vw;
  height: 100vh;
}
.sample-cards {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #eef2f6;
}
.router-area { height: calc(100vh - 100px); overflow: auto }
.main-nav { background: #2a6b8f; padding: 8px; }
.main-nav nav { display: flex; gap: 12px; justify-content: center; }
.main-nav a { color: #fff; text-decoration: none; padding: 6px 10px; border-radius: 6px; }
.main-nav a.router-link-active { background: rgba(255,255,255,0.12); }
</style>