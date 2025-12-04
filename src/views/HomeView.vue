<script setup lang="ts">
/**
 * HomeView - Simplified Lobby
 * Feature: 006-battle-module-update (Clarification: Lobby Flow Refactor)
 *
 * Shows only:
 * - Welcome text
 * - "Battle" button (auto-selects next opponent in progression)
 * - "Wild Encounter" button
 *
 * Flow Guard: Checks hasStarter flag before allowing battle
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTeamStore } from '@/stores/team'
import { useProgressStore } from '@/stores/progress'
import { getRandomUndefeatedNpc } from '@/data/thematicNpcs'
import { gymLeaders } from '@/data/gymLeaders'

const router = useRouter()
const teamStore = useTeamStore()
const progressStore = useProgressStore()

// Modal state for "No Starter" warning
const showNoStarterModal = ref(false)

/**
 * Check if player has a starter (hasStarter flag)
 */
function hasStarter(): boolean {
  return teamStore.hasStarter
}

/**
 * Navigate to starter selection
 */
function goToStarterSelection() {
  showNoStarterModal.value = false
  router.push('/starter-selection')
}

/**
 * Handle "Battle" button click
 * Auto-selects next opponent in linear progression
 */
function handleBattleClick() {
  // Flow Guard: Check for starter
  if (!hasStarter()) {
    showNoStarterModal.value = true
    return
  }

  // Check if game is complete
  if (progressStore.isGameComplete) {
    // All gym leaders defeated - maybe show a message?
    console.log('[HomeView] Game complete - no more story battles')
    return
  }

  // Determine next opponent
  const canChallengeGym = progressStore.canChallengeGymLeader(progressStore.currentGym)

  if (canChallengeGym) {
    // Challenge Gym Leader
    const gymLeader = gymLeaders.find(g => g.id === progressStore.currentGym)
    if (gymLeader) {
      sessionStorage.setItem('battleTarget', JSON.stringify({
        type: 'gym-leader',
        id: gymLeader.id,
      }))
      router.push('/battle')
    }
  } else {
    // Challenge random undefeated NPC from current gym's pool
    const npc = getRandomUndefeatedNpc(progressStore.defeatedTrainers)
    if (npc) {
      sessionStorage.setItem('battleTarget', JSON.stringify({
        type: 'npc',
        id: npc.id,
      }))
      router.push('/battle')
    }
  }
}

/**
 * Handle "Wild Encounter" button click
 */
function handleWildBattleClick() {
  // Flow Guard: Check for starter
  if (!hasStarter()) {
    showNoStarterModal.value = true
    return
  }

  sessionStorage.setItem('battleTarget', JSON.stringify({
    type: 'wild',
  }))
  router.push('/battle')
}
</script>

<template>
  <main class="lobby-container">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h1 class="title">Pokémon MMO</h1>
      <p class="subtitle">¡Bienvenido, entrenador!</p>
    </section>

    <!-- Battle Buttons -->
    <section class="battle-section">
      <Button
        class="battle-btn story-btn"
        size="lg"
        :disabled="progressStore.isGameComplete"
        @click="handleBattleClick"
      >
        {{ progressStore.isGameComplete ? 'Campeón' : 'Batalla' }}
      </Button>

      <Button
        class="pi- battle-btn wild-btn"
        size="lg"
        variant="outline"
        @click="handleWildBattleClick"
      >
        Encuentro Salvaje
      </Button>
    </section>

    <!-- No Starter Modal -->
    <Dialog v-model:open="showNoStarterModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¡Necesitas un Pokémon!</DialogTitle>
          <DialogDescription>
            Antes de comenzar tu aventura, debes elegir tu Pokémon inicial.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="goToStarterSelection">
            Elegir Pokémon Inicial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<style scoped>
.lobby-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
}

.welcome-section {
  margin-bottom: 3rem;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: #666;
}

.battle-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.battle-btn {
  width: 100%;
  font-size: 1.25rem;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.battle-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.story-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.story-btn:disabled {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #333;
  opacity: 1;
}

.wild-btn {
  background: white;
  color: #2e7d32;
  border: 2px solid #4caf50;
}

.wild-btn:hover {
  background: #e8f5e9;
}
</style>
