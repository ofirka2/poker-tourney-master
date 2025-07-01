import { TournamentLevel, Player, TournamentSettings, Table } from "@/types/types";

// Function to round values to standard poker chip denominations
export const roundToPokerChips = (value: number, chipset: number[] = [25, 100, 500, 1000, 5000]): number => {
  if (value <= 0) return chipset[0] || 25;
  
  // Find the closest chip denomination that's not larger than the value
  const sortedChipset = [...chipset].sort((a, b) => a - b);
  
  for (let i = sortedChipset.length - 1; i >= 0; i--) {
    if (value >= sortedChipset[i]) {
      return Math.round(value / sortedChipset[i]) * sortedChipset[i];
    }
  }
  
  return sortedChipset[0];
};

// Dynamic blind structure generator
export const generateDynamicBlinds = (
  playerCount: number,
  startingStack: number,
  targetDurationMinutes: number,
  options: {
    levelDurationMinutes?: number;
    tournamentFormat?: string;
    chipset?: number[];
    anteStartLevel?: number;
    breakIntervalLevels?: number;
    blindIncreaseFactor?: number;
    rebuyAddonFactor?: number;
    includeAnte?: boolean;
  } = {}
): TournamentLevel[] => {
  const {
    levelDurationMinutes = 20,
    tournamentFormat = 'standard',
    chipset = [25, 100, 500, 1000, 5000],
    anteStartLevel = 4,
    breakIntervalLevels = 4,
    blindIncreaseFactor = 1.5,
    rebuyAddonFactor = 1.0,
    includeAnte = false
  } = options;

  const levels: TournamentLevel[] = [];
  const targetLevels = Math.floor(targetDurationMinutes / levelDurationMinutes);
  
  // Starting blinds based on chipset and stack
  let smallBlind = roundToPokerChips(startingStack * 0.005, chipset);
  let bigBlind = smallBlind * 2;
  
  for (let level = 1; level <= targetLevels; level++) {
    // Add break every X levels
    if (level > 1 && level % breakIntervalLevels === 0) {
      levels.push({
        level: level,
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
        duration: 15,
        isBreak: true
      });
    } else {
      const ante = includeAnte && level >= anteStartLevel 
        ? roundToPokerChips(bigBlind * 0.1, chipset) 
        : 0;

      levels.push({
        level: level,
        smallBlind: roundToPokerChips(smallBlind, chipset),
        bigBlind: roundToPokerChips(bigBlind, chipset),
        ante: ante,
        duration: levelDurationMinutes,
        isBreak: false
      });
      
      // Increase blinds for next level
      smallBlind = Math.round(smallBlind * blindIncreaseFactor);
      bigBlind = smallBlind * 2;
    }
  }
  
  return levels;
};

// Function to generate early game blind structure
const generateEarlyGameStructure = (includeAnte: boolean = false) => {
  return [
    { smallBlind: 25, bigBlind: 50, ante: includeAnte ? 0 : 0, duration: 20, isBreak: false },
    { smallBlind: 50, bigBlind: 100, ante: includeAnte ? 0 : 0, duration: 20, isBreak: false },
    { smallBlind: 75, bigBlind: 150, ante: includeAnte ? 0 : 0, duration: 20, isBreak: false },
    { smallBlind: 100, bigBlind: 200, ante: includeAnte ? 25 : 0, duration: 20, isBreak: false },
    { smallBlind: 150, bigBlind: 300, ante: includeAnte ? 25 : 0, duration: 20, isBreak: false },
    { smallBlind: 200, bigBlind: 400, ante: includeAnte ? 50 : 0, duration: 20, isBreak: false },
    { smallBlind: 300, bigBlind: 600, ante: includeAnte ? 75 : 0, duration: 20, isBreak: false },
    { smallBlind: 400, bigBlind: 800, ante: includeAnte ? 100 : 0, duration: 20, isBreak: false },
  ];
};

