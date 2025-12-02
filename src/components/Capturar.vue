<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEncounterStore } from '@/stores/useEncounterStore'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import type { GeneratedPokemon } from '@/stores/pokemonGenerator'

const router = useRouter()
const encounterStore = useEncounterStore()

const props = defineProps<{
	pokemonData: GeneratedPokemon | null
	estadoBusqueda: 'encontrado' | 'no encontrado'
}>()

const emit = defineEmits<{
	'seguir-buscando': []
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

function seguirBuscando() {
	emit('seguir-buscando')
}

onMounted(() => {
	if (props.estadoBusqueda === 'encontrado' && props.pokemonData) {
		encounterStore.setCurrentPokemon(props.pokemonData)
		setTimeout(() => {
			router.push({ name: 'batalla' })
		}, 500)
	}
})
</script>

<template>
	<div v-if="!isEncontrado" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
		<Card class="w-full max-w-md mx-4 border border-border shadow-2xl animate__animated animate__fadeInUp">
			<CardHeader class="border-b border-border">
				<CardTitle class="text-foreground">No se encontró Pokémon</CardTitle>
			</CardHeader>

			<CardContent class="pt-6 text-center">
				<div class="text-6xl mb-4">🔍</div>
				<p class="text-sm text-muted-foreground">
					No hay encuentros en este momento. Sigue explorando para encontrar un Pokémon salvaje.
				</p>
			</CardContent>

			<CardFooter class="border-t border-border flex gap-2 pt-4">
				<Button class="flex-1" variant="default" @click="seguirBuscando">
					🔍 Seguir buscando
				</Button>
			</CardFooter>
		</Card>
	</div>
</template>
