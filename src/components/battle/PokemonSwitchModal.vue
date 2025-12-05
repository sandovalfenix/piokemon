<script setup lang="ts">
/**
 * PokemonSwitchModal - Modal for switching Pokemon during battle
 * Feature: 006-battle-module-update
 *
 * Uses shadcn Dialog and Tailwind CSS for styling.
 */

import { computed } from 'vue'
import type { Pokemon } from '@/domain/battle/engine/entities'
import { getPokemonOfficialArtworkUrl } from '@/utils/pokemonSpriteMap'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  /** Whether the modal is open */
  open: boolean
  /** Player's team */
  team: Pokemon[]
  /** Current active Pokemon ID */
  currentPokemonId: string
  /** Whether this is a forced switch (Pokemon fainted) */
  forcedSwitch?: boolean
}

interface Emits {
  (e: 'select', index: number): void
  (e: 'close'): void
  /** Emitted when player has no available Pokemon - signals defeat */
  (e: 'defeat'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle return to lobby when defeated (no available Pokemon)
 */
function handleDefeat() {
  emit('defeat')
}

// Computed for available Pokemon (alive and not current)
const availablePokemon = computed(() =>
  props.team.filter((p) => p.currentHp > 0 && p.id !== props.currentPokemonId)
)

const hasAvailablePokemon = computed(() => availablePokemon.value.length > 0)

// Computed class for dialog content
const dialogContentClass = computed(() =>
  cn(
    'sm:max-w-2xl bg-gradient-to-b from-slate-900/95 to-blue-950/95 backdrop-blur-lg border-blue-700/50',
    props.forcedSwitch && 'pointer-events-auto'
  )
)

/**
 * Get HP bar color based on percentage
 */
function getHpBarColor(pokemon: Pokemon): string {
  const hpPercent = pokemon.currentHp / pokemon.stats.hp
  if (hpPercent > 0.5) return 'bg-emerald-500'
  if (hpPercent > 0.25) return 'bg-amber-500'
  return 'bg-red-500'
}

/**
 * Get HP percentage for width
 */
function getHpPercent(pokemon: Pokemon): number {
  return (pokemon.currentHp / pokemon.stats.hp) * 100
}

/**
 * Handle Pokemon selection
 */
function handleSelect(index: number) {
  const pokemon = props.team[index]
  if (pokemon && pokemon.currentHp > 0 && pokemon.id !== props.currentPokemonId) {
    emit('select', index)
  }
}

/**
 * Handle close (only if not forced)
 */
function handleClose() {
  if (!props.forcedSwitch) {
    emit('close')
  }
}

/**
 * Get type badge color
 */
function getTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    Normal: 'bg-gray-400',
    Fire: 'bg-orange-500',
    Water: 'bg-blue-500',
    Electric: 'bg-yellow-400',
    Grass: 'bg-green-500',
    Ice: 'bg-cyan-300',
    Fighting: 'bg-red-700',
    Poison: 'bg-purple-500',
    Ground: 'bg-amber-600',
    Flying: 'bg-indigo-300',
    Psychic: 'bg-pink-500',
    Bug: 'bg-lime-500',
    Rock: 'bg-stone-500',
    Ghost: 'bg-purple-700',
    Dragon: 'bg-indigo-700',
    Dark: 'bg-slate-700',
    Steel: 'bg-slate-400',
    Fairy: 'bg-pink-300',
  }
  return colors[type] ?? 'bg-gray-500'
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && handleClose()">
    <DialogContent :class="dialogContentClass">
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold text-center text-blue-400">
          {{ forcedSwitch ? '¡Tu Pokémon se debilitó!' : 'Cambiar Pokémon' }}
        </DialogTitle>
        <DialogDescription class="text-center text-slate-300">
          {{
            forcedSwitch
              ? 'Elige tu próximo Pokémon para continuar la batalla'
              : 'Selecciona un Pokémon para cambiar'
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- No available Pokemon warning -->
      <div
        v-if="!hasAvailablePokemon"
        class="py-8 text-center"
      >
        <div class="mb-4">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-red-900/50 flex items-center justify-center border-2 border-red-600/50">
            <span class="text-4xl">💔</span>
          </div>
          <p class="text-lg font-semibold text-red-400">¡No tienes Pokémon disponibles!</p>
          <p class="text-sm text-slate-400 mt-2">Todos tus Pokémon han sido derrotados.</p>
        </div>
        <Button
          variant="destructive"
          size="lg"
          class="w-full sm:w-auto px-8 bg-red-600 hover:bg-red-700 text-white"
          @click="handleDefeat"
        >
          Volver al Lobby
        </Button>
      </div>

      <!-- Pokemon Grid -->
      <div v-else class="grid grid-cols-2 gap-3 py-4 max-h-96 overflow-y-auto">
        <button
          v-for="(pokemon, index) in team"
          :key="pokemon.id"
          :disabled="pokemon.currentHp === 0 || pokemon.id === currentPokemonId"
          :class="[
            'relative p-3 rounded-xl border-2 transition-all duration-200 text-left',
            'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900',
            pokemon.currentHp === 0
              ? 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
              : pokemon.id === currentPokemonId
                ? 'bg-blue-900/40 border-blue-500/50 cursor-not-allowed'
                : 'bg-slate-800/50 border-slate-600/50 hover:border-blue-400 hover:bg-slate-700/50 cursor-pointer',
          ]"
          @click="handleSelect(index)"
        >
          <!-- Current Pokemon badge -->
          <div
            v-if="pokemon.id === currentPokemonId"
            class="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full"
          >
            EN BATALLA
          </div>

          <!-- Fainted badge -->
          <div
            v-if="pokemon.currentHp === 0"
            class="absolute -top-2 -right-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full"
          >
            DEBILITADO
          </div>

          <div class="flex items-center gap-3">
            <!-- Pokemon Image -->
            <div class="relative flex-shrink-0">
              <img
                :src="getPokemonOfficialArtworkUrl(pokemon.name)"
                :alt="pokemon.name"
                class="w-16 h-16 object-contain"
                :class="{ 'grayscale': pokemon.currentHp === 0 }"
              />
            </div>

            <!-- Pokemon Info -->
            <div class="flex-1 min-w-0">
              <!-- Name and Level -->
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-white truncate">{{ pokemon.name }}</h3>
                <span class="text-xs text-slate-400 ml-2">Nv. {{ pokemon.level }}</span>
              </div>

              <!-- Types -->
              <div class="flex gap-1 mb-2">
                <span
                  v-for="type in pokemon.types"
                  :key="type"
                  :class="[
                    'text-xs px-1.5 py-0.5 rounded text-white font-medium',
                    getTypeBadgeColor(type),
                  ]"
                >
                  {{ type }}
                </span>
              </div>

              <!-- HP Bar -->
              <div class="space-y-1">
                <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    :class="['h-full transition-all duration-300', getHpBarColor(pokemon)]"
                    :style="{ width: `${getHpPercent(pokemon)}%` }"
                  />
                </div>
                <p class="text-xs text-slate-400 text-right">
                  {{ pokemon.currentHp }} / {{ pokemon.stats.hp }} HP
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- Footer with Cancel button (only if not forced) -->
      <div v-if="!forcedSwitch" class="flex justify-end pt-2 border-t border-slate-700/50">
        <Button
          variant="outline"
          class="border-slate-600 text-black-300 hover:bg-slate-800 hover:text-white"
          @click="handleClose"
        >
          Cancelar
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
