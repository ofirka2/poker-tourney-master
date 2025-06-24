import React, { useState, useEffect } from 'react';
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
import { ENV, chipsets } from '@/config/env';
import { calculateInitialStack } from '@/utils/stackCalculator';
import { generateDynamicBlinds, roundToPokerChips } from '@/utils/blindStructureGenerator'; 

const formatOptions = [
  { value: 'freezeout', label: 'Freezeout' },
  { value: 'rebuy', label: 'Rebuy' },
  { value: 'bounty', label: 'Bounty' },
  { value: 'deepstack', label: 'Deepstack' },
  { value: 'turbo', label: 'Turbo' },
  { value: 'hyper', label: 'Hyper-Turbo' }
];

// Define custom chipset option
const customChipsetOption = { value: 'custom', label: 'Custom Chipset' };

/**
 * Interface for the properties of the MultiStepTournamentForm component.
 */
interface MultiStepTournamentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTournamentCreated?: (tournamentData: { id: string }) => void; // Updated callback signature
}

/**
 * Interface for the form data collected during tournament creation.
 */
interface TournamentFormData {
  name: string;
  startDate: string;
  playerCount: number;
  desiredDuration: number;
  allowRebuy: boolean;
  allowAddon: boolean;
  format: string;
  chipset: string;
  customChipset: string;
  startingStack: number;
  smallBlind: number;
  bigBlind: number;
  buyIn: number;
  includeAnte: boolean;
}

/**
 * Converts a chipset string to an array of numbers.
 * @param {string} chipsetString - Comma-separated string of chip values.
 * @returns {number[]} Array of chip denominations.
 */
const parseChipset = (chipsetString: string): number[] => {
  try {
    return chipsetString.split(',')
      .map(value => parseInt(value.trim()))
      .filter(val => !isNaN(val));
  } catch (error) {
    console.error('Error parsing chipset:', error);
    return [];
  }
};

/**
 * MultiStepTournamentForm component.
 * @param {MultiStepTournamentFormProps} props - The component props.
 * @returns {JSX.Element}
 */
