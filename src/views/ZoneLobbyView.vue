<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NpcListPanel from '@/components/lobby/NpcListPanel.vue'
import PlayersOnlinePanel from '@/components/lobby/PlayersOnlinePanel.vue'
import ZoneActionsPanel from '@/components/lobby/ZoneActionsPanel.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

// Añadido: identificador de la zona (útil para suscripciones/ws/peticiones)
const zoneId = ref('zone-porcelana')
const zoneName = ref('Ciudad Porcelana')

// Añadido: intentar obtener el router (si el proyecto lo usa)
let router: ReturnType<typeof useRouter> | null = null
try {
	router = useRouter()
} catch {
	router = null
}

// Handlers adaptados para emitir eventos y/o navegación
const onNpcInteraction = (id: string) => {
	// Emitir evento que otros módulos pueden escuchar
	window.dispatchEvent(new CustomEvent('npc-interact', { detail: { zoneId: zoneId.value, npcId: id } }))
}

const onExploreZone = () => {
	// Evento público para iniciar exploración
	window.dispatchEvent(new CustomEvent('start-exploration', { detail: { zoneId: zoneId.value } }))

	// Preferir usar vue-router si está disponible, si no usar hash
	if (router && typeof router.push === 'function') {
		// intenta navegar a una ruta conocida 'map' (ajusta el nombre si tu router usa otro)
		try {
			router.push({ name: 'Map', params: { zoneId: zoneId.value } }).catch(() => {
				// si falla, fallback a hash
				window.location.hash = '#map'
			})
			return
		} catch {
			// noop y fallback abajo
		}
	}

	// Fallback: navegación simple al mapa (ajusta si usas otro mecanismo)
	try {
		window.location.hash = '#map'
	} catch (e) {
		// noop
	}
}

const onHealTeam = () => {
	window.dispatchEvent(new CustomEvent('heal-team', { detail: { zoneId: zoneId.value } }))
}

const onChallengePlayer = (id: string) => {
	window.dispatchEvent(new CustomEvent('challenge-player', { detail: { zoneId: zoneId.value, playerId: id } }))
}

const onTradeRequest = (id: string) => {
	window.dispatchEvent(new CustomEvent('trade-request', { detail: { zoneId: zoneId.value, playerId: id } }))
}
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
              <!-- Pasamos el valor explícito de zoneId al panel para claridad -->
              <NpcListPanel :zone-id="zoneId" @interact="onNpcInteraction" />
            </aside>

            <section class="md:col-span-6 lg:col-span-6 h-full flex items-center justify-center">
                <span class="font-bold text-xs uppercase tracking-[0.5em]" style="color:var(--color-muted-foreground)">Área Central</span>
            </section>

            <aside class="md:col-span-3 lg:col-span-3 h-[80%]">
              <!-- Pasamos el valor explícito de zoneId al panel de jugadores en línea -->
              <PlayersOnlinePanel :zone-id="zoneId" @challenge="onChallengePlayer" @trade="onTradeRequest" />
            </aside>
          </main>

          <footer class="flex-none flex justify-center pb-4 z-20">
            <div class="w-full max-w-4xl">
              <ZoneActionsPanel :zone-id="zoneId" @explore="onExploreZone" @heal="onHealTeam" />
            </div>
          </footer>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
