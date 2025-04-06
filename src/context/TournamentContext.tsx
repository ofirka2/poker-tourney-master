
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import { TournamentState } from "@/types/types";
import { TournamentAction } from "@/types/actionTypes";
import { tournamentReducer } from "./tournamentReducer";
import { initialState } from "./defaultSettings";
import { generatePlayerId, createEmptyPlayer } from "./playerUtils";

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

export { generatePlayerId, createEmptyPlayer };
