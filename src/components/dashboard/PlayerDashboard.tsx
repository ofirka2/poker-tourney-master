import React, { useState } from "react";
import { toast } from "sonner";
import { 
  UserMinus, Search, RefreshCw, Plus, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import { useTournament } from "@/context/TournamentContext";

const PlayerDashboard: React.FC = () => {
  const { state, dispatch } = useTournament();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { players, settings, currentLevel } = state;
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEliminatePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'MARK_ELIMINATED', payload: id });
    toast.info(`Player ${player.name} eliminated`);
  };
  
  const handleAddRebuy = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    // Check if player has reached max rebuys
    if (player.rebuys >= settings.maxRebuys) {
      toast.error(`Player has reached maximum ${settings.maxRebuys} rebuys`);
      return;
    }
    
    dispatch({ type: 'ADD_REBUY', payload: id });
    toast.success(`Added rebuy for ${player.name}`);
  };
  
  const handleAddAddOn = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    // Check if player has reached max add-ons
    if (player.addOns >= settings.maxAddOns) {
      toast.error(`Player has reached maximum ${settings.maxAddOns} add-ons`);
      return;
    }
    
    dispatch({ type: 'ADD_ADDON', payload: id });
    toast.success(`Added add-on for ${player.name}`);
  };
  
  // Create the correct link path based on whether we have a tournament ID
  const playersLink = tournamentId ? `/tournaments/${tournamentId}/players` : "/players";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            Player Management
          </CardTitle>
          <Button asChild size="sm">
            <Link to={playersLink}>
              Manage All Players
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search players..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? "No players match your search" : "No players added yet"}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground pb-1 border-b">
              <div className="col-span-4">Player</div>
              <div className="col-span-1">Table</div>
              <div className="col-span-2">Chips</div>
              <div className="col-span-1 text-center">Rebuys</div>
              <div className="col-span-1 text-center">Add-ons</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2">
              {filteredPlayers.map((player) => (
                <div key={player.id} className={`grid grid-cols-12 py-2 text-sm border-b border-dashed last:border-0 items-center ${player.eliminated ? "text-muted-foreground" : ""}`}>
                  <div className="col-span-4 font-medium">{player.name}</div>
                  <div className="col-span-1">{player.tableNumber || "-"}</div>
                  <div className="col-span-2">{player.chips?.toLocaleString() || '0'}</div>
                  <div className="col-span-1 text-center">{player.rebuys}</div>
                  <div className="col-span-1 text-center">{player.addOns}</div>
                  <div className="col-span-3 text-right">
                    <div className="flex justify-end space-x-1">
                      {!player.eliminated && (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEliminatePlayer(player.id)}
                            title="Eliminate Player"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleAddRebuy(player.id)}
                            title="Add Rebuy"
                            disabled={currentLevel > settings.lastRebuyLevel || player.rebuys >= settings.maxRebuys}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleAddAddOn(player.id)}
                            title="Add Add-On"
                            disabled={currentLevel > settings.lastAddOnLevel || player.addOns >= settings.maxAddOns}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {player.eliminated && (
                        <span className="text-xs text-muted-foreground">
                          Eliminated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerDashboard;