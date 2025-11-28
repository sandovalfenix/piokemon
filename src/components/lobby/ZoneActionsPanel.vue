<script setup lang="ts">
import { defineEmits } from 'vue'
import { IconMapSearch, IconFirstAidKit } from "@tabler/icons-vue"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const emit = defineEmits<{ (e: 'explore'): void; (e: 'heal'): void }>()

</script>

<template>
  <div class="lobby-panel rounded-3xl p-4 flex flex-col items-center justify-between gap-4 h-full">
    <div class="lobby-header w-full p-3 rounded-xl border-b flex items-center justify-between">
      <h3 class="text-sm font-black uppercase tracking-widest drop-shadow-sm" style="color:var(--color-card-foreground)">Acciones de Zona</h3>
      <Badge class="text-xs font-bold px-3 py-0.5 rounded-full">Rápido</Badge>
    </div>

    <div class="flex gap-3 w-full items-center justify-center">
      <Button @click="emit('explore')" variant="default" size="lg" class="px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-2">
        <IconMapSearch class="size-4" />
        Explorar
      </Button>

      <Button @click="emit('heal')" variant="secondary" size="sm" class="px-3 py-2 rounded-full font-bold shadow-md flex items-center gap-2">
        <IconFirstAidKit class="size-4" />
        Curar Equipo
      </Button>
    </div>

    <div class="w-full text-xs text-center pt-1" style="color:var(--color-muted-foreground)">
      Las acciones rápidas son accesos directos rápidos para interactuar con la zona.
    </div>
  </div>
</template>

<style scoped>
.lobby-panel{ background: var(--color-card); border: 1px solid rgba(255,255,255,0.03); color:var(--color-card-foreground) }
.lobby-header{ background: rgba(255,255,255,0.01); }
.lobby-panel .shacdn-btn{ min-width: 120px }
</style>

