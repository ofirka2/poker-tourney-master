// src/pages/Setup.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import TournamentSetup from "@/components/setup/TournamentSetup";
import { useTournament } from "@/context/TournamentContext";
import { suggestPayoutStructure } from "@/utils/payoutCalculator";
import { PayoutPlace, TournamentSettings } from "@/types/types";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define or import your tournamentDefaults
const tournamentDefaults: TournamentSettings = {
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
  houseFeeType: 'none', // Added default
  houseFeeValue: 0,      // Added default
};


const Setup = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { dispatch, state } = useTournament();
  const [loading, setLoading] = useState(false);
  // This state helps ensure we only attempt to load a specific tournament ID once
  // or if the tournament ID from the URL changes.
  const [processedTournamentId, setProcessedTournamentId] = useState<string | null>(null);

  const loadTournamentData = useCallback(async (id: string) => {
    if (!id) {
      toast.info("No tournament ID specified in URL for setup.");
      dispatch({ type: 'RESET_TOURNAMENT' });
      setLoading(false);
      return;
    }

    // If the context is already set to this ID, and we've marked it as processed for this instance
    if (state.id === id && processedTournamentId === id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log(`Setup: Attempting to load tournament with ID: ${id}`);

    try {
      if (!supabase) {
        console.warn("Supabase client not available, skipping tournament load");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error loading tournament for Setup:', error);
        throw new Error(`Failed to load tournament: ${error.message}`);
      }

      if (data) {
        const blindLevels = data.blind_levels ? JSON.parse(data.blind_levels) : [];
        const expectedPlayers = data.no_of_players || tournamentDefaults.playerCount;

        let payoutStructureDb = data.payout_structure ? JSON.parse(data.payout_structure) : null;
        if (!payoutStructureDb || !payoutStructureDb.places || payoutStructureDb.places.length === 0) {
           payoutStructureDb = {
             places: suggestPayoutStructure(expectedPlayers) as PayoutPlace[]
           };
        }

        const loadedSettings: TournamentSettings = {
          buyInAmount: data.buy_in ?? tournamentDefaults.buyInAmount,
          rebuyAmount: data.rebuy_amount ?? tournamentDefaults.rebuyAmount,
          addOnAmount: data.addon_amount ?? tournamentDefaults.addOnAmount,
          initialChips: data.starting_chips ?? tournamentDefaults.initialChips,
          rebuyChips: data.rebuy_chips ?? data.starting_chips ?? tournamentDefaults.rebuyChips,
          addOnChips: data.addon_chips ?? data.starting_chips ?? tournamentDefaults.addOnChips,
          maxRebuys: data.max_rebuys ?? tournamentDefaults.maxRebuys,
          maxAddOns: data.max_addons ?? tournamentDefaults.maxAddOns,
          lastRebuyLevel: data.last_rebuy_level ?? tournamentDefaults.lastRebuyLevel,
          lastAddOnLevel: data.last_addon_level ?? tournamentDefaults.lastAddOnLevel,
          levels: blindLevels.length > 0 ? blindLevels : tournamentDefaults.levels,
          payoutStructure: payoutStructureDb,
          allowRebuy: data.allow_rebuy ?? tournamentDefaults.allowRebuy,
          allowAddon: data.allow_addon ?? tournamentDefaults.allowAddon,
          includeAnte: data.include_ante ?? tournamentDefaults.includeAnte,
          playerCount: data.no_of_players ?? tournamentDefaults.playerCount,
          chipset: data.chipset || tournamentDefaults.chipset,
          format: data.format || tournamentDefaults.format,
          desiredDuration: data.desired_duration ? data.desired_duration / 60 : tournamentDefaults.desiredDuration,
          houseFeeType: (data.house_fee_type as any) || tournamentDefaults.houseFeeType, // Cast if type from DB is different
          houseFeeValue: data.house_fee_value ?? tournamentDefaults.houseFeeValue,
        };

        // Fetch players associated with this tournament
        let tournamentPlayers = [];
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('tournament_id', data.id);

        if (playersError) {
          console.error('Error fetching players for setup:', playersError);
          toast.error("Failed to load players for the tournament.");
          // Decide if you want to proceed without players or show a harder error
        } else {
          tournamentPlayers = playersData || [];
        }

        dispatch({
          type: 'LOAD_TOURNAMENT',
          payload: {
            id: data.id,
            name: data.name,
            startDate: data.start_date,
            settings: loadedSettings,
            chipset: data.chipset || tournamentDefaults.chipset,
            players: tournamentPlayers, // Load fetched players
            // Reset operational state when loading for setup
            isRunning: false, 
            currentLevel: 0, 
            timeRemaining: loadedSettings.levels[0]?.duration ? loadedSettings.levels[0].duration * 60 : 0,
            // You might want to calculate totalPrizePool based on loaded players and settings here
            // or have another mechanism to update it. For now, resetting.
            totalPrizePool: 0, 
            eliminationCounter: 0,
            tables: [], // Reset tables
          }
        });
        
        setProcessedTournamentId(data.id);
        toast.success(`Loaded settings for: ${data.name}`);
      } else {
        console.warn(`Setup: No tournament found with ID: ${id}`);
        toast.error(`Tournament with ID ${id} not found.`);
        dispatch({ type: 'RESET_TOURNAMENT' });
      }
    } catch (error) {
      console.error('Error loading tournament for setup:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to load tournament data: ${errorMessage}`);
      dispatch({ type: 'RESET_TOURNAMENT' });
    } finally {
      setLoading(false);
    }
  }, [dispatch]); // Removed state.id from dependencies, will rely on processedTournamentId and direct checks

  useEffect(() => {
    if (tournamentId && tournamentId !== processedTournamentId) {
      loadTournamentData(tournamentId);
    } else if (!tournamentId) {
        // If there's no tournamentId in the URL, reset context to a clean state
        // This handles navigating to a generic /setup page without an ID
        if(state.id) { // Only reset if context has some other tournament loaded
            dispatch({ type: 'RESET_TOURNAMENT' });
            toast.info("Navigated to generic setup. Create or select a tournament.");
        }
        setProcessedTournamentId(null); // Clear processed ID
    }
  }, [tournamentId, processedTournamentId, loadTournamentData, dispatch, state.id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading tournament setup...</p>
        </div>
      </Layout>
    );
  }

  if (!tournamentId || (!state.id && !loading)) {
    return (
      <Layout>
        <div className="text-center py-10">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Tournament Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a tournament from the homepage or create a new one to configure its settings.
          </p>
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Ensure TournamentSetup is rendered only when the context ID matches the URL ID
  return (
    <Layout>
      {state.id === tournamentId ? (
        <TournamentSetup tournamentId={tournamentId} />
      ) : (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="ml-4 text-muted-foreground">Preparing setup page...</p>
        </div>
      )}
    </Layout>
  );
};

export default Setup;