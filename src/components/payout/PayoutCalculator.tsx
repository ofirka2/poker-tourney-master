
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import { calculatePrizePoolAndPayouts, suggestPayoutStructure } from "@/utils/payoutCalculator";

export const PayoutCalculator: React.FC = () => {
  const { state } = useTournament();
  const { totalPrizePool, settings, players } = state;
  const { payoutStructure } = settings;
  
  const [payouts, setPayouts] = useState<{ position: number; percentage: number; amount: number }[]>([]);
  
  useEffect(() => {
    // Count total buy-ins, rebuys, and add-ons
    const totalBuyIns = players.filter(p => p.buyIn).length;
    const totalRebuys = players.reduce((sum, player) => sum + player.rebuys, 0);
    const totalAddOns = players.reduce((sum, player) => sum + player.addOns, 0);
    
    // Get payout structure (use existing or suggest new one)
    let payoutPlaces = payoutStructure.places.map(place => ({
      position: place.position,
      percentage: place.percentage
    }));
    
    // If no structure defined, suggest one based on participant count
    if (!payoutPlaces.length) {
      const totalParticipants = totalBuyIns + totalRebuys + totalAddOns;
      payoutPlaces = suggestPayoutStructure(totalParticipants);
    }
    
    // Calculate payouts
    const result = calculatePrizePoolAndPayouts({
      totalBuyIns,
      buyInAmount: settings.buyInAmount,
      totalRebuys,
      rebuyAmount: settings.rebuyAmount,
      totalAddons: totalAddOns,
      addonAmount: settings.addOnAmount,
      payoutPlaces
    });
    
    setPayouts(result.payoutDetails);
  }, [totalPrizePool, settings, players, payoutStructure]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Trophy className="mr-2 h-5 w-5 text-poker-chip" />
          Payout Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalPrizePool > 0 ? (
          <div className="space-y-3">
            <div className="text-lg font-bold mb-4">
              Total Prize Pool: ${totalPrizePool}
            </div>
            
            <div className="space-y-2">
              {payouts.map((payout) => (
                <div key={payout.position} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      payout.position === 1 
                        ? "bg-yellow-400 text-yellow-900" 
                        : payout.position === 2 
                          ? "bg-gray-300 text-gray-700" 
                          : payout.position === 3 
                            ? "bg-amber-600 text-amber-100" 
                            : "bg-muted text-muted-foreground"
                    }`}>
                      {payout.position}
                    </div>
                    <div className="ml-3">
                      {payout.position === 1 
                        ? "1st Place" 
                        : payout.position === 2 
                          ? "2nd Place" 
                          : payout.position === 3 
                            ? "3rd Place" 
                            : `${payout.position}th Place`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${payout.amount}</div>
                    <div className="text-xs text-muted-foreground">{payout.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No players added yet. Add players to see payout structure.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutCalculator;
