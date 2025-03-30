
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

export type TournamentAction =
  | { type: 'START_TOURNAMENT' }
  | { type: 'PAUSE_TOURNAMENT' }
  | { type: 'RESUME_TOURNAMENT' }
  | { type: 'STOP_TOURNAMENT' }
  | { type: 'END_TOURNAMENT' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'PREVIOUS_LEVEL' }
  | { type: 'PREV_LEVEL' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'MARK_ELIMINATED'; payload: string }
  | { type: 'ADD_REBUY'; payload: string }
  | { type: 'ADD_ADDON'; payload: string }
  | { type: 'ASSIGN_TABLES' }
  | { type: 'BALANCE_TABLES' }
  | { 
      type: 'UPDATE_CURRENT_LEVEL_DURATION'; 
      payload: { levelIndex: number; duration: number } 
    }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TournamentSettings> }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { 
      type: 'CREATE_TOURNAMENT'; 
      payload: { 
        name: string; 
        startDate: string; 
        settings?: TournamentSettings; 
      } 
    }
  | { 
      type: 'LOAD_TOURNAMENT'; 
      payload: { 
        name?: string; 
        startDate?: string; 
        settings?: TournamentSettings; 
        players?: Player[];
        chipset?: string;
        isRunning?: boolean;
        currentLevel?: number;
      } 
    }
  | { type: 'UPDATE_TOURNAMENT_NAME'; payload: string }
  | { type: 'UPDATE_TOURNAMENT_CHIPSET'; payload: string }
  | { type: 'RESET_TOURNAMENT' }
  | { type: 'GET_DEFAULT_LEVELS' };

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
  payoutStructure: {
    places: PayoutPlace[];
  };
}
