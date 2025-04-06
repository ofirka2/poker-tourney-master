
import { Player, TournamentSettings, Table } from "@/types/types";

/**
 * Calculates the total prize pool based on player entries
 */
export function calculatePrizePool(players: Player[], settings: TournamentSettings): number {
  return players.reduce((total, player) => {
    let playerTotal = 0;
    if (player.buyIn) playerTotal += settings.buyInAmount;
    playerTotal += player.rebuys * settings.rebuyAmount;
    playerTotal += player.addOns * settings.addOnAmount;
    return total + playerTotal;
  }, 0);
}

/**
 * Assigns players to tables randomly and evenly
 */
export function assignPlayersToTables(players: Player[], numTables: number): Table[] {
  const tables: Table[] = Array.from({ length: numTables }, (_, i) => ({
    id: i + 1,
    players: [],
    maxSeats: 9
  }));

  const shuffledPlayers = [...players]
    .filter(player => !player.eliminated)
    .sort(() => Math.random() - 0.5);
  
  shuffledPlayers.forEach((player, index) => {
    const tableIndex = index % numTables;
    const table = tables[tableIndex];
    
    const takenSeats = new Set(table.players.map(p => p.seatNumber));
    let seatNumber = 1;
    while (takenSeats.has(seatNumber) && seatNumber <= 9) {
      seatNumber++;
    }
    
    const updatedPlayer = { 
      ...player, 
      tableNumber: table.id, 
      seatNumber 
    };
    
    tables[tableIndex].players.push(updatedPlayer);
  });
  
  return tables;
}

/**
 * Balances table assignments to ensure even distribution
 */
export function balanceTables(tables: Table[]): Table[] {
  if (tables.length <= 1) return tables;
  
  const tableCounts = tables.map(table => ({
    tableId: table.id,
    count: table.players.filter(p => !p.eliminated).length
  }));
  
  const minTable = tableCounts.reduce((min, table) => 
    table.count < min.count ? table : min, tableCounts[0]);
  
  const maxTable = tableCounts.reduce((max, table) => 
    table.count > max.count ? table : max, tableCounts[0]);
  
  if (maxTable.count - minTable.count > 1) {
    const playersToMove = Math.floor((maxTable.count - minTable.count) / 2);
    
    if (playersToMove > 0) {
      const maxTableObj = tables.find(t => t.id === maxTable.tableId);
      const minTableObj = tables.find(t => t.id === minTable.tableId);
      
      if (maxTableObj && minTableObj) {
        const playersToReassign = maxTableObj.players
          .filter(p => !p.eliminated)
          .slice(0, playersToMove);
        
        maxTableObj.players = maxTableObj.players
          .filter(p => !playersToReassign.includes(p));
        
        const takenSeats = new Set(minTableObj.players.map(p => p.seatNumber));
        
        playersToReassign.forEach(player => {
          let seat = 1;
          while (takenSeats.has(seat) && seat <= 9) {
            seat++;
          }
          takenSeats.add(seat);
          
          const updatedPlayer = {
            ...player,
            tableNumber: minTableObj.id,
            seatNumber: seat
          };
          
          minTableObj.players.push(updatedPlayer);
        });
      }
    }
  }
  
  return tables;
}
