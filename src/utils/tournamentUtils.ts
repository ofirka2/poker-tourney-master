
import { supabase } from "@/integrations/supabase/client";
import { DatabaseTournament } from "@/types/types";

// Create a new tournament with user ownership
export const createTournamentWithOwnership = async (tournamentData: Partial<DatabaseTournament>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create tournaments');
  }

  const tournamentWithOwnership = {
    ...tournamentData,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('tournaments')
    .insert(tournamentWithOwnership)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Get tournaments for the current user (respects RLS)
export const getUserTournaments = async () => {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Update tournament (only if user owns it or is admin - handled by RLS)
export const updateTournament = async (tournamentId: string, updates: Partial<DatabaseTournament>) => {
  const { data, error } = await supabase
    .from('tournaments')
    .update(updates)
    .eq('id', tournamentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Delete tournament (only if user owns it or is admin - handled by RLS)
export const deleteTournament = async (tournamentId: string) => {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId);

  if (error) {
    throw error;
  }
};

// Get tournament by ID (only if user owns it or is admin - handled by RLS)
export const getTournamentById = async (tournamentId: string) => {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Utility to safely convert JSON fields to strings
export const safeJsonToString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
};
