import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote } from "lucide-react";

interface ChipSettingsCardProps {
  chipset: string;
  handleChipsetChange: (value: string) => void;
  isCustomChipset: boolean;
  handleCustomChipsetChange: (value: string) => void;
  initialChips: number;
  handleInitialChipsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  smallBlind: number;
  bigBlind: number;
  allowRebuy: boolean;
  rebuyChips: number;
  handleRebuyChipsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allowAddon: boolean;
  addOnChips: number;
  handleAddOnChipsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const chipsetOptions = [
  { value: "25,100,500,1000,5000", label: "25, 100, 500, 1000, 5000" },
  { value: "25,50,100,500,1000", label: "25, 50, 100, 500, 1000" },
  { value: "5,25,100,500,1000", label: "5, 25, 100, 500, 1000" },
  { value: "1,2,5,10,25,50", label: "1, 2, 5, 10, 25, 50" },
  { value: "custom", label: "Custom Chipset..." },
];

const ChipSettingsCard: React.FC<ChipSettingsCardProps> = ({
  chipset,
  handleChipsetChange,
  isCustomChipset,
  handleCustomChipsetChange,
  initialChips,
  handleInitialChipsChange,
  smallBlind,
  bigBlind,
  allowRebuy,
  rebuyChips,
  handleRebuyChipsChange,
  allowAddon,
  addOnChips,
  handleAddOnChipsChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Banknote className="mr-2 h-5 w-5" />
          Chip Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chipset">Chipset</Label>
          <Select
            value={isCustomChipset ? "custom" : chipset}
            onValueChange={handleChipsetChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select chipset" />
            </SelectTrigger>
            <SelectContent>
              {chipsetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCustomChipset && (
            <div className="mt-2">
              <Input
                id="customChipset"
                value={chipset}
                onChange={(e) =>
                  handleCustomChipsetChange(e.target.value)
                }
                placeholder="Enter comma-separated chip values (e.g., 25,100,500,1000,5000)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter comma-separated chip values
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialChips">Initial Chips</Label>
          <Input
            id="initialChips"
            type="number"
            value={initialChips}
            onChange={handleInitialChipsChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Initial Small Blind</Label>
            <div className="bg-muted rounded px-2 py-1 text-sm">
              {smallBlind || 0}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Initial Big Blind</Label>
            <div className="bg-muted rounded px-2 py-1 text-sm">
              {bigBlind || 0}
            </div>
          </div>
        </div>

        {allowRebuy && (
          <div className="space-y-2">
            <Label htmlFor="rebuyChips">Rebuy Chips</Label>
            <Input
              id="rebuyChips"
              type="number"
              value={rebuyChips}
              onChange={handleRebuyChipsChange}
            />
          </div>
        )}

        {allowAddon && (
          <div className="space-y-2">
            <Label htmlFor="addOnChips">Add-on Chips</Label>
            <Input
              id="addOnChips"
              type="number"
              value={addOnChips}
              onChange={handleAddOnChipsChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChipSettingsCard;
