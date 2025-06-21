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
// Removed Button and Wand2 imports as the button is removed
import { Wand2 } from "lucide-react"; // Keep Wand2 for the card title icon

interface TournamentParametersCardProps {
  tournamentFormat: string;
  handleFormatChange: (value: string) => void;
  playerCount: number;
  handlePlayerCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  durationHours: number;
  handleDurationHoursChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Removed handleGenerateBlindStructure and canGenerateBlinds props
  // handleGenerateBlindStructure: () => void;
  // canGenerateBlinds: boolean;
}

const formatOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'freezeout', label: 'Freezeout' },
  { value: 'rebuy', label: 'Rebuy' },
  { value: 'turbo', label: 'Turbo' },
  { value: 'hyper', label: 'Hyper Turbo' },
  { value: 'deepstack', label: 'Deepstack' },
  { value: 'bounty', label: 'Bounty' }
];

const TournamentParametersCard: React.FC<TournamentParametersCardProps> = ({
  tournamentFormat,
  handleFormatChange,
  playerCount,
  handlePlayerCountChange,
  durationHours,
  handleDurationHoursChange,
  // Removed props
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="mr-2 h-5 w-5" />
          Tournament Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tournamentFormat">Format</Label>
          <Select
            value={tournamentFormat}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Format influences stack sizes, blind intervals, and increase rate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="playerCount">Number of Players</Label>
            <Input
              id="playerCount"
              type="number"
              min="2"
              value={playerCount}
              onChange={handlePlayerCountChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationHours">Tournament Duration (hours)</Label>
            <Input
              id="durationHours"
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={durationHours}
              onChange={handleDurationHoursChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentParametersCard;
