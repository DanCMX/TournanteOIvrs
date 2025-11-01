<script setup>
import { ref, computed } from "vue"
import { getShiftForDate } from "./planning.js"

const selectedTeam = ref(4)
const today = new Date()

const days = computed(() =>
  Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      date: d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" }),
      shift: getShiftForDate(selectedTeam.value, d)
    }
  })
)
</script>

<template>
  <div class="p-4 max-w-md mx-auto font-sans">
    <h1 class="text-2xl font-bold mb-4 text-center">Planning 5x8</h1>
    <select v-model="selectedTeam" class="border p-2 rounded w-full mb-4">
      <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
    </select>

    <div
      v-for="(d, i) in days"
      :key="i"
      class="flex justify-between items-center border-b py-1 text-lg"
    >
      <span>{{ d.date }}</span>
      <span
        :class="{
          'text-gray-400': d.shift === '-',
          'text-blue-600 font-medium': d.shift === 'Matin',
          'text-orange-600 font-medium': d.shift === 'A-Midi',
          'text-purple-600 font-medium': d.shift === 'Nuit'
        }"
      >
        {{ d.shift === '-' ? 'Repos' : d.shift }}
      </span>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f5f5f5;
}
</style>
