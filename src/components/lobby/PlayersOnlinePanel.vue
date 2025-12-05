<script setup lang="ts">
import { ref, onMounted, computed, withDefaults } from 'vue'
import { IconArrowsLeftRight, IconUsers, IconCircleFilled } from '@tabler/icons-vue'
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

export interface Player {
  uid: string
  username: string
  avatarUrl?: string
  status: 'idle' | 'battle' | 'trade'
  isSelf: boolean
}

const props = withDefaults(defineProps<{
  hideTitle?: boolean
}>(), {
  hideTitle: false
})

const emit = defineEmits<{
  (e: 'challenge', targetId: string): void
  (e: 'trade', targetId: string): void
}>()
const players = ref<Player[]>([])

defineExpose({
  count: computed(() => players.value.length)
})
const initFirebaseListener = () => {
  players.value = [
    { uid: 'u1', username: 'AshKetchum', status: 'idle', isSelf: false },
    { uid: 'u2', username: 'GaryOak', status: 'battle', isSelf: false },
    { uid: 'u5', username: 'Red', status: 'idle', isSelf: true },
  ]
}
onMounted(() => {
  initFirebaseListener()
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'battle':
      return 'bg-gradient-to-br from-red-500 to-red-600'
    case 'trade':
      return 'bg-gradient-to-br from-yellow-400 to-orange-500'
    default:
      return 'bg-gradient-to-br from-green-400 to-emerald-500'
  }
}
</script>

<template>
  <Card
    class="@container/playerlist h-full flex flex-col overflow-hidden bg-black/15 backdrop-blur-xs"
  >
    <CardHeader v-if="!hideTitle" class="!px-3 !pb-3">
      <CardTitle
        class="text-lg font-black tracking-wide uppercase flex items-center gap-2 text-white"
      >
        <IconUsers class="size-5" />
        <span class="hidden @[200px]/playerlist:inline">Online</span>
      </CardTitle>
      <CardDescription class="sr-only">Jugadores conectados en la zona</CardDescription>
      <CardAction>
        <Badge class="px-2 py-0.5 rounded-full text-xs font-bold">{{ players.length }}</Badge>
      </CardAction>
    </CardHeader>

    <CardContent class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
      <div
        v-for="player in players"
        :key="player.uid"
        class="group relative flex items-center justify-between p-2 pl-3 rounded-full transition-all duration-300 hover:bg-accent/50"
        :class="{ 'opacity-70 saturate-50': player.status !== 'idle' }"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="relative flex-none">
            <Avatar class="size-11 group-hover:border-cyan-300 transition-colors">
              <AvatarImage v-if="player.avatarUrl" :src="player.avatarUrl" alt="avatar" />
              <AvatarFallback v-else>
                <IconUsers class="size-6 text-sidebar-primary" />
              </AvatarFallback>
            </Avatar>
            <IconCircleFilled
              :class="[
                'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full z-10 border-2 border-sidebar-border',
                getStatusClass(player.status),
              ]"
            />
          </div>
          <div class="flex flex-col min-w-0">
            <Label
              class="text-sm font-bold truncate @[150px]/playerlist:block hidden drop-shadow-sm text-white"
            >
              {{ player.username }}
            </Label>
            <CardDescription
              v-if="player.isSelf"
              class="text-[10px] font-bold uppercase tracking-wider @[150px]/playerlist:block hidden text-primary"
            >
              (Tú)
            </CardDescription>
            <CardDescription
              v-else
              class="text-[10px] font-bold truncate @[150px]/playerlist:block hidden text-white/80"
            >
              {{ player.status === 'idle' ? 'Disponible' : player.status }}
            </CardDescription>
          </div>
        </div>

        <div
          v-if="!player.isSelf"
          class="mr-1 flex gap-2 @[250px]/playerlist:flex hidden opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0"
        >
          <Button
            @click="emit('challenge', player.uid)"
            :disabled="player.status !== 'idle'"
            variant="destructive"
            size="sm"
            class="text-xs uppercase tracking-wider"
          >
            Retar
          </Button>

          <Button
            @click="emit('trade', player.uid)"
            :disabled="player.status !== 'idle'"
            variant="ghost"
            size="icon-sm"
          >
            <IconArrowsLeftRight class="size-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
