
import React from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournament } from "@/context/TournamentContext";

const Scoreboard: React.FC = () => {
  const { state } = useTournament();
  const { players, totalPrizePool, settings } = state;
  
  // Sort eliminated players by position (most recently eliminated first - descending order)
  const eliminatedPlayers = [...players]
    .filter(p => p.eliminated)
    .sort((a, b) => (b.eliminationPosition || 0) - (a.eliminationPosition || 0));
  
  // Get remaining active players count
  const activePlayersCount = players.filter(p => !p.eliminated).length;
  
  // Calculate positions and potential payouts
  const getPosition = (eliminationPosition: number | undefined): string => {
    if (!eliminationPosition) return "N/A";
    
    // Calculate finishing position (1st, 2nd, etc.) based on active players
    const position = activePlayersCount + eliminationPosition;
    
    // Return appropriate suffix
    if (position === 1) return "1st";
    if (position === 2) return "2nd";
    if (position === 3) return "3rd";
    return `${position}th`;
  };
  
  // Calculate potential payout for a position
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
        {eliminatedPlayers.length === 0 ? (
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
              {eliminatedPlayers.map((player) => {
                const position = activePlayersCount + (player.eliminationPosition || 0);
                const payout = calculatePayout(position);
                
                return (
                  <div key={player.id} className="grid grid-cols-12 py-2 text-sm border-b border-dashed last:border-0">
                    <div className="col-span-3">{getPosition(player.eliminationPosition)}</div>
                    <div className="col-span-6 font-medium">{player.name}</div>
                    <div className="col-span-3 text-right">
                      {payout !== null ? `$${payout.toFixed(2)}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {activePlayersCount > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="text-sm font-medium">
              {activePlayersCount} player{activePlayersCount !== 1 ? 's' : ''} remaining
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
