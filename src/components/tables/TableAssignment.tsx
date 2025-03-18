
import React, { useState } from "react";
import { 
  Shuffle, Users, LayoutGrid, ArrowDownUp, 
  Undo, RefreshCw, UserMinus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { Table as TableType, Player } from "@/types/types";

export const TableAssignment: React.FC = () => {
  const { state, dispatch } = useTournament();
  const [showEliminatedPlayers, setShowEliminatedPlayers] = useState(false);
  
  const { players, tables } = state;
  const activePlayers = players.filter(p => !p.eliminated);
  const eliminatedPlayers = players.filter(p => p.eliminated);
  
  // Handle randomizing table assignments
  const handleAssignTables = () => {
    dispatch({ type: 'ASSIGN_TABLES' });
    toast.success("Players assigned to tables");
  };
  
  // Handle balancing tables
  const handleBalanceTables = () => {
    dispatch({ type: 'BALANCE_TABLES' });
    toast.success("Tables balanced");
  };
  
  // Handle eliminating a player
  const handleEliminatePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'MARK_ELIMINATED', payload: id });
    toast.info(`Player ${player.name} eliminated`);
  };
  
  // Create table component
  const TableComponent: React.FC<{ table: TableType }> = ({ table }) => {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-poker-felt text-white p-4">
          <CardTitle className="text-xl font-bold">Table {table.id}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {table.players.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No players assigned
            </div>
          ) : (
            <div className="space-y-3">
              {table.players
                .filter(p => !p.eliminated || showEliminatedPlayers)
                .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0))
                .map(player => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      player.eliminated ? "bg-red-50 text-red-800" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                        {player.seatNumber}
                      </div>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {player.chips.toLocaleString()}
                      </span>
                      
                      {!player.eliminated && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEliminatePlayer(player.id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 p-3 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {table.players.filter(p => !p.eliminated).length} players
          </span>
        </CardFooter>
      </Card>
    );
  };
  
  // Unassigned players (shouldn't have any if tables are properly assigned)
  const unassignedPlayers = activePlayers.filter(p => p.tableNumber === null);
  
  // Group tables into rows of 2 or 3 depending on screen size
  const renderTables = () => {
    if (tables.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No tables assigned yet. Click "Assign Tables" to create table assignments.
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => (
          <TableComponent key={table.id} table={table} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Table Assignments</h2>
          <p className="text-muted-foreground">
            {activePlayers.length} active players, {eliminatedPlayers.length} eliminated
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setShowEliminatedPlayers(!showEliminatedPlayers)}
          >
            {showEliminatedPlayers ? (
              <>
                <Users className="mr-2 h-4 w-4" />
                Hide Eliminated
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Show Eliminated
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleBalanceTables}
            disabled={tables.length <= 1 || activePlayers.length === 0}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Balance Tables
          </Button>
          
          <Button 
            variant="default"
            onClick={handleAssignTables}
            disabled={activePlayers.length === 0}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Assign Tables
          </Button>
        </div>
      </div>
      
      {/* Render unassigned players if any */}
      {unassignedPlayers.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-800">Unassigned Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {unassignedPlayers.map(player => (
                <div key={player.id} className="p-2 bg-white rounded shadow-sm">
                  {player.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tables grid */}
      {renderTables()}
    </div>
  );
};

export default TableAssignment;
