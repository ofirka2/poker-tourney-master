
import { supabase } from "@/integrations/supabase/client";
import { DatabaseTournament, Player, Table, TournamentSettings } from "@/types/types";
import { Tables } from "@/integrations/supabase/types";
import { mapDatabasePlayerToPlayer } from "./playerUtils";
import { toast } from "sonner";

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
  
  // Separate players who are already assigned vs unassigned
  const alreadyAssignedPlayers = activePlayers.filter(p => p.tableNumber && p.seatNumber);
  const unassignedPlayers = activePlayers.filter(p => !p.tableNumber || !p.seatNumber);
  
  // First, place already assigned players in their existing positions
  alreadyAssignedPlayers.forEach(player => {
    const tableIndex = (player.tableNumber || 1) - 1;
    if (tableIndex >= 0 && tableIndex < tables.length) {
      // Ensure the name property is set correctly
      const playerWithName = {
        ...player,
        name: player.name || `${player.first_name} ${player.last_name}`.trim() || 'Unknown Player'
      };
      
      tables[tableIndex].players.push(playerWithName);
    }
  });
  
  // Randomly shuffle unassigned players for assignment
  const shuffledUnassignedPlayers = [...unassignedPlayers].sort(() => Math.random() - 0.5);
  
  // Distribute unassigned players across tables with random seat assignment
  shuffledUnassignedPlayers.forEach((player, index) => {
    const tableIndex = index % numTables;
    const table = tables[tableIndex];
    
    // Find an available seat at this table
    const usedSeats = new Set(table.players.map(p => p.seatNumber));
    let randomSeat = 1;
    while (usedSeats.has(randomSeat) && randomSeat <= maxPlayersPerTable) {
      randomSeat++;
    }
    
    // If no seat available at this table, try the next table
    if (randomSeat > maxPlayersPerTable) {
      for (let i = 0; i < numTables; i++) {
        const nextTable = tables[i];
        const nextUsedSeats = new Set(nextTable.players.map(p => p.seatNumber));
        let nextSeat = 1;
        while (nextUsedSeats.has(nextSeat) && nextSeat <= maxPlayersPerTable) {
          nextSeat++;
        }
        if (nextSeat <= maxPlayersPerTable) {
          const updatedPlayer = {
            ...player,
            tableNumber: i + 1,
            seatNumber: nextSeat,
            name: player.name || `${player.first_name} ${player.last_name}`.trim() || 'Unknown Player'
          };
          nextTable.players.push(updatedPlayer);
          break;
        }
      }
    } else {
      const updatedPlayer = {
        ...player,
        tableNumber: tableIndex + 1,
        seatNumber: randomSeat,
        name: player.name || `${player.first_name} ${player.last_name}`.trim() || 'Unknown Player'
      };
      table.players.push(updatedPlayer);
    }
  });
  
  return tables;
};

// Balance tables by moving players
export const balanceTables = (tables: Table[]): Table[] => {
  if (tables.length <= 1) {
    return tables;
  }
  
  // Collect all players from all tables
  const allPlayers = tables.flatMap(table => table.players);
  const totalPlayers = allPlayers.length;
  
  if (totalPlayers === 0) {
    return tables;
  }
  
  const playersPerTable = Math.floor(totalPlayers / tables.length);
  const extraPlayers = totalPlayers % tables.length;
  
  // Create new balanced tables
  const balancedTables: Table[] = [];
  let playerIndex = 0;
  
  for (let i = 0; i < tables.length; i++) {
    const targetSize = playersPerTable + (i < extraPlayers ? 1 : 0);
    const tablePlayers = allPlayers.slice(playerIndex, playerIndex + targetSize);
    
    balancedTables.push({
      ...tables[i],
      players: tablePlayers
    });
    
    playerIndex += targetSize;
  }
  
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

// Save table assignments to database
export const saveTableAssignmentsToDatabase = async (players: Player[], tournamentId: string): Promise<boolean> => {
  try {
    // Filter players with table assignments
    const playersWithAssignments = players.filter(player => player.tableNumber && player.seatNumber);

    if (playersWithAssignments.length === 0) {
      return true; // No assignments to save
    }

    // Update each player individually
    const updatePromises = playersWithAssignments.map(player => 
      supabase
        .from('players')
        .update({ 
          table_number: player.tableNumber,
          seat_number: player.seatNumber 
        })
        .eq('id', player.id)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      console.error('Error saving table assignments:', errors);
      toast.error('Failed to save some table assignments');
      return false;
    }

    toast.success(`Table assignments saved for ${playersWithAssignments.length} players`);
    return true;
  } catch (error) {
    console.error('Error saving table assignments:', error);
    toast.error('Failed to save table assignments');
    return false;
  }
};

// Load table assignments from database
export const loadTableAssignmentsFromDatabase = async (tournamentId: string): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('tournament_id', tournamentId)
      .not('table_number', 'is', null)
      .not('seat_number', 'is', null);

    if (error) {
      console.error('Error loading table assignments:', error);
      return [];
    }

    return (data || []).map(mapDatabasePlayerToPlayer);
  } catch (error) {
    console.error('Error loading table assignments:', error);
    return [];
  }
};

// Utility to safely convert JSON fields to strings
export const safeJsonToString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
};
