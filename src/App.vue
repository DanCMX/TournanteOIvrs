<template>
  <div class="wrap">
    <header>
      <h1>Planning 5×8</h1>
      <div class="controls">
        <label>Équipe
          <select v-model.number="team">
            <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
          </select>
        </label>

        <label>Date
          <input type="date" v-model="dateIso" />
        </label>

        <label>Jours
          <input type="number" v-model.number="len" min="1" max="60" />
        </label>

        <button class="btn" @click="refresh">Afficher</button>
      </div>
    </header>

    <main>
      <div class="subtitle">Affichage depuis <strong>{{ dateIso }}</strong> — Équipe {{ team }}</div>

      <table class="table" v-if="rows.length">
        <thead>
          <tr>
            <th>Date</th>
            <th>Jour</th>
            <th>Poste</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.iso">
            <td>{{ r.iso }} · {{ r.weekday }}</td>
            <td class="center">{{ r.daysSinceStart }}</td>
            <td class="center">
              <span :class="badgeClass(r.shift)">{{ displayShift(r.shift) }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="hint">Cliquez sur <em>Afficher</em> pour voir le planning.</div>
    </main>
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

function displayShift(s) { return s === '-' ? 'Repos' : s }

function badgeClass(s) {
  if (s === 'Matin') return 'badge morning'
  if (s === 'A-Midi') return 'badge afternoon'
  if (s === 'Nuit') return 'badge night'
  return 'badge rest'
}

function refresh() {
  const iso = dateIso.value.includes('T') ? dateIso.value : dateIso.value
  rows.value = previewRange(team.value, iso, len.value)
}

// initial load
refresh()
</script>

<style>
:root{
  --bg:#ffffff;
  --muted:#666;
  --accent: #0b66ff;
  --morning:#0b66ff;    /* bleu */
  --afternoon:#ff6a00;  /* orange */
  --night:#7a2cff;      /* violet */
  --rest:#9aa0a6;       /* gris */
}

*{box-sizing:border-box}
body,html,#app{height:100%;}
.wrap{padding:16px;max-width:920px;margin:0 auto;font-family:Inter, system-ui, -apple-system, "Helvetica Neue", Arial;color:#111;background:var(--bg)}
header{display:flex;flex-direction:column;gap:12px}
h1{margin:0 0 6px 0;font-size:22px}
.controls{display:flex;flex-wrap:wrap;gap:10px;align-items:end}
.controls label{font-size:14px;display:flex;flex-direction:column}
.controls input[type="date"], .controls select, .controls input[type="number"]{padding:6px 8px;border:1px solid #ddd;border-radius:6px}
.btn{padding:8px 12px;border-radius:8px;border:0;background:#222;color:#fff;cursor:pointer}
.btn:active{transform:translateY(1px)}

.subtitle{margin-top:10px;color:var(--muted);font-size:14px}

/* table */
.table{width:100%;border-collapse:collapse;margin-top:12px}
.table th{background:#f4f6f8;text-align:left;padding:10px;font-weight:600;border-bottom:1px solid #eee}
.table td{padding:10px;border-bottom:1px solid #f0f0f0}
.center{text-align:center}

/* badges */
.badge{
  display:inline-block;padding:6px 10px;border-radius:999px;font-weight:600;font-size:13px;color:#fff;
}
.morning{background:var(--morning)}
.afternoon{background:var(--afternoon)}
.night{background:var(--night)}
.rest{background:var(--rest);color:#fff;opacity:0.95}

/* small screens */
@media(max-width:520px){
  .controls{gap:8px}
  .controls label{min-width:120px}
  .table th, .table td{padding:8px;font-size:14px}
  h1{font-size:20px}
}
</style>
