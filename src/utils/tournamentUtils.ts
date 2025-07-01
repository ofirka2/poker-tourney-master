
import { supabase } from '@/integrations/supabase/client';
import { TournamentSettings } from '@/types/types';

// Helper function to create tournament with user ownership
export const createTournamentWithOwnership = async (
  name: string,
  startDate: string,
  settings: TournamentSettings,
  userId: string
) => {
  const tournamentData = {
    name,
    start_date: startDate,
    user_id: userId,
    buy_in: settings.buyInAmount,
    rebuy_amount: settings.rebuyAmount,
    addon_amount: settings.addOnAmount,
    starting_chips: settings.initialChips,
    rebuy_chips: settings.rebuyChips,
    addon_chips: settings.addOnChips,
    max_rebuys: settings.maxRebuys,
    max_addons: settings.maxAddOns,
    last_rebuy_level: settings.lastRebuyLevel,
    last_addon_level: settings.lastAddOnLevel,
    allow_rebuy: settings.allowRebuy,
    allow_addon: settings.allowAddon,
    include_ante: settings.includeAnte,
    no_of_players: settings.playerCount,
    chipset: settings.chipset,
    format: settings.format,
    desired_duration: settings.desiredDuration * 60, // Convert to minutes
    blind_levels: JSON.stringify(settings.levels),
    payout_structure: JSON.stringify(settings.payoutStructure),
    house_fee_type: settings.houseFeeType || 'none',
    house_fee_value: settings.houseFeeValue || 0,
    status: 'created'
  };

  const { data, error } = await supabase
    .from('tournaments')
    .insert([tournamentData])
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }

  return data;
};

// Helper function to check if user can access tournament
export const canAccessTournament = async (tournamentId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role === 'admin') {
      return true;
    }

    // Check if user owns the tournament
    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('user_id')
      .eq('id', tournamentId)
      .single();

    return tournamentData?.user_id === userId;
  } catch (error) {
    console.error('Error checking tournament access:', error);
    return false;
  }
};
