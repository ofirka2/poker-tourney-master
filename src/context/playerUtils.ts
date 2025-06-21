
import { v4 as uuidv4 } from 'uuid';
import { Player } from "@/types/types";

export const generatePlayerId = () => uuidv4();

export const createEmptyPlayer = (name: string): Player => ({
  id: generatePlayerId(),
  name,
  buyIn: true,
  rebuys: 0,
  addOns: 0,
  tableNumber: null,
  seatNumber: null,
  eliminated: false,
  eliminationPosition: undefined,
  chips: 0 // Will be set based on settings when added
});
