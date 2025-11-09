<template>
  <div style="padding:18px;max-width:820px;margin:0 auto;font-family:Arial,Helvetica,sans-serif">
    <h1 style="margin-bottom:8px">Planning 5x8 — resultats</h1>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:end">
      <div>
        <label>Équipe</label><br>
        <select v-model.number="team">
          <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
        </select>
      </div>

      <div>
        <label>Date (début)</label><br>
        <input type="date" v-model="dateIso" />
      </div>

      <div>
        <label>Jours</label><br>
        <input type="number" v-model.number="len" style="width:80px" />
      </div>

      <div>
        <button @click="refresh" style="padding:6px 10px">Afficher</button>
      </div>
    </div>

    <div style="margin:8px 0;font-size:18px">
      Résultat pour <strong>Équipe {{ team }}</strong> à partir de <strong>{{ dateIso }}</strong> :
    </div>

    <div v-if="rows.length">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f3f3f3">
          <tr>
            <th style="text-align:left;padding:8px">Date</th>
            <th style="padding:8px">Jour depuis ancre</th>
            <th style="padding:8px">Index</th>
            <th style="padding:8px">Poste</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.iso" style="border-bottom:1px solid #eee">
            <td style="padding:8px">{{ r.iso }} · {{ r.weekday }}</td>
            <td style="padding:8px;text-align:center">{{ r.daysSinceStart }}</td>
            <td style="padding:8px;text-align:center;font-family:monospace">{{ r.index }}</td>
            <td style="padding:8px;text-align:center">{{ displayShift(r.shift) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top:12px;color:#666;font-size:13px">
      Valeurs verrouillées : ancre = <strong>2025-11-09</strong>, offsets = <strong>1:10,2:15,3:20,4:0,5:5</strong>.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { previewRange } from './planning.js'

const team = ref(4)
const today = new Date()
const yyyy = today.getFullYear().toString().padStart(4,'0')
const mm = (today.getMonth()+1).toString().padStart(2,'0')
const dd = today.getDate().toString().padStart(2,'0')
const dateIso = ref(`${yyyy}-${mm}-${dd}`)
const len = ref(14)

const rows = ref([])

function displayShift(s) {
  return s === '-' ? 'Repos' : s
}

function refresh() {
  const iso = dateIso.value.includes('T') ? dateIso.value : dateIso.value
  rows.value = previewRange(team.value, iso, len.value)
}

// initial
refresh()
</script>

<style>
/* minimal styles */
</style>
