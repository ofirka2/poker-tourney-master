import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTournament } from "@/context/TournamentContext";
import { Player, Table } from "@/types/types";
import { toast } from "sonner";
import { Move, Users, X } from "lucide-react";

interface ManualSeatManagerProps {
  onSeatChange: (playerId: string, newTableNumber: number, newSeatNumber: number) => void;
}

const ManualSeatManager: React.FC<ManualSeatManagerProps> = ({ onSeatChange }) => {
  const { state } = useTournament();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [newTableNumber, setNewTableNumber] = useState<number>(1);
  const [newSeatNumber, setNewSeatNumber] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activePlayers = state.players.filter(p => !p.eliminated);
  const assignedPlayers = activePlayers.filter(p => p.tableNumber && p.seatNumber);
  const unassignedPlayers = activePlayers.filter(p => !p.tableNumber || !p.seatNumber);

  // Get available tables (existing tables + potential new tables)
  const existingTableNumbers = new Set(assignedPlayers.map(p => p.tableNumber!));
  const maxTableNumber = Math.max(...existingTableNumbers, 0);
  const availableTables = Array.from({ length: maxTableNumber + 2 }, (_, i) => i + 1); // +2 to allow new table

  // Get available seats for a specific table
  const getAvailableSeats = (tableNumber: number): number[] => {
    const usedSeats = new Set(
      assignedPlayers
        .filter(p => p.tableNumber === tableNumber)
        .map(p => p.seatNumber!)
    );
    
    const maxSeats = 10; // Maximum seats per table
    const availableSeats: number[] = [];
    
    for (let seat = 1; seat <= maxSeats; seat++) {
      if (!usedSeats.has(seat)) {
        availableSeats.push(seat);
      }
    }
    
    return availableSeats;
  };

  // Handle table number change
  const handleTableChange = (tableNumber: number) => {
    setNewTableNumber(tableNumber);
    // Reset seat number and find first available seat
    const availableSeats = getAvailableSeats(tableNumber);
    setNewSeatNumber(availableSeats.length > 0 ? availableSeats[0] : 1);
  };

  // Handle seat change
  const handleSeatChange = (seatNumber: number) => {
    setNewSeatNumber(seatNumber);
  };

  // Move player to new table/seat
  const handleMovePlayer = () => {
    if (!selectedPlayer) return;

    // Check if the seat is already taken
    const isSeatTaken = assignedPlayers.some(
      p => p.tableNumber === newTableNumber && 
           p.seatNumber === newSeatNumber && 
           p.id !== selectedPlayer.id
    );

    if (isSeatTaken) {
      toast.error(`Seat ${newSeatNumber} at Table ${newTableNumber} is already taken`);
      return;
    }

    onSeatChange(selectedPlayer.id, newTableNumber, newSeatNumber);
    setIsDialogOpen(false);
    setSelectedPlayer(null);
    toast.success(`Moved ${selectedPlayer.name || 'Unknown'} to Table ${newTableNumber}, Seat ${newSeatNumber}`);
  };

  // Remove player from table
  const handleRemoveFromTable = (playerId: string) => {
    onSeatChange(playerId, 0, 0); // 0,0 means unassigned
    toast.success("Player removed from table");
  };

  // Group players by table for display
  const getPlayersByTable = () => {
    const tableGroups = new Map<number, Player[]>();
    
    assignedPlayers.forEach(player => {
      const tableNum = player.tableNumber!;
      if (!tableGroups.has(tableNum)) {
        tableGroups.set(tableNum, []);
      }
      tableGroups.get(tableNum)!.push(player);
    });

    return tableGroups;
  };

  const tableGroups = getPlayersByTable();

  return (
    <div className="space-y-6">
      {/* Manual Seat Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Move className="mr-2 h-4 w-4" />
            Manual Seat Management
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move Player to Different Table/Seat</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Player Selection */}
            <div>
              <label className="text-sm font-medium">Select Player</label>
              <Select onValueChange={(playerId) => {
                const player = activePlayers.find(p => p.id === playerId);
                setSelectedPlayer(player || null);
                if (player) {
                  setNewTableNumber(player.tableNumber || 1);
                  setNewSeatNumber(player.seatNumber || 1);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent>
                  {activePlayers.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name || 'Unknown'} 
                      {player.tableNumber && player.seatNumber 
                        ? ` (Table ${player.tableNumber}, Seat ${player.seatNumber})`
                        : ' (Unassigned)'
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table Selection */}
            <div>
              <label className="text-sm font-medium">New Table</label>
              <Select value={newTableNumber.toString()} onValueChange={(value) => handleTableChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map(tableNum => (
                    <SelectItem key={tableNum} value={tableNum.toString()}>
                      Table {tableNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seat Selection */}
            <div>
              <label className="text-sm font-medium">New Seat</label>
              <Select value={newSeatNumber.toString()} onValueChange={(value) => handleSeatChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSeats(newTableNumber).map(seatNum => (
                    <SelectItem key={seatNum} value={seatNum.toString()}>
                      Seat {seatNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleMovePlayer} className="flex-1" disabled={!selectedPlayer}>
                Move Player
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Current Table Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Table Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tableGroups.size === 0 ? (
            <p className="text-muted-foreground text-center py-4">No players assigned to tables</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(tableGroups.entries()).map(([tableNumber, players]) => (
                <div key={tableNumber} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Table {tableNumber}</h4>
                    <Badge variant="secondary">{players.length} players</Badge>
                  </div>
                  <div className="space-y-2">
                    {players
                      .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0))
                      .map(player => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span>{player.name || 'Unknown'}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Seat {player.seatNumber}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromTable(player.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Players ({unassignedPlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map(player => (
                <Badge key={player.id} variant="secondary">
                  {player.name || 'Unknown'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManualSeatManager; 