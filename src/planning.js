// --- Cycle exact (25 jours) ---
export const baseCycle = [
  // Bloc 1
  "Matin","A-Midi","A-Midi","Nuit","Nuit","-","-","-",
  // Bloc 2
  "Matin","Matin","A-Midi","Nuit","Nuit","-","-","-",
  // Bloc 3
  "Matin","Matin","A-Midi","A-Midi","Nuit","-","-","-","-"
];

// ⚠️ Ancre : l'équipe 4 démarre le JOUR 0 du cycle le 31/10/2025
// Pour éviter les erreurs de fuseau, on travaille en UTC
const startUTC = Date.UTC(2025, 9, 31); // mois 9 = octobre
const DAY = 24 * 60 * 60 * 1000;
const cycleLength = baseCycle.length;

// Délais entre équipes : 0, +5, +10, +15, +20 (ordre à partir de l'équipe 4)
export const teamOffsets = {
  4: 0,   // ton équipe = ancre
  5: 5,
  1: 10,
  2: 15,
  3: 20
};

// Utilitaire : transforme une Date JS en "jour UTC" entier
function daysSinceStartUTC(date) {
  const dUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((dUTC - startUTC) / DAY);
}

export function getShiftForDate(teamNumber, date) {
  const days = daysSinceStartUTC(date);
  const offset = teamOffsets[teamNumber] ?? 0;
  let idx = (days + offset) % cycleLength;
  if (idx < 0) idx += cycleLength;
  return baseCycle[idx];
}

// Optionnel : petit helper pour vérifier vite fait dans la console
export function debugPreview(teamNumber, fromIso = "2025-11-01", len = 10) {
  const start = new Date(fromIso);
  return Array.from({ length: len }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return { date: d.toISOString().slice(0,10), shift: getShiftForDate(teamNumber, d) };
  });
}
