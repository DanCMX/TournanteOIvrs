<template>
  <div class="p-4 max-w-3xl mx-auto font-sans">
    <h1 class="text-2xl font-bold mb-3">Planning 5x8 — Debug</h1>

    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
      <div>
        <label>Équipe</label>
        <select v-model.number="team" class="border p-2 w-full">
          <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
        </select>
      </div>

      <div>
        <label>Date de départ (ISO)</label>
        <input v-model="fromIso" class="border p-2 w-full" />
      </div>

      <div>
        <label>Nombre de jours</label>
        <input type="number" v-model.number="len" class="border p-2 w-full" />
      </div>
    </div>

    <div class="mb-4">
      <label>Offsets équipes (jours) — modifie si nécessaire</label>
      <div class="grid grid-cols-5 gap-2 mt-2">
        <div v-for="i in 5" :key="i">
          <div class="text-xs">Éq {{ i }}</div>
          <input type="number" v-model.number="teamOffsets[i]" class="border p-2 w-full" />
        </div>
      </div>
      <div class="text-sm text-gray-600 mt-2">Ancre : équipe 4 commence le 2025-10-31 (index 0).</div>
    </div>

    <div class="mb-4">
      <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="refresh">Rafraîchir</button>
      <button class="ml-2 px-3 py-2 bg-green-600 text-white rounded" @click="copyAsText">Copier rapport</button>
    </div>

    <div class="overflow-auto border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="p-2 text-left">Date</th>
            <th class="p-2">Jour depuis ancre</th>
            <th class="p-2">Offset</th>
            <th class="p-2">Index</th>
            <th class="p-2">Poste</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in rows" :key="r.iso" :class="idx % 2 ? 'bg-white' : 'bg-gray-50'">
            <td class="p-2">{{ r.iso }} · {{ r.weekday }}</td>
            <td class="p-2 text-center">{{ r.daysSinceStart }}</td>
            <td class="p-2 text-center">{{ r.offset }}</td>
            <td class="p-2 text-center font-mono">{{ r.index }}</td>
            <td class="p-2 text-center font-semibold">
              <span :class="r.shift === '-' ? 'text-gray-400' : (r.shift==='Matin' ? 'text-blue-600' : (r.shift==='A-Midi' ? 'text-orange-600' : 'text-purple-600'))">
                {{ r.shift === '-' ? 'Repos' : r.shift }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-sm text-gray-700">
      <p><strong>Explication :</strong> la colonne <em>Jour depuis ancre</em> est calculée en UTC (minuit UTC = jour entier). Si tu vois un décalage de 1, vérifie que ta date d'ancre et tes offsets sont corrects.</p>
      <p class="mt-2">Si le calcul est encore faux : copie le rapport (bouton "Copier rapport") et colle-le ici. Je regarderai la ligne qui ne correspond pas et je corrigerai l'offset ou l'ancre.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// ✅ tableau complet des 25 jours
const cycle = [
  "Matin", "Après-midi", "Après-midi", "Nuit", "Nuit", "Repos", "Repos", "Repos",
  "Matin", "Matin", "Après-midi", "Nuit", "Nuit", "Repos", "Repos", "Repos",
  "Matin", "Matin", "Après-midi", "Après-midi", "Nuit", "Repos", "Repos", "Repos", "Repos"
];

const startDate = ref(new Date("2024-10-31")); // <-- date du début du cycle équipe 4
const selectedDate = ref(new Date()); // today
const currentShift = ref("");

function getShift(date, teamStartDate) {
  const diffTime = date - teamStartDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // ✅ Correction du décalage d’un jour
  const index = ((diffDays % cycle.length) + cycle.length) % cycle.length;

  return cycle[index];
}

// Exécuter au chargement
currentShift.value = getShift(selectedDate.value, startDate.value);

</script>

<style>
body { background:#f7f7f7; font-family:Inter, system-ui, Arial;}
table { border-collapse: collapse; }
th, td { border-bottom: 1px solid #eee; }
</style>
