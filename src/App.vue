<script setup>
import { ref } from "vue";
import { getShiftForDate } from "./planning";

const selectedDate = ref(new Date().toISOString().substring(0, 10));
const result = ref("");

function checkShift() {
  const d = new Date(selectedDate.value);
  result.value = getShiftForDate(d);
}
</script>

<template>
  <div style="padding: 20px; font-size: 22px;">
    <h2>Planning tournante 5x8 – Test</h2>

    <input type="date" v-model="selectedDate" @change="checkShift" />
    <p style="margin-top: 20px;">Résultat : <b>{{ result }}</b></p>
  </div>
</template>
