export const baseCycle = [
  "Matin", "A-Midi", "A-Midi", "Nuit", "Nuit", "-", "-", "-",
  "Matin", "Matin", "A-Midi", "Nuit", "Nuit", "-", "-", "-",
  "Matin", "Matin", "A-Midi", "A-Midi", "Nuit", "-", "-", "-", "-"
]

export const teamOffsets = {
  1: 15,
  2: 20,
  3: 25,
  4: 0,
  5: 10
}

const startDate = new Date("2025-10-31")
const cycleLength = baseCycle.length

export function getShiftForDate(teamNumber, date) {
  const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24))
  const index = (daysSinceStart + teamOffsets[teamNumber]) % cycleLength
  return baseCycle[index < 0 ? index + cycleLength : index]
}
