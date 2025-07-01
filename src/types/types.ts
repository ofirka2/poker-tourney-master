
// src/types/types.ts (Example - adjust path as needed)

export interface TournamentState {
 id?: string;
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
 allowRebuy?: boolean;
 allowAddon?: boolean;
 format?: string;
 playerCount?: number;
 desiredDuration?: number;
 includeAnte?: boolean;
 // Add the missing properties that are being accessed
 buyInAmount?: number;
 rebuyAmount?: number;
 addOnAmount?: number;
 maxAddOns?: number;
 lastRebuyLevel?: number;
 lastAddOnLevel?: number;
 payoutStructure?: PayoutStructure;
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
       id?: string;
       name: string; 
       startDate: string; 
       settings?: TournamentSettings; 
       allowRebuy: boolean;
       allowAddon: boolean;
       format: string;
       chipset: string;
       playerCount: number;
       desiredDuration: number;
       includeAnte: boolean;
     } 
   }
 | { 
     type: 'LOAD_TOURNAMENT'; 
     payload: { 
       id?: string;
       name?: string; 
       startDate?: string; 
       settings?: TournamentSettings; 
       players?: Player[];
       chipset?: string;
       isRunning?: boolean;
       currentLevel?: number;
       timeRemaining?: number;
       totalPrizePool?: number;
       eliminationCounter?: number;
       tables?: Table[];
       allowRebuy?: boolean;
       allowAddon?: boolean;
       format?: string;
       playerCount?: number;
       desiredDuration?: number;
       includeAnte?: boolean;
     } 
   }
 | { type: 'UPDATE_TOURNAMENT_NAME'; payload: string }
 | { type: 'UPDATE_TOURNAMENT_CHIPSET'; payload: string }
 | { type: 'RESET_TOURNAMENT' }
 | { type: 'GET_DEFAULT_LEVELS' }
 | { type: 'UPDATE_PAYOUT_STRUCTURE'; payload: PayoutPlace[] }
 | { 
     type: 'UPDATE_HOUSE_FEE'; 
     payload: { 
       type: 'none' | 'percentage' | 'fixed'; 
       value: number 
     } 
   };

// Updated Player interface to match database schema
export interface Player {
 id: string;
 tournament_id: string;
 first_name: string;
 last_name: string;
 email?: string;
 phone?: string;
 buy_ins: number;
 rebuys: number;
 addons: number;
 current_chips: number | null;
 status: 'registered' | 'active' | 'eliminated';
 table_id?: string | null;
 seat_number?: number | null;
 starting_position?: number | null;
 finish_position?: number | null;
 created_at?: string;
 updated_at?: string;
 
 // Computed properties for backward compatibility
 name?: string;
 buyIn?: boolean;
 addOns?: number;
 tableNumber?: number | null;
 seatNumber?: number | null;
 eliminated?: boolean;
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
 ante?: number;
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
 allowRebuy: boolean;
 allowAddon: boolean;
 includeAnte: boolean;
 playerCount: number;
 chipset: string;
 format: string;
 desiredDuration: number;
 // Add the missing smallBlind property
 smallBlind?: number;
}
