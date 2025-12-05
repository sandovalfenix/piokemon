<script setup lang="ts">
import { defineEmits } from 'vue'
import { IconMapSearch, IconUsersGroup, IconBolt } from '@tabler/icons-vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'

const emit = defineEmits<{ (e: 'explore'): void; (e: 'heal'): void }>()
</script>

<template>
  <Card
    class="flex flex-col items-center justify-between gap-4 h-full bg-black/15 backdrop-blur-xs"
  >
    <CardHeader class="w-full !px-3 !pb-3">
      <CardTitle
        class="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2"
      >
        <IconBolt class="size-5" />
        Acciones de Zona
      </CardTitle>
      <CardDescription class="sr-only">Acciones rápidas disponibles en la zona</CardDescription>
      <CardAction>
        <Badge class="text-xs font-bold px-3 py-0.5 rounded-full">Rápido</Badge>
      </CardAction>
    </CardHeader>

    <CardContent class="flex gap-3 w-full items-center justify-center">
      <Button @click="emit('explore')" variant="default" size="lg" class="min-w-[120px] font-bold">
        <IconMapSearch class="size-4" />
        Explorar
      </Button>

      <Button @click="emit('heal')" variant="secondary" size="sm" class="min-w-[120px] font-bold">
        <IconUsersGroup class="size-4" />
        Mi equipo Pokemon
      </Button>
    </CardContent>
  </Card>
</template>
