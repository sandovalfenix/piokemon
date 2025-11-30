<!--
  MoveCard Component
  Feature: 003-pokemon-team-builder
  Task: T022

  Displays a single Move with name, type, power, accuracy, PP, and category
-->
<script setup lang="ts">
import type { Move } from '@/models/teamBuilder'

interface Props {
  move: Move
  selected?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'add', move: Move): void
  (e: 'remove', move: Move): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

/**
 * Get type color class for styling
 */
function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    Normal: 'bg-gray-400',
    Fire: 'bg-red-500',
    Water: 'bg-blue-500',
    Electric: 'bg-yellow-400',
    Grass: 'bg-green-500',
    Ice: 'bg-cyan-400',
    Fighting: 'bg-orange-700',
    Poison: 'bg-purple-500',
    Ground: 'bg-yellow-700',
    Flying: 'bg-indigo-400',
    Psychic: 'bg-pink-500',
    Bug: 'bg-lime-500',
    Rock: 'bg-yellow-800',
    Ghost: 'bg-purple-700',
    Dragon: 'bg-indigo-700',
    Dark: 'bg-gray-700',
    Steel: 'bg-gray-500',
    Fairy: 'bg-pink-400',
  }
  return typeColors[type] ?? 'bg-gray-400'
}

/**
 * Get category label
 */
function getCategoryLabel(category: string): string {
  return category || 'Unknown'
}

/**
 * Get category styling class
 */
function getCategoryClass(category: string): string {
  const classes: Record<string, string> = {
    Physical: 'bg-red-100 text-red-700',
    Special: 'bg-blue-100 text-blue-700',
    Status: 'bg-gray-100 text-gray-700',
  }
  return classes[category] ?? 'bg-gray-100 text-gray-700'
}

/**
 * Handle add button click
 */
function handleAdd(): void {
  if (!props.disabled) {
    emit('add', props.move)
  }
}

/**
 * Handle remove button click
 */
function handleRemove(): void {
  emit('remove', props.move)
}
</script>

<template>
  <div
    class="move-card p-3 rounded-lg border-2 transition-all"
    :class="{
      'border-green-500 bg-green-50': selected,
      'border-gray-300 bg-white hover:border-gray-400': !selected,
      'opacity-50 cursor-not-allowed': disabled,
    }"
  >
    <!-- Move Name & Type -->
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-semibold text-lg text-gray-900">{{ move.name }}</h4>
      <span
        class="type-badge px-2 py-1 rounded text-white text-xs font-bold"
        :class="getTypeColor(move.type)"
      >
        {{ move.type }}
      </span>
    </div>

    <!-- Move Stats -->
    <div class="grid grid-cols-4 gap-2 text-sm mb-2">
      <div class="stat">
        <div class="text-gray-600 text-xs">Power</div>
        <div class="font-bold text-gray-900">
          {{ move.power !== null ? move.power : '—' }}
        </div>
      </div>
      <div class="stat">
        <div class="text-gray-600 text-xs">Accuracy</div>
        <div class="font-bold text-gray-900">
          {{ move.accuracy > 0 ? `${move.accuracy}%` : '—' }}
        </div>
      </div>
      <div class="stat">
        <div class="text-gray-600 text-xs">PP</div>
        <div class="font-bold text-gray-900">{{ move.pp }}</div>
      </div>
      <div class="stat">
        <div class="text-gray-600 text-xs">Category</div>
        <div
          class="category-badge px-1.5 py-0.5 rounded text-xs font-semibold"
          :class="getCategoryClass(move.category)"
        >
          {{ getCategoryLabel(move.category) }}
        </div>
      </div>
    </div>

    <!-- Move Effect (optional) -->
    <p v-if="move.effect" class="text-xs text-gray-600 mb-2 line-clamp-2">
      {{ move.effect }}
    </p>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        v-if="!selected"
        class="add-button flex-1 px-3 py-1 rounded text-sm font-semibold transition-colors"
        :class="{
          'bg-green-500 text-white hover:bg-green-600': !disabled,
          'bg-gray-300 text-gray-500 cursor-not-allowed': disabled,
        }"
        :disabled="disabled"
        :aria-label="`Add ${move.name} to selected moves`"
        @click="handleAdd"
      >
        Add Move
      </button>
      <button
        v-else
        class="remove-button flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm font-semibold hover:bg-red-600 transition-colors"
        :aria-label="`Remove ${move.name} from selected moves`"
        @click="handleRemove"
      >
        Remove Move
      </button>
    </div>
  </div>
</template>

<style scoped>
.move-card {
  cursor: pointer;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
