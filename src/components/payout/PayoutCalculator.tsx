
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import { calculatePrizePoolAndPayouts, suggestPayoutStructure } from "@/utils/payoutCalculator";
import { PayoutPlace } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const PayoutCalculator: React.FC = () => {
  const { state, dispatch } = useTournament();
  const { totalPrizePool, settings, players } = state;
  const { payoutStructure } = settings;
  
  const [payouts, setPayouts] = useState<{ position: number; percentage: number; amount: number }[]>([]);
  const [houseFeeType, setHouseFeeType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [houseFeeValue, setHouseFeeValue] = useState<number>(0);
  const [houseCut, setHouseCut] = useState<number>(0);
  const [netPrizePool, setNetPrizePool] = useState<number>(totalPrizePool);
  
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
      houseFeeType,
      houseFeeValue,
      payoutPlaces
    });
    
    setPayouts(result.payoutDetails);
    setHouseCut(result.houseCut);
    setNetPrizePool(result.netPrizePool);
  }, [totalPrizePool, settings, players, payoutStructure, houseFeeType, houseFeeValue]);
  
  const handleHouseFeeTypeChange = (value: string) => {
    setHouseFeeType(value as 'none' | 'percentage' | 'fixed');
  };
  
  const handleHouseFeeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setHouseFeeValue(isNaN(value) ? 0 : value);
  };
  
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-lg font-bold">
                  Gross Prize Pool: ${totalPrizePool}
                </div>
                <div className="text-muted-foreground text-sm">
                  Before house fee
                </div>
              </div>
              
              <div>
                <div className="text-lg font-bold">
                  Net Prize Pool: ${netPrizePool}
                </div>
                <div className="text-muted-foreground text-sm">
                  After house fee
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md mb-4">
              <Label className="text-sm mb-1 block">House Fee</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={houseFeeType} onValueChange={handleHouseFeeTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Fee Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Fee</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                {houseFeeType !== 'none' && (
                  <Input
                    type="number"
                    min="0"
                    value={houseFeeValue || ''}
                    onChange={handleHouseFeeValueChange}
                    placeholder={houseFeeType === 'percentage' ? "e.g. 10%" : "e.g. $50"}
                  />
                )}
              </div>
              
              {houseFeeType !== 'none' && houseCut > 0 && (
                <div className="mt-2 text-sm">
                  House takes: ${houseCut} {houseFeeType === 'percentage' && `(${houseFeeValue}%)`}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 font-semibold text-sm border-b pb-2">
                <div className="col-span-1">Place</div>
                <div className="col-span-7">Position</div>
                <div className="col-span-2 text-right">%</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              
              {payouts.map((payout) => (
                <div key={payout.position} className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/30 rounded-md">
                  <div className="col-span-1">
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
                  </div>
                  <div className="col-span-7">
                    {payout.position === 1 
                      ? "1st Place" 
                      : payout.position === 2 
                        ? "2nd Place" 
                        : payout.position === 3 
                          ? "3rd Place" 
                          : `${payout.position}th Place`}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {payout.percentage}%
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    ${payout.amount}
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
