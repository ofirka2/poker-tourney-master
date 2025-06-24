import React, { createContext, useReducer, useContext } from 'react';
import { TournamentState, TournamentAction, TournamentSettings, Player, Table } from '@/types/types';

// Define a more complete initial state that matches the TournamentState interface
const initialTournamentState: TournamentState = {
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
  chipset: '', // This might be redundant if chipset is always in settings, but keeping for now
};

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
}>({
  state: initialTournamentState,
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
        // These properties are part of settings now, but keeping for backward compatibility if needed
        // They should ideally be accessed from state.settings
        // allowRebuy: action.payload.allowRebuy,
        // allowAddon: action.payload.allowAddon,
        // format: action.payload.format,
        // chipset: action.payload.chipset,
        // playerCount: action.payload.playerCount,
        // desiredDuration: action.payload.desiredDuration,
        // includeAnte: action.payload.includeAnte,
      };

    case 'LOAD_TOURNAMENT':
      return {
        ...state,
        id: action.payload.id || state.id,
        name: action.payload.name || state.name,
        startDate: action.payload.startDate || state.startDate,
        settings: action.payload.settings || state.settings, // New settings overwrite old
        players: action.payload.players || state.players,
        chipset: action.payload.chipset || state.chipset,
        isRunning: action.payload.isRunning ?? state.isRunning,
        currentLevel: action.payload.currentLevel ?? state.currentLevel,
        timeRemaining: action.payload.timeRemaining ?? state.timeRemaining,
        totalPrizePool: action.payload.totalPrizePool ?? state.totalPrizePool,
        eliminationCounter: action.payload.eliminationCounter ?? state.eliminationCounter,
        tables: action.payload.tables || state.tables,
        // The following properties are expected to be within settings
        // allowRebuy: action.payload.allowRebuy ?? state.settings.allowRebuy,
        // allowAddon: action.payload.allowAddon ?? state.settings.allowAddon,
        // format: action.payload.format || state.settings.format,
        // playerCount: action.payload.playerCount ?? state.settings.playerCount,
        // desiredDuration: action.payload.desiredDuration ?? state.settings.desiredDuration,
        // includeAnte: action.payload.includeAnte ?? state.settings.includeAnte,
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
      return initialTournamentState; // Reset to the defined initial state

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
    case 'PREVIOUS_LEVEL': // Keeping both for robustness, PREV_LEVEL is more common
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
      const newTime = Math.max(0, action.payload); // action.payload is the new time remaining, not a delta
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
                rebuys: (p.rebuys || 0) + 1, // Ensure p.rebuys is treated as number
                chips: (p.chips || 0) + state.settings.rebuyChips, // Ensure p.chips is number
                eliminated: false,
                eliminationPosition: undefined
              }
            : p
        ),
        totalPrizePool: state.totalPrizePool + state.settings.rebuyAmount, // Update prize pool
      };

    case 'ADD_ADDON':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? {
                ...p,
                addOns: (p.addOns || 0) + 1, // Ensure p.addOns is number
                chips: (p.chips || 0) + state.settings.addOnChips // Ensure p.chips is number
              }
            : p
        ),
        totalPrizePool: state.totalPrizePool + state.settings.addOnAmount, // Update prize pool
      };

    case 'ASSIGN_TABLES':
      const playersToAssign = state.players.filter(p => !p.eliminated);
      const playersPerTable = 9; // Standard poker table size, can be dynamic
      const numTables = Math.ceil(playersToAssign.length / playersPerTable);

      const newTables: Table[] = Array.from({ length: numTables }, (_, i) => ({
        id: i + 1,
        players: [],
        maxSeats: playersPerTable
      }));

      // Randomly shuffle players for assignment
      const shuffledPlayers = [...playersToAssign].sort(() => Math.random() - 0.5);

      // Assign players to tables
      const assignedPlayers = shuffledPlayers.map((player, index) => {
        const tableIndex = Math.floor(index / playersPerTable);
        const seatIndex = index % playersPerTable;
        if (newTables[tableIndex]) {
          newTables[tableIndex].players.push(player);
        }
        return {
          ...player,
          tableNumber: tableIndex + 1,
          seatNumber: seatIndex + 1
        };
      });

      // Update all players in state, including eliminated ones that were not assigned
      const finalPlayers = state.players.map(p => {
        const assigned = assignedPlayers.find(ap => ap.id === p.id);
        return assigned || p; // Keep original if not an active player assigned to a table
      });

      return {
        ...state,
        players: finalPlayers,
        tables: newTables
      };

    case 'BALANCE_TABLES':
      // Basic re-balancing: collect active players, re-assign seats, keep same number of tables
      const activePlayersForBalance = state.players.filter(p => !p.eliminated);
      if (activePlayersForBalance.length === 0 || state.tables.length === 0) return state;

      const currentTableCount = state.tables.length;
      const playersPerTableBalanced = Math.floor(activePlayersForBalance.length / currentTableCount);
      let extraPlayers = activePlayersForBalance.length % currentTableCount;

      const rebalancedPlayers = [...activePlayersForBalance].sort(() => Math.random() - 0.5); // Shuffle for re-assignment

      let playerIndex = 0;
      const updatedTables = Array.from({ length: currentTableCount }, (_, i) => ({
        ...state.tables[i], // Keep existing table ID, maxSeats etc.
        players: [],
      }));

      const finalBalancedPlayers = state.players.map(p => {
        if (p.eliminated) return p; // Don't touch eliminated players

        if (playerIndex < rebalancedPlayers.length) {
          const assignedPlayer = rebalancedPlayers[playerIndex];
          const tableTarget = playersPerTableBalanced + (extraPlayers > 0 ? 1 : 0);
          extraPlayers = Math.max(0, extraPlayers - 1);

          const targetTableIndex = updatedTables.findIndex(t => t.players.length < tableTarget);
          if (targetTableIndex !== -1) {
            updatedTables[targetTableIndex].players.push(assignedPlayer);
            assignedPlayer.tableNumber = updatedTables[targetTableIndex].id;
            assignedPlayer.seatNumber = updatedTables[targetTableIndex].players.length; // Assign seat sequentially
            playerIndex++;
            return assignedPlayer;
          }
        }
        return p;
      });

      return {
        ...state,
        players: finalBalancedPlayers,
        tables: updatedTables,
      };

    default:
      return state;
  }
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, initialTournamentState);

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