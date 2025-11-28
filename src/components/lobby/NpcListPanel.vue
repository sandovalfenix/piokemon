<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconUser } from "@tabler/icons-vue"
// UI components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface Npc {
  id: string; name: string; role: string; avatarUrl?: string; isInteractive: boolean
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
onMounted(() => { loadNpcs() })
</script>

<template>
  <div class="h-full flex flex-col lobby-panel rounded-3xl overflow-hidden">
    <div class="lobby-header pb-3 pt-4 px-4 border-b">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2 drop-shadow-md text-shadow-outline">
          NPCs
        </h2>
        <Badge class="px-2 py-0.5 rounded-full text-xs font-bold">{{ npcList.length }}</Badge>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
      <div 
        v-for="npc in npcList" 
        :key="npc.id"
        class="group flex items-center justify-between p-2 pl-3 rounded-full transition-all duration-300 lobby-item"
      >
        <div class="flex items-center gap-3">
          <div class="relative flex-none">
            <Avatar class="size-11 rounded-full group-hover:border-cyan-300 transition-colors shadow-md">
              <AvatarImage v-if="npc.avatarUrl" :src="npc.avatarUrl" alt="avatar" />
              <AvatarFallback v-else><IconUser class="size-7" style="color:var(--color-sidebar-primary)"/></AvatarFallback>
            </Avatar>
          </div>
          
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold drop-shadow-sm truncate">
              {{ npc.name }}
            </span>
            <span class="text-[10px] uppercase tracking-wider font-bold" style="color:var(--color-muted-foreground)">
              {{ npc.role }}
            </span>
          </div>
        </div>

        <Button
          @click="emit('interact', npc.id)"
          :disabled="!npc.isInteractive"
          variant="default"
          size="sm"
          class="mr-1 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-md"
          title="Hablar"
        >
          Hablar
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-panel{
  background: var(--color-card, rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.04);
  /* ensure panel text uses card foreground color */
  color: var(--color-card-foreground);
}

.lobby-header{ background: transparent; }

.lobby-panel .group:hover, .lobby-panel .lobby-item:hover { background-color: rgba(99,102,241,0.03); }

.size-11{ width: 44px; height:44px; }
</style>

