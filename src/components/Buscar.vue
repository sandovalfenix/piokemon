}<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-2xl font-bold mb-2">Buscar Pokémon</h2> <!-- Reducido mb-4 a mb-2 -->
      
      <!-- Loading State -->
      <div v-if="buscando" class="text-center">
        <!-- Contenedor de animación - mucho más grande -->
        <div class="relative h-48 mb-2 flex items-center justify-center"> <!-- Aumentado h-32 a h-48 y mb-4 a mb-2 -->
          <!-- Personaje caminando en el mismo lugar - más grande -->
          <div 
            class="w-24 h-24" 
            :style="spriteStyle"
          ></div>
        </div>
        
        <p class="text-lg mb-1">Buscando Pokémon...</p> <!-- Añadido mb-1 -->
        <p class="text-sm text-gray-500">Explorando la selva</p> <!-- Eliminado mt-2 -->
      </div>
      
      <!-- Estado completado -->
      <div v-else class="text-center">
        <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-2"> <!-- Reducido mb-4 a mb-2 -->
          <h3 class="font-bold text-lg">Búsqueda completada</h3>
          <p class="mt-1">Revisa la consola para ver el resultado</p> <!-- Reducido mt-2 a mt-1 -->
        </div>
      </div>
      
      <!-- Botones -->
      <div class="flex gap-2 mt-4"> <!-- Reducido mt-6 a mt-4 -->
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

// Interfaces TypeScript
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

// Estados reactivos
const buscando = ref<boolean>(true);
const frameActual = ref<number>(0);
const animacionId = ref<number | null>(null);

// Configuración del sprite sheet - AJUSTA ESTOS VALORES SEGÚN TU IMAGEN
const spriteConfig: SpriteConfig = {
  totalFrames: 4,     // ¿Cuántos frames tiene tu sprite sheet?
  frameWidth: 96,     // Aumentado de 64 a 96 píxeles
  frameHeight: 96,    // Aumentado de 64 a 96 píxeles
  velocidadAnimacion: 200, // ms entre frames
};

// OPCIÓN 2: Imagen en src/assets/images/
import spriteSheet from '@/assets/images/personaje-selva.png';
const spriteSheetUrl = ref<string>(spriteSheet);

// Computed para el estilo del sprite
const spriteStyle = computed((): { [key: string]: string } => ({
  backgroundImage: `url('${spriteSheetUrl.value}')`,
  backgroundPosition: `-${frameActual.value * spriteConfig.frameWidth}px 0px`,
  backgroundSize: `${spriteConfig.totalFrames * spriteConfig.frameWidth}px ${spriteConfig.frameHeight}px`,
  imageRendering: 'pixelated' // Para que se vea bien con sprites pixel art
}));

// Iniciar búsqueda automáticamente cuando el componente se monta
onMounted((): void => {
  iniciarBusqueda();
});

// Limpiar animación al desmontar el componente
onUnmounted((): void => {
  if (animacionId.value !== null) {
    cancelAnimationFrame(animacionId.value);
  }
});

// Función para iniciar la búsqueda
const iniciarBusqueda = async (): Promise<void> => {
  buscando.value = true;
  frameActual.value = 0;
  
  // Iniciar animación
  iniciarAnimacion();
  
  // Temporizador de 2-3 segundos
  await new Promise<void>(resolve => setTimeout(resolve, Math.random() * 1000 + 2000));
  
  // Detener animación
  if (animacionId.value !== null) {
    cancelAnimationFrame(animacionId.value);
    animacionId.value = null;
  }
  
  // Ejecutar la lógica de decisión
  decidirResultadoDeBusqueda();
  
  buscando.value = false;
};

// Función para animar el personaje (solo cambio de frames)
const iniciarAnimacion = (): void => {
  let ultimoTiempo: number = 0;
  
  const animar = (tiempo: number): void => {
    if (!ultimoTiempo) ultimoTiempo = tiempo;
    
    // Controlar velocidad de animación
    if (tiempo - ultimoTiempo > spriteConfig.velocidadAnimacion) {
      // Solo avanzar frame (sin mover posición)
      frameActual.value = (frameActual.value + 1) % spriteConfig.totalFrames;
      ultimoTiempo = tiempo;
    }
    
    animacionId.value = requestAnimationFrame(animar);
  };
  
  animacionId.value = requestAnimationFrame(animar);
};

// Función que decide el resultado de la búsqueda
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

// Función para reiniciar la búsqueda
const reiniciarBusqueda = (): void => {
  buscando.value = true;
  iniciarBusqueda();
};

// Función para cerrar el modal
const cerrarModal = (): void => {
  emit('cerrar');
};
</script>