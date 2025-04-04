
/**
 * Rounds a number to the nearest sensible poker chip denomination,
 * including more intermediate steps. Adjust these steps if needed.
 *
 * @param {number} value The value to round.
 * @returns {number} The rounded value.
 */
export function roundToPokerChips(value: number): number {
    if (value <= 0) return 0;

    const steps = [
        25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600,
        800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000,
        6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000,
        40000, 50000, 60000, 80000, 100000
        // Add higher values if needed
    ];

    // Find the closest step
    let closestStep = steps[steps.length - 1]; // Default to largest if value is huge
    let minDiff = Math.abs(value - closestStep);

    for (let i = 0; i < steps.length; i++) {
        const diff = Math.abs(value - steps[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closestStep = steps[i];
        } else if (diff === minDiff && steps[i] > closestStep) {
            // Optional: Bias towards rounding up in case of a tie
            closestStep = steps[i];
        }
        // Optimization: if the current step is much larger than value, we can stop early
        if (steps[i] > value * 2 && i > 0) break;
    }

    // Ensure a minimum value (e.g., smallest chip like 25)
    const minChipValue = steps[0] || 25;
    return Math.max(minChipValue, closestStep);
}

/**
 * Generates a dynamic poker tournament blind structure, considering format.
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
    tournamentFormat?: string;
    chipset?: number[];
  } = {}
) {
  // --- 1. Set Defaults and Handle Options ---
  const {
    levelDurationMinutes: baseLevelDuration = 15,
    rebuyAddonFactor = 1.3,
    breakIntervalLevels = 5,
    anteStartLevel = 4,
    blindIncreaseFactor: baseBlindIncreaseFactor = 1.5,
    tournamentFormat = 'standard', // 'standard', 'turbo', 'hyper', 'deepstack'
    chipset = [25, 100, 500, 1000, 5000] // Informational for now
  } = options;

  // --- Input Validation ---
  if (numPlayers <= 1 || initialStack <= 0 || targetDurationMinutes <= 0 || baseLevelDuration <= 0) {
    console.error("Invalid input parameters for blind generation.");
    return [];
  }

  // --- Adjust parameters based on format ---
  let actualLevelDuration = baseLevelDuration;
  let actualBlindIncreaseFactor = baseBlindIncreaseFactor;

  switch (tournamentFormat.toLowerCase()) {
    case 'turbo':
      actualLevelDuration = Math.max(5, Math.round(baseLevelDuration * 0.66)); // Faster levels
      actualBlindIncreaseFactor = baseBlindIncreaseFactor * 1.1; // Slightly faster blind increases
      break;
    case 'hyper':
    case 'hyperturbo':
      actualLevelDuration = Math.max(3, Math.round(baseLevelDuration * 0.4)); // Very fast levels
      actualBlindIncreaseFactor = baseBlindIncreaseFactor * 1.25; // Faster blind increases
      break;
    case 'deepstack':
      // Slower blind increases for deepstack
      actualBlindIncreaseFactor = baseBlindIncreaseFactor * 0.9;
      break;
    case 'standard':
    default:
      // Use base values
      break;
  }

  // --- Calculate Basic Params ---
  const estimatedTotalChips = numPlayers * initialStack * rebuyAddonFactor;
  // Estimate number of levels needed based on *actual* level duration
  const numLevels = Math.max(10, Math.ceil(targetDurationMinutes / actualLevelDuration));

  const blindStructure = [];

  // --- 2. Set Initial Blinds ---
  let currentBB = roundToPokerChips(initialStack / 150); // Aim for BB ~1/150th stack
  let currentSB = roundToPokerChips(currentBB / 2);
  let currentAnte = 0;

  // Ensure minimum blinds
  const minChipValue = chipset.length > 0 ? chipset[0] : 25; // Use smallest chip from provided set if possible
  currentBB = Math.max(minChipValue * 2, currentBB); // Min BB is usually 2x smallest chip
  currentSB = Math.max(minChipValue, roundToPokerChips(currentBB / 2)); // Min SB is smallest chip

  // --- 3. Generate Blind Progression ---
  for (let level = 1; level <= numLevels; level++) {
    let isBreak = (level > 1 && level % breakIntervalLevels === 1);

    // Calculate blinds if not the first level and not a break
    if (level > 1 && !isBreak) {
      // Increase Blinds using the format-adjusted factor
      let nextBB = currentBB * actualBlindIncreaseFactor;
      currentBB = roundToPokerChips(nextBB);
      currentSB = roundToPokerChips(currentBB / 2); // Recalculate SB

      // Sanity check SB vs BB after rounding
      if (currentSB >= currentBB && currentBB > minChipValue) {
        currentSB = roundToPokerChips(currentBB * 0.5); // Force SB to be ~half
        // Ensure SB is still a valid step
        currentSB = roundToPokerChips(currentSB);
      }
      // Ensure minimum SB is smallest chip value
      currentSB = Math.max(minChipValue, currentSB);

      // Introduce/Increase Antes
      if (level >= anteStartLevel) {
        // Start ante around BB/5 or BB/4, ensure it's at least the minimum chip value
        currentAnte = Math.max(minChipValue, roundToPokerChips(currentBB / 5));
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
      duration: isBreak ? 15 : actualLevelDuration, // Use 15 minutes for breaks
      isBreak: isBreak,
    });
  }

  // --- 4. Return Structure ---
  return blindStructure;
}
