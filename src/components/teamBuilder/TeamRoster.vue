<!--
  TeamRoster Component
  Feature: 003-pokemon-team-builder
  Task: T033

  Displays the team roster with drag-and-drop reordering
-->
<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTeamStore } from '@/stores/team'
import TeamMemberCard from './TeamMemberCard.vue'

const teamStore = useTeamStore()
const { roster, teamSize, isTeamFull } = storeToRefs(teamStore)

const draggedIndex = ref<number | null>(null)

/**
 * Handle drag start
 */
function handleDragStart(index: number): void {
  draggedIndex.value = index
}

/**
 * Handle drag over (allow drop)
 */
function handleDragOver(event: DragEvent): void {
  event.preventDefault()
}

/**
 * Handle drop
 */
function handleDrop(targetIndex: number): void {
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    draggedIndex.value = null
    return
  }

  teamStore.reorderTeam(draggedIndex.value, targetIndex)
  teamStore.saveTeam()
  draggedIndex.value = null
}

/**
 * Handle remove Pokemon
 */
function handleRemove(position: number): void {
  teamStore.removePokemon(position)
  teamStore.saveTeam()
}

/**
 * Handle clear team
 */
function handleClearTeam(): void {
  if (confirm('Are you sure you want to clear the entire team?')) {
    teamStore.deleteTeam()
  }
}
</script>

<template>
  <div class="team-roster bg-gray-50 rounded-lg p-4">
    <!-- Header -->
    <div class="roster-header mb-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">
          Your Team ({{ teamSize }}/6)
        </h3>
        <button
          v-if="teamSize > 0"
          class="clear-button text-sm text-red-600 hover:text-red-800 transition-colors font-semibold"
          @click="handleClearTeam"
        >
          Clear Team
        </button>
      </div>
      <p v-if="isTeamFull" class="text-sm text-yellow-700 mt-1">
        Team is full (6/6). Remove a Pokemon to add more.
      </p>
      <p v-else class="text-sm text-gray-600 mt-1">
        Drag to reorder • Position 1 is your team lead
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="teamSize === 0" class="empty-state text-center py-8">
      <div class="text-gray-400 mb-3">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p class="text-gray-600 font-medium">No Pokemon in your team yet</p>
      <p class="text-sm text-gray-500 mt-1">Select a Pokemon and add moves to start building!</p>
    </div>

    <!-- Team Members List -->
    <div v-else class="team-members space-y-3">
      <div
        v-for="(member, index) in roster"
        :key="`${member.pokemon.id}-${member.position}`"
        class="team-member-wrapper"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover="handleDragOver"
        @drop="handleDrop(index)"
      >

        <!-- Team Member Card -->
        <TeamMemberCard
          :member="member"
          :is-lead="index === 0"
          @remove="handleRemove"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.team-roster {
  max-height: 800px;
  overflow-y: auto;
}

.team-member-wrapper {
  cursor: grab;
  transition: transform 0.2s;
  color: #000;
}

.team-member-wrapper:active {
  cursor: grabbing;
}

.team-member-wrapper:hover {
  transform: translateX(4px);
}

.position-indicator {
  padding-left: 8px;
}

/* Custom scrollbar */
.team-roster::-webkit-scrollbar {
  width: 8px;
}

.team-roster::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.team-roster::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.team-roster::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.empty-state {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
