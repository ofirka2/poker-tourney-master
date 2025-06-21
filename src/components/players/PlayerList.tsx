<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash, Search, UserMinus, RefreshCcw, DollarSign,
=======

import React, { useState } from "react";
import { 
  Plus, Trash, Search, UserMinus, RefreshCcw, DollarSign, 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  Edit, Check, X, ChevronDown, ChevronUp, List, Shuffle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
<<<<<<< HEAD
import { useTournament } from "@/context/TournamentContext"; // Still use context for settings/dispatch
import { Player } from "@/types/types"; // Assuming Player type is defined
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client"; // Import supabase

// Define createEmptyPlayer within PlayerList.tsx (or move to utils if reused)
const createEmptyPlayer = (name: string, tournamentId: string): Player => {
  return {
    id: uuidv4(), // Generate a unique ID
    tournament_id: tournamentId, // Associate player with the tournament ID
    name,
    buyIn: true,
    rebuys: 0,
    addOns: 0,
    tableNumber: null,
    seatNumber: null,
    eliminated: false,
    chips: 0,
    // Add any other default player properties here
  };
};

// Define props interface to accept tournamentId
interface PlayerListProps {
    tournamentId: string;
}

// Update component to accept props
export const PlayerList: React.FC<PlayerListProps> = ({ tournamentId }) => {
  // We will fetch players locally based on the tournamentId prop
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  const { state } = useTournament(); // Still use context to get settings (maxRebuys, etc.)
  // Note: Dispatching actions like ADD_PLAYER, REMOVE_PLAYER etc. will now need to
  // update the local 'players' state AND interact with the database.
  // The useTournament context might need refactoring if it's expected to
  // manage players for *any* tournament, not just the currently active one.
  // For this update, we'll focus on fetching and managing local state,
  // and add placeholders for DB interactions in the handlers.

=======
import { useTournament, createEmptyPlayer } from "@/context/TournamentContext";
import { Player } from "@/types/types";

export const PlayerList: React.FC = () => {
  const { state, dispatch } = useTournament();
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [bulkPlayerNames, setBulkPlayerNames] = useState("");
  const [sortField, setSortField] = useState<keyof Player | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
<<<<<<< HEAD

  const { settings } = state; // Get settings from context

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch players from Supabase where tournament_id matches the prop
        const { data, error } = await supabase
          .from('players') // Assuming your players table is named 'players'
          .select('*')
          .eq('tournament_id', tournamentId); // Filter by tournament_id

        if (error) {
          console.error('Error fetching players:', error);
          setError('Failed to load players.');
          setPlayers([]); // Clear players on error
        } else {
          // Assuming data is an array of Player objects
          setPlayers(data || []); // Set local players state
        }
      } catch (err) {
        console.error('Unexpected error fetching players:', err);
        setError('An unexpected error occurred while loading players.');
        setPlayers([]); // Clear players on error
      } finally {
        setLoading(false);
      }
    };

    // Fetch players whenever the tournamentId prop changes
    if (tournamentId) {
      fetchPlayers();
    } else {
        // Handle case where tournamentId is initially null/undefined (e.g., on a new tournament page)
        setPlayers([]);
        setLoading(false);
    }

  }, [tournamentId]); // Re-run effect when tournamentId changes

  // Get player being edited from local state
  const selectedPlayer = selectedPlayerId
    ? players.find(p => p.id === selectedPlayerId)
    : null;

  // Filter players based on search term (uses local state)
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort players (uses filtered local state)
  const sortedPlayers = sortField
    ? [...filteredPlayers].sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];

        if (fieldA === fieldB) return 0;

        const direction = sortDirection === "asc" ? 1 : -1;

        if (fieldA === null || fieldA === undefined) return 1 * direction; // Handle null/undefined
        if (fieldB === null || fieldB === undefined) return -1 * direction; // Handle null/undefined

        // Basic comparison for numbers and strings
        if (typeof fieldA === 'number' && typeof fieldB === 'number') {
             return (fieldA - fieldB) * direction;
        }
         if (typeof fieldA === 'string' && typeof fieldB === 'string') {
             return fieldA.localeCompare(fieldB) * direction;
         }

        return fieldA < fieldB ? -1 * direction : 1 * direction;
      })
    : filteredPlayers;

  // Calculate player totals (uses local state)
  const activePlayers = players.filter(p => !p.eliminated);
  const totalChips = players.reduce((sum, p) => sum + (p.chips || 0), 0); // Use 0 if chips is null/undefined
  const averageChips = activePlayers.length > 0
    ? Math.round(totalChips / activePlayers.length)
    : 0;

=======
  
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
  
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  // Handle sorting
  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
<<<<<<< HEAD

  // Add a new player - Needs DB interaction
  const handleAddPlayer = async () => {
=======
  
  // Add a new player
  const handleAddPlayer = () => {
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
<<<<<<< HEAD
     if (!tournamentId) {
         toast.error("Cannot add player: Tournament ID is missing.");
         return;
     }

    const newPlayer = createEmptyPlayer(newPlayerName.trim(), tournamentId);
    newPlayer.chips = settings.initialChips || 0; // Set initial chips from settings

    try {
        // Insert player into Supabase
        const { data, error } = await supabase
            .from('players')
            .insert(newPlayer)
            .select() // Select the inserted data to get the final player object (including DB-generated fields if any)
            .single();

        if (error) {
            console.error('Error adding player to DB:', error);
            toast.error('Failed to add player.');
            return;
        }

        // Update local state with the player returned from the DB
        setPlayers(prevPlayers => [...prevPlayers, data]);

        // Optional: Dispatch action to context if context also needs to know about this player
        // dispatch({ type: 'ADD_PLAYER', payload: data }); // This might need context refactoring

        setNewPlayerName("");
        setIsAddPlayerDialogOpen(false);
        toast.success(`Player ${newPlayerName} added`);

    } catch (err) {
        console.error('Unexpected error adding player:', err);
        toast.error('An unexpected error occurred while adding player.');
    }
  };

  // Add players in bulk - Needs DB interaction
  const handleBulkImport = async () => {
=======
    
    const newPlayer = createEmptyPlayer(newPlayerName.trim());
    newPlayer.chips = settings.initialChips; // Set initial chips
    
    dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    
    setNewPlayerName("");
    setIsAddPlayerDialogOpen(false);
    
    toast.success(`Player ${newPlayerName} added`);
  };

  // Add players in bulk
  const handleBulkImport = () => {
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
    if (!bulkPlayerNames.trim()) {
      toast.error("Please enter player names");
      return;
    }
<<<<<<< HEAD
     if (!tournamentId) {
         toast.error("Cannot import players: Tournament ID is missing.");
         return;
     }

=======
    
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
    const names = bulkPlayerNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
<<<<<<< HEAD

=======
    
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
    if (names.length === 0) {
      toast.error("No valid player names found");
      return;
    }
<<<<<<< HEAD

    const newPlayersToInsert = names.map(name => {
        const player = createEmptyPlayer(name, tournamentId);
        player.chips = settings.initialChips || 0; // Set initial chips
        return player;
    });

    try {
        // Insert players into Supabase
        const { data, error } = await supabase
            .from('players')
            .insert(newPlayersToInsert)
            .select(); // Select the inserted data

        if (error) {
            console.error('Error bulk importing players to DB:', error);
            toast.error('Failed to import players.');
            return;
        }

        // Update local state with the players returned from the DB
        setPlayers(prevPlayers => [...prevPlayers, ...(data || [])]);

        // Optional: Dispatch actions to context if context needs to know
        // (data || []).forEach(player => dispatch({ type: 'ADD_PLAYER', payload: player })); // Context refactoring might be needed

        setBulkPlayerNames("");
        setIsBulkImportDialogOpen(false);
        toast.success(`${data?.length || 0} players imported`);

    } catch (err) {
        console.error('Unexpected error bulk importing players:', err);
        toast.error('An unexpected error occurred while importing players.');
    }
  };

  // Remove a player - Needs DB interaction
  const handleRemovePlayer = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    try {
        // Delete player from Supabase
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', id); // Delete by player ID

        if (error) {
            console.error('Error removing player from DB:', error);
            toast.error('Failed to remove player.');
            return;
        }

        // Update local state by filtering out the removed player
        setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== id));

        // Optional: Dispatch action to context if context needs to know
        // dispatch({ type: 'REMOVE_PLAYER', payload: id }); // Context refactoring might be needed

        toast.success(`Player ${player.name} removed`);

    } catch (err) {
        console.error('Unexpected error removing player:', err);
        toast.error('An unexpected error occurred while removing player.');
    }
  };

  // Mark player as eliminated - Needs DB interaction
  const handleEliminatePlayer = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    try {
        // Update player status in Supabase
        const { data, error } = await supabase
            .from('players')
            .update({ eliminated: true })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error marking player eliminated in DB:', error);
            toast.error('Failed to mark player eliminated.');
            return;
        }

        // Update local state with the updated player data
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? data : p));

        // Optional: Dispatch action to context if context needs to know
        // dispatch({ type: 'MARK_ELIMINATED', payload: id }); // Context might need refactoring

        toast.info(`Player ${player.name} eliminated`);

    } catch (err) {
        console.error('Unexpected error marking player eliminated:', err);
        toast.error('An unexpected error occurred.');
    }
  };

  // Add rebuy for player - Needs DB interaction
  const handleRebuy = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    // Check if player has reached max rebuys (using settings from context)
    if (player.rebuys >= (settings.maxRebuys ?? 0)) {
      toast.error(`Maximum ${settings.maxRebuys ?? 0} rebuys reached`);
      return;
    }
    // Check if rebuy period is over (using settings and currentLevel from context)
    if ((state.currentLevel ?? 0) > (settings.lastRebuyLevel ?? Infinity)) {
         toast.error("Rebuy period has ended.");
         return;
    }


    try {
        // Update player rebuys and chips in Supabase
        const { data, error } = await supabase
            .from('players')
            .update({
                rebuys: player.rebuys + 1,
                chips: (player.chips || 0) + (settings.rebuyChips || 0), // Add rebuy chips from settings
                eliminated: false, // Mark as active again after rebuy
                eliminationPosition: null, // Clear elimination position
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error adding rebuy to DB:', error);
            toast.error('Failed to add rebuy.');
            return;
        }

        // Update local state with the updated player data
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? data : p));

        // Optional: Dispatch action to context if context needs to know
        // dispatch({ type: 'ADD_REBUY', payload: id }); // Context might need refactoring

        toast.success(`Rebuy for ${player.name} added`);

    } catch (err) {
        console.error('Unexpected error adding rebuy:', err);
        toast.error('An unexpected error occurred.');
    }
  };

  // Add add-on for player - Needs DB interaction
  const handleAddOn = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

     // Check if add-on period is over (using settings and currentLevel from context)
    if ((state.currentLevel ?? 0) > (settings.lastAddOnLevel ?? Infinity)) {
         toast.error("Add-on period has ended.");
         return;
    }
     // Check if player has reached max add-ons (using settings from context)
    if (player.addOns >= (settings.maxAddOns ?? 0)) {
         toast.error(`Maximum ${settings.maxAddOns ?? 0} add-ons reached`);
         return;
    }


    try {
        // Update player addons and chips in Supabase
        const { data, error } = await supabase
            .from('players')
            .update({
                addOns: player.addOns + 1,
                chips: (player.chips || 0) + (settings.addOnChips || 0), // Add addon chips from settings
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error adding add-on to DB:', error);
            toast.error('Failed to add add-on.');
            return;
        }

        // Update local state with the updated player data
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? data : p));

        // Optional: Dispatch action to context if context needs to know
        // dispatch({ type: 'ADD_ADDON', payload: id }); // Context might need refactoring

        toast.success(`Add-on for ${player.name} added`);

    } catch (err) {
        console.error('Unexpected error adding add-on:', err);
        toast.error('An unexpected error occurred.');
    }
  };

  // Update player chips - Needs DB interaction
  const handleUpdateChips = async (id: string, chips: number) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

     // Ensure chips is a valid number
    const safeChips = isNaN(chips) ? 0 : chips;


    try {
        // Update player chips in Supabase
        const { data, error } = await supabase
            .from('players')
            .update({ chips: safeChips })
            .eq('id', id)
            .select()
            .single();

         if (error) {
             console.error('Error updating chips in DB:', error);
             toast.error('Failed to update chips.');
             return;
         }

        // Update local state with the updated player data
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? data : p));

        // Optional: Dispatch action to context if context needs to know
        // dispatch({ type: 'UPDATE_PLAYER', payload: data }); // Context might need refactoring

         toast.success(`Chips updated for ${player.name}`); // Optional toast

    } catch (err) {
        console.error('Unexpected error updating chips:', err);
        toast.error('An unexpected error occurred while updating chips.');
    }
  };


