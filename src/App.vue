<template>
  <div style="padding:18px;max-width:820px;margin:0 auto;font-family:Arial,Helvetica,sans-serif">
    <h1 style="margin-bottom:8px">Planning tournante 5x8 — Outils</h1>

    <!-- Contrôles principaux -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
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

    <!-- Résultat rapide -->
    <div style="margin:8px 0;font-size:18px">
      Résultat pour <strong>Équipe {{ team }}</strong> le <strong>{{ dateIso }}</strong> : 
      <span style="margin-left:8px;font-weight:700">{{ resultText }}</span>
    </div>

    <!-- Section ancre : définir à partir d'une observation -->
    <section style="border:1px solid #eee;padding:12px;border-radius:6px;margin-top:14px;background:#fafafa">
      <h3 style="margin:0 0 8px 0">Ajuster l'ancre à partir d'une observation</h3>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end">
        <div>
          <label>Date observée</label><br>
          <input type="date" v-model="anchorDate" />
        </div>

        <div>
          <label>Équipe observée</label><br>
          <select v-model.number="anchorTeam">
            <option v-for="i in 5" :key="i" :value="i">Équipe {{ i }}</option>
          </select>
        </div>

        <div>
          <label>Poste observé</label><br>
          <select v-model="anchorShift">
            <option value="Matin">Matin</option>
            <option value="A-Midi">A-Midi</option>
            <option value="Nuit">Nuit</option>
            <option value="Repos">Repos</option>
          </select>
        </div>

        <div>
          <button @click="applyAnchor" style="padding:6px 10px">Appliquer l'ancre</button>
        </div>
      </div>

      <div style="margin-top:10px;color:#444">
        <div>Anchor actuelle (ISO) : <strong>{{ anchorInfo.anchorIso || '(par défaut)' }}</strong></div>
        <div v-if="anchorInfo.days !== undefined">daysSinceAnchor for observed date : <strong>{{ anchorInfo.days }}</strong></div>
      </div>
    </section>

    <!-- Table résultat / preview -->
    <div v-if="rows.length" style="margin-top:16px">
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

    <div style="margin-top:12px;color:#666;font-size:13px">
      Astuce : si tu connais EXACTEMENT un jour où ton équipe avait "Repos" (ou "Matin"), utilise la section "Ajuster l'ancre" pour que tout s'aligne automatiquement.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getShiftForTeamOnDate, previewRange, setAnchorFromObserved } from './planning.js'

const team = ref(4)
const today = new Date()
const yyyy = today.getFullYear().toString().padStart(4,'0')
const mm = (today.getMonth()+1).toString().padStart(2,'0')
const dd = today.getDate().toString().padStart(2,'0')
const dateIso = ref(`${yyyy}-${mm}-${dd}`)

const resultText = ref('')
const rows = ref([])

// anchor UI state
const anchorDate = ref('2025-10-31')
const anchorTeam = ref(4)
const anchorShift = ref('Repos')
const anchorInfo = ref({})

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
  const iso = dateIso.value.includes('T') ? dateIso.value : dateIso.value + 'T00:00:00Z'
  const d = new Date(iso)
  resultText.value = displayShift(getShiftForTeamOnDate(team.value, d))
}

function showNext() {
  rows.value = previewRange(team.value, dateIso.value.includes('T') ? dateIso.value : dateIso.value + 'T00:00:00Z', 10)
  if (rows.value.length) resultText.value = displayShift(rows.value[0].shift)
}

// applique setAnchorFromObserved et affiche le résultat
async function applyAnchor() {
  try {
    // on appelle la fonction importée
    const res = setAnchorFromObserved(anchorTeam.value, anchorDate.value, anchorShift.value)
    // res contient l'ancre recalculée
    anchorInfo.value = { anchorIso: res.anchorIso, days: res.daysSinceAnchorForGivenDate }
    // après avoir changé l'ancre interne, on recharge la liste pour vérif
    showNext()
    alert('Ancre
