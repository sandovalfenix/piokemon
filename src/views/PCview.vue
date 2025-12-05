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
   Dialog: "Minimum Team" (at least 1 Pokémon required)
=========================================================== */
const showMinTeam = ref(false)

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

  // Get level from old data (if exists) or use default level 10
  const pokemonLevel = (poke as any).captureLevel ?? 10

  // Convert MoveReference[] to Move[] with default battle values
  // Pokemon.moves is MoveReference (id+name), but TeamMember.selectedMoves needs full Move data
  const selectedMoves = (poke.pokemon.moves ?? []).slice(0, 4).map((moveRef) => ({
    id: moveRef.id,
    name: moveRef.name,
    type: 'Normal' as const,  // Default type (actual type would require API fetch)
    power: 40,                 // Default power
    accuracy: 100,             // Default accuracy
    category: 'Physical' as const,  // Default category - REQUIRED by battle engine
    pp: 35,                    // Default PP
  }))

  // Fallback: if no moves, add Tackle
  if (selectedMoves.length === 0) {
    selectedMoves.push({
      id: 33,
      name: 'Tackle',
      type: 'Normal' as const,
      power: 40,
      accuracy: 100,
      category: 'Physical' as const,
      pp: 35,
    })
  }

  teamStore.addPokemon({
    pokemon: poke.pokemon,
    selectedMoves,
    level: pokemonLevel,
    currentHp: pokemonLevel * 5 + 10,
    maxHp: pokemonLevel * 5 + 10,
    position: teamStore.roster.length
  })

  // Persistence Sync: Immediately save team after mutation to prevent Battle Module desyncs
  teamStore.saveTeam()
}

/* ===========================================================
   MOVER TEAM → PC
=========================================================== */
function moveToPC(teamIndex: number) {
  // Constraint: Minimum 1 Pokémon required in team
  if (teamStore.roster.length <= 1) {
    showMinTeam.value = true
    return
  }

  const mon = teamStore.roster[teamIndex]
  if (!mon) return

  pcBoxStore.addPokemon({
    instanceId: crypto.randomUUID(),
    pokemon: mon.pokemon
  })

  teamStore.removePokemon(teamIndex)

  // Persistence Sync: Immediately save team after mutation
  teamStore.saveTeam()
}

/* ===========================================================
   GUARDAR CAMBIOS
=========================================================== */
function saveChanges() {
    router.replace({ name: 'home' })
}
</script>

<template>
  <div class="w-full min-h-screen p-6 flex flex-col gap-6 bg-gradient-to-b from-slate-100 to-slate-200">

    <h1 class="text-4xl font-extrabold text-center mb-6 tracking-wide text-slate-800 drop-shadow">
      Pokémon Storage PC
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- TEAM -->
      <div class="border p-5 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-200">
        <h2 class="font-bold text-2xl mb-4 text-slate-900 flex items-center gap-2">
          <span class="text-blue-500">⬤</span> Your Team (Max 6)
        </h2>

        <div class="flex flex-col gap-4">
          <div
            v-for="(member, index) in teamList"
            :key="index"
            @click="moveToPC(index)"
            class="flex items-center gap-4 p-4 border rounded-xl cursor-pointer
                   bg-slate-50 hover:bg-red-50 transition-transform hover:scale-[1.02]
                   shadow-sm hover:shadow-md"
          >
            <img :src="member.pokemon.sprite" class="w-14 h-14 drop-shadow-md" />
            <div>
              <p class="font-semibold text-lg text-slate-900">{{ member.pokemon.name }}</p>
              <p class="text-sm text-slate-500">Lv. {{ member.level }}</p>
            </div>
          </div>

          <p v-if="teamList.length === 0" class="text-gray-400 text-center mt-4 italic">
            (Team Empty)
          </p>
        </div>
      </div>

      <!-- PC BOX -->
      <div class="border p-5 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-200">
        <h2 class="font-bold text-2xl mb-4 text-slate-900 flex items-center gap-2">
          <span class="text-green-500">⬤</span> PC Box
        </h2>

        <div class="grid grid-cols-3 md:grid-cols-4 gap-4">

          <div
            v-for="poke in pcList"
            :key="poke.instanceId"
            @click="moveFromPC(poke.instanceId)"
            class="p-4 border rounded-xl cursor-pointer flex flex-col items-center
                   bg-slate-50 hover:bg-green-50 transition-transform hover:scale-[1.03]
                   shadow-sm hover:shadow-md"
          >
            <img :src="poke.pokemon.sprite" class="w-14 h-14 drop-shadow-md" />
            <p class="text-sm font-semibold mt-2 text-slate-900">{{ poke.pokemon.name }}</p>
            <p class="text-xs text-gray-500">Lv. {{ (poke as any).captureLevel ?? 10 }}</p>
          </div>

          <p v-if="pcList.length === 0" class="text-gray-400 text-center col-span-4 mt-4 italic">
            (PC Box Empty)
          </p>
        </div>
      </div>

    </div>

    <div class="w-full flex justify-center mt-8">
      <Button class="px-10 py-4 text-lg font-bold shadow-md hover:shadow-xl transition-all rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black" @click="saveChanges">
        Save Changes
      </Button>
    </div>

    <!-- =====================================================
         TEAM FULL DIALOG (shadcn)
    ====================================================== -->
    <Dialog v-model:open="showTeamFull">
      <DialogContent class="max-w-sm rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-red-600">Team is Full</DialogTitle>
        </DialogHeader>

        <p class="text-gray-700">
          You already have 6 Pokémon in your team.
          Remove one before adding another.
        </p>

        <DialogFooter class="mt-4">
          <Button class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  @click="showTeamFull = false">
            Okay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- =====================================================
         MINIMUM TEAM DIALOG (at least 1 Pokémon required)
    ====================================================== -->
    <Dialog v-model:open="showMinTeam">
      <DialogContent class="max-w-sm rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-amber-600">Minimum Team Required</DialogTitle>
        </DialogHeader>

        <p class="text-gray-700">
          You must have at least 1 Pokémon in your team.
          You cannot deposit your last Pokémon.
        </p>

        <DialogFooter class="mt-4">
          <Button class="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  @click="showMinTeam = false">
            Okay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>
