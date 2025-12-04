<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Tipos de TypeScript para los datos del Lobby (simulados)
interface NPC {
  name: string
  role: string
  image: string // URL o path al asset de la imagen del NPC
}

interface Player {
  id: number
  name: string
  avatar: string // URL o path al avatar del jugador
  status: 'online' | 'busy' | 'offline'
}

const zoneName = 'Lobby Principal: El Corazón de Cali'

// Datos simulados (tendrán que ser reales a través de APIs en el futuro)
const npcs: NPC[] = [
  { name: 'Enfermera Joy', role: 'Curación', image: 'yoi.png' },
  { name: 'Profesor Oak', role: 'Investigación', image: 'prof-oak.png' },
  // ... Añade más NPCs
]

const onlinePlayers: Player[] = [
  { id: 1, name: 'NorbertoC', avatar: 'avatar1.png', status: 'online' },
  { id: 2, name: 'MayenaX', avatar: 'avatar2.png', status: 'busy' },
  // ... Añade más jugadores
]

// Asumiendo que las rutas para las acciones son:
// /explore
// /pokemon-center
// /shop
// /gym
</script>

<template>
  <div class="lobby-view-root">
    <div class="lobby-view-wrapper">
      <div class="lobby-bg" aria-hidden="true"></div>
      <header class="zone-header">
        <h2 class="zone-title">{{ zoneName }}</h2>
      </header>

      <div class="lobby-grid">
        <aside class="panel npcs-panel">
          <h3>NPCs</h3>
          <div class="npc-list">
            <div v-for="npc in npcs" :key="npc.name" class="npc-item">
              <img :src="npc.image" :alt="npc.name" class="npc-avatar" />
              <div class="npc-info">
                <span class="npc-name">{{ npc.name }}</span>
                <button class="talk-button">Hablar</button>
              </div>
            </div>
          </div>
        </aside>

        <main class="center-area">
          <div class="center-content"></div>
        </main>

        <aside class="panel right-panel">
          <div class="online-players">
            <h3>Jugadores Online</h3>
            <div class="player-list">
              <div v-for="player in onlinePlayers" :key="player.id" class="player-item">
                <img :src="player.avatar" :alt="player.name" class="player-avatar" />
                <span class="player-name">{{ player.name }}</span>
                <div :class="['status-dot', player.status]"></div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <RouterLink to="/batallas" class="battles-panel">
        <h3>Batallas Activas</h3>
        <img :src="`/batalla.png`" alt="Batalla" class="batalla-image" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* 1. Contenedor Principal para Centrar la Vista Completa */
.lobby-view-root {
  /* Ocupa el 100% del ancho de la pantalla (Viewport Width) */
  width: 90vw;
  /* Si necesitas que ocupe toda la altura */
  min-height: 90vh;

  /* Usa Flexbox para centrar el contenido (wrapper) */
  display: flex;
  justify-content: center; /* Centra horizontalmente el wrapper */
  align-items: center; /* Alinea arriba el wrapper */

  padding: 10px 0; /* Padding arriba y abajo */
  /* El overflow-x: hidden es CRUCIAL para evitar una barra de desplazamiento horizontal
     que puede aparecer debido a la combinación de width: 100vw y padding/margen externos. */
  overflow-x: hidden;
}

/* Contenedor del Lobby con ancho limitado para centrado */
.lobby-view-wrapper {
  position: relative;
  width: 100%; /* Ocupa el 90% del ancho disponible en lobby-view-root */
  max-width: 1200px; /* Limita el tamaño máximo */
  min-height: 95vh;
}

/* Fondo Fijo - No necesita cambios */
.lobby-bg {
  position: fixed;
  inset: 0;
  background-image: url('/lobbies/principal.png');
  background-size: cover;
  background-position: center;
  z-index: -2;
}

/* ---------------------------------------------------- */
/* Título de la Zona */
/* ---------------------------------------------------- */
.zone-header {
  padding: 1.5rem 2rem;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  border: 2px solid #888;
  margin: 1rem auto;
  width: fit-content;
}

.zone-title {
  color: white;
  font-size: 2.2rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* ---------------------------------------------------- */
/* GRID de 3 Columnas */
/* ---------------------------------------------------- */
.lobby-grid {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 1rem;
  padding: 1rem;
  height: calc(95vh - 150px);
}

/* ---------------------------------------------------- */
/* Fondo Negro con 70% de Transparencia (Paneles Laterales) */
/* ---------------------------------------------------- */
.panel {
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid #888;
  border-radius: 12px;
  padding: 1rem;
  color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
}

.panel h3 {
  color: #ffd700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 5px;
}

.npc-item,
.player-item {
  background-color: rgba(255, 255, 255, 0.1);
}

/* ---------------------------------------------------- */
/* Área Central Transparente */
/* ---------------------------------------------------- */
.center-area {
  background-color: transparent;
  border-radius: 12px;
  padding: 0;
}

.center-content {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Estilos de NPC y Jugadores (mantenidos para contraste) */
.npc-name,
.player-name {
  color: white;
  font-weight: bold;
}

.npc-avatar,
.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.talk-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: auto;
}
.status-dot.online {
  background-color: #10b981;
}
.status-dot.busy {
  background-color: #f59e0b;
}

/* ---------------------------------------------------- */
/* Panel de Batallas Activas */
/* ---------------------------------------------------- */
.battles-panel {
  position: fixed;
  bottom: 0.5rem;
  right: 8.9%;
  width: 250px;
  height: calc(var(--bottom-nav-height, 96px) * 1.3);
  background-color: rgba(0, 0, 0, 0.7);
  border: 3px solid #3b82f6;
  border-radius: 12px;
  padding: 1rem;
  color: white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 99;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.battles-panel:hover {
  border-color: #60a5fa;
  background-color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.battles-panel h3 {
  color: #ffd700;
  margin: 0;
  font-size: 0.95rem;
}

.batalla-image {
  width: 110px;
  height: 85px;
  object-fit: cover;
  border-radius: 8px;
}
.status-dot.offline {
  background-color: #9ca3af;
}
</style>
