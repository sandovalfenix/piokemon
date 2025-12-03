<script setup lang="ts">
import MoveSelector from '../MoveSelector.vue'
import LogPanel from './LogPanel.vue'
import type { Move } from '@/domain/battle/engine/entities'

interface Props {
  currentView: 'main' | 'fight'
  logMessages: string[]
  playerMoves: Move[]
  isAttacking: boolean
}

const props = defineProps<Props>()


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
          <button class="action-btn" @click="$emit('bag')">
            <span class="action-text">BAG</span>
          </button>
          <button class="action-btn" @click="$emit('pokemon')">
            <span class="action-text">POKéMON</span>
          </button>
          <button class="action-btn" @click="$emit('run')">
            <span class="action-text">RUN</span>
          </button>
        </div>
      </div>
    </template>

    <!-- MoveSelector con LogPanel a su lado -->
    <template v-else-if="props.currentView === 'fight'">
      <div class="fight-layout">
        <!-- LogPanel en el lado izquierdo -->
        <div class="log-section">
          <LogPanel
            :messages="props.logMessages"
            :max-messages="8"
            :is-battle-style="true"
          />
        </div>

        <!-- MoveSelector -->
        <div class="move-section">
          <MoveSelector
            :moves="props.playerMoves"
            :is-battle-style="true"
            :disabled="props.isAttacking"
            @select-move="(id: string) => $emit('select-move', id)"
            @back="$emit('back')"
          />
          <button class="back-button" @click="$emit('back')">
            <span class="back-arrow">←</span> ATRÁS
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.control-area {
  height: 100%;
  background: oklch(var(--color-muted));
  border-top: 3px solid oklch(var(--color-border));
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
  background: #f3f4f6;
  color: #1f2937;
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 150ms;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9);
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

.back-button {
  background: oklch(var(--color-card));
  border: 2px solid oklch(var(--color-border));
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 9px;
  font-weight: bold;
  color: oklch(var(--color-foreground));
  cursor: pointer;
  align-self: flex-start;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.1s ease;
}

.back-button:hover {
  background: oklch(var(--color-accent));
}

.back-arrow {
  font-size: 11px;
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

.fight-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100%;
  padding: 8px;
}

@media (max-width: 800px) {
  .main-layout,
  .fight-layout {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
