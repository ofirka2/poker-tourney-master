/**
 * Calculates the recommended initial stack size and blinds for a poker tournament,
 * considering tournament format, chipset, and desired duration.
 * 
 * Follows these target big blind ranges:
 * - Freezeout: 100-200 BB
 * - Rebuy: 50-150 BB
 * - Bounty: 100-200 BB
 * - DeepStack: 200+ BB
 * - Turbo: 50-150 BB
 * 
 * @param {number[]} denominations - An array of the available chip denominations.
 * @param {string} format - The tournament format (e.g., "Freezeout", "Rebuy").
 * @param {number} [desiredDurationHours] - Optional desired tournament duration in hours.
 * @returns {{ startingStack: number, smallBlind: number, bigBlind: number }} Object containing recommended values.
 */
export const calculateInitialStack = (
  denominations: number[],
  format: string,
  desiredDurationHours?: number
): { startingStack: number, smallBlind: number, bigBlind: number } => {
  if (!denominations || denominations.length === 0) {
    return { 
      startingStack: 5000, 
      smallBlind: 25, 
      bigBlind: 50 
    }; // Default values if no chipset is provided
  }

  const smallestChip = Math.min(...denominations);
  const biggestChip = Math.max(...denominations);
  
  // Set initial blinds based on smallest chip
  let initialBigBlind = smallestChip * 2;
  let initialSmallBlind = smallestChip;
  
  // For small chipsets with short tournaments, adjust blinds
  if (desiredDurationHours && desiredDurationHours < 3 && smallestChip < 5) {
    initialBigBlind = Math.max(initialBigBlind, smallestChip * 5);
    initialSmallBlind = Math.floor(initialBigBlind / 2);
  }
  
  // Calculate the target ratio between starting stack and big blind
  // based on format and desired duration
  const targetStackToBBRatio = getTargetStackToBBRatio(format, desiredDurationHours);
  
  // Calculate starting stack based on target ratio and initial big blind
  let startingStack = initialBigBlind * targetStackToBBRatio;
  
  // Round the stack size to make it divisible by common chip values
  startingStack = roundStackToChipset(startingStack, denominations);
  
  // Ensure minimum reasonable stack size based on chipset
  const minimumStack = determineMinimumStack(denominations, format);
  startingStack = Math.max(startingStack, minimumStack);
  
  return {
    startingStack,
    smallBlind: initialSmallBlind,
    bigBlind: initialBigBlind
  };
};

/**
 * Determines the target ratio of starting stack to big blind based on
 * tournament format and duration.
 * 
 * @param {string} format - Tournament format.
 * @param {number | undefined} duration - Desired duration in hours.
 * @returns {number} The target ratio of starting stack to big blind.
 */
function getTargetStackToBBRatio(format: string, duration?: number): number {
  // Base ratios by format
  const baseRatios: { [key: string]: number } = {
    'freezeout': 150, // 100-200 BB range, middle point
    'rebuy': 100,     // 50-150 BB range, middle point
    'bounty': 150,    // 100-200 BB range, middle point
    'deepstack': 250, // 200+ BB
    'turbo': 75,      // 50-150 BB range, lower end due to faster blinds
    'hyper-turbo': 50, // Even lower for hyper-turbo
    'sit & go': 100,  // Similar to rebuy
    'mtt': 150        // Similar to freezeout
  };
  
  // Get base ratio or default to 100
  let ratio = baseRatios[(format || '').toLowerCase()] || 100;
  
  // Adjust for tournament duration if provided
  if (duration) {
    if (duration <= 2) {
      // Short tournaments need smaller ratios (faster blind increases)
      ratio = Math.max(50, Math.floor(ratio * 0.7));
    } else if (duration > 5) {
      // Long tournaments need larger ratios (slower blind increases)
      ratio = Math.floor(ratio * 1.3);
    }
  }
  
  return ratio;
}

/**
 * Rounds the stack size to be better aligned with the available chip denominations.
 * 
 * @param {number} stack - The calculated raw stack size.
 * @param {number[]} denominations - Available chip denominations.
 * @returns {number} Rounded stack size.
 */
function roundStackToChipset(stack: number, denominations: number[]): number {
  const smallestChip = Math.min(...denominations);
  const biggestChip = Math.max(...denominations);
  
  // For tiny chipsets (max ≤ 10), round to nearest multiple of smallest chip
  if (biggestChip <= 10) {
    const roundingFactor = smallestChip * 20;
    return Math.round(stack / roundingFactor) * roundingFactor;
  }
  // For small chipsets (max ≤ 50), round to nearest 20 or 25
  else if (biggestChip <= 50) {
    const roundingFactor = denominations.includes(25) ? 25 : 20;
    return Math.round(stack / roundingFactor) * roundingFactor;
  }
  // For medium chipsets (max ≤ 500), round to nearest 100
  else if (biggestChip <= 500) {
    return Math.round(stack / 100) * 100;
  }
  // For large chipsets, round to nearest 500 or 1000
  else {
    const roundingFactor = biggestChip >= 1000 ? 1000 : 500;
    return Math.round(stack / roundingFactor) * roundingFactor;
  }
}

/**
 * Determines the minimum reasonable stack size based on the available denominations
 * and tournament format.
 * 
 * @param {number[]} denominations - The available chip denominations.
 * @param {string} format - Tournament format.
 * @returns {number} The minimum reasonable stack size.
 */
function determineMinimumStack(denominations: number[], format: string): number {
  const smallestChip = Math.min(...denominations);
  const biggestChip = Math.max(...denominations);
  
  // Base minimum stack as a function of the chipset
  let baseMinimum: number;
  
  if (biggestChip <= 10) {
    // For tiny chipsets like [1,2,5]
    baseMinimum = smallestChip * 200;  // e.g., 200 chips of the smallest denomination
  }
  else if (biggestChip <= 50) {
    // For small chipsets like [5,10,25,50]
    baseMinimum = smallestChip * 300;  // e.g., 300 chips of the smallest denomination
  }
  else if (biggestChip <= 500) {
    // For medium chipsets like [25,100,500]
    baseMinimum = smallestChip * 500;  // e.g., 500 chips of the smallest denomination
  }
  else {
    // For large chipsets like [100,500,1000,5000]
    baseMinimum = smallestChip * 1000;  // e.g., 1000 chips of the smallest denomination
  }
  
  // Adjust based on format
  switch((format || '').toLowerCase()) {
    case 'deepstack':
      baseMinimum *= 2;  // Deepstack should have at least double the normal minimum
      break;
    case 'rebuy':
    case 'turbo':
      baseMinimum *= 1.0;  // These can have slightly smaller stacks
      break;
    case 'hyper-turbo':
      baseMinimum *= 0.6;  // Even smaller stacks for hyper-turbo
      break;
  }
  
  // Return without enforcing global minimums
  return baseMinimum;
}