
import React, { useState } from "react";
import { 
  Shuffle, Users, LayoutGrid, ArrowDownUp, 
  Undo, RefreshCw, UserMinus, Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { Table as TableType, Player } from "@/types/types";

export const TableAssignment: React.FC = () => {
  const { state, dispatch } = useTournament();
  const [showEliminatedPlayers, setShowEliminatedPlayers] = useState(false);
  const [maxPlayersPerTable, setMaxPlayersPerTable] = useState(9);
  const [showSettings, setShowSettings] = useState(false);
  
  const { players, tables } = state;
  const activePlayers = players.filter(p => !p.eliminated);
  const eliminatedPlayers = players.filter(p => p.eliminated);
  
  // Check if table assignment is allowed (more than 9 players)
  const canAssignTables = activePlayers.length > 9;
  
  // Handle randomizing table assignments
  const handleAssignTables = () => {
    if (!canAssignTables) {
      toast.error("Table assignment requires more than 9 players");
      return;
    }
    
    dispatch({ 
      type: 'ASSIGN_TABLES', 
      payload: { maxPlayersPerTable } 
    });
    toast.success(`Players randomly assigned to tables (max ${maxPlayersPerTable} per table)`);
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
    if (activePlayers.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No Players Available</p>
          <p>Add players to the tournament before assigning tables.</p>
        </div>
      );
    }
    
    if (tables.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          {canAssignTables ? (
            <>
              <p className="text-lg font-medium mb-2">Ready to Assign Tables</p>
              <p>Click "Assign Tables" to randomly assign {activePlayers.length} players to tables.</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">Not Enough Players</p>
              <p>Table assignment requires more than 9 players (currently {activePlayers.length}).</p>
            </>
          )}
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
            {!canAssignTables && activePlayers.length > 0 && (
              <span className="block text-orange-600 font-medium">
                ⚠️ Table assignment requires more than 9 players (currently {activePlayers.length})
              </span>
            )}
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
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Table Assignment Settings</DialogTitle>
                <DialogDescription>
                  Configure how players are assigned to tables.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPlayersPerTable">Maximum Players per Table</Label>
                  <Input
                    id="maxPlayersPerTable"
                    type="number"
                    min="6"
                    max="10"
                    value={maxPlayersPerTable}
                    onChange={(e) => setMaxPlayersPerTable(Number(e.target.value))}
                    placeholder="9"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 6-10 players per table for optimal gameplay
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
            disabled={!canAssignTables}
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
