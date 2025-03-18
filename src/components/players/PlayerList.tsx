
import React, { useState } from "react";
import { 
  Plus, Trash, Search, UserMinus, RefreshCcw, DollarSign, 
  Edit, Check, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTournament, createEmptyPlayer } from "@/context/TournamentContext";
import { Player } from "@/types/types";

export const PlayerList: React.FC = () => {
  const { state, dispatch } = useTournament();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [sortField, setSortField] = useState<keyof Player | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const { players, settings } = state;
  
  // Get player being edited
  const selectedPlayer = selectedPlayerId 
    ? players.find(p => p.id === selectedPlayerId) 
    : null;
  
  // Filter players based on search term
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort players
  const sortedPlayers = sortField 
    ? [...filteredPlayers].sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        
        if (fieldA === fieldB) return 0;
        
        const direction = sortDirection === "asc" ? 1 : -1;
        
        if (fieldA === null) return 1 * direction;
        if (fieldB === null) return -1 * direction;
        
        return fieldA < fieldB ? -1 * direction : 1 * direction;
      })
    : filteredPlayers;
  
  // Calculate player totals
  const activePlayers = players.filter(p => !p.eliminated);
  const totalChips = players.reduce((sum, p) => sum + p.chips, 0);
  const averageChips = activePlayers.length > 0 
    ? Math.round(totalChips / activePlayers.length) 
    : 0;
  
  // Handle sorting
  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Add a new player
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    
    const newPlayer = createEmptyPlayer(newPlayerName.trim());
    newPlayer.chips = settings.initialChips; // Set initial chips
    
    dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    
    setNewPlayerName("");
    setIsAddPlayerDialogOpen(false);
    
    toast.success(`Player ${newPlayerName} added`);
  };
  
  // Remove a player
  const handleRemovePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
    toast.success(`Player ${player.name} removed`);
  };
  
  // Mark player as eliminated
  const handleEliminatePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'MARK_ELIMINATED', payload: id });
    toast.info(`Player ${player.name} eliminated`);
  };
  
  // Add rebuy for player
  const handleRebuy = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    // Check if player has reached max rebuys
    if (player.rebuys >= settings.maxRebuys) {
      toast.error(`Maximum ${settings.maxRebuys} rebuys reached`);
      return;
    }
    
    dispatch({ type: 'ADD_REBUY', payload: id });
    toast.success(`Rebuy for ${player.name} added`);
  };
  
  // Add add-on for player
  const handleAddOn = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'ADD_ADDON', payload: id });
    toast.success(`Add-on for ${player.name} added`);
  };
  
  // Update player chips
  const handleUpdateChips = (id: string, chips: number) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    const updatedPlayer = { ...player, chips };
    dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
  };
  
  // Edit player dialog open
  const openEditDialog = (id: string) => {
    setSelectedPlayerId(id);
    setIsEditPlayerDialogOpen(true);
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: keyof Player) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Players</h2>
          <p className="text-muted-foreground">Manage tournament players</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setIsAddPlayerDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      </div>
      
      {/* Search and stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 space-y-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search players..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Total Players</div>
              <div className="text-2xl font-bold mt-1">{players.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Active Players</div>
              <div className="text-2xl font-bold mt-1">{activePlayers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Total Chips</div>
              <div className="text-2xl font-bold mt-1">{totalChips.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Average Stack</div>
              <div className="text-2xl font-bold mt-1">{averageChips.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Players table */}
      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                <th className="h-10 px-4 text-left font-medium">
                  <button 
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("name")}
                  >
                    <span>Name</span>
                    {renderSortIndicator("name")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">
                  <button 
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("tableNumber")}
                  >
                    <span>Table</span>
                    {renderSortIndicator("tableNumber")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">
                  <button 
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("seatNumber")}
                  >
                    <span>Seat</span>
                    {renderSortIndicator("seatNumber")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">
                  <button 
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("chips")}
                  >
                    <span>Chips</span>
                    {renderSortIndicator("chips")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">Status</th>
                <th className="h-10 px-4 text-left font-medium">Rebuys</th>
                <th className="h-10 px-4 text-left font-medium">Add-ons</th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    {searchTerm ? "No players match your search" : "No players added yet"}
                  </td>
                </tr>
              ) : (
                sortedPlayers.map((player) => (
                  <tr 
                    key={player.id} 
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      player.eliminated ? "bg-muted/20 text-muted-foreground" : ""
                    }`}
                  >
                    <td className="p-4 font-medium">{player.name}</td>
                    <td className="p-4">
                      {player.tableNumber !== null ? player.tableNumber : "-"}
                    </td>
                    <td className="p-4">
                      {player.seatNumber !== null ? player.seatNumber : "-"}
                    </td>
                    <td className="p-4">{player.chips.toLocaleString()}</td>
                    <td className="p-4">
                      {player.eliminated ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Eliminated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">{player.rebuys}</td>
                    <td className="p-4">{player.addOns}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openEditDialog(player.id)}
                          title="Edit player"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {!player.eliminated ? (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEliminatePlayer(player.id)}
                            title="Mark as eliminated"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleRebuy(player.id)}
                            title="Add rebuy"
                            disabled={player.rebuys >= settings.maxRebuys || state.currentLevel > settings.lastRebuyLevel}
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleAddOn(player.id)}
                          title="Add add-on"
                          disabled={player.addOns >= settings.maxAddOns || state.currentLevel > settings.lastAddOnLevel}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleRemovePlayer(player.id)}
                          title="Remove player"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium">
                Player Name
              </label>
              <Input
                id="playerName"
                placeholder="Enter player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>
              Add Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Player Dialog */}
      <Dialog open={isEditPlayerDialogOpen} onOpenChange={setIsEditPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          
          {selectedPlayer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Player Name
                </label>
                <div className="font-medium">{selectedPlayer.name}</div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="playerChips" className="text-sm font-medium">
                  Chips
                </label>
                <Input
                  id="playerChips"
                  type="number"
                  value={selectedPlayer.chips}
                  onChange={(e) => handleUpdateChips(selectedPlayer.id, parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Rebuys</div>
                  <div className="font-medium">{selectedPlayer.rebuys}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Add-ons</div>
                  <div className="font-medium">{selectedPlayer.addOns}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Table</div>
                  <div className="font-medium">
                    {selectedPlayer.tableNumber !== null ? selectedPlayer.tableNumber : "-"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Seat</div>
                  <div className="font-medium">
                    {selectedPlayer.seatNumber !== null ? selectedPlayer.seatNumber : "-"}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Status</div>
                {selectedPlayer.eliminated ? (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Eliminated
                    </span>
                    {state.currentLevel <= settings.lastRebuyLevel && selectedPlayer.rebuys < settings.maxRebuys && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          dispatch({ type: 'ADD_REBUY', payload: selectedPlayer.id });
                          setIsEditPlayerDialogOpen(false);
                        }}
                      >
                        <RefreshCcw className="w-3 h-3 mr-1" />
                        Rebuy
                      </Button>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlayerDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerList;
