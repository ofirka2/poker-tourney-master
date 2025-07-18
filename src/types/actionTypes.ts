
import { Player, TournamentSettings, PayoutPlace, Table } from './types';

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
  | { type: 'ASSIGN_TABLES'; payload?: { maxPlayersPerTable: number } }
  | { type: 'BALANCE_TABLES' }
  | { type: 'MANUAL_SEAT_CHANGE'; payload: { playerId: string; tableNumber: number; seatNumber: number } }
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
