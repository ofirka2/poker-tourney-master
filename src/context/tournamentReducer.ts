
import { TournamentState, TournamentSettings, Player } from "@/types/types";
import { TournamentAction } from "@/types/actionTypes";
import { calculatePrizePool, assignPlayersToTables, balanceTables } from "@/utils/tournamentUtils";
import { toast } from "sonner";

export function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'START_TOURNAMENT':
      return {
        ...state,
        isRunning: true
      };
      
    case 'PAUSE_TOURNAMENT':
      return {
        ...state,
        isRunning: false
      };
    
    case 'RESUME_TOURNAMENT':
      return {
        ...state,
        isRunning: true
      };
      
    case 'STOP_TOURNAMENT':
    case 'END_TOURNAMENT':
      return {
        ...state,
        isRunning: false,
        currentLevel: 0,
        timeRemaining: state.settings.levels[0].duration * 60
      };
      
    case 'NEXT_LEVEL': {
      if (state.currentLevel >= state.settings.levels.length - 1) {
        return state;
      }
      
      const nextLevel = state.currentLevel + 1;
      const levelDuration = state.settings.levels[nextLevel].duration;
      
      return {
        ...state,
        currentLevel: nextLevel,
        timeRemaining: levelDuration * 60
      };
    }
    
    case 'PREVIOUS_LEVEL':
    case 'PREV_LEVEL': {
      if (state.currentLevel <= 0) {
        return state;
      }
      
      const prevLevel = state.currentLevel - 1;
      const levelDuration = state.settings.levels[prevLevel].duration;
      
      return {
        ...state,
        currentLevel: prevLevel,
        timeRemaining: levelDuration * 60
      };
    }
    
    case 'SET_TIME':
      return {
        ...state,
        timeRemaining: action.payload
      };
      
    case 'ADD_PLAYER': {
      const newPlayers = [...state.players, action.payload];
      const totalPrizePool = calculatePrizePool(newPlayers, state.settings);
      
      return {
        ...state,
        players: newPlayers,
        totalPrizePool
      };
    }
    
    case 'REMOVE_PLAYER': {
      const newPlayers = state.players.filter(p => p.id !== action.payload);
      const totalPrizePool = calculatePrizePool(newPlayers, state.settings);
      
      return {
        ...state,
        players: newPlayers,
        totalPrizePool
      };
    }
    
    case 'MARK_ELIMINATED': {
      const eliminationCounter = state.eliminationCounter + 1;
      
      const newPlayers = state.players.map(player => 
        player.id === action.payload 
          ? { 
              ...player, 
              eliminated: true, 
              tableNumber: null, 
              seatNumber: null,
              eliminationPosition: eliminationCounter 
            } 
          : player
      );
      
      return {
        ...state,
        players: newPlayers,
        eliminationCounter
      };
    }
    
    case 'ADD_REBUY': {
      if (state.currentLevel > state.settings.lastRebuyLevel) {
        toast.error("Rebuys are no longer allowed at this level");
        return state;
      }
      
      const newPlayers = state.players.map(player => 
        player.id === action.payload 
          ? { 
              ...player, 
              rebuys: player.rebuys + 1, 
              eliminated: false,
              chips: player.chips + state.settings.rebuyChips 
            } 
          : player
      );
      
      const totalPrizePool = calculatePrizePool(newPlayers, state.settings);
      
      return {
        ...state,
        players: newPlayers,
        totalPrizePool
      };
    }
    
    case 'ADD_ADDON': {
      if (state.currentLevel > state.settings.lastAddOnLevel) {
        toast.error("Add-ons are no longer allowed at this level");
        return state;
      }
      
      const player = state.players.find(p => p.id === action.payload);
      
      if (player && player.addOns >= state.settings.maxAddOns) {
        toast.error(`Maximum ${state.settings.maxAddOns} add-ons reached`);
        return state;
      }
      
      const newPlayers = state.players.map(player => 
        player.id === action.payload 
          ? { 
              ...player, 
              addOns: player.addOns + 1,
              chips: player.chips + state.settings.addOnChips 
            } 
          : player
      );
      
      const totalPrizePool = calculatePrizePool(newPlayers, state.settings);
      
      return {
        ...state,
        players: newPlayers,
        totalPrizePool
      };
    }
    
    case 'ASSIGN_TABLES': {
      const activePlayers = state.players.filter(p => !p.eliminated);
      
      const numTables = Math.max(1, Math.ceil(activePlayers.length / 9));
      
      const newTables = assignPlayersToTables(state.players, numTables);
      
      const updatedPlayers = state.players.map(player => {
        for (const table of newTables) {
          const tablePlayer = table.players.find(p => p.id === player.id);
          if (tablePlayer) {
            return {
              ...player,
              tableNumber: tablePlayer.tableNumber,
              seatNumber: tablePlayer.seatNumber
            };
          }
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        tables: newTables
      };
    }
    
    case 'BALANCE_TABLES': {
      if (state.tables.length <= 1) {
        return state;
      }
      
      const balancedTables = balanceTables([...state.tables]);
      
      const updatedPlayers = state.players.map(player => {
        for (const table of balancedTables) {
          const tablePlayer = table.players.find(p => p.id === player.id);
          if (tablePlayer) {
            return {
              ...player,
              tableNumber: tablePlayer.tableNumber,
              seatNumber: tablePlayer.seatNumber
            };
          }
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        tables: balancedTables
      };
    }

    case 'UPDATE_CURRENT_LEVEL_DURATION': {
      const { levelIndex, duration } = action.payload;
      
      if (levelIndex < 0 || levelIndex >= state.settings.levels.length) {
        return state;
      }
      
      const updatedLevels = [...state.settings.levels];
      updatedLevels[levelIndex] = {
        ...updatedLevels[levelIndex],
        duration
      };
      
      const timeRemaining = levelIndex === state.currentLevel 
        ? duration * 60 
        : state.timeRemaining;
      
      return {
        ...state,
        settings: {
          ...state.settings,
          levels: updatedLevels
        },
        timeRemaining
      };
    }
    
    case 'UPDATE_SETTINGS': {
      const newSettings = {
        ...state.settings,
        ...action.payload
      };
      
      const totalPrizePool = calculatePrizePool(state.players, newSettings);
      
      const timeRemaining = state.currentLevel === 0 
        ? newSettings.levels[0].duration * 60 
        : state.timeRemaining;
      
      return {
        ...state,
        settings: newSettings,
        totalPrizePool,
        timeRemaining
      };
    }
    
    case 'UPDATE_PLAYER': {
      const newPlayers = state.players.map(player => 
        player.id === action.payload.id ? action.payload : player
      );
      
      return {
        ...state,
        players: newPlayers
      };
    }
    
    case 'CREATE_TOURNAMENT': {
      const { name, startDate, settings } = action.payload;
      return {
        ...state,
        name,
        startDate,
        settings: settings || state.settings,
        isRunning: false,
        currentLevel: 0,
        timeRemaining: (settings?.levels[0]?.duration || state.settings.levels[0].duration) * 60,
        players: [],
        tables: [],
        totalPrizePool: 0,
        eliminationCounter: 0
      };
    }
    
    case 'UPDATE_TOURNAMENT_NAME': {
      return {
        ...state,
        name: action.payload
      };
    }
    
    case 'UPDATE_TOURNAMENT_CHIPSET': {
      return {
        ...state,
        chipset: action.payload
      };
    }
    
    case 'LOAD_TOURNAMENT': {
      const { name, startDate, settings, players, isRunning, currentLevel, chipset } = action.payload;
      const loadedSettings = settings || state.settings;
      
      return {
        ...state,
        name: name || state.name,
        startDate: startDate || state.startDate,
        settings: loadedSettings,
        isRunning: isRunning || false,
        currentLevel: currentLevel || 0,
        timeRemaining: loadedSettings.levels[currentLevel || 0].duration * 60,
        players: players || [],
        tables: [],
        totalPrizePool: calculatePrizePool(players || [], loadedSettings),
        eliminationCounter: players?.filter(p => p.eliminated)?.length || 0,
        chipset: chipset || state.chipset
      };
    }
    
    case 'RESET_TOURNAMENT':
      return {
        ...state,
        isRunning: false,
        currentLevel: 0,
        timeRemaining: state.settings.levels[0].duration * 60,
        players: [],
        tables: [],
        totalPrizePool: 0,
        eliminationCounter: 0,
      };
      
    case 'GET_DEFAULT_LEVELS':
      return {
        ...state,
      };
      
    case 'UPDATE_PAYOUT_STRUCTURE': {
      const newSettings = {
        ...state.settings,
        payoutStructure: {
          places: action.payload
        }
      };
      
      return {
        ...state,
        settings: newSettings
      };
    }
    
    case 'UPDATE_HOUSE_FEE': {
      const newSettings = {
        ...state.settings,
        houseFeeType: action.payload.type,
        houseFeeValue: action.payload.value
      };
      
      return {
        ...state,
        settings: newSettings
      };
    }
      
    default:
      return state;
  }
}
