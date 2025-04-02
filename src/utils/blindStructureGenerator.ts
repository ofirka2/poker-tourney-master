
/**
 * Rounds a number to the nearest sensible poker chip denomination.
 * Adjust the steps based on the typical chips used in your tournaments.
 *
 * @param {number} value The value to round.
 * @returns {number} The rounded value.
 */
export function roundToPokerChips(value: number): number {
  if (value <= 0) return 0;
  if (value < 100) return Math.max(25, Math.round(value / 25) * 25); // Round to nearest 25, min 25
  if (value < 500) return Math.round(value / 50) * 50;   // Round to nearest 50
  if (value < 1000) return Math.round(value / 100) * 100; // Round to nearest 100
  if (value < 5000) return Math.round(value / 250) * 250; // Round to nearest 250
  if (value < 10000) return Math.round(value / 500) * 500; // Round to nearest 500
  return Math.round(value / 1000) * 1000; // Round to nearest 1000
}

/**
 * Generates a dynamic poker tournament blind structure.
 *
 * @param {number} numPlayers The initial number of players.
 * @param {number} initialStack The starting chip stack per player.
 * @param {number} targetDurationMinutes The desired total tournament duration in minutes.
 * @param {object} [options={}] Optional parameters.
 * @returns {Array<object>} An array of level objects: { level, smallBlind, bigBlind, ante, duration, isBreak }
 */
export function generateDynamicBlinds(
  numPlayers: number, 
  initialStack: number, 
  targetDurationMinutes: number, 
  options: {
    levelDurationMinutes?: number;
    rebuyAddonFactor?: number;
    breakIntervalLevels?: number;
    anteStartLevel?: number;
    blindIncreaseFactor?: number;
  } = {}
) {
  // --- 1. Set Defaults and Calculate Basic Params ---
  const {
    levelDurationMinutes = 20, // Default level duration
    rebuyAddonFactor = 1.3,    // Estimate 30% chip increase from rebuys/addons
    breakIntervalLevels = 4,   // Break every 4 levels
    anteStartLevel = 4,        // Antes start at level 4
    blindIncreaseFactor = 1.5, // Increase blinds by ~50% each level
  } = options;

  if (numPlayers <= 1 || initialStack <= 0 || targetDurationMinutes <= 0 || levelDurationMinutes <= 0) {
    console.error("Invalid input parameters for blind generation.");
    return []; // Return empty array on invalid input
  }

  const estimatedTotalChips = numPlayers * initialStack * rebuyAddonFactor;
  // Estimate number of levels needed - add a buffer as games often speed up/slow down
  const numLevels = Math.max(10, Math.ceil(targetDurationMinutes / levelDurationMinutes)); // Ensure minimum levels

  const blindStructure = [];

  // --- 2. Set Initial Blinds ---
  // Aim for BB around 1/100th to 1/200th of stack
  let currentBB = roundToPokerChips(initialStack / 150);
  let currentSB = roundToPokerChips(currentBB / 2);
  let currentAnte = 0;

  // Ensure minimum blinds if calculation is too low
  currentBB = Math.max(25, currentBB); // Absolute minimum BB
  currentSB = Math.max(Math.floor(currentBB * 0.4 / 25) * 25, Math.round(currentBB / 2 / 25) * 25); // Ensure SB is reasonable

  // --- 3. Generate Blind Progression ---
  for (let level = 1; level <= numLevels; level++) {
    let isBreak = (level > 1 && level % breakIntervalLevels === 1); // Place break before level starts

    // If it's the first level, or not a break level, calculate blinds
    if (level > 1 && !isBreak) {
      // Increase Blinds
      let nextBB = currentBB * blindIncreaseFactor;
      currentBB = roundToPokerChips(nextBB);
      currentSB = roundToPokerChips(currentBB / 2); // Recalculate SB based on new BB

      // Ensure SB doesn't accidentally round up to BB or too close
      if (currentSB >= currentBB) {
        currentSB = roundToPokerChips(currentBB * 0.5); // Force SB to be ~half
      }
      
      // Ensure minimum SB difference if rounding makes them equal
      if (currentSB === currentBB && currentBB > 25) {
        currentSB = roundToPokerChips(currentBB * 0.75); // Adjust SB down slightly
        currentSB = roundToPokerChips(currentSB / 25) * 25; // Re-round SB
      }

      // Introduce/Increase Antes
      if (level >= anteStartLevel) {
        // Start ante around BB/5, increase it proportionally
        currentAnte = roundToPokerChips(currentBB / 5);
      } else {
        currentAnte = 0;
      }
    }

    // Add the level (or break) to the structure
    blindStructure.push({
      level: level,
      smallBlind: isBreak ? 0 : currentSB,
      bigBlind: isBreak ? 0 : currentBB,
      ante: isBreak ? 0 : currentAnte,
      duration: isBreak ? 15 : levelDurationMinutes, // Make breaks shorter (15 minutes)
      isBreak: isBreak,
    });
  }

  // --- 4. Return Structure ---
  return blindStructure;
}
