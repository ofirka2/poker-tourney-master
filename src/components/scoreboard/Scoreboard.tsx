import React from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournament } from "@/context/TournamentContext";

const Scoreboard: React.FC = () => {
  const { state } = useTournament();
  const { players, totalPrizePool, settings } = state;
  
  // Get active players
  const activePlayers = players.filter(p => !p.eliminated);
  
  // Total number of players in tournament
  const totalPlayers = players.length;
  
  // Calculate position for each eliminated player
  const eliminatedPlayersWithPositions = players
    .filter(p => p.eliminated)
    .map(player => {
      // Calculate position based on total players and elimination order
      // First eliminated = highest position number (e.g., 9th in a 9-player tournament)
      const position = totalPlayers + 1 - (player.eliminationPosition || 0);
      return { ...player, displayPosition: position };
    });
  
  // Sort by position in ascending order (e.g., #6, #7, #8, #9)
  const sortedPlayers = eliminatedPlayersWithPositions.sort((a, b) => a.displayPosition - b.displayPosition);
  
  // Calculate if a position is in the money (eligible for payout)
  const isInTheMoney = (position: number): boolean => {
    if (!settings.payoutStructure || !settings.payoutStructure.places) return false;
    
    // Check if this position has a payout defined
    return settings.payoutStructure.places.some(p => p.position === position);
  };
  
  // Calculate payout for a position
  const calculatePayout = (position: number): number | null => {
    if (!settings.payoutStructure || !settings.payoutStructure.places) return null;
    
    const payoutPlace = settings.payoutStructure.places.find(p => p.position === position);
    if (!payoutPlace) return null;
    
    return (totalPrizePool * payoutPlace.percentage) / 100;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Trophy className="mr-2 h-5 w-5" />
          Tournament Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No players have been eliminated yet
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground pb-1 border-b">
              <div className="col-span-3">Position</div>
              <div className="col-span-6">Name</div>
              <div className="col-span-3 text-right">Prize</div>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto pr-2">
              {sortedPlayers.map((player) => {
                const position = player.displayPosition;
                const inTheMoney = isInTheMoney(position);
                const payout = inTheMoney ? calculatePayout(position) : null;
                
                return (
                  <div key={player.id} className="grid grid-cols-12 py-2 text-sm border-b border-dashed last:border-0">
                    <div className="col-span-3">#{position}</div>
                    <div className="col-span-6 font-medium">{player.name}</div>
                    <div className="col-span-3 text-right">
                      {inTheMoney && payout !== null ? `$${payout.toFixed(2)}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {activePlayers.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-sm font-medium">
              {activePlayers.length} player{activePlayers.length !== 1 ? 's' : ''} remaining
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Scoreboard;