=======
    
    let addedCount = 0;
    
    names.forEach(name => {
      const newPlayer = createEmptyPlayer(name);
      newPlayer.chips = settings.initialChips; // Set initial chips
      
      dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
      addedCount++;
    });
    
    setBulkPlayerNames("");
    setIsBulkImportDialogOpen(false);
    
    toast.success(`${addedCount} players added`);
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
  
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  // Edit player dialog open
  const openEditDialog = (id: string) => {
    setSelectedPlayerId(id);
    setIsEditPlayerDialogOpen(true);
  };
<<<<<<< HEAD

  // Render sort indicator
  const renderSortIndicator = (field: keyof Player) => {
    if (sortField !== field) return null;

    return sortDirection === "asc"
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  // Show loading state
  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading players...</p>
              </div>
          </div>
      );
  }

  // Show error state
  if (error) {
       return (
          <div className="flex justify-center items-center h-64">
              <div className="text-center text-red-600">
                  <p>{error}</p>
              </div>
          </div>
       );
  }


=======
  
  // Render sort indicator
  const renderSortIndicator = (field: keyof Player) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };
  
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Players</h2>
          <p className="text-muted-foreground">Manage tournament players</p>
        </div>
<<<<<<< HEAD

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
=======
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
            onClick={() => setIsAddPlayerDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
<<<<<<< HEAD
          <Button
=======
          <Button 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
            variant="outline"
            onClick={() => setIsBulkImportDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <List className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
<<<<<<< HEAD
          {/* Optional: Add a button here to trigger table assignment if needed */}
           {/* <Button variant="outline" className="w-full sm:w-auto">
               <Shuffle className="w-4 h-4 mr-2" />
               Assign Tables
           </Button> */}
        </div>
      </div>

=======
        </div>
      </div>
      
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
<<<<<<< HEAD

=======
        
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Total Players</div>
<<<<<<< HEAD
              <div className="text-2xl font-bold mt-1">{players.length}</div> {/* Use local players state */}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Active Players</div>
              <div className="text-2xl font-bold mt-1">{activePlayers.length}</div> {/* Use local activePlayers */}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Total Chips</div>
              <div className="text-2xl font-bold mt-1">{totalChips.toLocaleString()}</div> {/* Use local totalChips */}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="text-muted-foreground text-sm">Average Stack</div>
              <div className="text-2xl font-bold mt-1">{averageChips.toLocaleString()}</div> {/* Use local averageChips */}
=======
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
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
            </CardContent>
          </Card>
        </div>
      </div>
<<<<<<< HEAD

=======
      
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
      {/* Players table */}
      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                <th className="h-10 px-4 text-left font-medium">
<<<<<<< HEAD
                  <button
=======
                  <button 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("name")}
                  >
                    <span>Name</span>
                    {renderSortIndicator("name")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">
<<<<<<< HEAD
                  <button
=======
                  <button 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("tableNumber")}
                  >
                    <span>Table</span>
                    {renderSortIndicator("tableNumber")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">
<<<<<<< HEAD
                  <button
=======
                  <button 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("seatNumber")}
                  >
                    <span>Seat</span>
                    {renderSortIndicator("seatNumber")}
                  </button>
                </th>
                <th className="h-10 px-4 text-left font-medium">
<<<<<<< HEAD
                  <button
=======
                  <button 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
<<<<<<< HEAD
                  <tr
                    key={player.id}
                    className={`border-b transition-colors hover:bg-muted/50 ${player.eliminated ? "bg-muted/20 text-muted-foreground" : ""
                      }`}
=======
                  <tr 
                    key={player.id} 
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      player.eliminated ? "bg-muted/20 text-muted-foreground" : ""
                    }`}
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                  >
                    <td className="p-4 font-medium">{player.name}</td>
                    <td className="p-4">
                      {player.tableNumber !== null ? player.tableNumber : "-"}
                    </td>
                    <td className="p-4">
                      {player.seatNumber !== null ? player.seatNumber : "-"}
                    </td>
<<<<<<< HEAD
                    <td className="p-4">{player.chips?.toLocaleString() || '0'}</td> {/* Use optional chaining and default */}
=======
                    <td className="p-4">{player.chips.toLocaleString()}</td>
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
<<<<<<< HEAD
                    <td className="p-4">{player.rebuys || 0}</td> {/* Use default 0 */}
                    <td className="p-4">{player.addOns || 0}</td> {/* Use default 0 */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
=======
                    <td className="p-4">{player.rebuys}</td>
                    <td className="p-4">{player.addOns}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                          onClick={() => openEditDialog(player.id)}
                          title="Edit player"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
<<<<<<< HEAD

                        {/* Rebuy/Eliminate Button */}
                        {!player.eliminated ? (
                          <Button
                            variant="outline"
                            size="icon"
=======
                        
                        {!player.eliminated ? (
                          <Button 
                            variant="outline" 
                            size="icon" 
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                            onClick={() => handleEliminatePlayer(player.id)}
                            title="Mark as eliminated"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        ) : (
<<<<<<< HEAD
                           // Show Rebuy button if eliminated AND within rebuy period/limits
                           // Use settings from context
                           (state.currentLevel ?? 0) <= (settings.lastRebuyLevel ?? Infinity) && (player.rebuys ?? 0) < (settings.maxRebuys ?? 0) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRebuy(player.id)}
                                title="Add rebuy"
                              >
                                <RefreshCcw className="w-3 h-3 mr-1" />
                                Rebuy
                              </Button>
                           )
                        )}

                        {/* Add-on Button - Use settings from context */}
                        {(state.currentLevel ?? 0) <= (settings.lastAddOnLevel ?? Infinity) && (player.addOns ?? 0) < (settings.maxAddOns ?? 0) && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddOn(player.id)}
                            title="Add add-on"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Add-on
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="icon"
=======
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
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
<<<<<<< HEAD

=======
      
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
      {/* Add Player Dialog */}
      <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
<<<<<<< HEAD

=======
          
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
<<<<<<< HEAD

=======
          
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
<<<<<<< HEAD

=======
      
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Players</DialogTitle>
          </DialogHeader>
<<<<<<< HEAD

=======
          
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="bulkPlayerNames" className="text-sm font-medium">
                Player Names (one per line)
              </label>
              <Textarea
                id="bulkPlayerNames"
                placeholder="John Doe&#10;Jane Smith&#10;Mike Johnson"
                rows={8}
                value={bulkPlayerNames}
                onChange={(e) => setBulkPlayerNames(e.target.value)}
              />
            </div>
          </div>
<<<<<<< HEAD

=======
          
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport}>
              Import Players
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
<<<<<<< HEAD

=======
      
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
      {/* Edit Player Dialog */}
      <Dialog open={isEditPlayerDialogOpen} onOpenChange={setIsEditPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
<<<<<<< HEAD

=======
          
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
          {selectedPlayer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Player Name
                </label>
                <div className="font-medium">{selectedPlayer.name}</div>
              </div>
<<<<<<< HEAD

=======
              
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
              <div className="space-y-2">
                <label htmlFor="playerChips" className="text-sm font-medium">
                  Chips
                </label>
                <Input
                  id="playerChips"
                  type="number"
<<<<<<< HEAD
                  value={selectedPlayer.chips ?? ''} // Use ?? '' for controlled input
                  onChange={(e) => handleUpdateChips(selectedPlayer.id, parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Rebuys</div>
                  <div className="font-medium">{selectedPlayer.rebuys || 0}</div> {/* Use default 0 */}
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Add-ons</div>
                  <div className="font-medium">{selectedPlayer.addOns || 0}</div> {/* Use default 0 */}
                </div>
              </div>

=======
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
              
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Table</div>
                  <div className="font-medium">
                    {selectedPlayer.tableNumber !== null ? selectedPlayer.tableNumber : "-"}
                  </div>
                </div>
<<<<<<< HEAD

=======
                
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                <div>
                  <div className="text-sm font-medium mb-1">Seat</div>
                  <div className="font-medium">
                    {selectedPlayer.seatNumber !== null ? selectedPlayer.seatNumber : "-"}
                  </div>
                </div>
              </div>
<<<<<<< HEAD

=======
              
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
              <div>
                <div className="text-sm font-medium mb-1">Status</div>
                {selectedPlayer.eliminated ? (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Eliminated
                    </span>
<<<<<<< HEAD
                    {/* Show Rebuy button in dialog if eliminated AND within rebuy period/limits */}
                    {(state.currentLevel ?? 0) <= (settings.lastRebuyLevel ?? Infinity) && (selectedPlayer.rebuys ?? 0) < (settings.maxRebuys ?? 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={async () => { // Make async
                           await handleRebuy(selectedPlayer.id); // Call handler
                           setIsEditPlayerDialogOpen(false); // Close dialog after action
=======
                    {state.currentLevel <= settings.lastRebuyLevel && selectedPlayer.rebuys < settings.maxRebuys && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          dispatch({ type: 'ADD_REBUY', payload: selectedPlayer.id });
                          setIsEditPlayerDialogOpen(false);
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                        }}
                      >
                        <RefreshCcw className="w-3 h-3 mr-1" />
                        Rebuy
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                      Active
                    </span>
<<<<<<< HEAD

                    <div className="flex space-x-2">
                       {/* Show Rebuy button in dialog if active AND within rebuy period/limits */}
                       {(state.currentLevel ?? 0) <= (settings.lastRebuyLevel ?? Infinity) && (selectedPlayer.rebuys ?? 0) < (settings.maxRebuys ?? 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => { // Make async
                              await handleRebuy(selectedPlayer.id); // Call handler
                              // Don't close dialog after rebuy if player is still active
                              // setIsEditPlayerDialogOpen(false);
                            }}
                          >
                            <RefreshCcw className="w-3 h-3 mr-1" />
                            Rebuy
                          </Button>
                        )}

                       {/* Show Add-on button in dialog if active AND within add-on period/limits */}
                       {(state.currentLevel ?? 0) <= (settings.lastAddOnLevel ?? Infinity) && (selectedPlayer.addOns ?? 0) < (settings.maxAddOns ?? 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => { // Make async
                              await handleAddOn(selectedPlayer.id); // Call handler
                              // Don't close dialog after add-on
                              // setIsEditPlayerDialogOpen(false);
                            }}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Add-on
                          </Button>
                        )}
=======
                    
                    <div className="flex space-x-2">
                      {state.currentLevel <= settings.lastRebuyLevel && selectedPlayer.rebuys < settings.maxRebuys && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            dispatch({ type: 'ADD_REBUY', payload: selectedPlayer.id });
                            toast.success(`Rebuy for ${selectedPlayer.name} added`);
                          }}
                        >
                          <RefreshCcw className="w-3 h-3 mr-1" />
                          Rebuy
                        </Button>
                      )}
                      
                      {state.currentLevel <= settings.lastAddOnLevel && selectedPlayer.addOns < settings.maxAddOns && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            dispatch({ type: 'ADD_ADDON', payload: selectedPlayer.id });
                            toast.success(`Add-on for ${selectedPlayer.name} added`);
                          }}
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Add-on
                        </Button>
                      )}
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
<<<<<<< HEAD

=======
          
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
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
