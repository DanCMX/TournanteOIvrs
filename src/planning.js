// ------------------------------
// planning.js
// ------------------------------

// ✅ Ancre du cycle (Équipe 4) : 31 octobre 2025 à minuit UTC
export const startUTC = Date.UTC(2025, 9, 31, 0, 0, 0); // mois 9 = octobre (index 0 = Janvier)

const DAY = 24 * 60 * 60 * 1000;

// ✅ Cycle 5x8 que tu m’as donné
export const cycle = [
  "Matin", "Après-midi", "Après-midi", "Nuit", "Nuit", "Repos", "Repos", "Repos",
  "Matin", "Matin", "Après-midi", "Nuit", "Nuit", "Repos", "Repos", "Repos",
  "Matin", "Matin", "Après-midi", "Après-midi", "Nuit", "Repos", "Repos", "Repos", "Repos"
];

/**
 * Retourne le poste à effectuer pour une date donnée
 * @param {Date} dateToCheck
 * @returns {string}
 */
export function getShiftForDate(dateToCheck) {
  // Convertit la date choisie en UTC
  const dateOnlyUTC = Date.UTC(
    dateToCheck.getFullYear(),
    dateToCheck.getMonth(),
    dateToCheck.getDate(),
    0, 0, 0
  );

  const diff = dateOnlyUTC - startUTC;

  // ✅ Réglage qui supprimera le décalage d'un jour
  const diffDays = Math.floor(diff / DAY + 0.0001);

  // Position dans le cycle (boucle infinie / modulo)
  const index = ((diffDays % cycle.length) + cycle.length) % cycle.length;

  return cycle[index];
}
