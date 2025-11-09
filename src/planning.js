// src/planning.js
// Cycle exact (25 jours)
export const baseCycle = [
  // Bloc 1
  "Matin","A-Midi","A-Midi","Nuit","Nuit","-","-","-",
  // Bloc 2
  "Matin","Matin","A-Midi","Nuit","Nuit","-","-","-",
  // Bloc 3
  "Matin","Matin","A-Midi","A-Midi","Nuit","-","-","-","-"
];

export const cycleLength = baseCycle.length

// ✅ Ancre du cycle (Équipe 4) : 31 octobre 2025, à minuit UTC
// ⚠️ IMPORTANT : le mois est 9 car JS commence à 0 pour janvier
export const startUTC = Date.UTC(2025, 9, 31, 0, 0, 0); // <-- Ajout des heures/minutes/secondes

const DAY = 24 * 60 * 60 * 1000;

// Par défaut : espacement 5 jours entre les équipes (modifiable)
export const defaultTeamOffsets = {
  1: 10,
  2: 15,
  3: 20,
  4: 0,   // équipe 4 = ancre
  5: 5
};

// transforme une Date JS en "jours depuis l'ancre" en UTC entier
export function daysSinceStartUTC(date) {
  const dUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((dUTC - startUTC) / DAY);
}

// retourne index / shift et valeurs brutes pour debug
export function computeIndexFor(teamNumber, date, teamOffsets = defaultTeamOffsets) {
  const days = daysSinceStartUTC(date);
  const offset = Number(teamOffsets[teamNumber] ?? 0);
  let idx = (days + offset) % cycleLength;
  if (idx < 0) idx += cycleLength;
  const shift = baseCycle[idx];
  return { daysSinceStart: days, offset, index: idx, shift };
}

// helper simple
export function getShiftForDate(teamNumber, date, teamOffsets = defaultTeamOffsets) {
  return computeIndexFor(teamNumber, date, teamOffsets).shift;
}

// helper pour l'UI : tableau de n jours à partir d'une date
export function previewRange(teamNumber, fromDateIso, len = 30, teamOffsets = defaultTeamOffsets) {
  const start = new Date(fromDateIso);
  return Array.from({ length: len }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const { daysSinceStart, offset, index, shift } = computeIndexFor(teamNumber, d, teamOffsets);
    return {
      iso: d.toISOString().slice(0,10),
      weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      daysSinceStart,
      offset,
      index,
      shift
    };
  });
}
