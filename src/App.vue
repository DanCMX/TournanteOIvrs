<template>
  <div style="padding:20px;max-width:720px;margin:0 auto;font-family:Arial,Helvetica,sans-serif">
    <h1>Planning tournante 5x8 — Test</h1>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0">
      <div>
        <label>Équipe</label><br>
        <select v-model.number="team">
          <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
        </select>
      </div>

      <div>
        <label>Date</label><br>
        <input type="date" v-model="dateIso" />
      </div>

      <div style="align-self:end">
        <button @click="check" style="padding:6px 10px">Vérifier</button>
        <button @click="showNext" style="padding:6px 10px;margin-left:6px">Afficher 10 jours</button>
      </div>
    </div>

    <div style="margin:10px 0;font-size:18px">
      Résultat : <strong>{{ resultText }}</strong>
    </div>

    <div v-if="rows.length" style="margin-top:18px">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f3f3f3">
          <tr>
            <th style="text-align:left;padding:8px">Date</th>
            <th style="padding:8px">Jour depuis ancre</th>
            <th style="padding:8px">Offset</th>
            <th style="padding:8px">Index</th>
            <th style="padding:8px">Poste</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.iso" style="border-bottom:1px solid #eee">
            <td style="padding:8px">{{ r.iso }} · {{ r.weekday }}</td>
            <td style="padding:8px;text-align:center">{{ r.daysSinceStart }}</td>
            <td style="padding:8px;text-align:center">{{ r.offset }}</td>
            <td style="padding:8px;text-align:center;font-family:monospace">{{ r.index }}</td>
            <td style="padding:8px;text-align:center">
              <span :style="colorFor(r.shift)">{{ displayShift(r.shift) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top:14px;color:#666;font-size:13px">
      Astuce : pour être sûr que la date d'ancre est interprétée correctement, essaie <code>2025-10-31T00:00:00Z</code> dans le champ date.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getShiftForTeamOnDate, previewRange } from './planning.js'

const team = ref(4)
const today = new Date()
const yyyy = today.getFullYear().toString().padStart(4,'0')
const mm = (today.getMonth()+1).toString().padStart(2,'0')
const dd = today.getDate().toString().padStart(2,'0')
const dateIso = ref(`${yyyy}-${mm}-${dd}`)

const resultText = ref('')
const rows = ref([])

function displayShift(s) {
  return s === '-' ? 'Repos' : s
}
function colorFor(s) {
  if (s === '-') return 'color:#999'
  if (s === 'Matin') return 'color:#0b66ff;font-weight:600'
  if (s === 'A-Midi') return 'color:#ff6a00;font-weight:600'
  return 'color:#7a2cff;font-weight:600' // Nuit
}

function check() {
  rows.value = []
  resultText.value = ''
  // parse date (assure ISO T00:00:00Z)
  const iso = dateIso.value.includes('T') ? dateIso.value : dateIso.value + 'T00:00:00Z'
  const d = new Date(iso)
  resultText.value = displayShift(getShiftForTeamOnDate(team.value, d))
}

function showNext() {
  rows.value = previewRange(team.value, dateIso.value.includes('T') ? dateIso.value : dateIso.value + 'T00:00:00Z', 10)
  // set the main result as well (first line)
  if (rows.value.length) {
    resultText.value = displayShift(rows.value[0].shift)
  }
}

setAnchorFromObserved(4, '2025-10-31', 'Repos')

// initial check
check()
</script>