const MultiStepTournamentForm: React.FC<MultiStepTournamentFormProps> = ({
  open,
  onOpenChange,
  onTournamentCreated
}) => {
  const navigate = useNavigate();
  const { dispatch } = useTournament();
  const [currentStep, setCurrentStep] = useState(1);

  // Create full chipset options array (ensuring no duplicates)
  const allChipsetOptions = [...chipsets];

  // Check if "Custom Chipset" is already in the options
  if (!allChipsetOptions.some(option => option.value === 'custom')) {
    allChipsetOptions.push(customChipsetOption);
  }

  // Use default values
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    playerCount: ENV.PLAYER_COUNT,
    desiredDuration: ENV.DESIRED_DURATION,
    allowRebuy: ENV.ALLOW_REBUY,
    allowAddon: ENV.ALLOW_ADDON,
    format: 'rebuy',
    chipset: ENV.CHIPSET,
    customChipset: '',
    startingStack: 10000, // Will be updated in useEffect
    smallBlind: 25,      // Will be updated in useEffect
    bigBlind: 50,        // Will be updated in useEffect
    buyIn: ENV.BUY_IN_AMOUNT,
    includeAnte: false,
  });

  // Update the starting stack whenever the format, chipset, or duration changes
  useEffect(() => {
    try {
      // Determine which chipset to use
      const chipsetToUse = formData.chipset === 'custom' ? formData.customChipset : formData.chipset;

      // Parse the chipset string into an array of numbers
      const chipsetArray = parseChipset(chipsetToUse);

      if (chipsetArray.length > 0) {
        const result = calculateInitialStack(
          chipsetArray,
          formData.format,
          formData.desiredDuration
        );

        console.log('Calculated stack values:', result,
            'from chipset:', chipsetArray,
            'format:', formData.format,
            'duration:', formData.desiredDuration);

        if (result) {
          setFormData(prev => ({
            ...prev,
            startingStack: result.startingStack,
            smallBlind: result.smallBlind,
            bigBlind: result.bigBlind
          }));
        }
      }
    } catch (error) {
      console.error('Error calculating stack:', error);
    }
  }, [formData.chipset, formData.customChipset, formData.format, formData.desiredDuration]);

  /**
   * Handles changes to input fields in the form.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLCheckBoxElement>} e - The input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  /**
   * Handles changes to select fields in the form.
   * @param {string} name - The name of the select field.
   * @param {string} value - The selected value.
   */
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Stack will be updated by the useEffect
  };

  /**
   * Navigates to the next step in the form.
   */
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Navigates to the previous step in the form.
   */
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Generates a blind structure based on the tournament settings.
   * Uses the dynamic blind generator.
   * @returns {Array<object>} An array of blind level objects.
   */
  const generateBlindLevels = () => {
    // Convert hours to minutes
    const desiredDurationMinutes = formData.desiredDuration * 60;

    // Parse the chipset
    let chipsetToUse = formData.chipset === 'custom' ? formData.customChipset : formData.chipset;
    const chipsetArray = parseChipset(chipsetToUse);

    // Use default blind progression if no chipset is provided
    if (!chipsetArray.length) {
      // Fallback to generating based on calculated blinds if chipset is invalid
      // This fallback uses a simpler, fixed progression if dynamic generation fails
      const defaultLevels = [];
      let sb = formData.smallBlind;
      let bb = formData.bigBlind;
      let ante = formData.includeAnte ? Math.round(bb * 0.1) : 0;
      const levelDuration = 20; // Default level duration for fallback
      const numLevels = Math.ceil(desiredDurationMinutes / levelDuration); // Recalculate levels for fallback

      for (let i = 1; i <= numLevels; i++) {
        // Add a break every 4 levels for default fallback
        if (i > 1 && i % 4 === 0) {
          defaultLevels.push({
            level: i,
            smallBlind: 0,
            bigBlind: 0,
            ante: 0,
            duration: 15,
            isBreak: true
          });
        } else {
          defaultLevels.push({
            level: i,
            smallBlind: roundToPokerChips(sb),
            bigBlind: roundToPokerChips(bb),
            ante: formData.includeAnte && i >= 4 ? roundToPokerChips(ante) : 0,
            duration: levelDuration,
            isBreak: false
          });

          // Simple blind increase for fallback
          if (i < numLevels) {
            sb = Math.round(sb * 1.5);
            bb = sb * 2;
            if (formData.includeAnte && i >= 3) {
              ante = Math.round(bb * 0.1);
            }
          }
        }
      }
      return defaultLevels;
    }


    // Map the format to the generator format
    let generatorFormat;
    switch (formData.format.toLowerCase()) {
      case 'freezeout':
        generatorFormat = 'standard';
        break;
      case 'deepstack':
        generatorFormat = 'deepstack';
        break;
      case 'turbo':
        generatorFormat = 'turbo';
        break;
      case 'hyper':
      case 'hyperturbo':
        generatorFormat = 'hyper';
        break;
      case 'rebuy':
      case 'bounty':
      default:
        generatorFormat = 'standard';
    }

    // Use the dynamic blind generator
    return generateDynamicBlinds(
      formData.playerCount,
      formData.startingStack,
      desiredDurationMinutes,
      {
        levelDurationMinutes: 20, // Base level duration
        tournamentFormat: generatorFormat,
        chipset: chipsetArray,
        anteStartLevel: formData.includeAnte ? 4 : 999, // Start antes at level 4 if enabled, otherwise disable effectively
        breakIntervalLevels: 4, // Break every 4 levels
        blindIncreaseFactor: formData.format === 'deepstack' ? 1.3 :
                           formData.format === 'turbo' ? 1.7 :
                           formData.format === 'hyper' ? 2.0 :
                           1.5, // Default increase factor
        rebuyAddonFactor: formData.allowRebuy || formData.allowAddon ? 1.3 : 1.0,
        includeAnte: formData.includeAnte // Pass includeAnte flag
      }
    );
  };


  /**
   * Handles the creation of a new tournament.
   * Saves the tournament data to Supabase and dispatches an action to the context.
   */
  const handleCreate = async () => {
    try {
      // Determine which chipset to use for the final tournament
      const finalChipset = formData.chipset === 'custom' ? formData.customChipset : formData.chipset;

      // Generate the blind levels
      const blindLevels = generateBlindLevels();

      // Create tournament in Supabase
      const { data, error } = await supabase.from('tournaments').insert({
        name: formData.name,
        start_date: formData.startDate,
        status: 'Not Started',
        no_of_players: formData.playerCount,
        desired_duration: formData.desiredDuration * 60,
        allow_rebuy: formData.allowRebuy,
        allow_addon: formData.allowAddon,
        format: formData.format,
        starting_chips: formData.startingStack,
        chipset: finalChipset,
        blind_levels: JSON.stringify(blindLevels),
        buy_in: formData.buyIn,
        include_ante: formData.includeAnte,
        // Add other settings properties to save to DB if needed
        // max_rebuys: settings.maxRebuys, // Assuming these are part of settings in context
        // max_addons: settings.maxAddOns,
        // last_rebuy_level: settings.lastRebuyLevel,
        // last_addon_level: settings.lastAddOnLevel,
      }).select().single(); // Use select().single() to get the inserted row data

      if (error) {
        toast.error('Error creating tournament: ' + error.message);
        console.error('Error creating tournament:', error);
        return;
      }

      // Dispatch to context (optional, depends on context design)
      // If context manages the *active* tournament, you might dispatch LOAD_TOURNAMENT
      // If context only manages settings defaults, this dispatch might need adjustment
      dispatch({
        type: 'CREATE_TOURNAMENT', // Or 'LOAD_TOURNAMENT' if context should load the new one
        payload: {
          id: data.id, // Make sure the ID from the DB is included
          name: formData.name,
          startDate: formData.startDate,
          settings: { // Include settings based on form data
             buyInAmount: formData.buyIn,
             initialChips: formData.startingStack,
             smallBlind: formData.smallBlind, // Initial blinds from form/calculation
             bigBlind: formData.bigBlind, // Initial blinds from form/calculation
             levels: blindLevels, // Generated levels
             payoutStructure: { // Default payout structure
               places: [
                 { position: 1, percentage: 50 },
                 { position: 2, percentage: 30 },
                 { position: 3, percentage: 20 },
               ]
             },
             // Include other settings properties from form data
             rebuyAmount: 0, // Form doesn't collect these, set defaults or get from ENV/settings
             addOnAmount: 0,
             maxRebuys: 0,
             maxAddOns: 0,
             lastRebuyLevel: 0,
             lastAddOnLevel: 0,
             allowRebuy: formData.allowRebuy,
             allowAddon: formData.allowAddon,
             includeAnte: formData.includeAnte,
             playerCount: formData.playerCount,
             chipset: finalChipset,
             format: formData.format,
             desiredDuration: formData.desiredDuration, // Store desired duration in settings
             rebuyChips: formData.startingStack, // Default rebuy chips to starting stack
             addOnChips: formData.startingStack, // Default addon chips to starting stack
             houseFeeType: 'none' as const,
             houseFeeValue: 0,
          },
          chipset: finalChipset, // Redundant if in settings, but kept for consistency
          format: formData.format, // Redundant if in settings
          allowRebuy: formData.allowRebuy,
          allowAddon: formData.allowAddon,
          playerCount: formData.playerCount,
          desiredDuration: formData.desiredDuration,
          includeAnte: formData.includeAnte,
          // ... add other top-level tournament properties if your state shape requires it
        }
      });

      toast.success('Tournament created successfully!');
      onOpenChange(false); // Close the dialog

      // Call the callback with the tournament data including the ID
      if (onTournamentCreated) {
        onTournamentCreated({ id: data.id });
      } else {
        // Fallback navigation if no callback is provided
        navigate(`/tournaments/${data.id}/setup`, { replace: true });
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  // Update starting stack when form is first mounted
  useEffect(() => {
    try {
      const initialChipsetArray = parseChipset(ENV.CHIPSET);
      if (initialChipsetArray.length > 0) {
        const result = calculateInitialStack(
          initialChipsetArray,
          'rebuy', // Use a default format for initial calculation
          ENV.DESIRED_DURATION
        );

        if (result) {
          setFormData(prev => ({
            ...prev,
            startingStack: result.startingStack,
            smallBlind: result.smallBlind,
            bigBlind: result.bigBlind
          }));
        }
      }
    } catch (error) {
      console.error('Error calculating initial stack on mount:', error);
    }
  }, []); // Empty dependency array means this runs once on mount

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
                  min="0.5" // Changed min duration to 0.5 based on TournamentSetup
                  max="24" // Changed max duration to 24 based on TournamentSetup
                  step="0.5"
                  value={formData.desiredDuration}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Approximate tournament length (used to generate blind structure)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="buyIn">Buy-in Amount</Label>
                <Input
                  id="buyIn"
                  name="buyIn"
                  type="number"
                  min="0"
                  value={formData.buyIn !== null ? formData.buyIn.toString() : ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowRebuy"
                  name="allowRebuy"
                  checked={formData.allowRebuy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowRebuy: !!checked })
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
                    setFormData({ ...formData, allowAddon: !!checked })
                  }
                />
                <Label htmlFor="allowAddon">Allow Add-ons</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAnte"
                  name="includeAnte"
                  checked={formData.includeAnte}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, includeAnte: !!checked })
                  }
                />
                <Label htmlFor="includeAnte">Include Ante</Label>
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
                    {allChipsetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formData.chipset === 'custom' && (
                  <div className="mt-2">
                    <Label htmlFor="customChipset">Custom Chipset Values</Label>
                    <Input
                      id="customChipset"
                      name="customChipset"
                      placeholder="Enter values separated by commas (e.g., 1,2,5,10,25,50)"
                      value={formData.customChipset}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter chip denominations separated by commas
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  Starting stack and blinds will update based on chipset and format
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startingStack">Starting Stack</Label>
                  <Input
                    id="startingStack"
                    name="startingStack"
                    type="number"
                    min="100"
                    step="100"
                    value={formData.startingStack.toString()}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="blinds">Initial Blinds</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="bg-muted rounded px-2 py-1 text-sm">
                      SB: {formData.smallBlind}
                    </div>
                    <div className="bg-muted rounded px-2 py-1 text-sm">
                      BB: {formData.bigBlind}
                    </div>
                  </div>
                </div>
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