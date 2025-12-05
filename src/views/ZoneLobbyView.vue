<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NpcListPanel from '@/components/lobby/NpcListPanel.vue'
import PlayersOnlinePanel from '@/components/lobby/PlayersOnlinePanel.vue'
import ZoneActionsPanel from '@/components/lobby/ZoneActionsPanel.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import SiteHeader from '@/components/SiteHeader.vue'
import zonalobbyBg from '@/assets/img/zonalobby.png'

const route = useRoute()

// Obtener el nombre de la zona desde los parámetros de la ruta
const zoneName = computed(() => {
  const param = route.params.zoneName as string
  // Decodificar y formatear el nombre de la zona (reemplazar guiones/encodings por espacios)
  return decodeURIComponent(param).replace(/-/g, ' ')
})

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

    <SidebarInset class="flex flex-col overflow-hidden !bg-transparent">
      <SiteHeader title="Zona Lobby" />
      <div
        class="relative flex-1 w-full overflow-hidden font-sans"
        :style="{
          backgroundImage: `url(${zonalobbyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'var(--color-foreground)',
        }"
      >
        <div class="relative z-10 flex h-full flex-col p-4 md:p-6 gap-4 justify-between">
          <main class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 items-center">
            <aside class="md:col-span-3 lg:col-span-3 h-[80%]">
              <NpcListPanel @interact="onNpcInteraction" />
            </aside>

            <section class="md:col-span-6 lg:col-span-6 h-full flex items-center justify-center">
              <h2
                class="tech-glow-title text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-[0.15em] text-white rounded-xl px-6 py-3"
                style="
                  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
                  letter-spacing: 0.15em;
                  margin-top: -5rem;
                "
              >
                {{ zoneName }}
              </h2>
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

<style scoped>
.tech-glow-title {
  animation: fadeInGlow 1.5s ease-out forwards;
  position: relative;
  overflow: hidden;
}

.tech-glow-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    rgba(0, 255, 255, 0.6),
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmerScan 3s infinite;
  z-index: -1;
}

@keyframes fadeInGlow {
  0% {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(10px);
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.5),
      0 0 0px rgba(0, 255, 255, 0);
  }
  50% {
    opacity: 0.7;
    filter: blur(3px);
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(0, 255, 255, 0.2);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(255, 255, 255, 0.3),
      0 0 40px rgba(0, 255, 255, 0.4),
      0 0 60px rgba(0, 255, 255, 0.2);
  }
}

@keyframes shimmerScan {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

/* Efecto de pulso tecnológico adicional */
.tech-glow-title::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg,
    rgba(0, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05),
    rgba(0, 255, 255, 0.1)
  );
  border-radius: 4px;
  opacity: 0;
  animation: pulseGlow 2s ease-in-out infinite;
  z-index: -2;
  filter: blur(8px);
}

@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}
</style>
