<script setup lang="ts">
/**
 * MoveLearningModal - Shadcn Dialog for learning new moves
 * Feature: 006-battle-module-update (T029)
 *
 * Shows when Pokemon wants to learn a new move but already has 4 moves.
 * User can replace an existing move or skip learning.
 */
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Move } from '@/domain/battle/engine/entities'

interface Props {
  /** Whether the modal is visible */
  open: boolean
  /** Name of the Pokemon learning the move */
  pokemonName: string
  /** The new move being learned */
  newMove: Move
  /** Current moves (should be 4) */
  currentMoves: Move[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Emitted when user selects a move to replace (index 0-3) */
  (e: 'replace', moveIndex: number): void
  /** Emitted when user skips learning the new move */
  (e: 'skip'): void
}>()

const selectedMoveIndex = ref<number | null>(null)

const canConfirm = computed(() => selectedMoveIndex.value !== null)

// Expose props as computed for template use
const pokemonDisplayName = computed(() => props.pokemonName)
const newMoveData = computed(() => props.newMove)
const currentMovesList = computed(() => props.currentMoves)

function selectMove(index: number) {
  selectedMoveIndex.value = index
}

function handleConfirm() {
  if (selectedMoveIndex.value !== null) {
    emit('replace', selectedMoveIndex.value)
    selectedMoveIndex.value = null
  }
}

function handleSkip() {
  emit('skip')
  selectedMoveIndex.value = null
}

/**
 * Get color class based on move type
 */
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Normal: 'bg-gray-500',
    Fire: 'bg-red-500',
    Water: 'bg-blue-500',
    Electric: 'bg-yellow-500',
    Grass: 'bg-green-500',
    Ice: 'bg-cyan-400',
    Fighting: 'bg-orange-700',
    Poison: 'bg-purple-500',
    Ground: 'bg-amber-700',
    Flying: 'bg-indigo-400',
    Psychic: 'bg-pink-500',
    Bug: 'bg-lime-600',
    Rock: 'bg-stone-600',
    Ghost: 'bg-violet-700',
    Dragon: 'bg-indigo-700',
    Dark: 'bg-slate-700',
    Steel: 'bg-slate-400',
    Fairy: 'bg-pink-400',
  }
  return colors[type] ?? 'bg-gray-500'
}
</script>

<template>
  <Dialog :open="open">
    <DialogContent
      class="sm:max-w-lg bg-gradient-to-b from-blue-950/95 to-slate-900/95 backdrop-blur-lg border-blue-800/50"
    >
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-blue-400 text-center">
          ¡{{ pokemonDisplayName }} quiere aprender {{ newMoveData.name }}!
        </DialogTitle>
        <DialogDescription class="text-center text-slate-300 mt-2">
          Pero {{ pokemonDisplayName }} ya conoce 4 movimientos. ¿Quieres olvidar uno para aprender {{ newMoveData.name }}?
        </DialogDescription>
      </DialogHeader>

      <div class="py-4 space-y-4">
        <!-- New Move Preview -->
        <div class="p-3 rounded-lg bg-green-900/30 border border-green-600/50">
          <p class="text-xs text-green-400 mb-2 font-semibold">NUEVO MOVIMIENTO</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white">{{ newMoveData.name }}</span>
              <span :class="['text-xs px-2 py-0.5 rounded text-white', getTypeColor(newMoveData.type)]">
                {{ newMoveData.type }}
              </span>
            </div>
            <div class="text-sm text-slate-400">
              <span>Poder: {{ newMoveData.power }}</span>
              <span class="ml-2">Prec: {{ newMoveData.accuracy }}%</span>
            </div>
          </div>
        </div>

        <!-- Current Moves -->
        <div class="space-y-2">
          <p class="text-xs text-slate-400 font-semibold">SELECCIONA UN MOVIMIENTO PARA OLVIDAR</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(move, index) in currentMovesList"
              :key="move.id"
              :class="[
                'p-3 rounded-lg border transition-all text-left',
                selectedMoveIndex === index
                  ? 'bg-red-900/50 border-red-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
              ]"
              @click="selectMove(index)"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-white text-sm">{{ move.name }}</span>
                <span :class="['text-xs px-1.5 py-0.5 rounded text-white', getTypeColor(move.type)]">
                  {{ move.type }}
                </span>
              </div>
              <div class="text-xs text-slate-400">
                <span>Poder: {{ move.power }}</span>
                <span class="ml-2">Prec: {{ move.accuracy }}%</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <DialogFooter class="flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          class="w-full sm:w-auto"
          @click="handleSkip"
        >
          No aprender
        </Button>
        <Button
          :disabled="!canConfirm"
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          @click="handleConfirm"
        >
          Olvidar y aprender
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
