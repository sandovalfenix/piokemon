<script setup lang="ts">
import { ref, computed } from "vue"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { useTeamStore } from "@/stores/team"
import { usePCBoxStore } from "@/stores/pcBox"
import router from "@/router"

const teamStore = useTeamStore()
const pcBoxStore = usePCBoxStore()

teamStore.loadTeam()
pcBoxStore.initialize()

const teamList = computed(() => teamStore.roster)
const pcList = computed(() => pcBoxStore.pokemonList)

/* ===========================================================
   Dialog: "Team Full"
=========================================================== */
const showTeamFull = ref(false)

/* ===========================================================
   MOVER PC → TEAM (CORREGIDO + DIALOG)
=========================================================== */
function moveFromPC(instanceId: string) {
  if (teamStore.isTeamFull) {
    showTeamFull.value = true
    return
  }

  const poke = pcBoxStore.removePokemon(instanceId)
  if (!poke) return

  teamStore.addPokemon({
    pokemon: poke.pokemon,
    selectedMoves: poke.pokemon.moves ?? [],
    level: poke.captureLevel,
    currentHp: poke.captureLevel * 5 + 10,
    maxHp: poke.captureLevel * 5 + 10,
    position: teamStore.roster.length
  })
}

/* ===========================================================
   MOVER TEAM → PC
=========================================================== */
function moveToPC(teamIndex: number) {
  const mon = teamStore.roster[teamIndex]
  if (!mon) return

  pcBoxStore.addPokemon({
    instanceId: crypto.randomUUID(),
    pokemon: mon.pokemon,
    captureLevel: mon.level,
    ballType: "pokeball",
    capturedAt: new Date().toISOString()
  })

  teamStore.removePokemon(teamIndex)
}

/* ===========================================================
   GUARDAR CAMBIOS
=========================================================== */
function saveChanges() {
    router.replace({ name: 'home' })
}
</script>

<template>
  <div class="w-full min-h-screen p-6 flex flex-col gap-6">

    <h1 class="text-3xl font-bold text-center mb-4">Pokémon Storage PC</h1>

    <div class="grid grid-cols-2 gap-6">

      <!-- TEAM -->
      <div class="border p-4 rounded-xl bg-white shadow">
        <h2 class="font-bold text-xl mb-3">Your Team (Max 6)</h2>

        <div class="flex flex-col gap-3">
          <div
            v-for="(member, index) in teamList"
            :key="index"
            @click="moveToPC(index)"
            class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition hover:bg-red-100"
          >
            <img :src="member.pokemon.sprite" class="w-12 h-12" />
            <div>
              <p class="font-semibold">{{ member.pokemon.name }}</p>
              <p class="text-sm">Lv. {{ member.level }}</p>
            </div>
          </div>

          <p v-if="teamList.length === 0" class="text-gray-400 text-center mt-4">
            (Team Empty)
          </p>
        </div>
      </div>

      <!-- PC BOX -->
      <div class="border p-4 rounded-xl bg-white shadow">
        <h2 class="font-bold text-xl mb-3">PC Box</h2>

        <div class="grid grid-cols-4 gap-3">

          <div
            v-for="poke in pcList"
            :key="poke.instanceId"
            @click="moveFromPC(poke.instanceId)"
            class="p-3 border rounded-lg cursor-pointer flex flex-col items-center transition hover:bg-green-100"
          >
            <img :src="poke.pokemon.sprite" class="w-12 h-12" />
            <p class="text-sm font-semibold mt-1">{{ poke.pokemon.name }}</p>
            <p class="text-xs text-gray-500">Lv. {{ poke.captureLevel }}</p>
          </div>

          <p v-if="pcList.length === 0" class="text-gray-400 text-center col-span-4 mt-4">
            (PC Box Empty)
          </p>
        </div>
      </div>

    </div>

    <div class="w-full flex justify-center mt-6">
      <Button class="px-8 py-3 text-lg" @click="saveChanges">
        Save Changes
      </Button>
    </div>

    <!-- =====================================================
         TEAM FULL DIALOG (shadcn)
    ====================================================== -->
    <Dialog v-model:open="showTeamFull">
      <DialogContent class="max-w-sm">
        <DialogHeader>
          <DialogTitle>Team is Full</DialogTitle>
        </DialogHeader>

        <p class="text-gray-600">
          You already have 6 Pokémon in your team.
          Remove one before adding another.
        </p>

        <DialogFooter>
          <Button @click="showTeamFull = false">Okay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>
