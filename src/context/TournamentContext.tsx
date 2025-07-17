import React, { createContext, useReducer, useContext } from 'react';
import { TournamentState, TournamentAction, TournamentSettings, Player, Table } from '@/types/types';
import { tournamentReducer } from './tournamentReducer';

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
};

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
}>({
  state: initialTournamentState,
  dispatch: () => {},
});

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