
import { Player } from "@/types/types";
import { Tables } from "@/integrations/supabase/types";

// Type alias for database player row
type DatabasePlayer = Tables<'players'>;

// Convert database player to frontend Player interface
export const mapDatabasePlayerToPlayer = (dbPlayer: DatabasePlayer): Player => {
  return {
    id: dbPlayer.id,
    tournament_id: dbPlayer.tournament_id,
    first_name: dbPlayer.first_name,
    last_name: dbPlayer.last_name,
    email: dbPlayer.email || undefined,
    phone: dbPlayer.phone || undefined,
    buy_ins: dbPlayer.buy_ins,
    rebuys: dbPlayer.rebuys,
    addons: dbPlayer.addons,
    current_chips: dbPlayer.current_chips,
    status: dbPlayer.status as 'registered' | 'active' | 'eliminated',
    table_id: dbPlayer.table_id,
    seat_number: dbPlayer.seat_number,
    starting_position: dbPlayer.starting_position,
    finish_position: dbPlayer.finish_position,
    created_at: dbPlayer.created_at || undefined,
    updated_at: dbPlayer.updated_at || undefined,
    
    // Computed properties for backward compatibility
    name: `${dbPlayer.first_name} ${dbPlayer.last_name}`,
    buyIn: dbPlayer.buy_ins > 0,
    addOns: dbPlayer.addons,
    tableNumber: dbPlayer.table_id ? parseInt(dbPlayer.table_id) : null,
    seatNumber: dbPlayer.seat_number,
    eliminated: dbPlayer.status === 'eliminated',
    eliminationPosition: dbPlayer.finish_position,
    chips: dbPlayer.current_chips || 0,
  };
};

// Convert frontend Player to database format for inserts/updates - ensure required fields
export const mapPlayerToDatabase = (player: Player): Omit<DatabasePlayer, 'created_at' | 'updated_at'> => {
  const nameParts = player.name?.split(' ') || [player.first_name, player.last_name];
  const firstName = nameParts[0] || player.first_name || '';
  const lastName = nameParts.slice(1).join(' ') || player.last_name || '';

  return {
    id: player.id,
    tournament_id: player.tournament_id,
    first_name: firstName, // Ensure this is always a string
    last_name: lastName,   // Ensure this is always a string
    email: player.email || null,
    phone: player.phone || null,
    buy_ins: player.buy_ins || 1,
    rebuys: player.rebuys || 0,
    addons: player.addons || player.addOns || 0,
    current_chips: player.current_chips || player.chips || 0,
    status: player.eliminated ? 'eliminated' : (player.status || 'active'),
    table_id: player.table_id || null,
    seat_number: player.seat_number || player.seatNumber || null,
    starting_position: player.starting_position || null,
    finish_position: player.finish_position || player.eliminationPosition || null,
  };
};

// Create a new player with default values
export const createEmptyPlayer = (name: string, tournamentId: string): Player => {
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    first_name: firstName,
    last_name: lastName,
    buy_ins: 1,
    rebuys: 0,
    addons: 0,
    current_chips: 0,
    status: 'registered',
    table_id: null,
    seat_number: null,
    starting_position: null,
    finish_position: null,
    
    // Computed properties
    name: name,
    buyIn: true,
    addOns: 0,
    tableNumber: null,
    seatNumber: null,
    eliminated: false,
    chips: 0,
  };
};
