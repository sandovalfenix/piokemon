<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <Card class="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      <!-- Contenido según el resultado -->
      <CardContent class="pt-8">
        <div class="flex flex-col items-center gap-6 text-center">
          <!-- Ícono y mensaje según resultado -->
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full"
            :class="
              resultado === 'capturado'
                ? 'bg-primary/20 text-primary'
                : 'bg-destructive/20 text-destructive'
            "
          >
            <svg
              v-if="resultado === 'capturado'"
              class="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <!-- Título principal -->
          <div>
            <h2
              class="text-2xl font-bold"
              :class="
                resultado === 'capturado'
                  ? 'text-primary'
                  : 'text-destructive'
              "
            >
              {{ resultado === 'capturado' ? '¡Pokémon capturado!' : '¡Pokémon escapó!' }}
            </h2>
          </div>

          <!-- Detalles del Pokémon (si aplica) -->
          <div
            v-if="resultado === 'capturado' && pokemon"
            class="w-full rounded-lg bg-card p-4 border border-border"
          >
            <p class="text-sm text-muted-foreground mb-2">Pokémon capturado:</p>
            <p class="text-lg font-semibold text-card-foreground">
              {{ pokemon.name }}
            </p>
            <!-- Feature 007: Save location badge -->
            <p v-if="saveLocationMessage" class="mt-2 text-sm font-medium text-primary">
              {{ saveLocationMessage }}
            </p>
          </div>

          <!-- Descripción según resultado -->
          <p class="text-sm text-muted-foreground">
            {{
              resultado === 'capturado'
                ? '¡Lo lograste! El Pokémon ha sido capturado exitosamente.'
                : 'El Pokémon se escapó. ¡Intenta de nuevo!'
            }}
          </p>
        </div>
      </CardContent>

      <!-- Pie con botón OK -->
      <CardFooter class="border-t border-border">
        <Button
          @click="handleOk"
          class="w-full"
          :class="
            resultado === 'capturado'
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-destructive hover:bg-destructive/90'
          "
        >
          OK
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
/**
 * FinalCaptura Component
 * Feature: 007-wild-encounter-capture (T028)
 *
 * Shows capture result (success or escape).
 * Displays where the Pokémon was saved (team or PC Box).
 */
import { computed } from 'vue'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Pokemon {
  name: string
  id?: number
  [key: string]: any
}

interface Props {
  resultado: 'capturado' | 'escapó'
  pokemon?: Pokemon
  /** Feature 007: Where the Pokémon was saved */
  saveLocation?: 'team' | 'pcbox'
}

const props = withDefaults(defineProps<Props>(), {
  resultado: 'escapó',
  saveLocation: 'team',
})

const emit = defineEmits<{
  'volver-inicio': []
}>()

/** Feature 007: Save location message */
const saveLocationMessage = computed(() => {
  if (props.resultado !== 'capturado') return ''
  if (props.saveLocation === 'pcbox') {
    return 'Enviado a PC Box (equipo lleno)'
  }
  return 'Añadido a tu equipo'
})

const handleOk = () => {
  emit('volver-inicio')
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoom-in-95 {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

.animate-in {
  animation: fade-in 0.3s ease-out, zoom-in-95 0.3s ease-out;
}

.fade-in {
  animation-name: fade-in;
}

.zoom-in-95 {
  animation-name: zoom-in-95;
}

.duration-300 {
  animation-duration: 0.3s;
}
</style>
