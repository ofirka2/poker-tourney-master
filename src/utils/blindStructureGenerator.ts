<<<<<<< HEAD
=======

>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
/**
 * Rounds a number to the nearest sensible poker chip denomination,
 * including more intermediate steps. Adjust these steps if needed.
 *
 * @param {number} value The value to round.
 * @returns {number} The rounded value.
 */
export function roundToPokerChips(value: number): number {
<<<<<<< HEAD
  if (value <= 0) return 0;

  const steps = [
      1, 2, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600,
      800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000,
      6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000,
      40000, 50000, 60000, 80000, 100000, 120000, 150000, 200000, 250000, 300000,
      400000, 500000, 600000, 800000, 1000000 // Added higher values
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
      // This prevents checking unnecessarily large chip values
      if (steps[i] > value * 2 && i > 0 && steps[i] > 1000) break; // Added threshold for optimization
  }

  // Ensure a minimum value (e.g., smallest chip like 1 or 25)
   const minChipValue = steps.find(step => step >= 1) || 1; // Find smallest step >= 1
  return Math.max(minChipValue, closestStep);
}

/**
* Rounds a value up to the nearest denomination from the provided chipset.
* This is often more suitable for blinds/antes to ensure they are playable.
*
* @param {number} value The value to round up.
* @param {number[]} chipset Available chip denominations.
* @returns {number} The rounded up value based on the chipset.
*/
export function roundUpToChipset(value: number, chipset: number[]): number {
  if (value <= 0) return 0;
  if (!chipset || chipset.length === 0) return roundToPokerChips(value); // Fallback

  const sortedChipset = [...chipset].sort((a, b) => a - b);
  const smallestChip = sortedChipset[0];

  // If the value is less than or equal to the smallest chip, return the smallest chip
  if (value <= smallestChip) return smallestChip;

  // Find the first chip denomination that is greater than or equal to the value
  for (const chip of sortedChipset) {
    if (chip >= value) {
      return chip;
    }
  }

  // If value is greater than all chips, return the largest chip
  return sortedChipset[sortedChipset.length - 1];
}


