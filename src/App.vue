<template>
  <div class="wrap">
    <header>
      <h1>Planning 5×8</h1>
    </header>

    <!-- BLOC 1 : RECHERCHE D'UN JOUR PRÉCIS -->
    <section class="card">
      <h2>Rechercher un jour précis</h2>

      <div class="controls">
        <label>Équipe
          <select v-model.number="dayTeam">
            <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
          </select>
        </label>

        <label>Date
          <input type="date" v-model="dayDateIso" />
        </label>

        <button class="btn" @click="refreshDay">Voir ce jour</button>
      </div>

      <div class="day-result" v-if="dayResult">
        Le <strong>{{ formatDateLabel(dayDateIso) }}</strong>,  
        l’équipe <strong>{{ dayTeam }}</strong> est de :
        <span :class="badgeClass(dayShiftRaw)">{{ dayResult }}</span>
      </div>

      <div v-else class="hint">Choisis une date et clique sur <em>Voir ce jour</em>.</div>
    </section>

    <!-- BLOC 2 : AFFICHER UNE PÉRIODE -->
    <section class="card">
      <h2>Afficher une période</h2>

      <div class="controls">
        <label>Équipe
          <select v-model.number="team">
            <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
          </select>
        </label>

        <label>Début
          <input type="date" v-model="dateIso" />
        </label>

        <label>Jours
          <input type="number" v-model.number="len" min="1" max="60" />
        </label>

        <button class="btn" @click="refreshRange">Afficher</button>
      </div>

      <div class="subtitle">
        À partir du <strong>{{ dateIso }}</strong> — Équipe {{ team }}
      </div>

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

      <div v-else class="hint">Clique sur <em>Afficher</em> pour voir le planning.</div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { previewRange, getShiftForTeamOnDate } from './planning.js'

// -------- BLOC JOUR PRÉCIS --------
const today = new Date()
const yyyy = today.getFullYear().toString().padStart(4,'0')
const mm = (today.getMonth()+1).toString().padStart(2,'0')
const dd = today.getDate().toString().padStart(2,'0')
const todayIso = `${yyyy}-${mm}-${dd}`

const dayTeam = ref(4)
const dayDateIso = ref(todayIso)
const dayResult = ref('')
const dayShiftRaw = ref('-')

function displayShift(s) { return s === '-' ? 'Repos' : s }

function badgeClass(s) {
  if (s === 'Matin') return 'badge morning'
  if (s === 'A-Midi') return 'badge afternoon'
  if (s === 'Nuit') return 'badge night'
  return 'badge rest'
}

function formatDateLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function refreshDay() {
  if (!dayDateIso.value) return
  const iso = dayDateIso.value.includes('T') ? dayDateIso.value : dayDateIso.value + 'T00:00:00Z'
  const d = new Date(iso)
  const shift = getShiftForTeamOnDate(dayTeam.value, d)
  dayShiftRaw.value = shift
  dayResult.value = displayShift(shift)
}

// -------- BLOC PÉRIODE --------
const team = ref(4)
const dateIso = ref(todayIso)
const len = ref(14)
const rows = ref([])

function refreshRange() {
  const iso = dateIso.value.includes('T') ? dateIso.value : dateIso.value
  rows.value = previewRange(team.value, iso, len.value)
}

// initial
refreshDay()
refreshRange()
</script>

<style>
:root{
  --bg:#ffffff;
  --muted:#666;
  --morning:#0b66ff;
  --afternoon:#ff6a00;
  --night:#7a2cff;
  --rest:#9aa0a6;
}

*{box-sizing:border-box}
body,html,#app{height:100%;}
.wrap{
  padding:16px;
  max-width:920px;
  margin:0 auto;
  font-family:Inter, system-ui, -apple-system, "Helvetica Neue", Arial;
  color:#111;
  background:var(--bg);
}
h1{margin:0 0 10px 0;font-size:22px}
h2{margin:0 0 8px 0;font-size:18px}

.card{
  border:1px solid #eee;
  border-radius:10px;
  padding:12px;
  margin-bottom:14px;
  background:#fafafa;
}

.controls{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  align-items:flex-end;
  margin-bottom:8px;
}
.controls label{
  font-size:14px;
  display:flex;
  flex-direction:column;
}
.controls input[type="date"],
.controls select,
.controls input[type="number"]{
  padding:6px 8px;
  border:1px solid #ddd;
  border-radius:6px;
}
.btn{
  padding:8px 12px;
  border-radius:8px;
  border:0;
  background:#222;
  color:#fff;
  cursor:pointer;
}
.btn:active{transform:translateY(1px)}

.subtitle{
  margin-top:4px;
  color:var(--muted);
  font-size:13px;
}
.hint{
  color:var(--muted);
  font-size:13px;
}

.day-result{
  margin-top:4px;
  font-size:15px;
}

/* table */
.table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
}
.table th{
  background:#f4f6f8;
  text-align:left;
  padding:8px;
  font-weight:600;
  border-bottom:1px solid #eee;
}
.table td{
  padding:8px;
  border-bottom:1px solid #f0f0f0;
}
.center{text-align:center}

/* badges */
.badge{
  display:inline-block;
  padding:4px 9px;
  border-radius:999px;
  font-weight:600;
  font-size:13px;
  color:#fff;
}
.morning{background:var(--morning)}
.afternoon{background:var(--afternoon)}
.night{background:var(--night)}
.rest{background:var(--rest);opacity:0.95}

/* mobile */
@media(max-width:520px){
  h1{font-size:20px}
  .controls{gap:8px}
  .table th,.table td{padding:6px;font-size:13px}
}
</style>
