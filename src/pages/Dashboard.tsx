// src/pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import TimerDisplay from "@/components/timer/TimerDisplay";
import Scoreboard from "@/components/scoreboard/Scoreboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Timer as TimerIcon, Users, LayoutGrid, Settings as SettingsIcon, ChevronRight,
  Play, Clock, Trophy, ArrowRight, UserMinus, Search, X, Check,
  RefreshCw, Plus, Wallet
} from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import PlayerDashboard from "@/components/dashboard/PlayerDashboard";
import { supabase } from "@/integrations/supabase/client";
import { PayoutPlace, TournamentSettings, Player as PlayerType, Table } from "@/types/types";
import { suggestPayoutStructure } from "@/utils/payoutCalculator";
import { mapDatabasePlayerToPlayer } from "@/utils/playerUtils";

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

const Dashboard = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { state, dispatch } = useTournament();
  const {
    players,
    settings,
    currentLevel,
    isRunning,
    name: contextTournamentName,
    id: contextTournamentId
  } = state;
  const navigate = useNavigate();

  const [loadingTournament, setLoadingTournament] = useState(() => {
    if (!tournamentId) return false;
    return contextTournamentId !== tournamentId;
  });

  const [tournamentNameForDisplay, setTournamentNameForDisplay] = useState(
    contextTournamentId === tournamentId && contextTournamentName ? contextTournamentName : "Tournament Dashboard"
  );

  const loadTournamentData = useCallback(async (id: string) => {
    if (contextTournamentId === id && contextTournamentName && !loadingTournament) {
      setTournamentNameForDisplay(contextTournamentName);
      if (loadingTournament) setLoadingTournament(false);
      return;
    }

    console.log(`Dashboard: Attempting to load tournament with ID: ${id}`);
    setLoadingTournament(true);

    try {
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentError) {
        if (tournamentError.code === 'PGRST116') {
          toast.error(`Dashboard: Tournament with ID ${id} not found.`);
          dispatch({ type: 'RESET_TOURNAMENT' });
          setTournamentNameForDisplay("Tournament Not Found");
        } else {
          throw tournamentError;
        }
      } else if (tournamentData) {
        const blindLevels = tournamentData.blind_levels ? JSON.parse(String(tournamentData.blind_levels)) : [];
        let payoutStructureDb = tournamentData.payout_structure ? JSON.parse(String(tournamentData.payout_structure)) : null;
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

        if (playersError) {
          console.error("Dashboard: Error fetching players:", playersError);
          toast.error("Failed to load players for the tournament.");
        }

        const tournamentPlayers: PlayerType[] = (playersData || []).map(mapDatabasePlayerToPlayer);
        const initialTotalPrizePool = tournamentPlayers.reduce((acc, player) => {
            let playerContribution = 0;
            if (player.buyIn) playerContribution += loadedSettings.buyInAmount;
            playerContribution += player.rebuys * loadedSettings.rebuyAmount;
            playerContribution += player.addOns * loadedSettings.addOnAmount;
            return acc + playerContribution;
        }, 0);

        // Reconstruct tables from existing player assignments
        const reconstructTables = (players: PlayerType[]): Table[] => {
          const activePlayers = players.filter(p => !p.eliminated && p.tableNumber && p.seatNumber);
          
          if (activePlayers.length === 0) {
            return [];
          }

          // Group players by table number
          const tableGroups = new Map<number, PlayerType[]>();
          activePlayers.forEach(player => {
            const tableNum = player.tableNumber!;
            if (!tableGroups.has(tableNum)) {
              tableGroups.set(tableNum, []);
            }
            tableGroups.get(tableNum)!.push(player);
          });

          // Convert to Table objects
          const tables: Table[] = [];
          tableGroups.forEach((tablePlayers, tableNumber) => {
            tables.push({
              id: tableNumber,
              players: tablePlayers,
              maxSeats: Math.max(...tablePlayers.map(p => p.seatNumber || 0), 9) // Default to 9 if no seat info
            });
          });

          // Sort tables by table number
          return tables.sort((a, b) => a.id - b.id);
        };

        const existingTables = reconstructTables(tournamentPlayers);

        dispatch({
          type: 'LOAD_TOURNAMENT',
          payload: {
            id: tournamentData.id,
            name: tournamentData.name,
            startDate: tournamentData.start_date,
            settings: loadedSettings,
            chipset: tournamentData.chipset || tournamentDefaults.chipset,
            players: tournamentPlayers,
            isRunning: tournamentData.status === 'In Progress',
            currentLevel: tournamentData.current_level || 0,
            timeRemaining: tournamentData.time_remaining ?? (loadedSettings.levels[tournamentData.current_level || 0]?.duration * 60 || 0),
            totalPrizePool: initialTotalPrizePool,
            eliminationCounter: tournamentPlayers.filter(p => p.eliminated).length,
            tables: existingTables, // Use reconstructed tables instead of empty array
          }
        });
        setTournamentNameForDisplay(tournamentData.name);
      } else {
        toast.error(`Dashboard: No data for tournament ID ${id}.`);
        dispatch({ type: 'RESET_TOURNAMENT' });
        setTournamentNameForDisplay("Tournament Data Error");
      }
    } catch (err) {
      console.error('Dashboard: Error loading tournament:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`Failed to load tournament data: ${errorMessage}`);
      dispatch({ type: 'RESET_TOURNAMENT' });
      setTournamentNameForDisplay("Tournament Load Error");
    } finally {
      setLoadingTournament(false);
    }
  }, [dispatch, contextTournamentId, contextTournamentName]);

  useEffect(() => {
    if (tournamentId) {
      loadTournamentData(tournamentId);
    } else {
      if(contextTournamentId) {
          dispatch({ type: 'RESET_TOURNAMENT' });
      }
      setTournamentNameForDisplay("Tournament Dashboard");
      setLoadingTournament(false);
    }
  }, [tournamentId, loadTournamentData, dispatch, contextTournamentId]);

  const activePlayersList = players.filter(p => !p.eliminated);
  const currentLevelData = settings.levels && settings.levels.length > currentLevel ? settings.levels[currentLevel] : null;
  const averageStack = activePlayersList.length > 0
    ? Math.round(activePlayersList.reduce((sum, p) => sum + (p.chips || 0), 0) / activePlayersList.length)
    : 0;

  const handleEndTournament = () => {
    // ... (existing logic)
  };

  if (loadingTournament) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading tournament dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (tournamentId && contextTournamentId !== tournamentId && !loadingTournament) {
      return (
          <Layout>
              <div className="text-center py-10">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Tournament Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                      Could not load data for tournament ID: {tournamentId}. It might not exist or there was an error.
                  </p>
                  <Button asChild>
                      <Link to="/">Go to Homepage</Link>
                  </Button>
              </div>
          </Layout>
      );
  }

  if (!tournamentId && !loadingTournament) {
    return (
         <Layout>
              <div className="text-center py-10">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Tournament Specified</h2>
                  <p className="text-muted-foreground mb-4">
                      Please select a tournament from the homepage.
                  </p>
                  <Button asChild>
                      <Link to="/">Go to Homepage</Link>
                  </Button>
              </div>
          </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold truncate" title={tournamentNameForDisplay}>{tournamentNameForDisplay}</h1>
        {contextTournamentId === tournamentId && contextTournamentName && (
          <Badge variant="outline" className="text-sm md:text-base px-3 py-1 self-start sm:self-center">
            ID: {contextTournamentId.substring(0,8)}...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <CardTitle className="text-xl">Tournament Status</CardTitle>
              <div className="flex items-center gap-2 self-start sm:self-center">
                {isRunning ? (
                  <>
                    <Badge variant="default" className="bg-green-500 text-white">Running</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleEndTournament}
                      disabled={players.length === 0}
                    >
                      <X className="mr-1 h-4 w-4" />
                      End Tournament
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline">Not Started / Paused</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">{players.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">{activePlayersList.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">${state.totalPrizePool}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Prize Pool</div>
                  </div>
                </div>

                {currentLevelData ? (
                  <div className="bg-muted/30 p-3 sm:p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <div className="text-muted-foreground">Current Level</div>
                      <div className="font-medium">{currentLevelData.level}</div>
                    </div>
                    {!currentLevelData.isBreak && (
                      <>
                        <div className="flex justify-between">
                          <div className="text-muted-foreground">Blinds</div>
                          <div className="font-medium">
                            {currentLevelData.smallBlind}/{currentLevelData.bigBlind}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-muted-foreground">Ante</div>
                          <div className="font-medium">
                            {currentLevelData.ante > 0 ? currentLevelData.ante : "-"}
                          </div>
                        </div>
                      </>
                    )}
                     {currentLevelData.isBreak && (
                        <div className="flex justify-between">
                            <div className="text-muted-foreground">Status</div>
                            <div className="font-medium text-green-600">Break Time</div>
                        </div>
                    )}
                    <div className="flex justify-between">
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-medium">{currentLevelData.duration} min</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-muted-foreground">Avg Stack</div>
                      <div className="font-medium">{(averageStack || 0).toLocaleString()}</div>
                    </div>
                    {settings.levels && currentLevel < settings.levels.length - 1 && settings.levels[currentLevel+1] && (
                      <>
                        <Separator className="my-1"/>
                        <div className="flex items-center">
                          <ArrowRight className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Next: </span>
                          {settings.levels[currentLevel + 1].isBreak ? (
                            <span className="ml-1 text-green-600">Break</span>
                          ) : (
                            <span className="ml-1">
                              {settings.levels[currentLevel + 1].smallBlind}/
                              {settings.levels[currentLevel + 1].bigBlind}
                               {settings.levels[currentLevel + 1].ante > 0 ? ` (A: ${settings.levels[currentLevel + 1].ante})` : ""}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No levels defined for this tournament.</p>
                )}

                <div className="flex flex-col sm:flex-row mt-4 gap-3">
                  <Button asChild className="flex-1">
                    <Link to={tournamentId ? `/tournaments/${tournamentId}/timer` : "/timer"}>
                      <Clock className="mr-2 h-4 w-4" />
                      Full Timer
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={tournamentId ? `/tournaments/${tournamentId}/setup` : "/setup"}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center pt-4 lg:pt-0">
                <TimerDisplay />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Scoreboard />
        </div>
      </div>
      <div className="mt-6">
        <PlayerDashboard />
      </div>
    </Layout>
  );
};

export default Dashboard;