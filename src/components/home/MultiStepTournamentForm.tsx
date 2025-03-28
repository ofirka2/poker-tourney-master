
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Dices, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";

const chipsetOptions = [
  { value: '25,100,500,1000,5000', label: '25, 100, 500, 1000, 5000' },
  { value: '25,50,100,500,1000', label: '25, 50, 100, 500, 1000' },
  { value: '5,25,100,500,1000', label: '5, 25, 100, 500, 1000' },
  { value: '1,2,5,10,25,50', label: '1, 2, 5, 10, 25, 50' },
  { value: 'custom', label: 'Custom Chipset...' },
];

const formatOptions = [
  { value: 'Freezeout', label: 'Freezeout' },
  { value: 'Rebuy', label: 'Rebuy' },
  { value: 'Bounty', label: 'Bounty' },
  { value: 'Deepstack', label: 'Deepstack' },
];

interface MultiStepTournamentFormProps {
  onFinish: () => void;
}

export const MultiStepTournamentForm: React.FC<MultiStepTournamentFormProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date(),
    playerCount: 9,
    desiredDuration: 3,
    allowRebuy: false,
    allowAddon: false,
    format: 'Freezeout',
    chipset: '25,100,500,1000,5000',
    customChipset: '',
    startingStack: 10000,
  });
  const { dispatch } = useTournament();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const generateBlindLevels = (playerCount: number, desiredDuration: number, startingStack: number) => {
    // Simple algorithm to generate blind levels based on duration and player count
    // This is a simplified version and can be improved
    const avgHandsPerHour = 30;
    const expectedHands = (playerCount * desiredDuration * avgHandsPerHour) / 9;
    
    // Start with small blind as 1/200 of starting stack
    const initialSmallBlind = Math.max(Math.floor(startingStack / 200), 25);
    const levelCount = Math.ceil(desiredDuration * 3); // Approximately 20 min levels
    
    const levels = [];
    let currentSmallBlind = initialSmallBlind;
    let currentBigBlind = initialSmallBlind * 2;
    let currentAnte = 0;
    
    // Generate regular levels
    for (let i = 1; i <= levelCount; i++) {
      levels.push({
        level: i,
        smallBlind: currentSmallBlind,
        bigBlind: currentBigBlind,
        ante: currentAnte,
        duration: 20,
        isBreak: false,
      });
      
      // Add a break every 3 levels
      if (i % 3 === 0 && i < levelCount) {
        levels.push({
          level: i + 1,
          smallBlind: currentSmallBlind,
          bigBlind: currentBigBlind,
          ante: currentAnte,
          duration: 15,
          isBreak: true,
        });
        i++;
      }
      
      // Increase blinds
      if (i < 3) {
        // Slower increase in early levels
        currentSmallBlind = Math.floor(currentSmallBlind * 1.5);
      } else if (i < 6) {
        // Standard increase in mid levels
        currentSmallBlind = currentSmallBlind * 2;
      } else {
        // Faster increase in later levels
        currentSmallBlind = Math.floor(currentSmallBlind * 2.5);
      }
      
      currentBigBlind = currentSmallBlind * 2;
      
      // Add ante from level 3
      if (i >= 3) {
        currentAnte = Math.floor(currentSmallBlind / 4);
      }
    }
    
    return levels;
  };

  const handleCreateTournament = async () => {
    try {
      setIsSubmitting(true);
      
      const { name, startDate, playerCount, desiredDuration, allowRebuy, allowAddon, format, chipset, customChipset, startingStack } = formData;
      const selectedChipset = chipset === 'custom' ? customChipset : chipset;
      
      // Generate blind levels
      const blindLevels = generateBlindLevels(playerCount, desiredDuration, startingStack);
      
      // Create tournament in Supabase
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name,
          status: 'Not Started',
          start_date: startDate.toISOString(),
          no_of_players: playerCount,
          desired_duration: desiredDuration,
          allow_rebuy: allowRebuy,
          allow_addon: allowAddon,
          format,
          starting_chips: startingStack,
          chipset: selectedChipset,
          blind_levels: JSON.stringify(blindLevels)
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Update tournament context
      dispatch({
        type: 'CREATE_TOURNAMENT',
        payload: {
          id: data.id,
          name,
          settings: {
            buyInAmount: 0,
            rebuyAmount: 0,
            addOnAmount: 0,
            initialChips: startingStack,
            rebuyChips: 0,
            addOnChips: 0,
            maxRebuys: 0,
            maxAddOns: 0,
            lastRebuyLevel: 0,
            lastAddOnLevel: 0,
            levels: blindLevels,
            payoutStructure: {
              places: []
            }
          },
          players: [],
          tables: [],
          status: 'Not Started',
          startDate: startDate.toISOString(),
          endDate: null,
          allowRebuy,
          allowAddon,
          format,
          chipset: selectedChipset,
          desiredDuration,
          noOfPlayers: playerCount
        }
      });
      
      toast.success('Tournament created successfully');
      onFinish();
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Tournament</DialogTitle>
        <DialogDescription>
          {step === 1 && "Enter tournament name and start date"}
          {step === 2 && "Configure player count and tournament options"}
          {step === 3 && "Set format and starting chips"}
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Weekly Poker Night"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => updateFormData('startDate', date || new Date())}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerCount">Number of Players</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="playerCount"
                  type="number"
                  min="2"
                  max="100"
                  value={formData.playerCount}
                  onChange={(e) => updateFormData('playerCount', parseInt(e.target.value) || 9)}
                />
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Desired Duration (hours)</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1 hour</span>
                  <span className="text-sm text-muted-foreground">8+ hours</span>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[formData.desiredDuration]}
                    min={1}
                    max={8}
                    step={0.5}
                    onValueChange={(value) => updateFormData('desiredDuration', value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">
                    {formData.desiredDuration} h
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowRebuy"
                  checked={formData.allowRebuy}
                  onCheckedChange={(checked) => updateFormData('allowRebuy', checked)}
                />
                <Label htmlFor="allowRebuy">Allow Rebuy</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowAddon"
                  checked={formData.allowAddon}
                  onCheckedChange={(checked) => updateFormData('allowAddon', checked)}
                />
                <Label htmlFor="allowAddon">Allow Add-on</Label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format">Tournament Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => updateFormData('format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chipset">Chipset</Label>
              <Select
                value={formData.chipset}
                onValueChange={(value) => updateFormData('chipset', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Chipset" />
                </SelectTrigger>
                <SelectContent>
                  {chipsetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.chipset === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customChipset">Custom Chipset</Label>
                <Input
                  id="customChipset"
                  value={formData.customChipset}
                  onChange={(e) => updateFormData('customChipset', e.target.value)}
                  placeholder="e.g. 25,50,100,500,1000"
                />
                <p className="text-sm text-muted-foreground">Enter chip values separated by commas</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="startingStack">Starting Stack</Label>
                <span className="text-sm text-muted-foreground">{formData.startingStack.toLocaleString()} chips</span>
              </div>
              <Input
                id="startingStack"
                type="number"
                min="1000"
                step="1000"
                value={formData.startingStack}
                onChange={(e) => updateFormData('startingStack', parseInt(e.target.value) || 10000)}
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <div className="flex justify-between w-full">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 && !formData.name}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreateTournament} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  );
};
