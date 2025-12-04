<script setup lang="ts">
/**
 * DefeatModal - Shadcn Dialog for battle defeat outcome
 * Feature: 006-battle-module-update (T035)
 *
 * Shows defeat message with opponent name and Return to Lobby button
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  /** Whether the modal is visible */
  open: boolean
  /** Name of the opponent who won */
  opponentName: string
}

defineProps<Props>()

const emit = defineEmits<{
  /** Emitted when user clicks Return to Lobby */
  (e: 'close'): void
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <Dialog :open="open">
    <DialogContent
      class="sm:max-w-md bg-gradient-to-b from-red-950/95 to-slate-900/95 backdrop-blur-lg border-red-800/50"
    >
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold text-red-400 text-center">
          ¡Has sido derrotado!
        </DialogTitle>
        <DialogDescription class="text-center text-slate-300 text-lg mt-2">
          {{ opponentName }} ha vencido a tu equipo.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col items-center gap-4 py-6">
        <!-- Defeat Icon -->
        <div
          class="w-24 h-24 rounded-full bg-red-900/50 flex items-center justify-center border-2 border-red-600/50"
        >
          <span class="text-5xl">💀</span>
        </div>

        <p class="text-slate-400 text-sm text-center max-w-xs">
          No te preocupes, tu equipo será curado automáticamente. ¡Vuelve a intentarlo!
        </p>
      </div>

      <DialogFooter class="sm:justify-center">
        <Button
          variant="destructive"
          size="lg"
          class="w-full sm:w-auto px-8 bg-red-600 hover:bg-red-700"
          @click="handleClose"
        >
          Volver al Lobby
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
