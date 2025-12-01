<!--
  PokemonCatalog Component
  Feature: 003-pokemon-team-builder
  User Story 1: Browse Pokemon Catalog
  User Story 2: Emit pokemon-select event for move selection

  Paginated Pokemon list with loading states and error handling
-->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PokemonCard from './PokemonCard.vue'
import type { Pokemon } from '@/models/teamBuilder'
import { fetchPokemonList, fetchPokemonBatch } from '@/services/teamBuilder'

interface Emits {
  (e: 'pokemon-select', pokemon: Pokemon): void
}

const emit = defineEmits<Emits>()

const currentPage = ref(1)
const pageSize = 20
const allPokemon = ref<Pokemon[]>([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const filteredPokemonList = computed(() => {
  if (!searchQuery.value.trim()) {
    return allPokemon.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return allPokemon.value.filter(pokemon =>
    pokemon.name.toLowerCase().includes(query) ||
    pokemon.types.some(type => type.toLowerCase().includes(query))
  )
})

const paginatedPokemonList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredPokemonList.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredPokemonList.value.length / pageSize))

async function loadAllPokemon() {
  loading.value = true
  error.value = null

  try {
    // Fetch complete list (all Pokemon at once)
    const listResponse = await fetchPokemonList(1025, 0)

    // Extract IDs from URLs
    const ids = listResponse.results.map((item) => {
      const match = item.url.match(/\/pokemon\/(\d+)\//)
      return match && match[1] ? parseInt(match[1], 10) : 0
    }).filter((id) => id > 0)

    console.log(`[PokemonCatalog] Fetching ${ids.length} Pokemon...`)

    // Batch fetch all Pokemon data in chunks of 50
    const chunkSize = 50
    const chunks: Pokemon[] = []

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunkIds = ids.slice(i, i + chunkSize)
      const results = await fetchPokemonBatch(chunkIds)
      chunks.push(...results.filter((p): p is Pokemon => p !== null))
      console.log(`[PokemonCatalog] Loaded ${chunks.length}/${ids.length} Pokemon`)
    }

    allPokemon.value = chunks
    console.log(`[PokemonCatalog] All Pokemon loaded: ${allPokemon.value.length}`)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load Pokemon'
    error.value = errorMessage
    console.error('[PokemonCatalog] Error loading Pokemon:', errorMessage)
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function retry() {
  loadAllPokemon()
}

function handlePokemonClick(pokemon: Pokemon) {
  emit('pokemon-select', pokemon)
  console.log(`[PokemonCatalog] Pokemon selected: ${pokemon.name}`)
}

onMounted(() => {
  loadAllPokemon()
})
</script>

<template>
  <div class="pokemon-catalog">
    <div class="catalog-header">
      <h2>Pokemon Catalog</h2>
      <p class="catalog-subtitle">Browse and select Pokemon to view moves</p>

      <!-- Search Bar -->
      <div class="search-bar mt-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or type..."
            class="search-input w-full px-4 py-2 pl-10 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <svg class="search-icon absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p v-if="searchQuery && filteredPokemonList.length === 0" class="text-sm text-gray-500 mt-2">
          No Pokemon found matching "{{ searchQuery }}"
        </p>
        <p v-else-if="searchQuery" class="text-sm text-gray-600 mt-2">
          Found {{ filteredPokemonList.length }} Pokemon
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="retry">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="pokemon-grid">
      <PokemonCard
        v-for="i in pageSize"
        :key="`skeleton-${i}`"
        :pokemon="{ id: 0, name: '', types: [], stats: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, sprite: '', moves: [] }"
        :loading="true"
      />
    </div>

    <!-- Pokemon grid -->
    <div v-else class="pokemon-grid">
      <div
        v-for="pokemon in paginatedPokemonList"
        :key="pokemon.id"
        @click="handlePokemonClick(pokemon)"
        class="pokemon-card-wrapper"
      >
        <PokemonCard :pokemon="pokemon" />
      </div>
    </div>

    <!-- Pagination controls -->
    <div v-if="!error" class="pagination-controls">
      <button
        class="pagination-button"
        :disabled="currentPage === 1 || loading"
        @click="prevPage"
      >
        ← Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        class="pagination-button"
        :disabled="currentPage === totalPages || loading"
        @click="nextPage"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<style scoped>
.pokemon-catalog {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.catalog-header {
  text-align: center;
  margin-bottom: 32px;
}

.catalog-header h2 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 8px;
}

.catalog-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.add-message {
  padding: 12px 24px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  transition: opacity 0.3s;
}

.add-message.success {
  background: rgba(52, 199, 89, 0.2);
  border: 2px solid #34C759;
  color: #34C759;
}

.add-message.error {
  background: rgba(255, 59, 48, 0.2);
  border: 2px solid #FF3B30;
  color: #FF3B30;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.pokemon-card-wrapper {
  cursor: pointer;
}

/* Error state */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
  background: rgba(255, 59, 48, 0.1);
  border: 2px solid rgba(255, 59, 48, 0.3);
  border-radius: 12px;
  margin-bottom: 32px;
}

.error-icon {
  font-size: 3rem;
}

.error-message {
  color: #ff3b30;
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

.retry-button {
  padding: 12px 24px;
  background: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #ff453a;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.pagination-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pagination-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

.search-bar {
  color: #000;
  margin-bottom: 16px;
}

.search-input {
  background: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
}

.search-input:focus {
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.search-icon {
  pointer-events: none;
}

/* Responsive */
@media (max-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .catalog-header h2 {
    font-size: 1.5rem;
  }

  .pagination-button {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
}
</style>
