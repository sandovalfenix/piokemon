<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconArrowsLeftRight, IconUsers, IconCircleFilled } from "@tabler/icons-vue"
// UI components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface Player { uid: string; username: string; avatarUrl?: string; status: 'idle' | 'battle' | 'trade'; isSelf: boolean }
const emit = defineEmits<{ (e: 'challenge', targetId: string): void; (e: 'trade', targetId: string): void }>()
const players = ref<Player[]>([])
const initFirebaseListener = () => {
  players.value = [
    { uid: 'u1', username: 'AshKetchum', status: 'idle', isSelf: false },
    { uid: 'u2', username: 'GaryOak', status: 'battle', isSelf: false },
    { uid: 'u5', username: 'Red', status: 'idle', isSelf: true },
  ]
}
onMounted(() => { initFirebaseListener() })

const getStatusClass = (status: string) => {
  switch(status) {
    case 'battle': return 'shacdn-status--battle'
    case 'trade': return 'shacdn-status--trade'
    default: return 'shacdn-status--idle'
  }
}
</script>

<template>
  <div class="lobby-panel @container/playerlist h-full flex flex-col rounded-3xl overflow-hidden">
    <div class="lobby-header pb-3 pt-4 px-4 border-b">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black tracking-wide uppercase flex items-center gap-2 drop-shadow-md text-shadow-outline" style="color:var(--color-card-foreground)">
          <IconUsers class="size-5" />
          <span class="hidden @[200px]/playerlist:inline">Online</span>
        </h2>
        <Badge class="px-2 py-0.5 rounded-full text-xs font-bold">{{ players.length }}</Badge>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
      <div 
        v-for="player in players" 
        :key="player.uid"
        class="group relative flex items-center justify-between p-2 pl-3 rounded-full transition-all duration-300 lobby-item"
        :class="{ 'opacity-70 saturate-50': player.status !== 'idle' }"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="relative flex-none">
            <Avatar class="size-11 rounded-full group-hover:border-cyan-300 transition-colors shadow-md">
              <AvatarImage v-if="player.avatarUrl" :src="player.avatarUrl" alt="avatar" />
              <AvatarFallback v-else><IconUsers class="size-6" style="color:var(--color-sidebar-primary)"/></AvatarFallback>
            </Avatar>
            <IconCircleFilled :class="['absolute -bottom-0.5 -right-0.5 size-4 rounded-full z-10', getStatusClass(player.status)]" style="border:2px solid var(--color-sidebar-border)" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold truncate @[150px]/playerlist:block hidden drop-shadow-sm" style="color:var(--color-card-foreground)">
              {{ player.username }}
            </span>
            <span v-if="player.isSelf" class="text-[10px] font-bold uppercase tracking-wider @[150px]/playerlist:block hidden" style="color:var(--color-primary)">
              (Tú)
            </span>
            <span v-else class="text-[10px] font-bold truncate @[150px]/playerlist:block hidden" style="color:var(--color-muted-foreground)">
              {{ player.status === 'idle' ? 'Disponible' : player.status }}
            </span>
          </div>
        </div>

        <div v-if="!player.isSelf" class="mr-1 flex gap-2 @[250px]/playerlist:flex hidden opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <Button
            @click="emit('challenge', player.uid)" :disabled="player.status !== 'idle'"
            variant="destructive"
            size="sm"
            class="px-3 py-1.5 rounded-full text-xs uppercase tracking-wider"
          >
            Retar
          </Button>

           <Button 
            @click="emit('trade', player.uid)" :disabled="player.status !== 'idle'"
            variant="ghost"
            size="icon-sm"
            class="p-1.5 rounded-full"
          >
            <IconArrowsLeftRight class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-panel{ background: var(--color-card, rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.04); color:var(--color-card-foreground); }
.lobby-header{ background: transparent }
.lobby-panel .group:hover, .lobby-panel .lobby-item:hover{ background-color: rgba(99,102,241,0.03); }
.size-11{ width:44px; height:44px }
.size-6{ width:28px; height:28px }
.shacdn-status--battle{ background: linear-gradient(45deg,#ff3b3b,#ff6b6b); }
.shacdn-status--trade{ background: linear-gradient(45deg,#f6e05e,#f97316); }
.shacdn-status--idle{ background: linear-gradient(45deg,#34d399,#10b981); }
</style>

