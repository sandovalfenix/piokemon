<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NpcListPanel from '@/components/lobby/NpcListPanel.vue'
import PlayersOnlinePanel from '@/components/lobby/PlayersOnlinePanel.vue'
import ZoneActionsPanel from '@/components/lobby/ZoneActionsPanel.vue'
import { SidebarInset } from '@/components/ui/sidebar'
import SiteHeader from '@/components/SiteHeader.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardTitle } from '@/components/ui/card'
import { IconArrowLeft, IconUser, IconUsers, IconBolt } from '@tabler/icons-vue'
import zonalobbyBg from '@/assets/img/zonalobby.png'

// Importar imágenes de fondo dinámicas de zones-lobby
import zooCaliLobbyBg from '@/assets/img/zones-lobby/zoo_cali.png'
import cristoReyLobbyBg from '@/assets/img/zones-lobby/cristo_rey.png'
import laErmitaLobbyBg from '@/assets/img/zones-lobby/la-ermita.png'
import nicheLobbyBg from '@/assets/img/zones-lobby/niche.png'

// Importar imágenes de locations como fallback
import laErmitaImg from '@/assets/img/locations/la_ermita.png'
import nicheImg from '@/assets/img/locations/niche.png'
import parqueCanaImg from '@/assets/img/locations/parque_cana.png'
import cristoReyImg from '@/assets/img/locations/cristo_rey.png'
import zooCaliImg from '@/assets/img/locations/zoo_cali.png'

const route = useRoute()
const router = useRouter()

const goBackToMap = () => {
  router.push('/mapa')
}

