
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
  chips: number;
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
  duration: number; // in minutes
  isBreak: boolean;
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
  payoutStructure: PayoutStructure;
  levels: TournamentLevel[];
}

export interface PayoutStructure {
  places: PayoutPlace[];
}

export interface PayoutPlace {
  position: number;
  percentage: number;
}

export interface TournamentState {
  name?: string;
  startDate?: string;
  isRunning: boolean;
  currentLevel: number;
  timeRemaining: number; // in seconds
  players: Player[];
  tables: Table[];
  settings: TournamentSettings;
  totalPrizePool: number;
  eliminationCounter: number;
}

export type TournamentAction = 
  | { type: 'START_TOURNAMENT' }
  | { type: 'PAUSE_TOURNAMENT' }
  | { type: 'RESUME_TOURNAMENT' }
  | { type: 'STOP_TOURNAMENT' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'PREVIOUS_LEVEL' }
  | { type: 'PREV_LEVEL' }
  | { type: 'END_TOURNAMENT' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'MARK_ELIMINATED'; payload: string }
  | { type: 'ADD_REBUY'; payload: string }
  | { type: 'ADD_ADDON'; payload: string }
  | { type: 'ASSIGN_TABLES'; payload?: void }
  | { type: 'BALANCE_TABLES'; payload?: void }
  | { type: 'UPDATE_CURRENT_LEVEL_DURATION'; payload: { levelIndex: number, duration: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TournamentSettings> }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'RESET_TOURNAMENT' }
  | { type: 'CREATE_TOURNAMENT'; payload: any }
  | { type: 'LOAD_TOURNAMENT'; payload: any };
