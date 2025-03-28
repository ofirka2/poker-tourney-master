
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTournament } from '@/context/TournamentContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chipsetOptions = [
  { value: '25,100,500,1000,5000', label: '25, 100, 500, 1000, 5000' },
  { value: '25,50,100,500,1000', label: '25, 50, 100, 500, 1000' },
  { value: '5,25,100,500,1000', label: '5, 25, 100, 500, 1000' },
  { value: '1,2,5,10,25,50', label: '1, 2, 5, 10, 25, 50' },
  { value: 'custom', label: 'Custom Chipset...' }
];

const formatOptions = [
  { value: 'freezeout', label: 'Freezeout' },
  { value: 'rebuy', label: 'Rebuy' },
  { value: 'bounty', label: 'Bounty' },
  { value: 'deepstack', label: 'Deepstack' }
];

interface MultiStepTournamentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTournamentCreated?: () => void;
}

const MultiStepTournamentForm: React.FC<MultiStepTournamentFormProps> = ({ 
  open, 
  onOpenChange,
  onTournamentCreated 
}) => {
  const navigate = useNavigate();
  const { dispatch } = useTournament();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    playerCount: 9,
    desiredDuration: 4, // In hours now
    allowRebuy: true,
    allowAddon: true,
    format: 'rebuy',
    chipset: '25,100,500,1000,5000',
    startingStack: 10000,
    lastRebuyLevel: 6,
    lastAddonLevel: 6,
    maxRebuys: 2,
    maxAddons: 1
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateBlindLevels = () => {
    const desiredDurationMinutes = formData.desiredDuration * 60; // Convert hours to minutes
    const avgLevelDuration = 20; // minutes
    const numLevels = Math.ceil(desiredDurationMinutes / avgLevelDuration);
    
    // Generate blind structure based on desired duration
    const blindLevels = [];
    let smallBlind = 25;
    let bigBlind = 50;
    let ante = 0;
    
    for (let i = 1; i <= numLevels; i++) {
      // Add a break every 4 levels
      if (i > 1 && i % 4 === 0) {
        blindLevels.push({
          level: i,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: 15,
          isBreak: true
        });
      } else {
        blindLevels.push({
          level: i,
          smallBlind,
          bigBlind,
          ante: i > 3 ? ante : 0, // Start adding antes after level 3
          duration: 20,
          isBreak: false
        });
        
        // Increase blinds for next level
        if (i % 2 === 0) {
          smallBlind = Math.round(smallBlind * 1.5);
          bigBlind = smallBlind * 2;
          if (i > 3) {
            ante = Math.round(bigBlind * 0.1); // Ante is typically 10% of big blind
          }
        }
      }
    }
    
    return blindLevels;
  };

  const handleCreate = async () => {
    try {
      const blindLevels = generateBlindLevels();
      
      // Create tournament in Supabase
      const { data, error } = await supabase.from('tournaments').insert({
        name: formData.name,
        start_date: formData.startDate,
        status: 'Not Started',
        no_of_players: formData.playerCount,
        desired_duration: formData.desiredDuration * 60, // Convert hours to minutes for database
        allow_rebuy: formData.allowRebuy,
        allow_addon: formData.allowAddon,
        format: formData.format,
        starting_chips: formData.startingStack,
        chipset: formData.chipset,
        blind_levels: blindLevels,
        buy_in: 100, // Default values
        rebuy_amount: 100,
        addon_amount: 100
      }).select().single();

      if (error) {
        toast.error('Error creating tournament: ' + error.message);
        console.error('Error creating tournament:', error);
        return;
      }

      // Dispatch to context
      dispatch({ 
        type: 'CREATE_TOURNAMENT', 
        payload: {
          name: formData.name,
          startDate: formData.startDate,
          settings: {
            buyInAmount: 100,
            rebuyAmount: 100,
            addOnAmount: 100,
            initialChips: formData.startingStack,
            rebuyChips: formData.startingStack,
            addOnChips: formData.startingStack,
            maxRebuys: formData.maxRebuys,
            maxAddOns: formData.maxAddons,
            lastRebuyLevel: formData.lastRebuyLevel,
            lastAddOnLevel: formData.lastAddonLevel,
            levels: blindLevels,
            payoutStructure: {
              places: [
                { position: 1, percentage: 50 },
                { position: 2, percentage: 30 },
                { position: 3, percentage: 20 },
              ]
            }
          }
        }
      });
      
      toast.success('Tournament created successfully!');
      onOpenChange(false);
      
      // Navigate to setup page
      navigate('/setup');
    } catch (err) {
      console.error('Error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
        </DialogHeader>

        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="step-1" disabled={currentStep !== 1}>
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="step-2" disabled={currentStep !== 2}>
              Tournament Details
            </TabsTrigger>
            <TabsTrigger value="step-3" disabled={currentStep !== 3}>
              Chip Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step-1" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter tournament name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleNextStep}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="step-2" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="playerCount">Number of Players</Label>
                <Input
                  id="playerCount"
                  name="playerCount"
                  type="number"
                  min="2"
                  max="100"
                  value={formData.playerCount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desiredDuration">Desired Duration (hours)</Label>
                <Input
                  id="desiredDuration"
                  name="desiredDuration"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.desiredDuration}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  Approximate tournament length (used to generate blind structure)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowRebuy"
                  name="allowRebuy"
                  checked={formData.allowRebuy}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, allowRebuy: !!checked})
                  }
                />
                <Label htmlFor="allowRebuy">Allow Rebuys</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowAddon"
                  name="allowAddon"
                  checked={formData.allowAddon}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, allowAddon: !!checked})
                  }
                />
                <Label htmlFor="allowAddon">Allow Add-ons</Label>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Back
              </Button>
              <Button onClick={handleNextStep}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="step-3" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="format">Tournament Format</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => handleSelectChange('format', value)}
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="chipset">Chipset</Label>
                <Select
                  value={formData.chipset}
                  onValueChange={(value) => handleSelectChange('chipset', value)}
                >
                  <SelectTrigger>
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startingStack">Starting Stack</Label>
                <Input
                  id="startingStack"
                  name="startingStack"
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.startingStack}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Back
              </Button>
              <Button onClick={handleCreate}>Create Tournament</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepTournamentForm;
