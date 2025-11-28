<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-2xl font-bold mb-1">Buscar Pokémon</h2>
      
      <div v-if="buscando" class="text-center">
        <div class="relative h-56 flex items-center justify-center">
          <div 
            class="w-32 h-32"
            :style="spriteStyle"
          ></div>
        </div>
        
        <p class="text-lg mt-2">Buscando Pokémon...</p>
        <p class="text-sm text-gray-500 mt-1">Explorando la selva</p>
      </div>
      
      <div v-else class="text-center">
        <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-2">
          <h3 class="font-bold text-lg">Búsqueda completada</h3>
          <p class="mt-1">Revisa la consola para ver el resultado</p>
        </div>
      </div>
      
      <div class="flex gap-2 mt-4">
        <button
          v-if="!buscando"
          @click="reiniciarBusqueda"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
        >
          Buscar de Nuevo
        </button>
        
        <button
          @click="cerrarModal"
          class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface PokemonData {
  nombre: string;
  tipo: string;
  nivel: number;
}

interface SpriteConfig {
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  velocidadAnimacion: number;
}

const emit = defineEmits<{
  'pokemon-encontrado': [pokemonData: PokemonData];
  'pokemon-no-encontrado': [];
  'cerrar': [];
}>()

const buscando = ref<boolean>(true);
const frameActual = ref<number>(0);
const animacionId = ref<number | null>(null);

const spriteConfig: SpriteConfig = {
  totalFrames: 4,
  frameWidth: 128,
  frameHeight: 128,
  velocidadAnimacion: 200,
};

import spriteSheet from '@/assets/images/personaje-selva.png';
const spriteSheetUrl = ref<string>(spriteSheet);

const spriteStyle = computed((): { [key: string]: string } => ({
  backgroundImage: `url('${spriteSheetUrl.value}')`,
  backgroundPosition: `-${frameActual.value * spriteConfig.frameWidth}px 0px`,
  backgroundSize: `${spriteConfig.totalFrames * spriteConfig.frameWidth}px ${spriteConfig.frameHeight}px`,
  imageRendering: 'pixelated'
}));

onMounted((): void => {
  iniciarBusqueda();
});

onUnmounted((): void => {
  if (animacionId.value !== null) {
    cancelAnimationFrame(animacionId.value);
  }
});

const iniciarBusqueda = async (): Promise<void> => {
  buscando.value = true;
  frameActual.value = 0;
  
  iniciarAnimacion();
  
  await new Promise<void>(resolve => setTimeout(resolve, Math.random() * 1000 + 2000));
  
  if (animacionId.value !== null) {
    cancelAnimationFrame(animacionId.value);
    animacionId.value = null;
  }
  
  decidirResultadoDeBusqueda();
  
  buscando.value = false;
};

const iniciarAnimacion = (): void => {
  let ultimoTiempo: number = 0;
  
  const animar = (tiempo: number): void => {
    if (!ultimoTiempo) ultimoTiempo = tiempo;
    
    if (tiempo - ultimoTiempo > spriteConfig.velocidadAnimacion) {
      frameActual.value = (frameActual.value + 1) % spriteConfig.totalFrames;
      ultimoTiempo = tiempo;
    }
    
    animacionId.value = requestAnimationFrame(animar);
  };
  
  animacionId.value = requestAnimationFrame(animar);
};

const decidirResultadoDeBusqueda = (): void => {
  const encontrado: boolean = Math.random() > 0.4;
  
  if (encontrado) {
    const pokemones: PokemonData[] = [
      { nombre: 'Pikachu', tipo: 'Eléctrico', nivel: Math.floor(Math.random() * 50) + 1 },
      { nombre: 'Charmander', tipo: 'Fuego', nivel: Math.floor(Math.random() * 50) + 1 },
      { nombre: 'Bulbasaur', tipo: 'Planta/Veneno', nivel: Math.floor(Math.random() * 50) + 1 },
      { nombre: 'Squirtle', tipo: 'Agua', nivel: Math.floor(Math.random() * 50) + 1 },
      { nombre: 'Eevee', tipo: 'Normal', nivel: Math.floor(Math.random() * 50) + 1 }
    ];
    
    const pokemonAleatorio: PokemonData = pokemones[Math.floor(Math.random() * pokemones.length)];
    console.log('✅ Pokémon encontrado:', pokemonAleatorio);
    emit('pokemon-encontrado', pokemonAleatorio);
  } else {
    console.log('❌ Pokémon no encontrado');
    emit('pokemon-no-encontrado');
  }
};

const reiniciarBusqueda = (): void => {
  buscando.value = true;
  iniciarBusqueda();
};

const cerrarModal = (): void => {
  emit('cerrar');
};
</script>