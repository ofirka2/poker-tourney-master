import React, { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { TournamentState, TournamentAction, Player, Table, TournamentSettings, PayoutPlace } from "@/types/types";

const defaultSettings: TournamentSettings = {
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

const initialState: TournamentState = {
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

function calculatePrizePool(players: Player[], settings: TournamentSettings): number {
  return players.reduce((total, player) => {
    let playerTotal = 0;
    if (player.buyIn) playerTotal += settings.buyInAmount;
    playerTotal += player.rebuys * settings.rebuyAmount;
    playerTotal += player.addOns * settings.addOnAmount;
    return total + playerTotal;
  }, 0);
}

function assignPlayersToTables(players: Player[], numTables: number): Table[] {
  const tables: Table[] = Array.from({ length: numTables }, (_, i) => ({
    id: i + 1,
    players: [],
    maxSeats: 9
  }));

  const shuffledPlayers = [...players]
    .filter(player => !player.eliminated)
    .sort(() => Math.random() - 0.5);
  
  shuffledPlayers.forEach((player, index) => {
    const tableIndex = index % numTables;
    const table = tables[tableIndex];
    
    const takenSeats = new Set(table.players.map(p => p.seatNumber));
    let seatNumber = 1;
    while (takenSeats.has(seatNumber) && seatNumber <= 9) {
      seatNumber++;
    }
    
    const updatedPlayer = { 
      ...player, 
      tableNumber: table.id, 
      seatNumber 
    };
    
    tables[tableIndex].players.push(updatedPlayer);
  });
  
  return tables;
}

function balanceTables(tables: Table[]): Table[] {
  if (tables.length <= 1) return tables;
  
  const tableCounts = tables.map(table => ({
    tableId: table.id,
    count: table.players.filter(p => !p.eliminated).length
  }));
  
  const minTable = tableCounts.reduce((min, table) => 
    table.count < min.count ? table : min, tableCounts[0]);
  
  const maxTable = tableCounts.reduce((max, table) => 
    table.count > max.count ? table : max, tableCounts[0]);
  
  if (maxTable.count - minTable.count > 1) {
    const playersToMove = Math.floor((maxTable.count - minTable.count) / 2);
    
    if (playersToMove > 0) {
      const maxTableObj = tables.find(t => t.id === maxTable.tableId);
      const minTableObj = tables.find(t => t.id === minTable.tableId);
      
      if (maxTableObj && minTableObj) {
        const playersToReassign = maxTableObj.players
          .filter(p => !p.eliminated)
          .slice(0, playersToMove);
        
        maxTableObj.players = maxTableObj.players
          .filter(p => !playersToReassign.includes(p));
        
        const takenSeats = new Set(minTableObj.players.map(p => p.seatNumber));
        
        playersToReassign.forEach(player => {
          let seat = 1;
          while (takenSeats.has(seat) && seat <= 9) {
            seat++;
          }
          takenSeats.add(seat);
          
          const updatedPlayer = {
            ...player,
            tableNumber: minTableObj.id,
            seatNumber: seat
          };
          
          minTableObj.players.push(updatedPlayer);
        });
      }
    }
  }
  
  return tables;
}

function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
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
        ...initialState,
        settings: state.settings,
        name: state.name
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

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
} | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (state.isRunning && state.timeRemaining > 0) {
      timer = setInterval(() => {
        dispatch({ type: 'SET_TIME', payload: state.timeRemaining - 1 });
      }, 1000);
    } else if (state.timeRemaining === 0 && state.isRunning) {
      dispatch({ type: 'NEXT_LEVEL' });
      toast.info(`Level ${state.currentLevel + 1} complete`);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isRunning, state.timeRemaining, state.currentLevel]);
  
  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export const generatePlayerId = () => uuidv4();

export const createEmptyPlayer = (name: string): Player => ({
  id: generatePlayerId(),
  name,
  buyIn: true,
  rebuys: 0,
  addOns: 0,
  tableNumber: null,
  seatNumber: null,
  eliminated: false,
  eliminationPosition: undefined,
  chips: 0 // Will be set based on settings when added
});
