<script setup lang="ts">
import MoveSelector from '../MoveSelector.vue'
import LogPanel from './LogPanel.vue'
import type { Move } from '@/domain/battle/engine/entities'

interface Props {
  currentView: 'main' | 'fight'
  logMessages: string[]
  playerMoves: Move[]
  isAttacking: boolean
  /** Feature 007: Is this a wild battle? Enables Pokéballs button */
  isWildBattle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isWildBattle: false, // Pokéballs disabled by default (only in wild battles)
})


</script>

<template>
  <div class="control-area">
    <!-- Vista principal -->
    <template v-if="props.currentView === 'main'">
      <!-- Contenedor de Log y Botones lado a lado -->
      <div class="main-layout">
        <!-- LogPanel en el lado izquierdo -->
        <div class="log-section">
          <LogPanel
            :messages="props.logMessages"
            :max-messages="8"
            :is-battle-style="true"
          />
        </div>

        <!-- Botones de acciones en el lado derecho -->
        <div class="action-panel ">
          <button class="action-btn" @click="$emit('fight')">
            <span class="action-text">FIGHT</span>
          </button>
                    <button
            class="action-btn"
            :disabled="!props.isWildBattle"
            :class="{ 'opacity-50 cursor-not-allowed': !props.isWildBattle }"
            @click="props.isWildBattle && $emit('bag')"
          >
            <span class="action-text">POKÉBALLS</span>
          </button>
          <button class="action-btn" @click="$emit('pokemon')">
            <span class="action-text">POKÉMON</span>
          </button>
          <button class="action-btn" @click="$emit('run')">
            <span class="action-text">RUN</span>
          </button>
        </div>
      </div>
    </template>

    <!-- MoveSelector as Full Overlay (covers battle logs) -->
    <template v-else-if="props.currentView === 'fight'">
      <div class="fight-overlay">
        <!-- Full-width MoveSelector with Cancel button -->
        <div class="fight-overlay-content">
          <div class="fight-header">
            <span class="fight-title">Select a Move</span>
            <button class="cancel-button" @click="$emit('back')">
              <span class="cancel-icon">✕</span>
              <span class="cancel-text">CANCEL</span>
            </button>
          </div>
          <MoveSelector
            :moves="props.playerMoves"
            :is-battle-style="true"
            :disabled="props.isAttacking"
            @select-move="(id: string) => $emit('select-move', id)"
            @back="$emit('back')"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.control-area {
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  overflow-y: auto;
}

.action-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  color: white;
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 150ms;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  transform: translate(1px, 1px);
}

.action-btn:active {
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1);
  transform: translate(2px, 2px);
}

.action-text {
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.05em;
}

/* Fight Overlay Styles - Full screen coverage */
.fight-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  padding: 8px;
  z-index: 50;
  overflow: hidden;
}

.fight-overlay-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  overflow: hidden;
}

.fight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.fight-title {
  font-size: 0.875rem;
  font-weight: bold;
  color: white;
  letter-spacing: 0.05em;
}

.cancel-button {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.65rem;
  font-weight: bold;
  color: #ef4444;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.cancel-button:hover {
  background: #ef4444;
  color: white;
}

.back-arrow {
  font-size: 11px;
}

.cancel-icon {
  font-size: 0.875rem;
}

.cancel-text {
  letter-spacing: 0.05em;
}

/* New Layout Styles */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100%;
  padding: 8px;
}

.log-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.move-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

@media (max-width: 800px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
