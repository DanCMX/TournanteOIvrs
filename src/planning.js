// === CONFIG VERROUILÉE ===

// Ancre (UTC) = 2025-11-09
// ⚠️ Mois en JavaScript : janvier = 0 → novembre = 10
export const anchorStartUTC = Date.UTC(2025, 10, 9, 0, 0, 0);

// Offsets définitifs (convention d'écartement 5x8)
export let teamOffsets = {
  1: 10,
  2: 15,
  3: 20,
  4: 0,
  5: 5
};
