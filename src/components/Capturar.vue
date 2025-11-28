<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import type { GeneratedPokemon } from '@/stores/pokemonGenerator'

const props = defineProps<{
	pokemonData: GeneratedPokemon | null
	estadoBusqueda: 'encontrado' | 'no encontrado'
}>()

const emit = defineEmits<{
	'ir-a-batalla': [pokemonData: GeneratedPokemon]
	'huir': []
}>()

const titulo = computed(() => {
	return props.estadoBusqueda === 'encontrado'
		? `¡Apareció un ${props.pokemonData?.name ?? 'Pokémon'} salvaje!`
		: 'No se encontró ningún Pokémon'
})

const isEncontrado = computed(() => props.estadoBusqueda === 'encontrado' && !!props.pokemonData)

const hpPercent = computed(() => {
	if (!props.pokemonData) return 0
	const { currentHp, maxHp } = props.pokemonData
	if (!maxHp) return 0
	return Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)))
})

// Cargar todas las imágenes disponibles en /src/assets/images como URL (incluye svg, png y jpeg)
const images = import.meta.glob('../assets/images/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' }) as Record<string, string>

const defaultImage = images['../assets/images/personaje-selva.png'] ?? null

const spriteUrl = computed(() => {
	const sprite = props.pokemonData?.sprite
	if (!sprite) return defaultImage

	const base = sprite.split('.')[0].toLowerCase()

	// Priorizar la imagen oficial (PokeAPI) si tenemos el ID del Pokémon y preferimos mostrar la imagen "real"
	const id = props.pokemonData?.id
	if (id) {
		const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
		return url
	}

	// si no tenemos id o no preferimos la oficial, buscar imagen local coincidiente
	const matchKey = Object.keys(images).find(k => k.toLowerCase().includes('/' + base + '.'))
	if (matchKey) return images[matchKey]

	return defaultImage
})

const isRemoteSprite = computed(() => {
	const url = spriteUrl.value
	if (!url) return false
	return url.startsWith('http') || url.includes('raw.githubusercontent.com')
})

// Computed para deducir un tipo (placeholder) y color visual
const pokemonType = computed(() => {
	const name = props.pokemonData?.name?.toLowerCase() ?? ''
	if (!name) return null
	if (name.includes('char') || name.includes('cynda')) return 'Fuego'
	if (name.includes('squir') || name.includes('toto')) return 'Agua'
	if (name.includes('bulba') || name.includes('chiko')) return 'Planta'
	return 'Neutral'
})

const typeColor = computed(() => {
	switch (pokemonType.value) {
		case 'Fuego': return 'from-red-400 to-orange-400'
		case 'Agua': return 'from-sky-400 to-blue-500'
		case 'Planta': return 'from-emerald-400 to-green-600'
		default: return 'from-gray-300 to-gray-400'
	}
})

function intentarCapturar() {
	if (!props.pokemonData) return
	emit('ir-a-batalla', props.pokemonData)
}

function huir() {
	emit('huir')
}
</script>