export const generateBlindStructure = (
  playerCount: number,
  desiredDuration: number,
  includeAnte: boolean = false
): TournamentLevel[] => {
  const earlyGameStructure = generateEarlyGameStructure(includeAnte);

  const levels: TournamentLevel[] = earlyGameStructure.map((level, index) => ({
    level: index + 1,
    smallBlind: level.smallBlind,
    bigBlind: level.bigBlind,
    ante: includeAnte ? level.ante || 0 : 0,
    duration: level.duration,
    isBreak: level.isBreak || false
  }));

  // Add mid-game and late-game levels
  let currentLevel = levels.length;
  
  // Mid-game: faster progression
  const midGameLevels = [
    { smallBlind: 500, bigBlind: 1000, ante: includeAnte ? 100 : 0 },
    { smallBlind: 600, bigBlind: 1200, ante: includeAnte ? 200 : 0 },
    { smallBlind: 800, bigBlind: 1600, ante: includeAnte ? 200 : 0 },
    { smallBlind: 1000, bigBlind: 2000, ante: includeAnte ? 300 : 0 },
  ];

  midGameLevels.forEach((level) => {
    currentLevel++;
    levels.push({
      level: currentLevel,
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
      ante: level.ante,
      duration: 20,
      isBreak: false
    });

    // Add break every 4 levels
    if (currentLevel % 4 === 0) {
      currentLevel++;
      levels.push({
        level: currentLevel,
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
        duration: 15,
        isBreak: true
      });
    }
  });

  // Find last break index using manual search instead of findLastIndex for compatibility
  let lastBreakIndex = -1;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (levels[i].isBreak) {
      lastBreakIndex = i;
      break;
    }
  }

  // Late game: slower progression with antes
  const lateGameLevels = [
    { smallBlind: 1200, bigBlind: 2400, ante: includeAnte ? 400 : 0 },
    { smallBlind: 1500, bigBlind: 3000, ante: includeAnte ? 500 : 0 },
    { smallBlind: 2000, bigBlind: 4000, ante: includeAnte ? 500 : 0 },
    { smallBlind: 3000, bigBlind: 6000, ante: includeAnte ? 1000 : 0 },
    { smallBlind: 4000, bigBlind: 8000, ante: includeAnte ? 1000 : 0 },
    { smallBlind: 5000, bigBlind: 10000, ante: includeAnte ? 1000 : 0 },
    { smallBlind: 6000, bigBlind: 12000, ante: includeAnte ? 2000 : 0 },
    { smallBlind: 8000, bigBlind: 16000, ante: includeAnte ? 2000 : 0 },
    { smallBlind: 10000, bigBlind: 20000, ante: includeAnte ? 3000 : 0 },
    { smallBlind: 15000, bigBlind: 30000, ante: includeAnte ? 4000 : 0 },
    { smallBlind: 20000, bigBlind: 40000, ante: includeAnte ? 5000 : 0 },
    { smallBlind: 30000, bigBlind: 60000, ante: includeAnte ? 5000 : 0 },
    { smallBlind: 40000, bigBlind: 80000, ante: includeAnte ? 10000 : 0 },
    { smallBlind: 50000, bigBlind: 100000, ante: includeAnte ? 10000 : 0 },
  ];

  lateGameLevels.forEach((level) => {
    currentLevel++;
    levels.push({
      level: currentLevel,
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
      ante: level.ante,
      duration: 20,
      isBreak: false
    });
  });
  
  // Adjust durations to fit desiredDuration
  const totalLevelsDuration = levels.reduce((sum, level) => sum + level.duration, 0);
  const durationRatio = desiredDuration * 60 / totalLevelsDuration;

  const adjustedLevels = levels.map(level => ({
    ...level,
    duration: Math.max(5, Math.round(level.duration * durationRatio)),
  }));

  return adjustedLevels;
};