// Función helper para capitalizar cada palabra, excepto conectores
const capitalizeWords = (text: string): string => {
  // Lista de conectores que no deben capitalizarse (excepto si son la primera palabra)
  const connectors = ['de', 'la', 'del', 'y', 'e', 'o', 'u', 'a', 'en', 'por', 'para', 'con', 'sin']

  return text
    .split(' ')
    .map((word, index) => {
      const lowerWord = word.toLowerCase()
      // Si es la primera palabra o no es un conector, capitalizar
      if (index === 0 || !connectors.includes(lowerWord)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      // Si es un conector y no es la primera palabra, mantener en minúscula
      return lowerWord
    })
    .join(' ')
}

// Obtener el nombre de la zona desde los parámetros de la ruta
const zoneName = computed(() => {
  const param = route.params.zoneName as string
  // Decodificar y formatear el nombre de la zona (reemplazar guiones/encodings por espacios)
  const decoded = decodeURIComponent(param).replace(/-/g, ' ')
  // Aplicar capitalize a cada palabra
  return capitalizeWords(decoded)
})

// Obtener el slug de la zona (sin decodificar)
const zoneSlug = computed(() => {
  return (route.params.zoneName as string).toLowerCase()
})

// Mapeo de zonas a imágenes de fondo dinámicas
// Prioridad: zones-lobby > locations > default
const zoneBackgroundImage = computed(() => {
  const zoneSlugLower = zoneSlug.value

  // Mapeo de slugs a imágenes de zones-lobby (si existen)
  const lobbyImages: Record<string, string> = {
    'zoo-de-cali': zooCaliLobbyBg,
    'cristo-rey': cristoReyLobbyBg,
    'la-ermita': laErmitaLobbyBg,
    'plazoleta-jairo-varela': nicheLobbyBg,
  }

  // Mapeo de slugs a imágenes de locations (fallback)
  const locationImages: Record<string, string> = {
    'plazoleta-jairo-varela': nicheImg,
    'zoo-de-cali': zooCaliImg,
    'la-ermita': laErmitaImg,
    'cristo-rey': cristoReyImg,
    'parque-de-la-cana': parqueCanaImg,
  }

  // Retornar imagen de zones-lobby si existe, sino location, sino default
  return lobbyImages[zoneSlugLower] || locationImages[zoneSlugLower] || zonalobbyBg
})

// Refs para acceder a los conteos de los componentes hijos
const npcListPanelRef = ref<InstanceType<typeof NpcListPanel> | null>(null)
const playersOnlinePanelRef = ref<InstanceType<typeof PlayersOnlinePanel> | null>(null)

// Computed para obtener los conteos
const npcCount = computed(() => npcListPanelRef.value?.count ?? 0)
const playerCount = computed(() => playersOnlinePanelRef.value?.count ?? 0)

// Handlers placeholders...
const onNpcInteraction = (id: string) => console.log('NPC:', id)
const onExploreZone = () => console.log('Explore')
const onHealTeam = () => console.log('Heal')
const onChallengePlayer = (id: string) => console.log('Challenge:', id)
const onTradeRequest = (id: string) => console.log('Trade:', id)
</script>

<template>
  <SidebarInset class="flex flex-col overflow-hidden !bg-transparent">
    <SiteHeader title="Zona Lobby" />
    <div
      class="relative flex-1 w-full overflow-hidden font-sans"
      :style="{
        backgroundImage: `url(${zoneBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'var(--color-foreground)',
      }"
    >
      <div class="relative z-10 flex h-full flex-col p-4 md:p-6 gap-4 justify-between">
        <div class="absolute top-4 left-4 z-20">
          <Button
            @click="goBackToMap"
            variant="outline"
            size="lg"
            class="bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-black/50 hover:text-white font-bold"
          >
            <IconArrowLeft class="size-4" />
            Volver al Mapa
          </Button>
        </div>
        <main class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 items-center">
          <aside class="md:col-span-3 lg:col-span-3 h-[80%] flex flex-col gap-3">
            <div class="flex items-center justify-between px-1">
              <CardTitle
                class="text-xl font-bold tracking-normal flex items-center gap-3 text-white drop-shadow-lg"
                style="
                  text-shadow:
                    2px 2px 4px rgba(0, 0, 0, 0.8),
                    0 0 8px rgba(0, 0, 0, 0.5);
                "
              >
                <IconUser class="size-6" />
                <span>NPCs</span>
              </CardTitle>
              <Badge
                class="px-3 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm border border-white/30"
                >{{ npcCount }}</Badge
              >
            </div>
            <NpcListPanel ref="npcListPanelRef" hide-title @interact="onNpcInteraction" />
          </aside>

          <section
            class="md:col-span-6 lg:col-span-6 h-full flex items-center justify-center w-full"
          >
            <h2
              class="tech-glow-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-normal text-white rounded-xl px-8 py-4 text-center mx-auto"
              style="
                text-shadow:
                  3px 3px 6px rgba(0, 0, 0, 0.9),
                  0 0 12px rgba(0, 0, 0, 0.7),
                  0 0 20px rgba(255, 255, 255, 0.3);
                margin-top: -5rem;
              "
            >
              {{ zoneName }}
            </h2>
          </section>

          <aside class="md:col-span-3 lg:col-span-3 h-[80%] flex flex-col gap-3">
            <div class="flex items-center justify-between px-1">
              <CardTitle
                class="text-xl font-bold tracking-normal flex items-center gap-3 text-white drop-shadow-lg"
                style="
                  text-shadow:
                    2px 2px 4px rgba(0, 0, 0, 0.8),
                    0 0 8px rgba(0, 0, 0, 0.5);
                "
              >
                <IconUsers class="size-6" />
                <span>Online</span>
              </CardTitle>
              <Badge
                class="px-3 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm border border-white/30"
                >{{ playerCount }}</Badge
              >
            </div>
            <PlayersOnlinePanel
              ref="playersOnlinePanelRef"
              hide-title
              @challenge="onChallengePlayer"
              @trade="onTradeRequest"
            />
          </aside>
        </main>

        <footer class="flex-none flex flex-col items-center justify-center pb-4 z-20 gap-3">
          <CardTitle
            class="text-xl font-bold tracking-normal text-white flex items-center gap-3 drop-shadow-lg"
            style="
              text-shadow:
                2px 2px 4px rgba(0, 0, 0, 0.8),
                0 0 8px rgba(0, 0, 0, 0.5);
            "
          >
            <IconBolt class="size-6" />
            <span>Acciones de Zona</span>
          </CardTitle>
          <div class="w-full max-w-4xl">
            <ZoneActionsPanel hide-title @explore="onExploreZone" @heal="onHealTeam" />
          </div>
        </footer>
      </div>
    </div>
  </SidebarInset>
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
    filter: blur(5px);
    text-shadow:
      3px 3px 6px rgba(0, 0, 0, 0.9),
      0 0 0px rgba(255, 255, 255, 0);
  }
  50% {
    opacity: 0.8;
    filter: blur(2px);
    text-shadow:
      3px 3px 6px rgba(0, 0, 0, 0.9),
      0 0 12px rgba(0, 0, 0, 0.7),
      0 0 20px rgba(255, 255, 255, 0.2);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
    text-shadow:
      3px 3px 6px rgba(0, 0, 0, 0.9),
      0 0 12px rgba(0, 0, 0, 0.7),
      0 0 20px rgba(255, 255, 255, 0.3);
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
