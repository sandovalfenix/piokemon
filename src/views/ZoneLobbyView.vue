<script setup lang="ts">
import { ref } from 'vue'
import NpcListPanel from '@/components/lobby/NpcListPanel.vue'
import PlayersOnlinePanel from '@/components/lobby/PlayersOnlinePanel.vue'
import ZoneActionsPanel from '@/components/lobby/ZoneActionsPanel.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

const zoneName = ref('Ciudad Porcelana')

// Handlers placeholders...
const onNpcInteraction = (id: string) => console.log('NPC:', id)
const onExploreZone = () => console.log('Explore')
const onHealTeam = () => console.log('Heal')
const onChallengePlayer = (id: string) => console.log('Challenge:', id)
const onTradeRequest = (id: string) => console.log('Trade:', id)
</script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <SidebarInset>
      <div class="relative h-screen w-full overflow-hidden font-sans" style="background:var(--color-background); color:var(--color-foreground)">
        
        <div class="relative z-10 flex h-full flex-col p-4 md:p-6 gap-4 justify-between">

          <header class="flex-none flex justify-center z-20">
            <div class="w-full max-w-3xl relative group rounded-full shadow-lg">
              <div
                class="absolute -inset-0.5 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"
                style="background:linear-gradient(90deg,var(--color-primary),var(--color-sidebar-primary))"
              ></div>

              <div class="shacdn-header relative w-full rounded-full py-3 px-8 text-center flex items-center justify-center" style="background:var(--color-card); border:1px solid var(--color-sidebar-border)">
                <h1
                  class="text-2xl md:text-3xl font-black tracking-widest uppercase drop-shadow-sm"
                  style="-webkit-text-stroke: 1px rgba(0,0,0,0.08); color:var(--color-card-foreground);"
                >
                  Zone Lobby:
                  <span class="ml-2 font-extrabold" style="color:var(--color-sidebar-primary)">
                    {{ zoneName }}
                  </span>
                </h1>
              </div>
            </div>
          </header>

          <main class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 items-center">
            
            <aside class="md:col-span-3 lg:col-span-3 h-[80%]">
              <NpcListPanel @interact="onNpcInteraction" />
            </aside>

            <section class="md:col-span-6 lg:col-span-6 h-full flex items-center justify-center">
                <span class="font-bold text-xs uppercase tracking-[0.5em]" style="color:var(--color-muted-foreground)">Área Central</span>
            </section>

            <aside class="md:col-span-3 lg:col-span-3 h-[80%]">
              <PlayersOnlinePanel @challenge="onChallengePlayer" @trade="onTradeRequest" />
            </aside>
          </main>

          <footer class="flex-none flex justify-center pb-4 z-20">
            <div class="w-full max-w-4xl">
              <ZoneActionsPanel @explore="onExploreZone" @heal="onHealTeam" />
            </div>
          </footer>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