// Function to generate a hyper-turbo blind structure
export const generateHyperTurboBlindStructure = (
  playerCount: number,
  desiredDuration: number,
  includeAnte: boolean = false
): TournamentLevel[] => {
  const levels: TournamentLevel[] = [];
  let currentLevel = 1;

  const structure = [
    { smallBlind: 100, bigBlind: 200, ante: includeAnte ? 0 : 0 },
    { smallBlind: 200, bigBlind: 400, ante: includeAnte ? 0 : 0 },
    { smallBlind: 300, bigBlind: 600, ante: includeAnte ? 50 : 0 },
    { smallBlind: 400, bigBlind: 800, ante: includeAnte ? 100 : 0 },
    { smallBlind: 600, bigBlind: 1200, ante: includeAnte ? 200 : 0 },
    { smallBlind: 800, bigBlind: 1600, ante: includeAnte ? 200 : 0 },
    { smallBlind: 1000, bigBlind: 2000, ante: includeAnte ? 300 : 0 },
    { smallBlind: 1500, bigBlind: 3000, ante: includeAnte ? 400 : 0 },
    { smallBlind: 2000, bigBlind: 4000, ante: includeAnte ? 500 : 0 },
    { smallBlind: 3000, bigBlind: 6000, ante: includeAnte ? 500 : 0 },
    { smallBlind: 4000, bigBlind: 8000, ante: includeAnte ? 1000 : 0 },
    { smallBlind: 6000, bigBlind: 12000, ante: includeAnte ? 2000 : 0 },
    { smallBlind: 8000, bigBlind: 16000, ante: includeAnte ? 2000 : 0 },
    { smallBlind: 10000, bigBlind: 20000, ante: includeAnte ? 3000 : 0 },
    { smallBlind: 15000, bigBlind: 30000, ante: includeAnte ? 4000 : 0 },
    { smallBlind: 20000, bigBlind: 40000, ante: includeAnte ? 5000 : 0 },
    { smallBlind: 30000, bigBlind: 60000, ante: includeAnte ? 5000 : 0 },
    { smallBlind: 40000, bigBlind: 80000, ante: includeAnte ? 10000 : 0 },
    { smallBlind: 50000, bigBlind: 100000, ante: includeAnte ? 10000 : 0 },
  ];

  structure.forEach((level) => {
    levels.push({
      level: currentLevel++,
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
      ante: level.ante,
      duration: 5, // Very short levels
      isBreak: false,
    });
  });

  // Adjust durations to fit desiredDuration
  const totalLevelsDuration = levels.reduce((sum, level) => sum + level.duration, 0);
  const durationRatio = desiredDuration * 60 / totalLevelsDuration;

  const adjustedLevels = levels.map(level => ({
    ...level,
    duration: Math.max(3, Math.round(level.duration * durationRatio)), // Even shorter minimum duration
  }));

  return adjustedLevels;
};

// Function to generate a turbo blind structure
export const generateTurboBlindStructure = (
  playerCount: number,
  desiredDuration: number,
  includeAnte: boolean = false
): TournamentLevel[] => {
  const levels: TournamentLevel[] = [];
  let currentLevel = 1;

  const structure = [
    { smallBlind: 50, bigBlind: 100, ante: includeAnte ? 0 : 0 },
    { smallBlind: 100, bigBlind: 200, ante: includeAnte ? 0 : 0 },
    { smallBlind: 150, bigBlind: 300, ante: includeAnte ? 25 : 0 },
    { smallBlind: 200, bigBlind: 400, ante: includeAnte ? 50 : 0 },
    { smallBlind: 300, bigBlind: 600, ante: includeAnte ? 75 : 0 },
    { smallBlind: 400, bigBlind: 800, ante: includeAnte ? 100 : 0 },
    { smallBlind: 600, bigBlind: 1200, ante: includeAnte ? 200 : 0 },
    { smallBlind: 800, bigBlind: 1600, ante: includeAnte ? 200 : 0 },
    { smallBlind: 1000, bigBlind: 2000, ante: includeAnte ? 300 : 0 },
    { smallBlind: 1500, bigBlind: 3000, ante: includeAnte ? 400 : 0 },
    { smallBlind: 2000, bigBlind: 4000, ante: includeAnte ? 500 : 0 },
    { smallBlind: 3000, bigBlind: 6000, ante: includeAnte ? 500 : 0 },
    { smallBlind: 4000, bigBlind: 8000, ante: includeAnte ? 1000 : 0 },
    { smallBlind: 6000, bigBlind: 12000, ante: includeAnte ? 2000 : 0 },
    { smallBlind: 8000, bigBlind: 16000, ante: includeAnte ? 2000 : 0 },
    { smallBlind: 10000, bigBlind: 20000, ante: includeAnte ? 3000 : 0 },
    { smallBlind: 15000, bigBlind: 30000, ante: includeAnte ? 4000 : 0 },
    { smallBlind: 20000, bigBlind: 40000, ante: includeAnte ? 5000 : 0 },
    { smallBlind: 30000, bigBlind: 60000, ante: includeAnte ? 5000 : 0 },
    { smallBlind: 40000, bigBlind: 80000, ante: includeAnte ? 10000 : 0 },
    { smallBlind: 50000, bigBlind: 100000, ante: includeAnte ? 10000 : 0 },
  ];

  structure.forEach((level) => {
    levels.push({
      level: currentLevel++,
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
      ante: level.ante,
      duration: 10, // Shorter levels
      isBreak: false,
    });
  });

  // Adjust durations to fit desiredDuration
  const totalLevelsDuration = levels.reduce((sum, level) => sum + level.duration, 0);
  const durationRatio = desiredDuration * 60 / totalLevelsDuration;

  const adjustedLevels = levels.map(level => ({
    ...level,
    duration: Math.max(5, Math.round(level.duration * durationRatio)), // Ensure a minimum duration
  }));

  return adjustedLevels;
};