<template>
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
		<Card class="w-full max-w-3xl mx-4 border border-border shadow-2xl animate__animated animate__fadeInUp">
			<CardHeader class="border-b border-border">
				<CardTitle class="text-foreground">Resultado de la búsqueda</CardTitle>
			</CardHeader>

			<CardContent class="pt-6">
				<!-- Banner tipo alerta similar a la imagen de ejemplo -->
				<div :class="['w-full rounded-lg p-3 mb-4 flex items-center gap-4 border', isEncontrado ? 'bg-linear-to-r from-yellow-50 to-transparent border-yellow-200' : 'bg-destructive/10 border-destructive']">
					<div class="flex-none w-10 h-10 rounded-full bg-white/60 flex items-center justify-center border border-border shadow-sm">
						<span class="text-2xl">⚡️</span>
					</div>
					<div class="flex-1">
						<div class="text-sm font-bold text-foreground">{{ titulo }}</div>
						<div class="text-xs text-muted-foreground">{{ isEncontrado ? 'Prepárate para intentar capturarlo o huir si no te sientes listo' : 'No hay encuentros — inténtalo otra vez' }}</div>
					</div>
				</div>
				<div class="flex flex-col lg:flex-row gap-6 items-center lg:items-stretch">
					<!-- Left: visual -->
					<div class="w-full lg:w-2/5 flex items-center justify-center p-4">
						<div class="relative bg-linear-to-br from-primary/10 to-transparent rounded-xl p-6 w-full flex items-center justify-center border border-border">
							<div class="w-40 h-40 md:w-48 md:h-48 bg-linear-to-tr from-primary/5 via-primary/10 to-transparent rounded-full flex items-center justify-center shadow-inner border border-border">
								<img v-if="spriteUrl" :src="spriteUrl" alt="sprite" class="w-32 h-32 md:w-40 md:h-40 object-contain" />
								<div v-if="isRemoteSprite" class="absolute right-3 top-3 text-xs bg-white/50 text-muted-foreground rounded-full px-2 py-0.5 border border-border">Fuente: PokeAPI</div>
								<div v-else class="w-32 h-32 flex items-center justify-center text-xs text-muted-foreground">Sin sprite</div>
							</div>
							<div class="absolute -bottom-4 left-6 bg-card/80 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground shadow-md">Nivel {{ pokemonData?.level ?? '-' }}</div>
						</div>
					</div>

					<!-- Right: detalles -->
					<div class="w-full lg:w-3/5 p-4 flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between gap-4">
								<div>
									<h3 class="text-2xl font-extrabold tracking-tight text-foreground">{{ titulo }}</h3>
									<p class="mt-1 text-sm text-muted-foreground">{{ estadoBusqueda === 'encontrado' ? '¡Apresúrate antes de que huya!' : 'Sigue explorando para encontrar otro Pokémon.' }}</p>
								</div>
								<div class="text-right flex items-center gap-2">
									<span class="inline-block text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">Región: <strong class="ml-1 text-foreground">{{ pokemonData?.region ?? '—' }}</strong></span>
									  <span v-if="pokemonData" :class="`inline-flex items-center text-xs px-3 py-1 rounded-full text-white border border-border bg-linear-to-r ${typeColor}`">
										{{ pokemonType }}
									</span>
								</div>
							</div>

							<div v-if="pokemonData" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>HP</span>
										<span class="font-semibold text-foreground">{{ pokemonData.currentHp }} / {{ pokemonData.maxHp }}</span>
									</div>
									<div class="w-full bg-muted/20 border border-border rounded-full h-3 overflow-hidden">
										<div :style="{ width: hpPercent + '%' }" class="h-full bg-linear-to-r from-green-400 to-emerald-500"></div>
									</div>
								</div>

								<div class="flex flex-col gap-2">
									<div class="text-sm text-muted-foreground flex items-center justify-between">
										<span>Tasa de captura base</span>
										<span class="font-semibold text-foreground">{{ pokemonData.baseCatchRate }}%</span>
									</div>
									<div class="text-xs text-muted-foreground">Influye en la probabilidad de atrapar al Pokémon con diferentes pokébolas.</div>
								</div>
							</div>
						</div>

						<!-- Acciones (mantenidas en footer) -->
						<!-- Los botones se muestran únicamente en el footer para mantener la UI limpia -->
					</div>
				</div>
        
				<!-- Mensaje cuando no encontrado (modo centrado) -->
				<div v-if="!isEncontrado" class="mt-6 lg:mt-8 text-center text-sm text-muted-foreground">
					<p>No se encontró ningún Pokémon en ese intento.</p>
					<p class="mt-2">Puedes volver a intentarlo explorando o cambiar la región.</p>
				</div>
			</CardContent>

			<CardFooter class="border-t border-border flex gap-2 pt-4">
				<Button
					class="flex-1"
					:disabled="!isEncontrado"
					variant="outline"
					@click="intentarCapturar"
				>
					Intentar capturar
				</Button>

				<Button class="flex-1" variant="destructive" @click="huir">Huir</Button>
			</CardFooter>
		</Card>
	</div>
</template>
