<<<<<<< HEAD
import React, { createContext, useReducer, useContext } from 'react';
import { TournamentState, TournamentAction, TournamentSettings } from '@/types/types'; 
=======

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { TournamentState } from "@/types/types";
import { TournamentAction } from "@/types/actionTypes";
import { tournamentReducer } from "./tournamentReducer";
import { initialState } from "./defaultSettings";
import { generatePlayerId, createEmptyPlayer } from "./playerUtils";
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
<<<<<<< HEAD
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

=======
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
  
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
<<<<<<< HEAD
  return useContext(TournamentContext);
};
=======
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export { generatePlayerId, createEmptyPlayer };
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
