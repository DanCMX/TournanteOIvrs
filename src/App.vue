<template>
  <div style="padding:18px;max-width:820px;margin:0 auto;font-family:Arial,Helvetica,sans-serif">
    <h1 style="margin-bottom:8px">Planning 5x8 — outil local (test fiable)</h1>

    <section style="border:1px solid #eee;padding:12px;border-radius:6px;background:#fafafa;margin-bottom:12px">
      <strong>1) Définis une observation fiable</strong>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
        <div>
          <label>Date observée</label><br>
          <input type="date" v-model="obsDate" />
        </div>

        <div>
          <label>Équipe observée</label><br>
          <select v-model.number="obsTeam">
            <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
          </select>
        </div>

        <div>
          <label>Poste observé</label><br>
          <select v-model="obsShift">
            <option value="Matin">Matin</option>
            <option value="A-Midi">A-Midi</option>
            <option value="Nuit">Nuit</option>
            <option value="-">Repos</option>
          </select>
        </div>

        <div style="display:flex;flex-direction:column;justify-content:flex-end">
          <button @click="applyObservation" style="padding:6px 10px">Appliquer observation</button>
          <small style="color:#666;margin-top:6px">Sauvegardé localement</small>
        </div>
      </div>

      <div style="margin-top:10px;color:#333">
        <div><strong>Ancre calculée :</strong> {{ anchorIso || '(aucune)' }}</div>
        <div v-if="anchorDays !== null"><strong>daysSinceAnchor pour la date observée :</strong> {{ anchorDays }}</div>
      </div>
    </section>

    <section style="border:1px solid #eee;padding:12px;border-radius:6px;margin-bottom:12px">
      <strong>2) Paramètres et vérification</strong>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;align-items:end">
        <div>
          <label>Équipe à afficher</label><br>
          <select v-model.number="team">
            <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
          </select>
        </div>

        <div>
          <label>Date (début affichage)</label><br>
          <input type="date" v-model="dateIso" />
        </div>

        <div>
          <label>Jours à afficher</label><br>
          <input type="number" v-model.number="len" style="width:80px" />
        </div>

        <div style="align-self:end">
          <button @click="refresh" style="padding:6px 10px">Afficher</button>
        </div>
      </div>

      <div style="margin-top:8px;color:#666">
        <small>Offsets équipes (modifie si la convention d'écartement n'est pas celle-ci)</small>
        <div style="display:flex;gap:8px;margin-top:6px">
          <div v-for="i in 5" :key="i" style="font-size:13px">
            Éq{{i}}:<input type="number" v-model.number="offsets[i]" style="width:56px;margin-left:6px" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="rows.length">
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
            <td style="padding:8px;text-align:center">{{ r.daysSinceAnchor }}</td>
            <td style="padding:8px;text-align:center;font-family:monospace">{{ r.index }}</td>
            <td style="padding:8px;text-align:center">{{ displayShift(r.shift) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <div style="margin-top:12px;color:#666;font-size:13px">
      Si l'ordre (Matin → A-Midi → A-Midi → Nuit ...) n'est pas correct, change l'observation initiale (date/poste) ou augmente/diminue un offset d'équipe jusqu'à ce que ça colle — une fois ok, on verrouille et on exporte.
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Cycle 25 jours exact (tes 3 blocs)
const cycle = [
  "Matin","A-Midi","A-Midi","Nuit","Nuit","-","-","-",
  "Matin","Matin","A-Midi","Nuit","Nuit","-","-","-",
  "Matin","Matin","A-Midi","A-Midi","Nuit","-","-","-","-"
]
const L = cycle.length
const DAY = 24 * 60 * 60 * 1000

// defaults
const defaultOffsets = {1:10,2:15,3:20,4:0,5:5}

// UI state
const obsDate = ref(localStorage.getItem('obsDate') || '2025-10-31')
const obsTeam = ref(Number(localStorage.getItem('obsTeam') || 4))
const obsShift = ref(localStorage.getItem('obsShift') || '-')

const anchorIso = ref(localStorage.getItem('anchorIso') || '')
const anchorDays = ref(localStorage.getItem('anchorDays') ? Number(localStorage.getItem('anchorDays')) : null)

const offsets = reactive({...defaultOffsets})
// allow persisted offsets
const storedOffsets = localStorage.getItem('offsets')
if (storedOffsets) {
  try { Object.assign(offsets, JSON.parse(storedOffsets)) } catch(e){ }
}

const team = ref(Number(localStorage.getItem('team') || 4))
const dateIso = ref(localStorage.getItem('dateIso') || new Date().toISOString().slice(0,10))
const len = ref(Number(localStorage.getItem('len') || 14))

const rows = ref([])

// utilitaires
function isoToUTCmidnight(iso) {
  // accepts 'YYYY-MM-DD' or full ISO
  const full = iso.includes('T') ? iso : iso + 'T00:00:00Z'
  const d = new Date(full)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0,0,0)
}

// applique l'observation : calcule anchorDays (X) et anchorIso
function applyObservationDate(dateIsoStr, teamNumber, observedShift) {
  // normalize
  const obs = observedShift === 'Repos' ? '-' : observedShift
  const dUTC = isoToUTCmidnight(dateIsoStr)

  // possible indices with that observed shift
  const possibleIndices = []
  for (let i=0;i<L;i++) if (cycle[i] === obs) possibleIndices.push(i)
  if (!possibleIndices.length) throw new Error('Poste observé invalide')

  // offset for that team
  const offset = Number(offsets[teamNumber] || 0)

  // we need X such that (X + offset) % L == desiredIndex
  // choose X that keeps anchor near the chosen date (prefer small absolute anchorDays)
  // compute current guess 0
  // We'll choose X close to 0 (i.e., anchor at the observed date minus X days)
  // Let's choose X in range [-L..L] near 0 that satisfies the equation
  let best = null, bestAbs = Infinity
  for (const desiredIndex of possibleIndices) {
    // general solution X = desiredIndex - offset + k*L
    // choose k so that X is small magnitude
    for (let k=-2; k<=2; k++) {
      const X = desiredIndex - offset + k*L
      const absX = Math.abs(X)
      if (absX < bestAbs) { bestAbs = absX; best = X }
    }
  }

  // anchorDays = best
  const anchorDaysLocal = best
  const anchorUTC = dUTC - anchorDaysLocal * DAY
  // set global displayed values
  anchorIso.value = new Date(anchorUTC).toISOString().slice(0,10)
  anchorDays.value = anchorDaysLocal

  // persist
  localStorage.setItem('obsDate', dateIsoStr)
  localStorage.setItem('obsTeam', String(teamNumber))
  localStorage.setItem('obsShift', observedShift)
  localStorage.setItem('anchorIso', anchorIso.value)
  localStorage.setItem('anchorDays', String(anchorDaysLocal))
  localStorage.setItem('offsets', JSON.stringify(offsets))
  return { anchorIso: anchorIso.value, anchorDays: anchorDaysLocal }
}

// compute schedule based on anchorIso (UTC) + offsets
function computeRows(teamNumber, startIso, n) {
  if (!anchorIso.value) {
    // no anchor: cannot compute
    return []
  }
  const startUTC = isoToUTCmidnight(startIso)
  const anchorUTC = isoToUTCmidnight(anchorIso.value)
  return Array.from({length:n}, (_,i) => {
    const dUTC = startUTC + i*DAY
    const daysSince = Math.floor((dUTC - anchorUTC) / DAY + 0.0001)
    const off = Number(offsets[teamNumber] || 0)
    let idx = (daysSince + off) % L
    if (idx < 0) idx += L
    return {
      iso: new Date(dUTC).toISOString().slice(0,10),
      weekday: new Date(dUTC).toLocaleDateString('fr-FR', {weekday:'short'}),
      daysSinceAnchor: daysSince,
      index: idx,
      shift: cycle[idx]
    }
  })
}

function displayShift(s){ return s === '-' ? 'Repos' : s }

function refresh(){
  rows.value = computeRows(team.value, dateIso.value.includes('T')?dateIso.value:dateIso.value, len.value)
  // persist UI
  localStorage.setItem('team', String(team.value))
  localStorage.setItem('dateIso', dateIso.value)
  localStorage.setItem('len', String(len.value))
  localStorage.setItem('offsets', JSON.stringify(offsets))
}

// actions
function applyObservation(){
  try{
    const res = applyObservationDate(obsDate.value, obsTeam.value, obsShift.value)
    alert('Ancre calculée : ' + res.anchorIso + '  (days=' + res.anchorDays + ') — maintenant clique "Afficher"')
    refresh()
  }catch(e){
    alert('Erreur: ' + (e.message||e))
  }
}

// init: if anchorIso stored, keep it
if (localStorage.getItem('anchorIso')) {
  anchorIso.value = localStorage.getItem('anchorIso')
  anchorDays.value = localStorage.getItem('anchorDays') ? Number(localStorage.getItem('anchorDays')) : null
}

// initial refresh
refresh()

</script>

<style>
/* minimal */
</style>
