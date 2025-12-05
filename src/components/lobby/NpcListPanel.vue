<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconUser } from '@tabler/icons-vue'
// UI components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'

export interface Npc {
  id: string
  name: string
  role: string
  avatarUrl?: string
  isInteractive: boolean
}
const emit = defineEmits<{ (e: 'interact', npcId: string): void }>()
const npcList = ref<Npc[]>([])
const loadNpcs = async () => {
  npcList.value = [
    { id: 'npc_joy_01', name: 'Nurse Joy', role: 'Healer', isInteractive: true },
    { id: 'npc_oak_01', name: 'Professor Oak', role: 'Professor', isInteractive: true },
    { id: 'npc_norse_01', name: 'Norse', role: 'Rival', isInteractive: true },
    { id: 'npc_mahipuk', name: 'Mahipuk', role: 'Trainer', isInteractive: false },
    { id: 'npc_joy_02', name: 'Nurse Joy', role: 'Healer', isInteractive: true },
  ]
}
onMounted(() => {
  loadNpcs()
})
</script>

<template>
  <Card class="h-full flex flex-col overflow-hidden bg-black/15 backdrop-blur-xs">
    <CardHeader class="!px-3 !pb-3">
      <CardTitle
        class="text-lg font-black tracking-wide uppercase flex items-center gap-2 text-white"
      >
        <IconUser class="size-5" />
        NPCs
      </CardTitle>
      <CardDescription class="sr-only">Lista de NPCs disponibles en la zona</CardDescription>
      <CardAction>
        <Badge class="px-2 py-0.5 rounded-full text-xs font-bold">{{ npcList.length }}</Badge>
      </CardAction>
    </CardHeader>

    <CardContent class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
      <div
        v-for="npc in npcList"
        :key="npc.id"
        class="group flex items-center justify-between p-2 pl-3 rounded-full transition-all duration-300 hover:bg-accent/50"
      >
        <div class="flex items-center gap-3">
          <div class="relative flex-none">
            <Avatar class="size-11 group-hover:border-cyan-300 transition-colors">
              <AvatarImage v-if="npc.avatarUrl" :src="npc.avatarUrl" alt="avatar" />
              <AvatarFallback v-else>
                <IconUser class="size-7 text-sidebar-primary" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div class="flex flex-col min-w-0">
            <Label class="text-sm font-bold drop-shadow-sm truncate text-white">
              {{ npc.name }}
            </Label>
            <CardDescription class="text-[10px] uppercase tracking-wider font-bold text-white/80">
              {{ npc.role }}
            </CardDescription>
          </div>
        </div>

        <Button
          @click="emit('interact', npc.id)"
          :disabled="!npc.isInteractive"
          variant="default"
          size="sm"
          class="mr-1 text-xs uppercase tracking-wider"
          title="Hablar"
        >
          Hablar
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
