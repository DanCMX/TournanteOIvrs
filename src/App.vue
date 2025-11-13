<template>
  <div class="wrap">
    <header class="header">
      <h1>Planning 5×8</h1>
      <button class="btn-secondary" @click="toggleTheme">
        {{ isDark ? 'Mode clair' : 'Mode sombre' }}
      </button>
    </header>

    <!-- BLOC : RECHERCHER UN JOUR PRÉCIS -->
<section class="card">
  <h2>Rechercher un jour précis</h2>

  <div class="controls">
    <label>Équipe
      <select v-model.number="singleTeam">
        <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
      </select>
    </label>

    <label>Date
      <input type="date" v-model="singleDate" />
    </label>

    <button class="btn" @click="refreshSingle">Voir</button>
  </div>

  <div v-if="singleResult" class="day-result">
    Le <strong>{{ formatDate(singleDate) }}</strong>,
    l’équipe <strong>{{ singleTeam }}</strong> est :
    <span :class="badgeClass(singleRaw)">{{ singleResult }}</span>
  </div>

  <div v-else class="hint">Choisis une date et clique sur <em>Voir</em>.</div>
</section>
    
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

        <button class="btn" @click="refresh">Afficher</button>
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
import { ref, onMounted, watch } from 'vue'
import { previewRange } from './planning.js'

// équipe + date + longueur
const team = ref(4)
const today = new Date()
const yyyy = today.getFullYear().toString().padStart(4,'0')
const mm = (today.getMonth()+1).toString().padStart(2,'0')
const dd = today.getDate().toString().padStart(2,'0')
const dateIso = ref(`${yyyy}-${mm}-${dd}`)
const len = ref(14)
const rows = ref([])

// thème (clair / sombre)
const isDark = ref(false)

function displayShift(s) {
  return s === '-' ? 'Repos' : s
}

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

function applyTheme(val) {
  const theme = val ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

function toggleTheme() {
  isDark.value = !isDark.value
}

// au chargement : récupérer le thème stocké
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    isDark.value = true
  }
  applyTheme(isDark.value)
  refresh()
})

// quand isDark change -> appliquer
watch(isDark, (val) => {
  applyTheme(val)
})
</script>

<style>
:root[data-theme="light"],
:root:not([data-theme]) {
  --bg:#ffffff;
  --text:#111111;
  --muted:#666666;
  --card-bg:#fafafa;
  --border:#e2e2e2;
  --header-bg:#f4f6f8;
  --row-border:#f0f0f0;
  --morning:#0b66ff;
  --afternoon:#ff6a00;
  --night:#7a2cff;
  --rest:#9aa0a6;
  --button-bg:#222222;
  --button-text:#ffffff;
}

:root[data-theme="dark"] {
  --bg:#050712;
  --text:#e5e9f5;
  --muted:#9aa0b5;
  --card-bg:#101322;
  --border:#2a3145;
  --header-bg:#181c2c;
  --row-border:#1f2435;
  --morning:#4c8dff;
  --afternoon:#ff914d;
  --night:#b095ff;
  --rest:#7a8699;
  --button-bg:#e5e9f5;
  --button-text:#050712;
}

*{box-sizing:border-box}
body,html,#app{height:100%;margin:0;padding:0}
.wrap{
  padding:16px;
  max-width:920px;
  margin:0 auto;
  font-family:Inter, system-ui, -apple-system, "Helvetica Neue", Arial;
  color:var(--text);
  background:var(--bg);
}
.header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:10px;
}
h1{margin:0;font-size:22px}
h2{margin:0 0 8px 0;font-size:18px}

.card{
  border:1px solid var(--border);
  border-radius:10px;
  padding:12px;
  background:var(--card-bg);
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
  border:1px solid var(--border);
  border-radius:6px;
  background:var(--bg);
  color:var(--text);
}
.controls input:focus,
.controls select:focus{
  outline:1px solid var(--morning);
}

.btn{
  padding:8px 12px;
  border-radius:8px;
  border:0;
  background:var(--button-bg);
  color:var(--button-text);
  cursor:pointer;
}
.btn:active{transform:translateY(1px)}

.btn-secondary{
  padding:6px 10px;
  border-radius:999px;
  border:1px solid var(--border);
  background:transparent;
  color:var(--text);
  font-size:13px;
  cursor:pointer;
}
.btn-secondary:active{transform:translateY(1px)}

.subtitle{
  margin-top:4px;
  color:var(--muted);
  font-size:13px;
}
.hint{
  color:var(--muted);
  font-size:13px;
}

/* table */
.table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
}
.table th{
  background:var(--header-bg);
  text-align:left;
  padding:8px;
  font-weight:600;
  border-bottom:1px solid var(--border);
}
.table td{
  padding:8px;
  border-bottom:1px solid var(--row-border);
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
  .header{flex-direction:column;align-items:flex-start}
}
</style>
