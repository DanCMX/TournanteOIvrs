// src/planning.js
// Amélioration : permet d'ajuster l'ancre en donnant une date + le poste observé ce jour-là.

// --- cycle 25 jours (tes 3 blocs) ---
export const cycle = [
  "Matin","A-Midi","A-Midi","Nuit","Nuit","-","-","-",
  "Matin","Matin","A-Midi","Nuit","Nuit","-","-","-",
  "Matin","Matin","A-Midi","A-Midi","Nuit","-","-","-","-"
];
export const cycleLength = cycle.length;
const DAY = 24 * 60 * 60 * 1000;

// Offsets par équipe (par défaut, à partir de l'équipe 4 = 0)
// Tu peux modifier ces valeurs si l'ordre des décalages est différent.
export let teamOffsets = {
  1: 10,
  2: 15,
  3: 20,
  4: 0,
  5: 5
};

// --- ancre interne (en ms UTC) ---
// Par défaut on met la même ancre que précédemment (31 oct 2025 minuit UTC)
// Mais elle peut être recalculée via setAnchorFromObserved(...)
let anchorStartUTC = Date.UTC(2025, 9, 31, 0, 0, 0);

// utilitaire : jours entiers en UTC depuis l'ancre
export function daysSinceAnchorUTC(date) {
  const dUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0,0,0);
  return Math.floor((dUTC - anchorStartUTC) / DAY + 0.0001);
}

// calcul "brut" : pour une équipe et une date renvoie index et poste
export function computeIndexFor(teamNumber, date) {
  const days = daysSinceAnchorUTC(date);
  const offset = Number(teamOffsets[teamNumber] ?? 0);
  let idx = (days + offset) % cycleLength;
  if (idx < 0) idx += cycleLength;
  return { daysSinceStart: days, offset, index: idx, shift: cycle[idx] };
}

export function getShiftForTeamOnDate(teamNumber, date) {
  return computeIndexFor(teamNumber, date).shift;
}

// --- FONCTION CLE: recalcule anchorStartUTC à partir d'une date connue et du poste observé ---
// teamNumber : n° d'équipe (1..5)
// dateIso : 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:MM:SSZ' (on accepte les deux)
// observedShift : string parmi cycle, ex "Matin", "A-Midi", "Nuit", "-" (ou "Repos")
export function setAnchorFromObserved(teamNumber, dateIso, observedShift) {
  // normalize observedShift texte court
  const obs = observedShift === 'Repos' ? '-' : observedShift;

  // parse date en UTC (si pas de T on force T00:00:00Z)
  const iso = dateIso.includes('T') ? dateIso : dateIso + 'T00:00:00Z';
  const d = new Date(iso);
  const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0,0,0);

  // on veut trouver anchorStartUTC tel que computeIndexFor(teamNumber, d).shift === obs
  // computeIndexFor use : idx = (daysSinceAnchor + offset) mod L, where daysSinceAnchor = (dUTC - anchorStartUTC)/DAY
  // So daysSinceAnchor = (dUTC - anchorStartUTC)/DAY
  // Let desiredIndex be any index i where cycle[i] === obs
  const possibleIndices = [];
  for (let i = 0; i < cycleLength; i++) {
    if (cycle[i] === obs) possibleIndices.push(i);
  }
  if (possibleIndices.length === 0) {
    throw new Error("observedShift invalide : " + observedShift);
  }

  // offset pour l'équipe
  const offset = Number(teamOffsets[teamNumber] ?? 0);

  // daysSinceAnchor = some integer X such that (X + offset) % L == desiredIndex
  // donc X == desiredIndex - offset (mod L)
  // on choisit la solution X la plus proche de la valeur courante (préserve continuité)
  // calcul valeur actuelle days depuis anchor (avant modif)
  const currentDays = Math.floor((dUTC - anchorStartUTC) / DAY + 0.0001);

  // On cherche la possibleIndex qui donne l'X le plus proche de currentDays
  let best = null;
  let bestDelta = Infinity;
  for (const desiredIndex of possibleIndices) {
    // toutes les solutions X = desiredIndex - offset + k*L
    // on choisit k tel que X proche de currentDays
    const base = desiredIndex - offset;
    // choisir k entier pour rapprocher
    const k = Math.round((currentDays - base) / cycleLength);
    const X = base + k * cycleLength;
    const delta = Math.abs(X - currentDays);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = X;
    }
  }

  // on recalcule anchorStartUTC pour que daysSinceAnchor at date d equals best
  anchorStartUTC = dUTC - best * DAY;

  return {
    anchorStartUTC,
    anchorIso: new Date(anchorStartUTC).toISOString().slice(0,10),
    daysSinceAnchorForGivenDate: best
  };
}

// helper pour preview range
export function previewRange(teamNumber, fromDateIso, len = 10) {
  const startIso = fromDateIso.includes('T') ? fromDateIso : fromDateIso + 'T00:00:00Z';
  const start = new Date(startIso);
  return Array.from({ length: len }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const info = computeIndexFor(teamNumber, d);
    return {
      iso: d.toISOString().slice(0,10),
      weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      ...info
    };
  });
}

// expose aussi une fonction pour mettre à jour teamOffsets si tu veux ajuster manuellement
export function setTeamOffsets(newOffsets) {
  teamOffsets = { ...teamOffsets, ...newOffsets };
  return teamOffsets;
}
