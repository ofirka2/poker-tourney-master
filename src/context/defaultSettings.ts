
import { TournamentSettings } from "@/types/types";

// Parse environment variables with appropriate defaults
const getEnvInt = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvFloat = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseFloat(value) : defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Get values from environment variables
const DEFAULT_PLAYER_COUNT = getEnvInt('VITE_DEFAULT_PLAYER_COUNT', 9);
const DEFAULT_TOURNAMENT_DURATION = getEnvFloat('VITE_DEFAULT_TOURNAMENT_DURATION', 4);
const DEFAULT_BUY_IN_AMOUNT = getEnvInt('VITE_DEFAULT_BUY_IN_AMOUNT', 100);
const DEFAULT_ALLOW_REBUY = getEnvBool('VITE_DEFAULT_ALLOW_REBUY', true);
const DEFAULT_ALLOW_ADDON = getEnvBool('VITE_DEFAULT_ALLOW_ADDON', true);

export const defaultSettings: TournamentSettings = {
  buyInAmount: DEFAULT_BUY_IN_AMOUNT,
  rebuyAmount: DEFAULT_BUY_IN_AMOUNT,
  addOnAmount: DEFAULT_BUY_IN_AMOUNT,
  initialChips: 10000,
  rebuyChips: 10000,
  addOnChips: 10000,
  maxRebuys: DEFAULT_ALLOW_REBUY ? 2 : 0,
  maxAddOns: DEFAULT_ALLOW_ADDON ? 1 : 0,
  lastRebuyLevel: 6,
  lastAddOnLevel: 6,
  houseFeeType: 'none',
  houseFeeValue: 0,
  payoutStructure: {
    places: [
      { position: 1, percentage: 50 },
      { position: 2, percentage: 30 },
      { position: 3, percentage: 20 },
    ]
  },
  levels: [
    { level: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 20, isBreak: false },
    { level: 2, smallBlind: 50, bigBlind: 100, ante: 0, duration: 20, isBreak: false },
    { level: 3, smallBlind: 75, bigBlind: 150, ante: 0, duration: 20, isBreak: false },
    { level: 4, smallBlind: 100, bigBlind: 200, ante: 25, duration: 20, isBreak: false },
    { level: 5, smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true },
    { level: 6, smallBlind: 150, bigBlind: 300, ante: 25, duration: 20, isBreak: false },
    { level: 7, smallBlind: 200, bigBlind: 400, ante: 50, duration: 20, isBreak: false },
    { level: 8, smallBlind: 300, bigBlind: 600, ante: 75, duration: 20, isBreak: false },
    { level: 9, smallBlind: 400, bigBlind: 800, ante: 100, duration: 20, isBreak: false },
    { level: 10, smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true },
    { level: 11, smallBlind: 500, bigBlind: 1000, ante: 100, duration: 20, isBreak: false },
    { level: 12, smallBlind: 600, bigBlind: 1200, ante: 200, duration: 20, isBreak: false },
    { level: 13, smallBlind: 800, bigBlind: 1600, ante: 200, duration: 20, isBreak: false },
    { level: 14, smallBlind: 1000, bigBlind: 2000, ante: 300, duration: 20, isBreak: false },
    { level: 15, smallBlind: 0, bigBlind: 0, ante: 0, duration: 15, isBreak: true },
  ]
};

export const initialState = {
  isRunning: false,
  currentLevel: 0,
  timeRemaining: defaultSettings.levels[0].duration * 60,
  players: [],
  tables: [],
  settings: defaultSettings,
  totalPrizePool: 0,
  eliminationCounter: 0,
  name: "New Tournament",
  chipset: "25,100,500,1000,5000"
};

// Export the environment variables for use in other files
export const envDefaults = {
  playerCount: DEFAULT_PLAYER_COUNT,
  tournamentDuration: DEFAULT_TOURNAMENT_DURATION,
  buyInAmount: DEFAULT_BUY_IN_AMOUNT,
  allowRebuy: DEFAULT_ALLOW_REBUY,
  allowAddon: DEFAULT_ALLOW_ADDON
};
