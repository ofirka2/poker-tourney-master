// Add types for the tournament state
export interface TournamentState {
  isRunning: boolean;
  currentLevel: number;
  timeRemaining: number;
  name?: string;
  startDate?: string;
  players: Player[];
  tables: Table[];
  settings: TournamentSettings;
  totalPrizePool: number;
  eliminationCounter: number;
  chipset?: string;
}

// TournamentAction type has been moved to actionTypes.ts

export interface Player {
  id: string;
  name: string;
  buyIn: boolean;
  rebuys: number;
  addOns: number;
  tableNumber: number | null;
  seatNumber: number | null;
  eliminated: boolean;
  eliminationPosition?: number;
  chips?: number;
}

export interface Table {
  id: number;
  players: Player[];
  maxSeats: number;
}

export interface TournamentLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number;
  isBreak: boolean;
}

export interface PayoutPlace {
  position: number;
  percentage: number;
}

export interface PayoutStructure {
  places: PayoutPlace[];
}

export interface TournamentSettings {
  buyInAmount: number;
  rebuyAmount: number;
  addOnAmount: number;
  initialChips: number;
  rebuyChips: number;
  addOnChips: number;
  maxRebuys: number;
  maxAddOns: number;
  lastRebuyLevel: number;
  lastAddOnLevel: number;
  levels: TournamentLevel[];
  payoutStructure: PayoutStructure;
  houseFeeType?: 'none' | 'percentage' | 'fixed';
  houseFeeValue?: number;
}
