import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTournament } from "@/context/TournamentContext";
import { Player, Table } from "@/types/types";
import { toast } from "sonner";
import { Users, Plus, X } from "lucide-react";

interface DragDropSeatManagerProps {
  onSeatChange: (playerId: string, newTableNumber: number, newSeatNumber: number) => void;
}

interface DraggedPlayer {
  player: Player;
  sourceTable: number;
  sourceSeat: number;
}

const DragDropSeatManager: React.FC<DragDropSeatManagerProps> = ({ onSeatChange }) => {
  const { state } = useTournament();
  const [draggedPlayer, setDraggedPlayer] = useState<DraggedPlayer | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<{ table: number; seat: number } | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const activePlayers = state.players.filter(p => !p.eliminated);
  const assignedPlayers = activePlayers.filter(p => p.tableNumber && p.seatNumber);
  const unassignedPlayers = activePlayers.filter(p => !p.tableNumber || !p.seatNumber);

  // Get available tables (existing tables + potential new tables)
  const existingTableNumbers = new Set(assignedPlayers.map(p => p.tableNumber!));
  const maxTableNumber = Math.max(...existingTableNumbers, 0);
  const availableTables = Array.from({ length: maxTableNumber + 2 }, (_, i) => i + 1);

  // Group players by table
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer({
      player,
      sourceTable: player.tableNumber || 0,
      sourceSeat: player.seatNumber || 0
    });
    
    // Set drag image
    if (dragRef.current) {
      e.dataTransfer.setDragImage(dragRef.current, 0, 0);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, tableNumber: number, seatNumber: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSeat({ table: tableNumber, seat: seatNumber });
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setHoveredSeat(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetTable: number, targetSeat: number) => {
    e.preventDefault();
    
    if (!draggedPlayer) return;

    // Check if target seat is occupied by another player
    const isOccupied = assignedPlayers.some(
      p => p.tableNumber === targetTable && 
           p.seatNumber === targetSeat && 
           p.id !== draggedPlayer.player.id
    );

    if (isOccupied) {
      toast.error(`Seat ${targetSeat} at Table ${targetTable} is already occupied`);
      return;
    }

    // Move the player
    onSeatChange(draggedPlayer.player.id, targetTable, targetSeat);
    
    setDraggedPlayer(null);
    setHoveredSeat(null);
    
    toast.success(`Moved ${draggedPlayer.player.name || 'Unknown'} to Table ${targetTable}, Seat ${targetSeat}`);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setHoveredSeat(null);
  };

  // Remove player from table
  const handleRemoveFromTable = (playerId: string) => {
    onSeatChange(playerId, 0, 0);
    toast.success("Player removed from table");
  };

  // Create a new table
  const handleCreateTable = () => {
    const newTableNumber = Math.max(...Array.from(tableGroups.keys()), 0) + 1;
    toast.info(`New table ${newTableNumber} created. Drag players to assign seats.`);
  };

  // Render a single seat
  const renderSeat = (tableNumber: number, seatNumber: number, player?: Player) => {
    const isHovered = hoveredSeat?.table === tableNumber && hoveredSeat?.seat === seatNumber;
    const isDragging = draggedPlayer?.player.id === player?.id;
    
    return (
      <div
        key={`${tableNumber}-${seatNumber}`}
        className={`
          relative w-20 h-20 border-2 rounded-lg flex items-center justify-center text-xs font-medium
          ${player 
            ? 'bg-primary text-primary-foreground border-primary cursor-grab active:cursor-grabbing' 
            : 'bg-muted border-dashed border-muted-foreground/30 hover:border-primary/50'
          }
          ${isHovered ? 'ring-2 ring-primary ring-opacity-50' : ''}
          ${isDragging ? 'opacity-50' : ''}
          transition-all duration-200
        `}
        draggable={!!player}
        onDragStart={(e) => player && handleDragStart(e, player)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, tableNumber, seatNumber)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, tableNumber, seatNumber)}
      >
        {player ? (
          <>
            <div className="text-center">
              <div className="font-bold">{player.name || 'Unknown'}</div>
              <div className="text-xs opacity-80">Seat {seatNumber}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromTable(player.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <div className="text-muted-foreground">Seat {seatNumber}</div>
        )}
      </div>
    );
  };

  // Render a table
  const renderTable = (tableNumber: number, players: Player[]) => {
    const maxSeats = 10;
    const seats = Array.from({ length: maxSeats }, (_, i) => i + 1);
    
    // Create a map of seat numbers to players
    const seatMap = new Map<number, Player>();
    players.forEach(player => {
      if (player.seatNumber) {
        seatMap.set(player.seatNumber, player);
      }
    });

    return (
      <Card key={tableNumber} className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Table {tableNumber}</span>
            <Badge variant="secondary">{players.length} players</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {seats.map(seatNumber => 
              renderSeat(tableNumber, seatNumber, seatMap.get(seatNumber))
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Drag & Drop Seat Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Drag players between seats and tables</p>
            <p>• Click the X button to remove players from tables</p>
            <p>• Empty seats are highlighted when you drag over them</p>
            <p>• Players can only be dropped on empty seats</p>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(tableGroups.entries()).map(([tableNumber, players]) => 
          renderTable(tableNumber, players)
        )}
        
        {/* Create New Table Button */}
        <Card className="w-full border-dashed">
          <CardContent className="flex items-center justify-center h-32">
            <Button
              variant="outline"
              onClick={handleCreateTable}
              className="flex flex-col items-center gap-2 h-full w-full"
            >
              <Plus className="h-6 w-6" />
              <span>Create New Table</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Players ({unassignedPlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {unassignedPlayers.map(player => (
                <div
                  key={player.id}
                  className="w-20 h-20 bg-primary text-primary-foreground border-2 border-primary rounded-lg flex items-center justify-center text-xs font-medium cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(e, player)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="text-center">
                    <div className="font-bold">{player.name || 'Unknown'}</div>
                    <div className="text-xs opacity-80">Unassigned</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden drag reference element */}
      <div
        ref={dragRef}
        className="fixed -top-1000 left-0 w-20 h-20 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xs font-medium pointer-events-none"
        style={{ visibility: 'hidden' }}
      >
        {draggedPlayer?.player.name || 'Unknown'}
      </div>
    </div>
  );
};

export default DragDropSeatManager; 