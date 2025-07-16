
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTournament } from "@/context/TournamentContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TableAssignment: React.FC = () => {
  const { state, dispatch } = useTournament();
  const [maxPlayersPerTable, setMaxPlayersPerTable] = useState(9);

  const activePlayers = state.players.filter(p => !p.eliminated);
  const assignedPlayers = activePlayers.filter(p => p.tableNumber && p.seatNumber);
  const unassignedPlayers = activePlayers.filter(p => !p.tableNumber || !p.seatNumber);

  const handleAssignTables = () => {
    if (activePlayers.length === 0) {
      toast.error("No active players to assign");
      return;
    }

    dispatch({ 
      type: 'ASSIGN_TABLES', 
      payload: { maxPlayersPerTable } 
    });
  };

  const handleBalanceTables = () => {
    if (state.tables.length <= 1) {
      toast.info("Need at least 2 tables to balance");
      return;
    }

    dispatch({ type: 'BALANCE_TABLES' });
  };

  const handleClearAssignments = () => {
    // Clear all table assignments by setting them to null
    const updatedPlayers = state.players.map(player => ({
      ...player,
      tableNumber: null,
      seatNumber: null
    }));

    dispatch({ 
      type: 'LOAD_TOURNAMENT', 
      payload: { 
        ...state, 
        players: updatedPlayers 
      } 
    });

    toast.success("All table assignments cleared");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Table Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{activePlayers.length}</div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{assignedPlayers.length}</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{unassignedPlayers.length}</div>
              <div className="text-sm text-muted-foreground">Unassigned</div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players per Table</Label>
            <Input
              id="maxPlayers"
              type="number"
              min="2"
              max="10"
              value={maxPlayersPerTable}
              onChange={(e) => setMaxPlayersPerTable(parseInt(e.target.value) || 9)}
              className="w-32"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleAssignTables}
              disabled={activePlayers.length === 0}
            >
              {unassignedPlayers.length > 0 ? 'Assign Unassigned Players' : 'Reassign All Players'}
            </Button>
            
            {state.tables.length > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBalanceTables}
              >
                Balance Tables
              </Button>
            )}
            
            {assignedPlayers.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleClearAssignments}
              >
                Clear All Assignments
              </Button>
            )}
          </div>

          {/* Assignment Status */}
          {unassignedPlayers.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Unassigned Players ({unassignedPlayers.length})</h4>
              <div className="flex flex-wrap gap-2">
                {unassignedPlayers.map(player => (
                  <Badge key={player.id} variant="secondary">
                    {player.name || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Assignments */}
          {assignedPlayers.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Current Assignments ({assignedPlayers.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {assignedPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{player.name || 'Unknown'}</span>
                    <Badge variant="outline">
                      Table {player.tableNumber}, Seat {player.seatNumber}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Players Message */}
          {activePlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active players available for table assignment.</p>
              <p className="text-sm">Add players to the tournament first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables Display */}
      {state.tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.tables.map((table) => (
                <div key={table.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Table {table.id}</h4>
                  <div className="space-y-1">
                    {table.players.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No players assigned</p>
                    ) : (
                      table.players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between text-sm">
                          <span>{player.name || 'Unknown'}</span>
                          <span className="text-muted-foreground">
                            Seat {player.seatNumber}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {table.players.length}/{table.maxSeats} players
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableAssignment;
