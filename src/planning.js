// src/planning.js

// Ancre du cycle (Équipe 4) : 31 octobre 2025 à minuit UTC
export const startUTC = Date.UTC(2025, 9, 31, 0, 0, 0);

const DAY = 24 * 60 * 60 * 1000;

// Cycle 25 jours (tes 3 blocs)
export const cycle = [
  "Matin", "A-Midi", "A-Midi", "Nuit", "Nuit", "-", "-", "-",
  "Matin", "Matin", "A-Midi", "Nuit", "Nuit", "-", "-", "-",
  "Matin", "Matin", "A-Midi", "A-Midi", "Nuit", "-", "-", "-", "-"
];

// Offsets entre équipes (à partir de l'équipe 4 = 0)
export const teamOffsets = {
  1: 10,
  2: 15,
  3: 20,
  4: 0,
  5: 5
};

export const cycleLength = cycle.length;

// convertit une Date en "jours depuis l'ancre" en UTC
export function daysSinceStartUTC(date) {
  const dUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0,0,0);
  return Math.floor((dUTC - startUTC) / DAY + 0.0001);
}

// retourne l'index et le poste pour une équipe à une date
export function computeIndexFor(teamNumber, date) {
  const days = daysSinceStartUTC(date);
  const offset = Number(teamOffsets[teamNumber] ?? 0);
  let idx = (days + offset) % cycleLength;
  if (idx < 0) idx += cycleLength;
  return { daysSinceStart: days, offset, index: idx, shift: cycle[idx] };
}

// helper simple
export function getShiftForTeamOnDate(teamNumber, date) {
  return computeIndexFor(teamNumber, date).shift;
}

// preview range (array utile pour l'UI)
export function previewRange(teamNumber, fromDateIso, len = 10) {
  // parse en UTC si nécessaire
  const start = fromDateIso.includes('T') ? new Date(fromDateIso) : new Date(fromDateIso + 'T00:00:00Z');
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
