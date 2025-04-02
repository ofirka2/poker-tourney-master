
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import TournamentSetup from "@/components/setup/TournamentSetup";
import { useTournament } from "@/context/TournamentContext";
import { suggestPayoutStructure } from "@/utils/payoutCalculator";

const Setup = () => {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("id");
  const { dispatch, state } = useTournament();
  const [loading, setLoading] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    const loadTournament = async () => {
      if (!tournamentId || tournamentId === loadedId) return;
      
      setLoading(true);
      
      try {
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
          const blindLevels = data.blind_levels ? JSON.parse(data.blind_levels) : null;
          
          // Generate default payout structure based on expected participants
          const expectedPlayers = data.expected_players || 9;
          const defaultPayoutStructure = {
            places: suggestPayoutStructure(expectedPlayers)
          };
          
          const settings = {
            buyInAmount: data.buy_in || 100,
            rebuyAmount: data.rebuy_amount || 100,
            addOnAmount: data.addon_amount || 100,
            initialChips: data.starting_chips || 10000,
            rebuyChips: data.rebuy_chips || data.starting_chips || 10000,
            addOnChips: data.addon_chips || data.starting_chips || 10000,
            maxRebuys: data.max_rebuys || 2,
            maxAddOns: data.max_addons || 1,
            lastRebuyLevel: data.last_rebuy_level || 6,
            lastAddOnLevel: data.last_addon_level || 6,
            levels: blindLevels || state.settings.levels,
            tournamentFormat: data.tournament_format || 'standard',
            payoutStructure: data.payout_structure ? 
              JSON.parse(data.payout_structure) : defaultPayoutStructure
          };
          
          dispatch({ 
            type: 'LOAD_TOURNAMENT', 
            payload: {
              name: data.name,
              startDate: data.start_date,
              settings,
              chipset: data.chipset,
              players: [],
              isRunning: false,
              currentLevel: 0
            }
          });
          
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
  }, [tournamentId, dispatch, state.settings.levels, loadedId]);

  return (
    <Layout>
      <TournamentSetup tournamentId={tournamentId} />
    </Layout>
  );
};

export default Setup;
