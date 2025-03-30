import React, { useEffect, useState } from "react";
import { useTournament } from "@/context/TournamentContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Square } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import TimerDisplay from "@/components/timer/TimerDisplay";
import { supabase } from "@/integrations/supabase/client";

const TournamentView = () => {
  const { state, dispatch } = useTournament();
  const { currentLevel, isRunning, settings, players, timeRemaining, name } = state;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("id");
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Load tournament if ID is provided and not already loaded
  useEffect(() => {
    const loadTournament = async () => {
      // If we already loaded this tournament or there's no ID, don't reload
      if (!tournamentId || tournamentId === loadedId) return;
      
      setLoading(true);
      
      try {
        // Check if supabase client is available
        if (!supabase) {
          console.warn("Supabase client not available, skipping tournament load");
          return;
        }
        
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', tournamentId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Parse blind levels from JSON if available
          const blindLevels = data.blind_levels ? JSON.parse(data.blind_levels) : null;
          
          // Create settings object from tournament data
          const settings = {
            buyInAmount: data.buy_in || 100,
            rebuyAmount: data.rebuy_amount || 100,
            addOnAmount: data.addon_amount || 100,
            initialChips: data.starting_chips || 10000,
            rebuyChips: data.starting_chips || 10000, // Using same as starting chips if not specified
            addOnChips: data.starting_chips || 10000, // Using same as starting chips if not specified
            maxRebuys: data.max_rebuys || 2,
            maxAddOns: data.max_addons || 1,
            lastRebuyLevel: data.last_rebuy_level || 6,
            lastAddOnLevel: data.last_addon_level || 6,
            // Use blind levels from JSON or default
            levels: blindLevels || state.settings.levels,
            payoutStructure: {
              places: [
                { position: 1, percentage: 50 },
                { position: 2, percentage: 30 },
                { position: 3, percentage: 20 },
              ]
            }
          };
          
          // Load tournament into context
          dispatch({ 
            type: 'LOAD_TOURNAMENT', 
            payload: {
              name: data.name,
              startDate: data.start_date,
              settings,
              chipset: data.chipset,
              players: [], // We'd load players separately if needed
              isRunning: false,
              currentLevel: 0
            }
          });
          
          // Store the loaded tournament ID to prevent re-fetching
          setLoadedId(tournamentId);
          
          toast.success(`Loaded tournament: ${data.name}`);
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
        toast.error('Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [tournamentId, loadedId]);

  useEffect(() => {
    if (isRunning && startTime) {
      const intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
      setTimerIntervalId(intervalId);
    } else if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }

    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [isRunning, startTime]);

  const startTournament = () => {
    dispatch({ type: "START_TOURNAMENT" });
    setStartTime(new Date());
    toast.success("Tournament started!");
  };

  const pauseTournament = () => {
    dispatch({ type: "PAUSE_TOURNAMENT" });
    toast.info("Tournament paused.");
  };

  const resumeTournament = () => {
    dispatch({ type: "START_TOURNAMENT" });
    setStartTime(new Date(Date.now() - elapsedTime));
    toast.success("Tournament resumed!");
  };

  const stopTournament = () => {
    dispatch({ type: "RESET_TOURNAMENT" });
    setStartTime(null);
    setElapsedTime(0);
    toast.warning("Tournament stopped.");
  };

  const goToSetup = () => {
    navigate(tournamentId ? `/setup?id=${tournamentId}` : "/setup");
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{name || "Tournament View"}</h1>
            {tournamentId && (
              <p className="text-muted-foreground text-sm">Tournament ID: {tournamentId}</p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {isRunning ? (
              <>
                <Button onClick={pauseTournament} variant="secondary">
                  <Pause className="mr-2" /> Pause
                </Button>
                <Button onClick={stopTournament} variant="destructive">
                  <Square className="mr-2" /> Stop
                </Button>
              </>
            ) : startTime ? (
              <Button onClick={resumeTournament} variant="secondary">
                <Play className="mr-2" /> Resume
              </Button>
            ) : (
              <Button onClick={startTournament}>
                <Play className="mr-2" /> Start
              </Button>
            )}
            <Button onClick={goToSetup} variant="outline">
              <SkipBack className="mr-2" />
              Setup
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Blind Structure</h2>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Level</th>
                      <th className="py-2 text-left font-medium">Blinds</th>
                      <th className="py-2 text-left font-medium">Ante</th>
                      <th className="py-2 text-right font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {settings.levels.map((level, index) => (
                      <tr key={index} className={`
                        ${level.isBreak ? 'bg-muted/30' : ''} 
                        ${index === currentLevel ? 'bg-primary/10 font-medium' : ''}
                      `}>
                        <td className="py-2">{level.level}</td>
                        <td className="py-2">
                          {level.isBreak ? 'Break' : `${level.smallBlind}/${level.bigBlind}`}
                        </td>
                        <td className="py-2">{level.isBreak ? '-' : level.ante}</td>
                        <td className="py-2 text-right">{level.duration} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-card border rounded-lg p-6 flex justify-center h-full">
              <TimerDisplay />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TournamentView;
