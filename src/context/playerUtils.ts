
import { v4 as uuidv4 } from 'uuid';
import { Player } from "@/types/types";

export const generatePlayerId = () => uuidv4();

export const createEmptyPlayer = (name: string, tournamentId: string = ''): Player => {
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: generatePlayerId(),
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
    
    // Computed properties for backward compatibility
    name,
    buyIn: true,
    addOns: 0,
    tableNumber: null,
    seatNumber: null,
    eliminated: false,
    eliminationPosition: undefined,
    chips: 0
  };
};
