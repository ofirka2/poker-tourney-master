
/**
 * Rounds a currency value to two decimal places.
 * @param amount - The amount to round.
 * @returns The rounded amount.
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Predefined payout percentage suggestions based on the number of places paid.
 * You can customize these structures. Ensure each array sums to 100.
 */
export const payoutSuggestions: Record<number, number[]> = {
  1: [100],
  2: [65, 35],
  3: [50, 30, 20],
  4: [45, 27, 18, 10],
  5: [40, 25, 15, 12, 8],
  6: [38, 24, 14, 10, 8, 6],
  7: [35, 22, 13, 10, 8, 7, 5],
  8: [34, 21, 13, 9, 8, 6, 5, 4],
  9: [33, 20, 13, 9, 7, 6, 5, 4, 3],
  10: [32, 19, 12.5, 8.5, 7, 6, 5, 4, 3.5, 2.5],
  // Add more structures for > 10 places if needed
};

/**
 * Suggests a payout structure based on the number of participants.
 * @param numParticipants - Total number of buy-ins + rebuys (or total players).
 * @returns Suggested payout structure, e.g., [{ position: 1, percentage: 50 }, ...]. Returns empty array if input is invalid.
 */
export function suggestPayoutStructure(numParticipants: number): { position: number; percentage: number }[] {
  if (numParticipants <= 1) {
    return [{ position: 1, percentage: 100 }]; // Only 1 participant gets 100%
  }
  if (numParticipants <= 0) {
    return []; // No participants, no payouts
  }

  // --- Determine Number of Places to Pay (Heuristic) ---
  // Pays ~15-20% of the field, capped, minimum 2 if possible
  let numPlacesToPay = 1;
  if (numParticipants >= 50) {
    numPlacesToPay = Math.min(10, Math.max(2, Math.ceil(numParticipants * 0.15))); // ~15%, max 10
  } else if (numParticipants >= 20) {
    numPlacesToPay = Math.min(8, Math.max(2, Math.ceil(numParticipants * 0.18))); // ~18%, max 8
  } else if (numParticipants >= 8) {
    numPlacesToPay = Math.min(5, Math.max(2, Math.ceil(numParticipants * 0.22))); // ~22%, max 5
  } else if (numParticipants >= 4) {
    numPlacesToPay = Math.max(2, Math.ceil(numParticipants * 0.30)); // ~30%, min 2
    numPlacesToPay = Math.min(numPlacesToPay, 3); // Cap at 3 for small fields
  } else if (numParticipants >= 2) {
    numPlacesToPay = 2; // Pay 2 for 2-3 players
  }
  // Ensure we don't pay more places than participants
  numPlacesToPay = Math.min(numParticipants, numPlacesToPay);

  // --- Get Suggested Percentages ---
  const suggestedPercentages = payoutSuggestions[numPlacesToPay];

  if (!suggestedPercentages) {
    console.warn(`No predefined suggestion for ${numPlacesToPay} places. Falling back.`);
    // Fallback: simple linear distribution or just pay top 3?
    // For now, return empty or a default like top 3 if available
    if (numPlacesToPay > 3 && payoutSuggestions[3]) {
      return suggestPayoutStructure(Math.min(numParticipants, 7)); // Try smaller known structure
    }
    return payoutSuggestions[1] ? [{ position: 1, percentage: 100 }] : []; // Default to 1 place if all else fails
  }

  // --- Format the Output ---
  const structure = suggestedPercentages.map((percentage, index) => ({
    position: index + 1,
    percentage: percentage,
  }));

  return structure;
}

interface PayoutData {
  totalBuyIns?: number;
  buyInAmount?: number;
  totalRebuys?: number;
  rebuyAmount?: number;
  totalAddons?: number;
  addonAmount?: number;
  houseFeeType?: 'percentage' | 'fixed' | 'none';
  houseFeeValue?: number;
  payoutPlaces: { position: number; percentage: number }[];
}

interface PayoutResult {
  isValidStructure: boolean;
  validationMessage: string;
  grossPrizePool: number;
  houseCut: number;
  netPrizePool: number;
  payoutDetails: { position: number; percentage: number; amount: number }[];
}

/**
 * Calculates prize pool details and payout amounts based on inputs.
 */
export function calculatePrizePoolAndPayouts(data: PayoutData): PayoutResult {
  const {
    totalBuyIns = 0,
    buyInAmount = 0,
    totalRebuys = 0,
    rebuyAmount = 0,
    totalAddons = 0,
    addonAmount = 0,
    houseFeeType = 'none',
    houseFeeValue = 0,
    payoutPlaces = [] // Expecting [{ position: 1, percentage: 50 }, ...]
  } = data;

  // --- Calculate Gross Prize Pool ---
  const grossPrizePool =
    (totalBuyIns * buyInAmount) +
    (totalRebuys * rebuyAmount) +
    (totalAddons * addonAmount);

  // --- Calculate House Cut ---
  let houseCut = 0;
  if (houseFeeType === 'percentage') {
    houseCut = grossPrizePool * (houseFeeValue / 100);
  } else if (houseFeeType === 'fixed') {
    houseCut = houseFeeValue;
  }
  houseCut = Math.max(0, houseCut); // Ensure house cut isn't negative

  // --- Calculate Net Prize Pool ---
  let netPrizePool = Math.max(0, grossPrizePool - houseCut); // Ensure non-negative pool

  // --- Validate Payout Structure ---
  let isValidStructure = false;
  let validationMessage = '';
  let totalPercentage = 0;

  if (!Array.isArray(payoutPlaces) || payoutPlaces.length === 0) {
    validationMessage = "Payout structure is empty or invalid.";
  } else {
    payoutPlaces.forEach(p => {
      if (typeof p.percentage === 'number') {
        totalPercentage += p.percentage;
      }
    });
    // Use a tolerance for floating point issues
    if (Math.abs(totalPercentage - 100) < 0.01) {
      isValidStructure = true;
      validationMessage = "Payout structure is valid.";
    } else {
      validationMessage = `Payout percentages sum to ${roundCurrency(totalPercentage)}%, but should sum to 100%.`;
    }
  }

  // --- Calculate Payout Amounts ---
  let payoutDetails: { position: number; percentage: number; amount: number }[] = [];
  if (isValidStructure && netPrizePool > 0) {
    payoutDetails = payoutPlaces.map(p => ({
      position: p.position,
      percentage: p.percentage,
      amount: roundCurrency(netPrizePool * (p.percentage / 100))
    }));

    // Optional: Adjust last place slightly to account for rounding errors if total payout != netPrizePool
    const totalPaid = payoutDetails.reduce((sum, p) => sum + p.amount, 0);
    const diff = roundCurrency(netPrizePool - totalPaid);
    if (Math.abs(diff) > 0.001 && payoutDetails.length > 0) { // If there's a small difference
      payoutDetails[payoutDetails.length - 1].amount = roundCurrency(payoutDetails[payoutDetails.length - 1].amount + diff);
    }
  } else if (netPrizePool <= 0 && payoutPlaces.length > 0) {
    // If structure exists but pool is zero, show structure with 0 amounts
    payoutDetails = payoutPlaces.map(p => ({
      position: p.position,
      percentage: p.percentage,
      amount: 0
    }));
  }

  // --- Return Results ---
  return {
    isValidStructure,
    validationMessage,
    grossPrizePool: roundCurrency(grossPrizePool),
    houseCut: roundCurrency(houseCut),
    netPrizePool: roundCurrency(netPrizePool),
    payoutDetails // Array of { position, percentage, amount }
  };
}
