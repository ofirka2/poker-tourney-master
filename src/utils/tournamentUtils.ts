
import { supabase } from "@/integrations/supabase/client";
import { DatabaseTournament, Player, Table, TournamentSettings } from "@/types/types";
import { Tables } from "@/integrations/supabase/types";
import { mapDatabasePlayerToPlayer } from "./playerUtils";

// Calculate prize pool based on players and settings
export const calculatePrizePool = (players: Player[], settings: TournamentSettings): number => {
  const totalBuyIns = players.reduce((sum, player) => sum + (player.buy_ins || 1), 0);
  const totalRebuys = players.reduce((sum, player) => sum + (player.rebuys || 0), 0);
  const totalAddons = players.reduce((sum, player) => sum + (player.addons || 0), 0);
  
  const buyInTotal = totalBuyIns * settings.buyInAmount;
  const rebuyTotal = totalRebuys * settings.rebuyAmount;
  const addonTotal = totalAddons * settings.addOnAmount;
  
  const grossPrizePool = buyInTotal + rebuyTotal + addonTotal;
  
  // Apply house fee if configured
  let houseFee = 0;
  if (settings.houseFeeType === 'percentage') {
    houseFee = grossPrizePool * (settings.houseFeeValue || 0) / 100;
  } else if (settings.houseFeeType === 'fixed') {
    houseFee = settings.houseFeeValue || 0;
  }
  
  return Math.max(0, grossPrizePool - houseFee);
};

// Assign players to tables
export const assignPlayersToTables = (players: Player[], numTables: number, maxPlayersPerTable: number = 9): Table[] => {
  const activePlayers = players.filter(p => !p.eliminated);
  const tables: Table[] = [];
  
  // Create empty tables
  for (let i = 0; i < numTables; i++) {
    tables.push({
      id: i + 1,
      players: [],
      maxSeats: maxPlayersPerTable
    });
  }
  
  // Randomly shuffle players for assignment
  const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5);
  
  // Distribute players across tables with random seat assignment
  shuffledPlayers.forEach((player, index) => {
    const tableIndex = index % numTables;
    
    if (tables[tableIndex]) {
      // Randomly assign seat within the table
      const availableSeats = Array.from({ length: maxPlayersPerTable }, (_, i) => i + 1);
      const usedSeats = tables[tableIndex].players.map(p => p.seatNumber || 0);
      const availableSeatsFiltered = availableSeats.filter(seat => !usedSeats.includes(seat));
      
      const randomSeat = availableSeatsFiltered[Math.floor(Math.random() * availableSeatsFiltered.length)] || 1;
      
      const updatedPlayer = {
        ...player,
        tableNumber: tableIndex + 1,
        seatNumber: randomSeat
      };
      
      tables[tableIndex].players.push(updatedPlayer);
    }
  });
  
  return tables;
};

// Balance tables by moving players
export const balanceTables = (tables: Table[]): Table[] => {
  const totalPlayers = tables.reduce((sum, table) => sum + table.players.length, 0);
  const playersPerTable = Math.floor(totalPlayers / tables.length);
  const extraPlayers = totalPlayers % tables.length;
  
  const balancedTables = tables.map((table, index) => {
    const targetSize = playersPerTable + (index < extraPlayers ? 1 : 0);
    return {
      ...table,
      players: table.players.slice(0, targetSize)
    };
  });
  
  return balancedTables;
};

// Create a new tournament with user ownership
export const createTournamentWithOwnership = async (tournamentData: Partial<Tables<'tournaments'>>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create tournaments');
  }

  const tournamentWithOwnership = {
    ...tournamentData,
    user_id: user.id,
    name: tournamentData.name || 'Untitled Tournament', // Ensure name is provided
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
export const updateTournament = async (tournamentId: string, updates: Partial<Tables<'tournaments'>>) => {
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

// Get tournament players with proper typing
export const getTournamentPlayers = async (tournamentId: string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (error) {
    throw error;
  }

  return (data || []).map(mapDatabasePlayerToPlayer);
};

// Utility to safely convert JSON fields to strings
export const safeJsonToString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
};
