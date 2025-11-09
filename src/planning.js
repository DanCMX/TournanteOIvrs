// src/planning.js
// Config verrouillée — ne change pas ici si tu veux garder le réglage stable

// Ancre (UTC) = 2025-11-09 (mois: novembre = 10 en JS)
export const anchorStartUTC = Date.UTC(2025, 10, 9, 0, 0, 0);

// Offsets définitifs pour chaque équipe
export let teamOffsets = {
  1: 10,
  2: 15,
  3: 20,
  4: 0,
  5: 5
};

const DAY = 24 * 60 * 60 * 1000;

// Cycle 25 jours (tes 3 blocs)
export const cycle = [
  "Matin","A-Midi","A-Midi","Nuit","Nuit","-","-","-",
  "Matin","Matin","A-Midi","Nuit","Nuit","-","-","-",
  "Matin","Matin","A-Midi","A-Midi","Nuit","-","-","-","-"
];

export const cycleLength = cycle.length;

// Convertit une date JS (ou ISO) en jours entiers UTC depuis l'ancre
export function daysSinceAnchorUTC(date) {
  const d = (date instanceof Date) ? date : new Date(date);
  const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0);
  return Math.floor((dUTC - anchorStartUTC) / DAY + 0.0001);
}

// Calcule index + shift pour une équipe à une date donnée
export function computeIndexFor(teamNumber, date) {
  const days = daysSinceAnchorUTC(date);
  const offset = Number(teamOffsets[teamNumber] ?? 0);
  let idx = (days + offset) % cycleLength;
  if (idx < 0) idx += cycleLength;
  return { daysSinceStart: days, offset, index: idx, shift: cycle[idx] };
}

// Retourne le poste ("Matin" / "A-Midi" / "Nuit" / "-") pour une équipe à une date
export function getShiftForTeamOnDate(teamNumber, date) {
  return computeIndexFor(teamNumber, date).shift;
}

// Retourne un tableau d'éléments pour l'UI (preview)
export function previewRange(teamNumber, fromDateIso, len = 14) {
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
