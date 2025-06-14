// src/pages/TournamentView.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTournament } from "@/context/TournamentContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Settings as SettingsIcon, Trophy, LayoutGrid } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import TimerDisplay from "@/components/timer/TimerDisplay";
import { supabase } from "@/integrations/supabase/client";
import { PayoutPlace, TournamentSettings, Player as PlayerType } from "@/types/types";
import { suggestPayoutStructure } from "@/utils/payoutCalculator";

const tournamentDefaults: Partial<TournamentSettings> = {
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
};

const TournamentView = () => {
  const { state, dispatch } = useTournament();
  const {
    currentLevel,
    isRunning,
    settings,
    players,
    timeRemaining,
    name: contextTournamentName,
    id: contextTournamentId
  } = state;
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();

  const [loading, setLoading] = useState(false);
  const [tournamentNameForDisplay, setTournamentNameForDisplay] = useState(state.name || "Tournament View");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadTournamentData = useCallback(async (id: string) => {
    if (!id) {
      toast.error("No Tournament ID provided for view.");
      dispatch({ type: 'RESET_TOURNAMENT' });
      setTournamentNameForDisplay("Tournament View");
      setLoading(false);
      return;
    }
    if (state.id === id && state.name) {
      setTournamentNameForDisplay(state.name);
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log(`TournamentView: Attempting to load tournament with ID: ${id}`);
    try {
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();
      if (tournamentError) throw tournamentError;

      if (tournamentData) {
        const blindLevels = tournamentData.blind_levels ? JSON.parse(tournamentData.blind_levels) : [];
        let payoutStructureDb = tournamentData.payout_structure ? JSON.parse(tournamentData.payout_structure) : null;
        if (!payoutStructureDb || !payoutStructureDb.places || payoutStructureDb.places.length === 0) {
          const expectedPlayers = tournamentData.no_of_players || tournamentDefaults.playerCount!;
          payoutStructureDb = {
            places: suggestPayoutStructure(expectedPlayers) as PayoutPlace[]
          };
        }
        const loadedSettings: TournamentSettings = {
          buyInAmount: tournamentData.buy_in ?? tournamentDefaults.buyInAmount!,
          rebuyAmount: tournamentData.rebuy_amount ?? tournamentDefaults.rebuyAmount!,
          addOnAmount: tournamentData.addon_amount ?? tournamentDefaults.addOnAmount!,
          initialChips: tournamentData.starting_chips ?? tournamentDefaults.initialChips!,
          rebuyChips: tournamentData.rebuy_chips ?? tournamentData.starting_chips ?? tournamentDefaults.rebuyChips!,
          addOnChips: tournamentData.addon_chips ?? tournamentData.starting_chips ?? tournamentDefaults.addOnChips!,
          maxRebuys: tournamentData.max_rebuys ?? tournamentDefaults.maxRebuys!,
          maxAddOns: tournamentData.max_addons ?? tournamentDefaults.maxAddOns!,
          lastRebuyLevel: tournamentData.last_rebuy_level ?? tournamentDefaults.lastRebuyLevel!,
          lastAddOnLevel: tournamentData.last_addon_level ?? tournamentDefaults.lastAddOnLevel!,
          levels: blindLevels.length > 0 ? blindLevels : tournamentDefaults.levels!,
          payoutStructure: payoutStructureDb,
          allowRebuy: tournamentData.allow_rebuy ?? tournamentDefaults.allowRebuy!,
          allowAddon: tournamentData.allow_addon ?? tournamentDefaults.allowAddon!,
          includeAnte: tournamentData.include_ante ?? tournamentDefaults.includeAnte!,
          playerCount: tournamentData.no_of_players ?? tournamentDefaults.playerCount!,
          chipset: tournamentData.chipset || tournamentDefaults.chipset!,
          format: tournamentData.format || tournamentDefaults.format!,
          desiredDuration: tournamentData.desired_duration ? tournamentData.desired_duration / 60 : tournamentDefaults.desiredDuration!,
          houseFeeType: (tournamentData.house_fee_type as any) || tournamentDefaults.houseFeeType!,
          houseFeeValue: tournamentData.house_fee_value ?? tournamentDefaults.houseFeeValue!,
        };
        
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('tournament_id', tournamentData.id);
        if (playersError) console.error("TournamentView: Error fetching players:", playersError);
        
        const tournamentPlayers: PlayerType[] = playersData || [];
        const initialTotalPrizePool = tournamentPlayers.reduce((acc, player) => {
            let playerContribution = 0;
            if (player.buyIn) playerContribution += loadedSettings.buyInAmount;
            playerContribution += player.rebuys * loadedSettings.rebuyAmount;
            playerContribution += player.addOns * loadedSettings.addOnAmount;
            return acc + playerContribution;
        }, 0);

        dispatch({
          type: 'LOAD_TOURNAMENT',
          payload: {
            id: tournamentData.id,
            name: tournamentData.name,
            startDate: tournamentData.start_date,
            settings: loadedSettings,
            chipset: tournamentData.chipset || '',
            players: tournamentPlayers,
            isRunning: tournamentData.status === 'In Progress', // Example status handling
            currentLevel: tournamentData.current_level || 0,   // Example status handling
            timeRemaining: tournamentData.time_remaining ?? (loadedSettings.levels[tournamentData.current_level || 0]?.duration * 60 || 0),
            totalPrizePool: initialTotalPrizePool,
            eliminationCounter: tournamentPlayers.filter(p => p.eliminated).length,
            tables: [], // Load tables if needed for this view
          }
        });
        setTournamentNameForDisplay(tournamentData.name);
        toast.success(`Loaded tournament: ${tournamentData.name}`);
      } else {
        toast.error(`TournamentView: Tournament with ID ${id} not found.`);
        dispatch({ type: 'RESET_TOURNAMENT' });
        setTournamentNameForDisplay("Tournament View");
      }
    } catch (error) {
      console.error('TournamentView: Error loading tournament:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to load tournament data: ${errorMessage}`);
      dispatch({ type: 'RESET_TOURNAMENT' });
      setTournamentNameForDisplay("Tournament View");
    } finally {
      setLoading(false);
    }
  }, [dispatch, state.id, state.name]);

  useEffect(() => {
    if (tournamentId) {
      loadTournamentData(tournamentId);
    } else {
      if(state.id) dispatch({ type: 'RESET_TOURNAMENT' });
      setTournamentNameForDisplay("Tournament View");
    }
  }, [tournamentId, loadTournamentData, dispatch, state.id]);

  useEffect(() => {
    if (isRunning && settings.levels.length > 0 && currentLevel < settings.levels.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        dispatch({ type: 'SET_TIME', payload: -1 });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentLevel, settings.levels, dispatch, timeRemaining]); // Added timeRemaining

  const handleStartPause = () => {
    if (isRunning) {
      dispatch({ type: 'PAUSE_TOURNAMENT' });
      toast.info("Tournament paused.");
    } else {
      if (players.length === 0) {
        toast.error("Cannot start: No players added.");
        return;
      }
      if (settings.levels.length === 0) {
        toast.error("Cannot start: Blind structure not defined.");
        return;
      }
      dispatch({ type: 'START_TOURNAMENT' });
      toast.success("Tournament started!");
    }
  };

  const handleStopTournament = () => {
    dispatch({ type: 'RESET_TOURNAMENT' });
    toast.warning("Tournament stopped and reset.");
    navigate('/');
  };

  const goToSetup = () => navigate(tournamentId ? `/tournaments/${tournamentId}/setup` : "/setup");
  const goToDashboard = () => navigate(tournamentId ? `/tournaments/${tournamentId}/dashboard` : "/");

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading tournament...</p>
        </div>
      </Layout>
    );
  }

  if (!contextTournamentId && !loading) {
    return (
      <Layout>
        <div className="text-center py-10">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tournament Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The tournament you are looking for does not exist or could not be loaded.
          </p>
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const currentLevelData = settings.levels[currentLevel];

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold truncate" title={tournamentNameForDisplay}>{tournamentNameForDisplay}</h1>
            {tournamentId && (
              <p className="text-muted-foreground text-sm">ID: {tournamentId.substring(0,8)}...</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleStartPause} variant={isRunning ? "secondary" : "default"} size="sm">
              {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isRunning ? "Pause" : (timeRemaining === 0 && currentLevel >= 0 && settings.levels[currentLevel]?.duration * 60 !== timeRemaining ? "Resume" : "Start")}
            </Button>
            <Button onClick={handleStopTournament} variant="destructive" size="sm">
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
            <Button onClick={goToDashboard} variant="outline" size="sm">
              <LayoutGrid className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button onClick={goToSetup} variant="outline" size="sm">
              <SettingsIcon className="mr-2 h-4 w-4" /> Setup
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-card border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Blind Structure</h2>
              {settings.levels && settings.levels.length > 0 ? (
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 text-xs sm:text-sm">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b">
                        <th className="py-2 px-1 text-left font-medium">Lvl</th>
                        <th className="py-2 px-1 text-left font-medium">Blinds</th>
                        <th className="py-2 px-1 text-left font-medium">Ante</th>
                        <th className="py-2 px-1 text-right font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {settings.levels.map((level, index) => (
                        <tr key={index} className={`
                          ${level.isBreak ? 'bg-muted/20 opacity-80' : ''} 
                          ${index === currentLevel ? 'bg-primary/10 font-semibold text-primary' : ''}
                          hover:bg-muted/50 transition-colors
                        `}>
                          <td className="py-1.5 px-1">{level.level}</td>
                          <td className="py-1.5 px-1">
                            {level.isBreak ? 'BREAK' : `${level.smallBlind}/${level.bigBlind}`}
                          </td>
                          <td className="py-1.5 px-1">{level.isBreak ? '-' : (level.ante > 0 ? level.ante : '-')}</td>
                          <td className="py-1.5 px-1 text-right">{level.duration} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center">No blind levels defined.</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-card border rounded-lg p-2 sm:p-4 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:h-full">
              {currentLevelData ? (
                 <TimerDisplay fullscreen={true} showDurationEditor={false} />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg mb-2">Blind structure not available.</p>
                  <p className="mb-4">Please configure the levels in the Setup page.</p>
                  <Button onClick={goToSetup} variant="outline">
                    Go to Setup
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TournamentView;