/**
* Generates a dynamic poker tournament blind structure based on format, chipset, and duration.
*
* @param {number} numPlayers The initial number of players.
* @param {number} initialStack The starting chip stack per player.
* @param {number} targetDurationMinutes The desired total tournament duration in minutes.
* @param {object} [options={}] Optional parameters.
* @param {number} [options.levelDurationMinutes=15] Base duration for non-break levels.
* @param {number} [options.rebuyAddonFactor=1.3] Factor to adjust blind progression for rebuys/addons.
* @param {number} [options.breakIntervalLevels=5] Number of blind levels between breaks.
* @param {number} [options.anteStartLevel=4] The level at which antes begin (if includeAnte is true).
* @param {number} [options.blindIncreaseFactor=1.5] The base multiplier for blind increases.
* @param {string} [options.tournamentFormat='standard'] Tournament format ('standard', 'turbo', 'hyper', 'deepstack', 'rebuy', 'bounty').
* @param {number[]} [options.chipset=[25, 100, 500, 1000, 5000]] Available chip denominations.
* @param {boolean} [options.includeAnte=false] Whether to include antes in the structure.
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
  includeAnte?: boolean; // Parameter to control ante inclusion
} = {}
) {
// --- 1. Set Defaults and Handle Options ---
const {
  levelDurationMinutes: baseLevelDuration = 15,
  rebuyAddonFactor = 1.3, // Factor applied to blind increases if rebuys/addons are allowed
  breakIntervalLevels = 5,
  anteStartLevel = 4,
  blindIncreaseFactor: baseBlindIncreaseFactor = 1.5,
  tournamentFormat = 'standard', // 'standard', 'turbo', 'hyper', 'deepstack', 'rebuy', 'bounty'
  chipset = [25, 100, 500, 1000, 5000],
  includeAnte = false // Default to false
} = options;

// --- Input Validation ---
if (numPlayers <= 0 || initialStack <= 0 || targetDurationMinutes <= 0 || baseLevelDuration <= 0) {
  console.error("Invalid input parameters for blind generation.");
  return [];
}

// --- Ensure we have a valid chipset to work with ---
const validChipset = chipset && chipset.length > 0 ?
                    chipset.filter(chip => typeof chip === 'number' && chip > 0) :
                    [25, 100, 500, 1000, 5000];

// Sort the chipset for easier usage
const sortedChipset = [...validChipset].sort((a, b) => a - b);
const smallestChip = sortedChipset[0];
const largestChip = sortedChipset[sortedChipset.length - 1];


// --- Adjust parameters based on format ---
let actualLevelDuration = baseLevelDuration;
let actualBlindIncreaseFactor = baseBlindIncreaseFactor;
let stackToBlindRatio: number; // Target ratio of initial stack to initial Big Blind

switch (tournamentFormat.toLowerCase()) {
  case 'turbo':
    actualLevelDuration = Math.max(5, Math.round(baseLevelDuration * 0.66)); // Faster levels
    actualBlindIncreaseFactor = baseBlindIncreaseFactor * 1.1; // Slightly faster blind increases
    stackToBlindRatio = 100; // Lower ratio for faster tournament (start with higher blinds relative to stack)
    break;
  case 'hyper':
  case 'hyperturbo':
    actualLevelDuration = Math.max(3, Math.round(baseLevelDuration * 0.4)); // Very fast levels
    actualBlindIncreaseFactor = baseBlindIncreaseFactor * 1.25; // Faster blind increases
    stackToBlindRatio = 75; // Much lower ratio for super-fast format
    break;
  case 'deepstack':
    // Slower blind increases for deepstack
    actualBlindIncreaseFactor = baseBlindIncreaseFactor * 0.9;
    stackToBlindRatio = 200; // Higher ratio for deepstack (start with lower blinds relative to stack)
    break;
  case 'rebuy':
    // Slightly faster increases due to rebuys adding chips (consider rebuyAddonFactor)
    actualBlindIncreaseFactor = baseBlindIncreaseFactor * rebuyAddonFactor;
    stackToBlindRatio = 125; // Balanced ratio for rebuy
    break;
  case 'bounty':
    // Similar to standard but adjusted for bounty dynamics
    stackToBlindRatio = 150; // Standard ratio
    break;
  case 'standard':
  case 'freezeout':
  default:
    stackToBlindRatio = 150; // Standard ratio
    break;
}

// --- Adjust for tournament duration ---
// Calculate a target number of levels based on total duration and actual level duration
let targetLevels = Math.ceil(targetDurationMinutes / actualLevelDuration);

// Ensure a minimum number of levels to make the structure meaningful
const minLevels = 10; // Minimum number of blind levels
targetLevels = Math.max(minLevels, targetLevels);

// Adjust level duration slightly to better fit the target duration, if needed
// This helps the total time of the generated levels be closer to targetDurationMinutes
const totalBlindLevelTime = targetLevels * actualLevelDuration;
if (totalBlindLevelTime !== targetDurationMinutes && targetLevels > 0) {
  actualLevelDuration = Math.round(targetDurationMinutes / targetLevels);
  // Ensure level duration is at least 1 minute
  actualLevelDuration = Math.max(1, actualLevelDuration);
}


// --- 2. Set Initial Blinds ---
// Calculate optimal starting big blind based on stack-to-blind ratio and chipset
let initialTargetBB = initialStack / stackToBlindRatio;
// Round the initial target BB up to a valid chipset denomination
let initialBB = roundUpToChipset(initialTargetBB, sortedChipset);

// Ensure initial BB is at least twice the smallest chip
initialBB = Math.max(smallestChip * 2, initialBB);

// Calculate small blind (exactly half of BB)
let initialSB = Math.floor(initialBB / 2);
// Round the initial SB to a valid poker chip denomination
initialSB = roundToPokerChips(initialSB); // Use general poker chips for SB

// Adjust BB to be exactly double the SB after rounding SB
// If SB is rounded down, BB might need to be adjusted to maintain BB = 2*SB
initialBB = initialSB * 2;

// Ensure the initial blinds are at least the smallest chip value
initialSB = Math.max(smallestChip, initialSB);
initialBB = Math.max(smallestChip * 2, initialBB); // BB must be at least 2x smallest chip


let currentSB = initialSB;
let currentBB = initialBB;
let currentAnte = 0;


// --- 3. Generate Blind Progression ---
const blindStructure = [];

for (let i = 1; i <= targetLevels; i++) {
  // Determine if this level is a break
  // Breaks occur *after* a block of blind levels.
  // So, if breakIntervalLevels is 5, breaks are after levels 5, 10, 15, etc.
  // The break level itself will be level 6, 11, 16, etc.
  const isBreak = (i > 0 && i % breakIntervalLevels === 0 && i !== targetLevels); // Add break AFTER levels 5, 10, etc. (not after the very last level)

  const levelDuration = actualLevelDuration; // Blind levels have the calculated duration

  // Add the current blind level
  blindStructure.push({
    level: blindStructure.length + 1, // Assign level number based on position
    smallBlind: currentSB,
    bigBlind: currentBB,
    ante: includeAnte && (blindStructure.length + 1) >= anteStartLevel ? currentAnte : 0, // Include ante if enabled and at/past start level
    duration: levelDuration,
    isBreak: false, // This is a blind level, not a break level
  });

  // If this level is followed by a break, add the break level
  if (isBreak) {
    blindStructure.push({
      level: blindStructure.length + 1, // Assign level number based on position
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15, // Default break duration (can be configurable)
      isBreak: true,
    });
  }

  // Calculate blinds and ante for the *next* blind level
  // Skip calculation if this was the last blind level we intended to generate
  if (i < targetLevels) {
    // Calculate the target for the next Big Blind based on the increase factor
    let nextTargetBB = currentBB * actualBlindIncreaseFactor;

    // Round the target next BB up to a valid chipset denomination
    let nextBB = roundUpToChipset(nextTargetBB, sortedChipset);

    // Ensure the next BB is strictly greater than the current BB (unless current BB is already the largest chip)
    if (nextBB <= currentBB && currentBB < largestChip) {
      // If rounding resulted in no increase, find the next available chipset value
      const nextLargerChip = sortedChipset.find(chip => chip > currentBB);
      nextBB = nextLargerChip || largestChip; // Use the next chip or the largest if no larger exists
        // If nextLargerChip is undefined (currentBB is the largest chip), nextBB remains currentBB
        if (nextLargerChip === undefined && currentBB === largestChip) {
             nextBB = currentBB; // Cannot increase past the largest chip
        } else if (nextLargerChip !== undefined) {
             nextBB = nextLargerChip; // Use the next available chip
        } else {
             // Fallback if something unexpected happens, ensure it's at least current BB + smallest chip
             nextBB = Math.max(currentBB + smallestChip, nextBB);
        }
    }


    // Calculate the target for the next Small Blind (half of the next BB)
    let nextTargetSB = Math.floor(nextBB / 2);

    // Round the target next SB to a valid poker chip denomination
    let nextSB = roundToPokerChips(nextTargetSB); // Use general poker chips for SB

    // Adjust the next BB to be exactly double the next SB after rounding SB
    nextBB = nextSB * 2;

    // Ensure the next SB and BB are at least the smallest chip value
    nextSB = Math.max(smallestChip, nextSB);
    nextBB = Math.max(smallestChip * 2, nextBB); // BB must be at least 2x smallest chip

    // Update current blinds for the next iteration
    currentSB = nextSB;
    currentBB = nextBB;

    // Calculate ante for the *next* level (based on the *new* currentBB)
    if (includeAnte && (blindStructure.length + 1) + 1 >= anteStartLevel) { // Check level + 1 (for the *next* level)
      let nextTargetAnte = currentBB * 0.2; // Ante is typically 20% of BB
      currentAnte = roundUpToChipset(nextTargetAnte, sortedChipset); // Round ante up to a chipset value
      
      // Ensure ante is at least the smallest chip and never larger than the big blind
      currentAnte = Math.max(smallestChip, Math.min(currentAnte, currentBB));
    } else {
      currentAnte = 0;
    }
  } else {
     // If this is the last blind level, the ante for the *next* level (which won't exist) is 0
     currentAnte = 0;
  }
}

// Ensure the very last level (if it's a blind level) has its ante set correctly based on includeAnte and anteStartLevel
// This handles the case where the loop finishes *exactly* at the anteStartLevel
if (blindStructure.length > 0) {
    const lastBlindLevelIndex = blindStructure.findLastIndex(level => !level.isBreak); // Find the last actual blind level
    if (lastBlindLevelIndex !== -1) {
        const lastBlindLevel = blindStructure[lastBlindLevelIndex];
         lastBlindLevel.ante = includeAnte && lastBlindLevel.level >= anteStartLevel
            ? roundUpToChipset(lastBlindLevel.bigBlind * 0.2, sortedChipset)
            : 0;
         // Re-apply ante constraints after potential recalculation
         if (lastBlindLevel.ante > 0) {
             lastBlindLevel.ante = Math.max(smallestChip, Math.min(lastBlindLevel.ante, lastBlindLevel.bigBlind));
         }
    }
}


return blindStructure;
=======
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
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
}
