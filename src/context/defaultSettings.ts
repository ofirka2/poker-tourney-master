
import { TournamentSettings } from "@/types/types";

export const defaultSettings: TournamentSettings = {
  buyInAmount: 100,
  rebuyAmount: 100,
  addOnAmount: 100,
  initialChips: 10000,
  rebuyChips: 10000,
  addOnChips: 10000,
  maxRebuys: 2,
  maxAddOns: 1,
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
