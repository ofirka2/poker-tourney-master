import React, { createContext, useReducer, useContext } from 'react';
import { TournamentState, TournamentAction, TournamentSettings } from '@/types/types'; 

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
}>({
  state: {
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
    },
    totalPrizePool: 0,
    eliminationCounter: 0,
    chipset: '',
  },
  dispatch: () => {},
});

const tournamentReducer = (state: TournamentState, action: TournamentAction): TournamentState => {
  switch (action.type) {
    // ... other cases
    case 'CREATE_TOURNAMENT':
      return {
        ...state,
        name: action.payload.name,
        startDate: action.payload.startDate,
        settings: action.payload.settings,
        // Add these lines to update the state with form data
        allowRebuy: action.payload.allowRebuy,
        allowAddon: action.payload.allowAddon,
        format: action.payload.format,
        chipset: action.payload.chipset,
        playerCount: action.payload.playerCount,
        desiredDuration: action.payload.desiredDuration,
      };
    // ... other cases
    default:
      return state;
  }
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, {
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