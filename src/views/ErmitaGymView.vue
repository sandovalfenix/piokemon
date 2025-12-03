<script setup lang="ts">
import { ref } from 'vue'
// Asumiendo que tienes los componentes de shadcn configurados así (ajusta las rutas según tu estructura real)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Heart, MapPin, Sparkles } from 'lucide-vue-next' // Asegúrate de tener lucide-vue-next o iconos similares

// --- Interfaces ---
interface Pokemon {
  id: number;
  name: string;
  type: string[];
  description: string;
  image: string; // Ruta a la imagen
}

interface Npc {
  name: string;
  role: string;
  description: string;
  image: string;
  partner?: string; // ruta al Pokémon acompañante (imagen)
}

// --- Data (Mock Data con sabor Caleño) ---

// 1. NPC: Líder Sofía
const leader = ref<Npc>({
  name: "Sofía",
  role: "Líder de Gimnasio - La Ermita",
  description: "Protectora del Bulevar del Río. Sofía utiliza Pokémon de estilo Gótico y Volador. Se dice que su Gárgoluz vigila la ciudad desde las torres de la iglesia cuando cae la tarde.",
  // Imagen del líder (fondo/banner) y su Pokémon acompañante
  image: '/images/leader-sofia.svg',
  partner: '/images/gargoluz.svg'
})

// 3. Pokémon de la Zona (3 por zona)
const zonePokemons = ref<Pokemon[]>([
  {
    id: 1,
    name: "Gárgoluz",
    type: ["Acero", "Volador"],
    description: "Se camufla entre las estatuas de La Ermita. Solo se mueve cuando escucha salsa.",
    image: "/images/gargoluz.svg" // Reemplazar con imagen real
  },
  {
    id: 2,
    name: "Chontadurock",
    type: ["Roca", "Planta"],
    description: "Duro por fuera, pero da mucha energía. ¡Cuidado con su ataque 'Sal y Miel'!",
    image: "/images/chonta.svg" // Reemplazar con imagen real
  },
  {
    id: 3,
    name: "Alfeñix",
    type: ["Hada", "Dulce"],
    description: "Un Pokémon hecho de azúcar pura, inspirado en las macetas caleñas.",
    image: "/images/alfenix.svg" // Reemplazar con imagen real
  }
])

// Estado del Centro Pokémon
const isHealing = ref(false)

// --- Métodos ---
const healTeam = () => {
  isHealing.value = true
  setTimeout(() => {
    isHealing.value = false
    alert('¡Tu equipo ha sido curado con un buen Champús y Pandebono!')
  }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 p-6 md:p-10">
    
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">📍 La Ermita</h1>
        <p class="text-slate-500">Distrito Gótico - Cali, Valle</p>
      </div>
      <Button variant="outline" class="gap-2">
        <MapPin class="h-4 w-4" />
        Mapa de Cali
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      
      <div class="col-span-1 lg:col-span-1 space-y-6">
        <Card class="overflow-hidden border-slate-200 shadow-sm">
          <div class="relative h-64 w-full bg-slate-200">
             <img 
              :src="leader.image" 
              alt="Líder Sofía en La Ermita" 
              class="h-full w-full object-cover transition-transform hover:scale-105 duration-700"
            />
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div class="flex items-center gap-3">
                  <h2 class="text-2xl font-bold text-white">{{ leader.name }}</h2>
                  <img v-if="leader.partner" :src="leader.partner" alt="Pokémon acompañante" class="h-12 w-12 rounded-full object-cover border-2 border-white/40" />
                </div>
                <Badge variant="secondary" class="mt-1 bg-yellow-500 text-black hover:bg-yellow-400">
                  {{ leader.role }}
                </Badge>
            </div>
          </div>
          <CardContent class="pt-6">
            <p class="italic text-slate-600">
              "{{ leader.description }}"
            </p>
            <Separator class="my-4" />
            <div class="flex gap-2">
              <Button class="w-full bg-indigo-600 hover:bg-indigo-700">
                Desafiar Líder
              </Button>
              <Button variant="secondary" class="w-full">
                Hablar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card class="border-red-100 bg-red-50/50">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-red-600">
              <Heart class="h-5 w-5 fill-red-600" />
              Centro de Recuperación
            </CardTitle>
            <CardDescription>
              ¿Tus Piokemon están "mamados"? Recupéralos aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              class="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-200 shadow-lg"
              @click="healTeam"
              :disabled="isHealing"
            >
              <span v-if="!isHealing">Curar Equipo</span>
              <span v-else>Curando...</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div class="col-span-1 md:col-span-1 lg:col-span-2">
        <div class="mb-4 flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-purple-600" />
          <h2 class="text-xl font-semibold">Piokemon en esta zona</h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card v-for="poke in zonePokemons" :key="poke.id" class="group hover:border-purple-300 transition-colors cursor-pointer">
            <CardHeader class="pb-2">
              <div class="flex justify-between items-start">
                <Badge 
                  v-for="type in poke.type" 
                  :key="type" 
                  variant="outline"
                  class="text-xs font-normal"
                >
                  {{ type }}
                </Badge>
              </div>
              <div class="aspect-square w-full rounded-md bg-slate-100 flex items-center justify-center mt-2 group-hover:bg-purple-50 transition-colors">
                 <span class="text-4xl">👾</span>
                 </div>
            </CardHeader>
            <CardContent>
              <CardTitle class="text-lg">{{ poke.name }}</CardTitle>
              <p class="text-xs text-slate-500 mt-2 line-clamp-2">
                {{ poke.description }}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" class="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                Ver Detalles
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>

</style>