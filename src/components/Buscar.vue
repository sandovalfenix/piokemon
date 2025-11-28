<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { useEncounterStore } from '@/stores/useEncounterStore'
import type { GeneratedPokemon } from '@/stores/pokemonGenerator'

interface SpriteConfig {
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  velocidadAnimacion: number;
}

const props = defineProps<{ region?: string }>()

const emit = defineEmits<{
  'pokemon-encontrado': [pokemonData: GeneratedPokemon];
  'pokemon-no-encontrado': [];
  'cerrar': [];
}>()

const buscando = ref<boolean>(true);
const frameActual = ref<number>(0);
const animacionId = ref<number | null>(null);

const encounterStore = useEncounterStore()
const foundPokemon = ref<GeneratedPokemon | null>(null)

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
    // Generar un encuentro real usando el store y la región recibida
    encounterStore.generateEncounter(props.region)
    foundPokemon.value = encounterStore.wildPokemon as GeneratedPokemon

    if (foundPokemon.value) {
      console.log('✅ Pokémon encontrado (store):', foundPokemon.value)
      emit('pokemon-encontrado', foundPokemon.value)
    } else {
      // Fallback por si algo raro pasa
      console.log('❌ Error: se esperaba un Pokémon del store pero es null')
      emit('pokemon-no-encontrado')
    }
  } else {
    console.log('❌ Pokémon no encontrado')
    emit('pokemon-no-encontrado')
  }
}

const reiniciarBusqueda = (): void => {
  buscando.value = true;
  iniciarBusqueda();
};

const cerrarModal = (): void => {
  emit('cerrar');
};
</script>
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <Card class="w-full max-w-md mx-4 border border-border shadow-lg">
      <CardHeader class="border-b border-border">
        <CardTitle class="text-foreground">Buscar Pokémon</CardTitle>
      </CardHeader>
      
      <CardContent class="text-center pt-6">
        <div v-if="buscando" class="space-y-4">
          <div class="relative h-56 flex items-center justify-center rounded-lg bg-muted/50 border border-border">
            <div 
              class="w-32 h-32"
              :style="spriteStyle"
            ></div>
          </div>
          
          <div class="space-y-1">
            <p class="text-lg font-semibold text-foreground">Buscando Pokémon...</p>
            <p class="text-sm text-muted-foreground">Explorando la selva</p>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <template v-if="foundPokemon">
            <div class="bg-primary/10 border border-primary rounded-lg p-4 space-y-2 text-left">
              <h3 class="font-bold text-base text-foreground">✅ Pokémon encontrado</h3>
              <p class="text-sm text-muted-foreground">Nombre: <strong class="text-foreground">{{ foundPokemon.name }}</strong></p>
              <p class="text-sm text-muted-foreground">Nivel: <strong class="text-foreground">{{ foundPokemon.level }}</strong></p>
              <p class="text-sm text-muted-foreground">Región: <strong class="text-foreground">{{ foundPokemon.region }}</strong></p>
            </div>
          </template>

          <template v-else>
            <div class="bg-destructive/10 border border-destructive rounded-lg p-4 space-y-2">
              <h3 class="font-bold text-base text-foreground">❌ No se encontró ningún Pokémon</h3>
              <p class="text-sm text-muted-foreground">Intenta de nuevo o cambia la región</p>
            </div>
          </template>
        </div>
      </CardContent>
      
      <CardFooter class="border-t border-border flex gap-2 pt-4">
        <Button
          v-if="!buscando"
          @click="reiniciarBusqueda"
          class="flex-1"
          variant="outline"
        >
          Buscar de Nuevo
        </Button>
        
        <Button
          @click="cerrarModal"
          class="flex-1"
          variant="destructive"
        >
          Cerrar
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>