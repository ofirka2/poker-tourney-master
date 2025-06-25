
import React, { useState, useEffect, useCallback } from "react";
import {
 Plus, Trash, Search, UserMinus, RefreshCcw, DollarSign,
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
import { useTournament } from "@/context/TournamentContext";
import { Player } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabasePlayerToPlayer, mapPlayerToDatabase, createEmptyPlayer } from "@/utils/playerUtils";

// Define props interface to accept tournamentId
interface PlayerListProps {
   tournamentId: string;
}

// Update component to accept props
export const PlayerList: React.FC<PlayerListProps> = ({ tournamentId }) => {
 // We will fetch players locally based on the tournamentId prop
 const [players, setPlayers] = useState<Player[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const { state } = useTournament();

 const [searchTerm, setSearchTerm] = useState("");
 const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
 const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
 const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false);
 const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
 const [newPlayerName, setNewPlayerName] = useState("");
 const [bulkPlayerNames, setBulkPlayerNames] = useState("");
 const [sortField, setSortField] = useState<keyof Player | null>("name");
 const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

 const { settings } = state;

 // --- Data Fetching Effect ---
 useEffect(() => {
   const fetchPlayers = async () => {
     setLoading(true);
     setError(null);
     try {
       const { data, error } = await supabase
         .from('players')
         .select('*')
         .eq('tournament_id', tournamentId);

       if (error) {
         console.error('Error fetching players:', error);
         setError('Failed to load players.');
         setPlayers([]);
       } else {
         const mappedPlayers = (data || []).map(mapDatabasePlayerToPlayer);
         setPlayers(mappedPlayers);
       }
     } catch (err) {
       console.error('Unexpected error fetching players:', err);
       setError('An unexpected error occurred while loading players.');
       setPlayers([]);
     } finally {
       setLoading(false);
     }
   };

   if (tournamentId) {
     fetchPlayers();
   } else {
       setPlayers([]);
       setLoading(false);
   }

 }, [tournamentId]);

 // Get player being edited from local state
 const selectedPlayer = selectedPlayerId
   ? players.find(p => p.id === selectedPlayerId)
   : null;

 // Filter players based on search term (uses local state)
 const filteredPlayers = players.filter(player =>
   player.name?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 // Sort players (uses filtered local state)
 const sortedPlayers = sortField
   ? [...filteredPlayers].sort((a, b) => {
       const fieldA = a[sortField];
       const fieldB = b[sortField];

       if (fieldA === fieldB) return 0;

       const direction = sortDirection === "asc" ? 1 : -1;

       if (fieldA === null || fieldA === undefined) return 1 * direction;
       if (fieldB === null || fieldB === undefined) return -1 * direction;

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
 const totalChips = players.reduce((sum, p) => sum + (p.chips || 0), 0);
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

 // Add a new player - Needs DB interaction
 const handleAddPlayer = async () => {
   if (!newPlayerName.trim()) {
     toast.error("Please enter a player name");
     return;
   }
    if (!tournamentId) {
        toast.error("Cannot add player: Tournament ID is missing.");
        return;
    }

   const newPlayer = createEmptyPlayer(newPlayerName.trim(), tournamentId);
   newPlayer.chips = settings.initialChips || 0;
   newPlayer.current_chips = settings.initialChips || 0;

   try {
       const playerForDb = mapPlayerToDatabase(newPlayer);
       const { data, error } = await supabase
           .from('players')
           .insert(playerForDb)
           .select()
           .single();

       if (error) {
           console.error('Error adding player to DB:', error);
           toast.error('Failed to add player.');
           return;
       }

       const mappedPlayer = mapDatabasePlayerToPlayer(data);
       setPlayers(prevPlayers => [...prevPlayers, mappedPlayer]);

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
   if (!bulkPlayerNames.trim()) {
     toast.error("Please enter player names");
     return;
   }
    if (!tournamentId) {
        toast.error("Cannot import players: Tournament ID is missing.");
        return;
    }

   const names = bulkPlayerNames
     .split('\n')
     .map(name => name.trim())
     .filter(name => name.length > 0);

   if (names.length === 0) {
     toast.error("No valid player names found");
     return;
   }

   const newPlayersToInsert = names.map(name => {
       const player = createEmptyPlayer(name, tournamentId);
       player.chips = settings.initialChips || 0;
       player.current_chips = settings.initialChips || 0;
       return mapPlayerToDatabase(player);
   });

   try {
       const { data, error } = await supabase
           .from('players')
           .insert(newPlayersToInsert)
           .select();

       if (error) {
           console.error('Error bulk importing players to DB:', error);
           toast.error('Failed to import players.');
           return;
       }

       const mappedPlayers = (data || []).map(mapDatabasePlayerToPlayer);
       setPlayers(prevPlayers => [...prevPlayers, ...mappedPlayers]);

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
       const { error } = await supabase
           .from('players')
           .delete()
           .eq('id', id);

       if (error) {
           console.error('Error removing player from DB:', error);
           toast.error('Failed to remove player.');
           return;
       }

       setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== id));

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
       const { data, error } = await supabase
           .from('players')
           .update({ 
             status: 'eliminated',
             finish_position: players.filter(p => p.eliminated).length + 1
           })
           .eq('id', id)
           .select()
           .single();

       if (error) {
           console.error('Error marking player eliminated in DB:', error);
           toast.error('Failed to mark player eliminated.');
           return;
       }

       const updatedPlayer = mapDatabasePlayerToPlayer(data);
       setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? updatedPlayer : p));

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

   if (player.rebuys >= (settings.maxRebuys ?? 0)) {
     toast.error(`Maximum ${settings.maxRebuys ?? 0} rebuys reached`);
     return;
   }
   if ((state.currentLevel ?? 0) > (settings.lastRebuyLevel ?? Infinity)) {
        toast.error("Rebuy period has ended.");
        return;
   }

   try {
       const { data, error } = await supabase
           .from('players')
           .update({
               rebuys: player.rebuys + 1,
               current_chips: (player.current_chips || 0) + (settings.rebuyChips || 0),
               status: 'active',
               finish_position: null,
           })
           .eq('id', id)
           .select()
           .single();

       if (error) {
           console.error('Error adding rebuy to DB:', error);
           toast.error('Failed to add rebuy.');
           return;
       }

       const updatedPlayer = mapDatabasePlayerToPlayer(data);
       setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? updatedPlayer : p));

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

   if ((state.currentLevel ?? 0) > (settings.lastAddOnLevel ?? Infinity)) {
        toast.error("Add-on period has ended.");
        return;
   }
   if (player.addons >= (settings.maxAddOns ?? 0)) {
        toast.error(`Maximum ${settings.maxAddOns ?? 0} add-ons reached`);
        return;
   }

   try {
       const { data, error } = await supabase
           .from('players')
           .update({
               addons: player.addons + 1,
               current_chips: (player.current_chips || 0) + (settings.addOnChips || 0),
           })
           .eq('id', id)
           .select()
           .single();

       if (error) {
           console.error('Error adding add-on to DB:', error);
           toast.error('Failed to add add-on.');
           return;
       }

       const updatedPlayer = mapDatabasePlayerToPlayer(data);
       setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? updatedPlayer : p));

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

   const safeChips = isNaN(chips) ? 0 : chips;

   try {
       const { data, error } = await supabase
           .from('players')
           .update({ current_chips: safeChips })
           .eq('id', id)
           .select()
           .single();

        if (error) {
            console.error('Error updating chips in DB:', error);
            toast.error('Failed to update chips.');
            return;
        }

       const updatedPlayer = mapDatabasePlayerToPlayer(data);
       setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? updatedPlayer : p));

        toast.success(`Chips updated for ${player.name}`);

   } catch (err) {
       console.error('Unexpected error updating chips:', err);
       toast.error('An unexpected error occurred while updating chips.');
   }
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
         <Button
           variant="outline"
           onClick={() => setIsBulkImportDialogOpen(true)}
           className="w-full sm:w-auto"
         >
           <List className="w-4 h-4 mr-2" />
           Bulk Import
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
                   className={`border-b transition-colors hover:bg-muted/50 ${player.eliminated ? "bg-muted/20 text-muted-foreground" : ""
                     }`}
                 >
                   <td className="p-4 font-medium">{player.name}</td>
                   <td className="p-4">
                     {player.tableNumber !== null ? player.tableNumber : "-"}
                   </td>
                   <td className="p-4">
                     {player.seatNumber !== null ? player.seatNumber : "-"}
                   </td>
                   <td className="p-4">{player.chips?.toLocaleString() || '0'}</td>
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
                   <td className="p-4">{player.rebuys || 0}</td>
                   <td className="p-4">{player.addOns || 0}</td>
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

                       {/* Rebuy/Eliminate Button */}
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
                          (state.currentLevel ?? 0) <= (settings.lastRebuyLevel ?? Infinity) && (player.rebuys ?? 0) < (settings.maxRebuys ?? 0) && (
                             <Button
                               variant="outline"
                               size="sm"
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
                           size="sm"
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

     {/* Bulk Import Dialog */}
     <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Bulk Import Players</DialogTitle>
         </DialogHeader>

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
                 value={selectedPlayer.chips ?? ''}
                 onChange={(e) => handleUpdateChips(selectedPlayer.id, parseInt(e.target.value) || 0)}
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <div className="text-sm font-medium mb-1">Rebuys</div>
                 <div className="font-medium">{selectedPlayer.rebuys || 0}</div>
               </div>

               <div>
                 <div className="text-sm font-medium mb-1">Add-ons</div>
                 <div className="font-medium">{selectedPlayer.addOns || 0}</div>
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
                   {(state.currentLevel ?? 0) <= (settings.lastRebuyLevel ?? Infinity) && (selectedPlayer.rebuys ?? 0) < (settings.maxRebuys ?? 0) && (
                     <Button
                       variant="outline"
                       size="sm"
                       className="ml-2"
                       onClick={async () => {
                          await handleRebuy(selectedPlayer.id);
                          setIsEditPlayerDialogOpen(false);
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

                   <div className="flex space-x-2">
                      {(state.currentLevel ?? 0) <= (settings.lastRebuyLevel ?? Infinity) && (selectedPlayer.rebuys ?? 0) < (settings.maxRebuys ?? 0) && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={async () => {
                             await handleRebuy(selectedPlayer.id);
                           }}
                         >
                           <RefreshCcw className="w-3 h-3 mr-1" />
                           Rebuy
                         </Button>
                       )}

                      {(state.currentLevel ?? 0) <= (settings.lastAddOnLevel ?? Infinity) && (selectedPlayer.addOns ?? 0) < (settings.maxAddOns ?? 0) && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={async () => {
                             await handleAddOn(selectedPlayer.id);
                           }}
                         >
                           <DollarSign className="w-3 h-3 mr-1" />
                           Add-on
                         </Button>
                       )}
                   </div>
                 </div>
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
