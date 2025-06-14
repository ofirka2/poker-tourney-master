import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign } from "lucide-react";
import { TournamentLevel } from '@/types/types'; // Assuming TournamentLevel type is needed for max level

interface BuyInSettingsCardProps {
  buyInAmount: number;
  setBuyInAmount: (amount: number) => void;
  allowRebuy: boolean;
  setAllowRebuy: (checked: boolean) => void;
  rebuyAmount: number;
  setRebuyAmount: (amount: number) => void;
  maxRebuys: number;
  setMaxRebuys: (count: number) => void;
  lastRebuyLevel: number;
  setLastRebuyLevel: (level: number) => void;
  allowAddon: boolean;
  setAllowAddon: (checked: boolean) => void;
  addOnAmount: number;
  setAddOnAmount: (amount: number) => void;
  maxAddOns: number;
  setMaxAddOns: (count: number) => void;
  lastAddOnLevel: number;
  setLastAddOnLevel: (level: number) => void;
  includeAnte: boolean;
  setIncludeAnte: (checked: boolean) => void;
  levelsCount: number; // Pass the number of levels to determine max level inputs
}

const BuyInSettingsCard: React.FC<BuyInSettingsCardProps> = ({
  buyInAmount,
  setBuyInAmount,
  allowRebuy,
  setAllowRebuy,
  rebuyAmount,
  setRebuyAmount,
  maxRebuys,
  setMaxRebuys,
  lastRebuyLevel,
  setLastRebuyLevel,
  allowAddon,
  setAllowAddon,
  addOnAmount,
  setAddOnAmount,
  maxAddOns,
  setMaxAddOns,
  lastAddOnLevel,
  setLastAddOnLevel,
  includeAnte,
  setIncludeAnte,
  levelsCount,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Buy-in Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyInAmount">Buy-in Amount ($)</Label>
          <Input
            id="buyInAmount"
            type="number"
            value={buyInAmount}
            onChange={(e) => setBuyInAmount(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="allowRebuy"
            checked={allowRebuy}
            onCheckedChange={(checked) => setAllowRebuy(!!checked)}
          />
          <Label htmlFor="allowRebuy">Allow Rebuys</Label>
        </div>

        {allowRebuy && (
          <>
            <div className="space-y-2">
              <Label htmlFor="rebuyAmount">Rebuy Amount ($)</Label>
              <Input
                id="rebuyAmount"
                type="number"
                value={rebuyAmount}
                onChange={(e) => setRebuyAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRebuys">Max Rebuys Per Player</Label>
              <Input
                id="maxRebuys"
                type="number"
                value={maxRebuys}
                onChange={(e) => setMaxRebuys(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastRebuyLevel">Last Rebuy Level</Label>
              <Input
                id="lastRebuyLevel"
                type="number"
                min="0"
                max={levelsCount > 0 ? levelsCount : 1}
                value={lastRebuyLevel}
                onChange={(e) =>
                  setLastRebuyLevel(Math.max(0, Math.min(levelsCount, Number(e.target.value))))
                }
              />
              <p className="text-xs text-muted-foreground">Level to end rebuys (e.g., 1 means rebuys end *after* Level 1)</p>
            </div>
          </>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="allowAddon"
            checked={allowAddon}
            onCheckedChange={(checked) => setAllowAddon(!!checked)}
          />
          <Label htmlFor="allowAddon">Allow Add-ons</Label>
        </div>

        {allowAddon && (
          <>
            <div className="space-y-2">
              <Label htmlFor="addOnAmount">Add-on Amount ($)</Label>
              <Input
                id="addOnAmount"
                type="number"
                value={addOnAmount}
                onChange={(e) => setAddOnAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAddOns">Max Add-ons Per Player</Label>
              <Input
                id="maxAddOns"
                type="number"
                value={maxAddOns}
                onChange={(e) => setMaxAddOns(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastAddOnLevel">Last Add-on Level</Label>
              <Input
                id="lastAddOnLevel"
                type="number"
                min="0"
                 max={levelsCount > 0 ? levelsCount : 1}
                value={lastAddOnLevel}
                onChange={(e) =>
                  setLastAddOnLevel(Math.max(0, Math.min(levelsCount, Number(e.target.value))))
                }
              />
              <p className="text-xs text-muted-foreground">Level to end add-ons (e.g., 4 means add-ons end *after* Level 4)</p>
            </div>
          </>
        )}

        {/* Include Ante checkbox remains here as it's tied to buy-in/structure options */}
         <div className="flex items-center space-x-2 pt-2">
           <Checkbox
             id="includeAnte"
             checked={includeAnte}
             onCheckedChange={(checked) => setIncludeAnte(!!checked)}
           />
           <Label htmlFor="includeAnte">Include Ante in blind structure</Label>
         </div>

      </CardContent>
    </Card>
  );
};

export default BuyInSettingsCard;
