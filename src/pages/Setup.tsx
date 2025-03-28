
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import TournamentSetup from "@/components/setup/TournamentSetup";
import { useTournament } from "@/context/TournamentContext";

const Setup = () => {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("id");
  const { dispatch } = useTournament();

  useEffect(() => {
    const loadTournament = async () => {
      if (!tournamentId) return;
      
      try {
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
            levels: blindLevels || dispatch({ type: 'GET_DEFAULT_LEVELS' }).levels,
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
              players: [], // We'd load players separately if needed
              isRunning: false,
              currentLevel: 0
            }
          });
          
          toast.success(`Loaded tournament: ${data.name}`);
        }
      } catch (error) {
        console.error('Error loading tournament:', error);
        toast.error('Failed to load tournament data');
      }
    };

    loadTournament();
  }, [tournamentId, dispatch]);

  return (
    <Layout>
      <TournamentSetup tournamentId={tournamentId} />
    </Layout>
  );
};

export default Setup;
