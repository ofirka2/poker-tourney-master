import React, { createContext, useReducer, useContext } from 'react';
import { TournamentState, TournamentAction, TournamentSettings } from '@/types/types'; 

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
}>({
  state: {
    id: '',
    isRunning: false,
    currentLevel: 0,
    timeRemaining: 0,
    name: '',
    startDate: '',
    players: [],
    tables: [],
    settings: {
      buyInAmount: 0,
      rebuyAmount: 0,
      addOnAmount: 0,
      initialChips: 0,
      rebuyChips: 0,
      addOnChips: 0,
      maxRebuys: 0,
      maxAddOns: 0,
      lastRebuyLevel: 0,
      lastAddOnLevel: 0,
      levels: [],
      payoutStructure: { places: [] },
      allowRebuy: true,
      allowAddon: true,
      includeAnte: false,
      playerCount: 9,
      chipset: "25,100,500,1000,5000",
      format: 'standard',
      desiredDuration: 4,
      houseFeeType: 'none',
      houseFeeValue: 0,
    },
    totalPrizePool: 0,
    eliminationCounter: 0,
    chipset: '',
  },
  dispatch: () => {},
});

const tournamentReducer = (state: TournamentState, action: TournamentAction): TournamentState => {
  switch (action.type) {
    case 'CREATE_TOURNAMENT':
      return {
        ...state,
        id: action.payload.id || '',
        name: action.payload.name,
        startDate: action.payload.startDate,
        settings: action.payload.settings || state.settings,
        allowRebuy: action.payload.allowRebuy,
        allowAddon: action.payload.allowAddon,
        format: action.payload.format,
        chipset: action.payload.chipset,
        playerCount: action.payload.playerCount,
        desiredDuration: action.payload.desiredDuration,
        includeAnte: action.payload.includeAnte,
      };

    case 'LOAD_TOURNAMENT':
      return {
        ...state,
        id: action.payload.id || state.id,
        name: action.payload.name || state.name,
        startDate: action.payload.startDate || state.startDate,
        settings: action.payload.settings || state.settings,
        players: action.payload.players || state.players,
        chipset: action.payload.chipset || state.chipset,
        isRunning: action.payload.isRunning ?? state.isRunning,
        currentLevel: action.payload.currentLevel ?? state.currentLevel,
        timeRemaining: action.payload.timeRemaining ?? state.timeRemaining,
        totalPrizePool: action.payload.totalPrizePool ?? state.totalPrizePool,
        eliminationCounter: action.payload.eliminationCounter ?? state.eliminationCounter,
        tables: action.payload.tables || state.tables,
        allowRebuy: action.payload.allowRebuy ?? state.allowRebuy,
        allowAddon: action.payload.allowAddon ?? state.allowAddon,
        format: action.payload.format || state.format,
        playerCount: action.payload.playerCount ?? state.playerCount,
        desiredDuration: action.payload.desiredDuration ?? state.desiredDuration,
        includeAnte: action.payload.includeAnte ?? state.includeAnte,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'UPDATE_TOURNAMENT_NAME':
      return {
        ...state,
        name: action.payload
      };

    case 'UPDATE_TOURNAMENT_CHIPSET':
      return {
        ...state,
        chipset: action.payload
      };

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

    case 'RESET_TOURNAMENT':
      return {
        id: '',
        isRunning: false,
        currentLevel: 0,
        timeRemaining: 0,
        name: '',
        startDate: '',
        players: [],
        tables: [],
        settings: {
          buyInAmount: 0,
          rebuyAmount: 0,
          addOnAmount: 0,
          initialChips: 0,
          rebuyChips: 0,
          addOnChips: 0,
          maxRebuys: 0,
          maxAddOns: 0,
          lastRebuyLevel: 0,
          lastAddOnLevel: 0,
          levels: [],
          payoutStructure: { places: [] },
          allowRebuy: true,
          allowAddon: true,
          includeAnte: false,
          playerCount: 9,
          chipset: "25,100,500,1000,5000",
          format: 'standard',
          desiredDuration: 4,
          houseFeeType: 'none',
          houseFeeValue: 0,
        },
        totalPrizePool: 0,
        eliminationCounter: 0,
        chipset: '',
      };

    case 'NEXT_LEVEL':
      if (state.currentLevel < state.settings.levels.length - 1) {
        const nextLevel = state.currentLevel + 1;
        return {
          ...state,
          currentLevel: nextLevel,
          timeRemaining: state.settings.levels[nextLevel].duration * 60
        };
      }
      return state;

    case 'PREV_LEVEL':
    case 'PREVIOUS_LEVEL':
      if (state.currentLevel > 0) {
        const prevLevel = state.currentLevel - 1;
        return {
          ...state,
          currentLevel: prevLevel,
          timeRemaining: state.settings.levels[prevLevel].duration * 60
        };
      }
      return state;

    case 'SET_TIME':
      const newTime = Math.max(0, state.timeRemaining + action.payload);
      if (newTime === 0 && state.currentLevel < state.settings.levels.length - 1) {
        // Auto-advance to next level when time reaches 0
        const nextLevel = state.currentLevel + 1;
        return {
          ...state,
          currentLevel: nextLevel,
          timeRemaining: state.settings.levels[nextLevel].duration * 60
        };
      }
      return {
        ...state,
        timeRemaining: newTime
      };

    case 'UPDATE_CURRENT_LEVEL_DURATION':
      const { levelIndex, duration } = action.payload;
      if (levelIndex >= 0 && levelIndex < state.settings.levels.length) {
        const updatedLevels = [...state.settings.levels];
        updatedLevels[levelIndex] = {
          ...updatedLevels[levelIndex],
          duration
        };
        
        return {
          ...state,
          settings: {
            ...state.settings,
            levels: updatedLevels
          },
          // Update current time remaining if we're updating the current level
          timeRemaining: levelIndex === state.currentLevel ? duration * 60 : state.timeRemaining
        };
      }
      return state;

    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload]
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload)
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };

    case 'MARK_ELIMINATED':
      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload 
            ? { ...p, eliminated: true, eliminationPosition: state.eliminationCounter + 1 }
            : p
        ),
        eliminationCounter: state.eliminationCounter + 1
      };

    case 'ADD_REBUY':
      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload 
            ? { 
                ...p, 
                rebuys: p.rebuys + 1,
                chips: (p.chips || 0) + state.settings.rebuyChips,
                eliminated: false,
                eliminationPosition: undefined
              }
            : p
        )
      };

    case 'ADD_ADDON':
      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload 
            ? { 
                ...p, 
                addOns: p.addOns + 1,
                chips: (p.chips || 0) + state.settings.addOnChips
              }
            : p
        )
      };

    case 'ASSIGN_TABLES':
      // Simple table assignment logic - you can enhance this
      const activePlayers = state.players.filter(p => !p.eliminated);
      const playersPerTable = 9; // Standard poker table size
      const numTables = Math.ceil(activePlayers.length / playersPerTable);
      
      const newTables = Array.from({ length: numTables }, (_, i) => ({
        id: i + 1,
        players: [],
        maxSeats: playersPerTable
      }));

      // Assign players to tables
      const updatedPlayers = activePlayers.map((player, index) => ({
        ...player,
        tableNumber: Math.floor(index / playersPerTable) + 1,
        seatNumber: (index % playersPerTable) + 1
      }));

      // Update table players
      updatedPlayers.forEach(player => {
        if (player.tableNumber) {
          newTables[player.tableNumber - 1].players.push(player);
        }
      });

      return {
        ...state,
        players: state.players.map(p => {
          const updatedPlayer = updatedPlayers.find(up => up.id === p.id);
          return updatedPlayer || p;
        }),
        tables: newTables
      };

    case 'BALANCE_TABLES':
      // Simple table balancing - redistribute players evenly
      const activePlayersForBalance = state.players.filter(p => !p.eliminated);
      const currentTables = state.tables.length;
      
      if (currentTables <= 1) return state;

      const playersPerTableBalance = Math.floor(activePlayersForBalance.length / currentTables);
      const extraPlayers = activePlayersForBalance.length % currentTables;

      const balancedPlayers = activePlayersForBalance.map((player, index) => {
        const tableIndex = Math.floor(index / (playersPerTableBalance + (index < extraPlayers ? 1 : 0)));
        return {
          ...player,
          tableNumber: Math.min(tableIndex + 1, currentTables),
          seatNumber: (index % 9) + 1
        };
      });

      return {
        ...state,
        players: state.players.map(p => {
          const balancedPlayer = balancedPlayers.find(bp => bp.id === p.id);
          return balancedPlayer || p;
        })
      };

    default:
      return state;
  }
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, {
    id: '',
    isRunning: false,
    currentLevel: 0,
    timeRemaining: 0,
    name: '',
    startDate: '',
    players: [],
    tables: [],
    settings: {
      buyInAmount: 0,
      rebuyAmount: 0,
      addOnAmount: 0,
      initialChips: 0,
      rebuyChips: 0,
      addOnChips: 0,
      maxRebuys: 0,
      maxAddOns: 0,
      lastRebuyLevel: 0,
      lastAddOnLevel: 0,
      levels: [],
      payoutStructure: { places: [] },
      allowRebuy: true,
      allowAddon: true,
      includeAnte: false,
      playerCount: 9,
      chipset: "25,100,500,1000,5000",
      format: 'standard',
      desiredDuration: 4,
      houseFeeType: 'none',
      houseFeeValue: 0,
    },
    totalPrizePool: 0,
    eliminationCounter: 0,
    chipset: '',
  });

  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  return useContext(TournamentContext);
};