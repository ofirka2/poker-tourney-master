<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from "react";
import { Save, Clock, Wand2, DollarSign, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { PayoutPlace } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import the new components and the custom hook
import BuyInSettingsCard from "@/components/setup/BuyInSettingsCard";
import ChipSettingsCard from "@/components/setup/ChipSettingsCard";
import TournamentParametersCard from "@/components/setup/TournamentParametersCard";
import PayoutStructureSection from "@/components/setup/PayoutStructureSection";
import BlindsSetupTab from "@/components/setup/BlindsSetupTab";
import useBlindStructureLogic from "@/hooks/useBlindStructureLogic";
=======
import React, { useState, useEffect } from "react";
import { 
  Save, Plus, Trash, Clock, DollarSign, 
  Banknote, Percent, ArrowRight, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { TournamentLevel, PayoutPlace } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { generateDynamicBlinds } from "@/utils/blindStructureGenerator";

const chipsetOptions = [
  { value: '25,100,500,1000,5000', label: '25, 100, 500, 1000, 5000' },
  { value: '25,50,100,500,1000', label: '25, 50, 100, 500, 1000' },
  { value: '5,25,100,500,1000', label: '5, 25, 100, 500, 1000' },
  { value: '1,2,5,10,25,50', label: '1, 2, 5, 10, 25, 50' },
  { value: 'custom', label: 'Custom Chipset...' }
];

const formatOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'turbo', label: 'Turbo' },
  { value: 'hyper', label: 'Hyper Turbo' },
  { value: 'deepstack', label: 'Deep Stack' }
];
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061

interface TournamentSetupProps {
  tournamentId?: string | null;
}

<<<<<<< HEAD
const TournamentSetup: React.FC<TournamentSetupProps> = ({ tournamentId }) => {
  const { state, dispatch } = useTournament();
  const { settings, currentLevel } = state;

  // State variables managed directly in TournamentSetup
  const [tournamentName, setTournamentName] = useState(state.name || "");
  // Buy-in/Addon amounts, max addons, and last levels are kept here as they are less core to the blind generation logic itself
  const [buyInAmount, setBuyInAmount] = useState(settings.buyInAmount);
  const [rebuyAmount, setRebuyAmount] = useState(settings.rebuyAmount);
  const [addOnAmount, setAddOnAmount] = useState(settings.addOnAmount);
  const [maxAddOns, setMaxAddOns] = useState(settings.maxAddOns);
  const [lastRebuyLevel, setLastRebuyLevel] = useState(settings.lastRebuyLevel);
  const [lastAddOnLevel, setLastAddOnLevel] = useState(settings.lastAddOnLevel);
  // allowRebuy/allowAddon are also kept here as they affect UI visibility in BuyInSettingsCard
  const [allowRebuy, setAllowRebuy] = useState(settings.allowRebuy ?? true); // Initialize from settings
  const [allowAddon, setAllowAddon] = useState(settings.allowAddon ?? true); // Initialize from settings


  const [payoutPlaces, setPayoutPlaces] = useState<PayoutPlace[]>(
    settings.payoutStructure?.places || []
  );
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // Use the custom hook to manage state and logic related to blind structure generation
  const {
      playerCount,
      setPlayerCount,
      durationHours,
      setDurationHours,
      tournamentFormat,
      setTournamentFormat,
      chipset,
      setChipset,
      handleChipsetChange,
      isCustomChipset,
      handleCustomChipsetChange,
      chipsetValues,
      initialChips,
      setInitialChips,
      handleInitialChipsChange,
      rebuyChips,
      setRebuyChips,
      handleRebuyChipsChange,
      addOnChips,
      setAddOnChips,
      handleAddOnChipsChange,
      smallBlind,
      bigBlind,
      levels,
      setLevels,
      maxRebuys,
      setMaxRebuys,
      includeAnte,
      setIncludeAnte,
      handleGenerateBlindStructure,
      canGenerateBlinds
  } = useBlindStructureLogic({
      initialPlayerCount: settings.playerCount ?? 9,
      initialDurationHours: settings.desiredDuration ?? 4,
      initialTournamentFormat: settings.format ?? "rebuy",
      initialChipset: settings.chipset || "25,100,500,1000,5000",
      initialAllowRebuy: settings.allowRebuy ?? true,
      initialMaxRebuys: settings.maxRebuys ?? 0,
      initialIncludeAnte: settings.includeAnte ?? false,
      initialLevels: settings.levels ?? [],
      initialStartingChips: settings.initialChips ?? 0,
      initialRebuyChips: settings.rebuyChips ?? 0,
      initialAddOnChips: settings.addOnChips ?? 0
  });


  // Load data from database on initial load
  useEffect(() => {
    const loadTournamentData = async () => {
      if (tournamentId) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("tournaments")
            .select("*")
            .eq("id", tournamentId)
            .single();

          if (error) throw error;

          if (data) {
            // Update state variables managed directly in TournamentSetup
            setTournamentName(data.name || "");
            setBuyInAmount(data.buy_in || settings.buyInAmount);
            setRebuyAmount(data.rebuy_amount || settings.rebuyAmount);
            setAddOnAmount(data.addon_amount || settings.addOnAmount);
            setMaxAddOns(data.max_addons || settings.maxAddOns);
            setLastRebuyLevel(data.last_rebuy_level || settings.lastRebuyLevel);
            setLastAddOnLevel(data.last_addon_level || settings.lastAddOnLevel);
            setAllowRebuy(data.allow_rebuy !== undefined ? data.allow_rebuy : true);
            setAllowAddon(data.allow_addon !== undefined ? data.allow_addon : true);

            // Update state variables managed by the hook using their setters
            setPlayerCount(data.player_count || 9);
            setDurationHours(data.duration_hours || 4);
            setTournamentFormat(data.format || "rebuy");
            setChipset(data.chipset || "25,100,500,1000,5000");
            setInitialChips(data.starting_chips || settings.initialChips);
            setRebuyChips(data.rebuy_chips || settings.rebuyChips);
            setAddOnChips(data.addon_chips || settings.addOnChips);
            setMaxRebuys(data.max_rebuys || settings.maxRebuys);
            setIncludeAnte(data.include_ante !== undefined ? data.include_ante : false);


            // Parse and set blind levels from JSON string (managed by hook)
            if (data.blind_levels) {
              try {
                const parsedLevels = JSON.parse(data.blind_levels);
                setLevels(parsedLevels);
              } catch (e) {
                console.error("Error parsing blind levels:", e);
                setLevels([]);
              }
            } else {
                setLevels([]);
            }

            // Load payout structure if available (managed here)
            if (data.payout_structure) {
              try {
                const parsedPayouts = JSON.parse(data.payout_structure);
                setPayoutPlaces(parsedPayouts.places || []);
              } catch (e) {
                console.error("Error parsing payout structure:", e);
                setPayoutPlaces([]);
              }
            } else {
                setPayoutPlaces([]);
            }
          }
        } catch (error) {
          console.error("Error loading tournament data:", error);
          toast.error("Failed to load tournament data");
        } finally {
          setLoading(false);
        }
      } else {
          // If no tournamentId, initialize local state with context/defaults
           setTournamentName(state.name || "");
           setBuyInAmount(settings.buyInAmount);
           setRebuyAmount(settings.rebuyAmount);
           setAddOnAmount(settings.addOnAmount);
           setMaxAddOns(settings.maxAddOns);
           setLastRebuyLevel(settings.lastRebuyLevel);
           setLastAddOnLevel(settings.lastAddOnLevel);
           setAllowRebuy(settings.allowRebuy ?? true);
           setAllowAddon(settings.allowAddon ?? true);
           setPayoutPlaces(settings.payoutStructure?.places || []);
      }
    };

    loadTournamentData();
  }, [
      tournamentId,
      settings,
      setPlayerCount,
      setDurationHours,
      setTournamentFormat,
      setChipset,
      setInitialChips,
      setRebuyChips,
      setAddOnChips,
      setMaxRebuys,
      setIncludeAnte,
      setLevels,
  ]);


  // Handler for adding payout place (managed here)
  const addPayoutPlace = useCallback(() => {
    const lastPosition =
      payoutPlaces.length > 0
        ? payoutPlaces[payoutPlaces.length - 1].position
        : 0;

    const newPlace: PayoutPlace = {
      position: lastPosition + 1,
      percentage: 10,
    };

    setPayoutPlaces([...payoutPlaces, newPlace]);
  }, [payoutPlaces]);

  // Handler for removing payout place (managed here)
  const removePayoutPlace = useCallback((position: number) => {
    const newPayoutPlaces = payoutPlaces.filter(
      (place) => place.position !== position
    );
    const renumberedPlaces = newPayoutPlaces.map((place, index) => ({
      ...place,
      position: index + 1,
    }));

    setPayoutPlaces(renumberedPlaces);
  }, [payoutPlaces]);

  // Handler for updating payout percentage (managed here)
  const updatePayoutPercentage = useCallback(
    (position: number, percentage: number) => {
       const safePercentage = Math.max(0, Math.min(100, percentage));
      const newPayoutPlaces = payoutPlaces.map((place) =>
        place.position === position ? { ...place, percentage: safePercentage } : place
      );
      setPayoutPlaces(newPayoutPlaces);
    },
    [payoutPlaces]
  );

  // Calculate total payout percentage (derived state managed here)
  const totalPayoutPercentage = payoutPlaces.reduce(
    (sum, place) => sum + (place.percentage || 0),
    0
  );

  // Handler for applying current level duration changes from the running card
  const updateCurrentLevelDuration = useCallback((duration: number) => {
    // Check if tournament is running and currentLevel is valid
    if (state.isRunning && currentLevel >= 0 && currentLevel < levels.length) {
      // Update local levels state (managed by the hook)
      const updatedLevels = [...levels];
      updatedLevels[currentLevel] = {
        ...updatedLevels[currentLevel],
        duration // Update duration in local state copy
      };
      setLevels(updatedLevels); // Use the setter from the hook

      // Dispatch action to update context state (and trigger timer update)
      dispatch({
        type: 'UPDATE_CURRENT_LEVEL_DURATION',
        payload: {
          levelIndex: currentLevel,
          duration // Use the provided duration
        }
      });

      toast.success(`Current level duration updated to ${duration} minutes`);
    } else {
       console.warn(`Cannot update duration for level ${currentLevel}. Tournament running: ${state.isRunning}. Levels array length: ${levels.length}`);
       toast.error("Failed to update current level duration. Tournament may not be running.");
    }
  }, [currentLevel, levels, dispatch, state.isRunning, setLevels]);


  // Save settings handler
  const saveSettings = useCallback(async () => {
    // Only validate total payout percentage if there are payout places defined
    if (payoutPlaces.length > 0 && Math.abs(totalPayoutPercentage - 100) > 0.01) {
      toast.error("Payout percentages must sum to 100%");
      return;
    }

    // Construct settings object from state managed here and by the hook
=======
export const TournamentSetup: React.FC<TournamentSetupProps> = ({ tournamentId }) => {
  const { state, dispatch } = useTournament();
  const { settings, currentLevel } = state;
  
  const [buyInAmount, setBuyInAmount] = useState(settings.buyInAmount);
  const [rebuyAmount, setRebuyAmount] = useState(settings.rebuyAmount);
  const [addOnAmount, setAddOnAmount] = useState(settings.addOnAmount);
  const [initialChips, setInitialChips] = useState(settings.initialChips);
  const [rebuyChips, setRebuyChips] = useState(settings.rebuyChips);
  const [addOnChips, setAddOnChips] = useState(settings.addOnChips);
  const [maxRebuys, setMaxRebuys] = useState(settings.maxRebuys);
  const [maxAddOns, setMaxAddOns] = useState(settings.maxAddOns);
  const [lastRebuyLevel, setLastRebuyLevel] = useState(settings.lastRebuyLevel);
  const [lastAddOnLevel, setLastAddOnLevel] = useState(settings.lastAddOnLevel);
  const [levels, setLevels] = useState<TournamentLevel[]>(settings.levels);
  const [payoutPlaces, setPayoutPlaces] = useState<PayoutPlace[]>(settings.payoutStructure.places);
  const [tournamentName, setTournamentName] = useState(state.name || "");
  const [chipset, setChipset] = useState(state.chipset || '25,100,500,1000,5000');
  const [isCustomChipset, setIsCustomChipset] = useState(false);
  const [chipsetValues, setChipsetValues] = useState<number[]>([25, 100, 500, 1000, 5000]);
  const [playerCount, setPlayerCount] = useState(9);
  const [durationHours, setDurationHours] = useState(4);
  const [tournamentFormat, setTournamentFormat] = useState("Rebuy");
  const [activeTab, setActiveTab] = useState("general");
  const [allowRebuy, setAllowRebuy] = useState(true);
  const [allowAddon, setAllowAddon] = useState(true);
  
  useEffect(() => {
    setBuyInAmount(settings.buyInAmount);
    setRebuyAmount(settings.rebuyAmount);
    setAddOnAmount(settings.addOnAmount);
    setInitialChips(settings.initialChips);
    setRebuyChips(settings.rebuyChips);
    setAddOnChips(settings.addOnChips);
    setMaxRebuys(settings.maxRebuys);
    setMaxAddOns(settings.maxAddOns);
    setLastRebuyLevel(settings.lastRebuyLevel);
    setLastAddOnLevel(settings.lastAddOnLevel);
    setLevels(settings.levels);
    setPayoutPlaces(settings.payoutStructure.places);
    setTournamentName(state.name || "");
    
    if (state.chipset) {
      setChipset(state.chipset);
      const matchedOption = chipsetOptions.find(option => option.value === state.chipset);
      setIsCustomChipset(!matchedOption || matchedOption.value === 'custom');
      
      try {
        const chipValues = state.chipset.split(',').map(val => parseInt(val.trim()));
        if (chipValues.length > 0 && !chipValues.some(isNaN)) {
          setChipsetValues(chipValues);
          
          const optimalStack = calculateOptimalStartingStack(chipValues);
          setInitialChips(optimalStack);
          setRebuyChips(optimalStack);
          setAddOnChips(optimalStack);
        }
      } catch (error) {
        console.error("Error parsing chipset:", error);
      }
    }
  }, [settings, state.name, state.chipset]);
  
  const roundToDenom = (value: number, denomArray: number[], prevValue: number = 0): number => {
    if (!denomArray.length) return value;
    
    const closest = denomArray.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    
    if (closest <= prevValue && prevValue !== 0) {
      const nextDenom = denomArray.find(d => d > prevValue);
      return nextDenom || closest;
    }
    
    return closest;
  };
  
  const calculateOptimalStartingStack = (denominations: number[]): number => {
    const biggestChip = Math.max(...denominations);
    let startingStack = 0;
    
    if (biggestChip >= 1000) {
      startingStack = Math.round(biggestChip * 10 / 1000) * 1000;
    } else if (biggestChip >= 100) {
      startingStack = Math.round(biggestChip * 100 / 1000) * 1000;
    } else {
      startingStack = 5000;
    }
    
    return Math.max(startingStack, 5000);
  };
  
  const handleGenerateBlindStructure = () => {
    try {
      const targetDurationMinutes = durationHours * 60;
      
      const levelDurationMinutes = 20;
      
      const rebuyFactor = allowRebuy ? (1 + (maxRebuys / 2)) : 1;
      
      const chipValues = chipsetValues.length > 0 ? chipsetValues : [25, 100, 500, 1000, 5000];
      
      const newLevels = generateDynamicBlinds(
        playerCount,
        initialChips,
        targetDurationMinutes,
        {
          levelDurationMinutes,
          rebuyAddonFactor: rebuyFactor,
          breakIntervalLevels: 4,
          anteStartLevel: 4,
          blindIncreaseFactor: 1.5,
          tournamentFormat: tournamentFormat.toLowerCase(),
          chipset: chipValues
        }
      );
      
      if (newLevels.length === 0) {
        toast.error("Failed to generate blind structure. Please check your inputs.");
        return;
      }
      
      setLevels(newLevels);
      toast.success("Blind structure generated successfully");
    } catch (error) {
      console.error("Error generating blind structure:", error);
      toast.error("Failed to generate blind structure");
    }
  };
  
  const addLevel = () => {
    const lastLevel = levels[levels.length - 1];
    const newLevel: TournamentLevel = {
      level: lastLevel.level + 1,
      smallBlind: lastLevel.isBreak ? lastLevel.smallBlind : lastLevel.smallBlind * 2,
      bigBlind: lastLevel.isBreak ? lastLevel.bigBlind : lastLevel.bigBlind * 2,
      ante: lastLevel.isBreak ? lastLevel.ante : Math.floor(lastLevel.ante * 1.5),
      duration: 20,
      isBreak: false
    };
    
    setLevels([...levels, newLevel]);
  };
  
  const addBreak = () => {
    const lastLevel = levels[levels.length - 1];
    const newBreak: TournamentLevel = {
      level: lastLevel.level + 1,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15,
      isBreak: true
    };
    
    setLevels([...levels, newBreak]);
  };
  
  const removeLevel = (levelIndex: number) => {
    if (levelIndex === 0) {
      toast.error("Cannot remove the first level");
      return;
    }
    
    const newLevels = levels.filter((_, index) => index !== levelIndex);
    const renumberedLevels = newLevels.map((level, index) => ({
      ...level,
      level: index + 1
    }));
    
    setLevels(renumberedLevels);
  };
  
  const updateLevel = (index: number, field: keyof TournamentLevel, value: number | boolean) => {
    const newLevels = [...levels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: value
    };
    setLevels(newLevels);
  };
  
  const updateCurrentLevelDuration = (duration: number) => {
    if (currentLevel >= 0 && currentLevel < levels.length) {
      const updatedLevels = [...levels];
      updatedLevels[currentLevel] = {
        ...updatedLevels[currentLevel],
        duration
      };
      
      dispatch({ 
        type: 'UPDATE_CURRENT_LEVEL_DURATION', 
        payload: { 
          levelIndex: currentLevel, 
          duration 
        }
      });
      
      setLevels(updatedLevels);
      toast.success(`Current level duration updated to ${duration} minutes`);
    }
  };
  
  const addPayoutPlace = () => {
    const lastPosition = payoutPlaces.length > 0 
      ? payoutPlaces[payoutPlaces.length - 1].position 
      : 0;
    
    const newPlace: PayoutPlace = {
      position: lastPosition + 1,
      percentage: 10
    };
    
    setPayoutPlaces([...payoutPlaces, newPlace]);
  };
  
  const removePayoutPlace = (position: number) => {
    const newPayoutPlaces = payoutPlaces.filter(place => place.position !== position);
    const renumberedPlaces = newPayoutPlaces.map((place, index) => ({
      ...place,
      position: index + 1
    }));
    
    setPayoutPlaces(renumberedPlaces);
  };
  
  const updatePayoutPercentage = (position: number, percentage: number) => {
    const newPayoutPlaces = payoutPlaces.map(place => 
      place.position === position ? { ...place, percentage } : place
    );
    setPayoutPlaces(newPayoutPlaces);
  };
  
  const totalPayoutPercentage = payoutPlaces.reduce((sum, place) => sum + place.percentage, 0);
  
  const handleChipsetChange = (selectedChipsetValue: string) => {
    setChipset(selectedChipsetValue);
    
    if (selectedChipsetValue === 'custom') {
      setIsCustomChipset(true);
    } else {
      setIsCustomChipset(false);
      
      try {
        const values = selectedChipsetValue.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        setChipsetValues(values);
        
        const optimalStack = calculateOptimalStartingStack(values);
        setInitialChips(optimalStack);
        setRebuyChips(optimalStack);
        setAddOnChips(optimalStack);
        
        setTimeout(() => {
          handleGenerateBlindStructure();
        }, 100);
      } catch (error) {
        console.error("Error parsing chipset:", error);
      }
    }
  };
  
  const handleCustomChipsetChange = (customChipsetValue: string) => {
    setChipset(customChipsetValue);
    
    try {
      const values = customChipsetValue.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
      if (values.length > 0) {
        setChipsetValues(values);
        
        const optimalStack = calculateOptimalStartingStack(values);
        setInitialChips(optimalStack);
        setRebuyChips(optimalStack);
        setAddOnChips(optimalStack);
        
        setTimeout(() => {
          handleGenerateBlindStructure();
        }, 100);
      }
    } catch (error) {
      console.error("Error parsing custom chipset:", error);
    }
  };
  
  const saveSettings = async () => {
    if (Math.abs(totalPayoutPercentage - 100) > 0.01) {
      toast.error("Payout percentages must sum to 100%");
      return;
    }
    
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
    const updatedSettings = {
      buyInAmount,
      rebuyAmount,
      addOnAmount,
<<<<<<< HEAD
      initialChips, // From hook
      rebuyChips, // From hook
      addOnChips, // From hook
      maxRebuys, // From hook
      maxAddOns, // From here
      lastRebuyLevel, // From here
      lastAddOnLevel, // From here
      includeAnte, // From hook
      levels, // From hook
      payoutStructure: {
        places: payoutPlaces, // From here
      },
      // Include parameters from the hook that are part of settings
      playerCount,
      durationHours,
      tournamentFormat,
      chipset,
      allowRebuy, // From here
      allowAddon, // From here
    };

    // Update context state first
    dispatch({ type: "UPDATE_SETTINGS", payload: updatedSettings });

    dispatch({
      type: "UPDATE_TOURNAMENT_NAME",
      payload: tournamentName,
    });

    dispatch({
      type: "UPDATE_TOURNAMENT_CHIPSET",
      payload: chipset, // Chipset is managed by the hook
    });

    if (tournamentId) {
      // Update existing tournament in DB
=======
      initialChips,
      rebuyChips,
      addOnChips,
      maxRebuys,
      maxAddOns,
      lastRebuyLevel,
      lastAddOnLevel,
      levels,
      payoutStructure: {
        places: payoutPlaces
      }
    };
    
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: updatedSettings 
    });
    
    dispatch({
      type: 'UPDATE_TOURNAMENT_NAME',
      payload: tournamentName
    });
    
    dispatch({
      type: 'UPDATE_TOURNAMENT_CHIPSET',
      payload: chipset
    });
    
    if (tournamentId) {
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
      try {
        const tournamentData = {
          name: tournamentName,
          buy_in: buyInAmount,
          rebuy_amount: rebuyAmount,
          addon_amount: addOnAmount,
<<<<<<< HEAD
          starting_chips: initialChips, // From hook
          rebuy_chips: rebuyChips, // From hook
          addon_chips: addOnChips, // From hook
          max_rebuys: maxRebuys, // From hook
          max_addons: maxAddOns, // From here
          last_rebuy_level: lastRebuyLevel, // From here
          last_addon_level: lastAddOnLevel, // From here
          blind_levels: JSON.stringify(levels), // From hook
          chipset: chipset, // From hook
          format: tournamentFormat, // From hook
          player_count: playerCount, // From hook
          duration_hours: durationHours, // From hook
          allow_rebuy: allowRebuy, // From here
          include_ante: includeAnte, // From hook
          allow_addon: allowAddon, // From here
          payout_structure: JSON.stringify({ places: payoutPlaces }), // From here
        };

        const { error } = await supabase
          .from("tournaments")
          .update(tournamentData)
          .eq("id", tournamentId);

        if (error) throw error;

        toast.success("Tournament updated in database");
      } catch (error) {
        console.error("Error updating tournament:", error);
        toast.error("Failed to update tournament in database");
      }
    } else {
       // For new tournaments not yet saved to DB, just update context/local state
       toast.success("Tournament settings saved locally");
       console.log("Tournament settings saved locally:", updatedSettings);
    }
  }, [
    tournamentId,
    tournamentName,
    buyInAmount,
    rebuyAmount,
    addOnAmount,
    maxAddOns,
    lastRebuyLevel,
    lastAddOnLevel,
    payoutPlaces,
    totalPayoutPercentage,
    allowRebuy,
    allowAddon,
    dispatch,
    // Dependencies from the hook's state that are saved
    initialChips,
    rebuyChips,
    addOnChips,
    maxRebuys,
    includeAnte,
    levels,
    playerCount,
    durationHours,
    tournamentFormat,
    chipset,
  ]);


  // Show loading state while tournament data is being fetched
  if (loading && tournamentId) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tournament data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Main component render - Orchestrates the layout and child components
  return (
    
      <div className="space-y-6"> {/* Main stacked layout */}

        {/* Header and Save Button */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tournament Setup</h2>
            <p className="text-muted-foreground">Configure tournament settings</p>
          </div>
          <Button onClick={saveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Tournament Name Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tournament Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tournamentName">Name</Label>
              <Input
                id="tournamentName"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Enter tournament name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Optional Current Level Duration Card - Only shown if tournament is running */}
        {state.isRunning && (
          <Card className="border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Clock className="mr-2 h-5 w-5" />
                Current Level Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <Label htmlFor="currentLevelDuration">Duration (minutes)</Label>
                  {/* Input value comes from the levels state managed by the hook */}
                  <Input
                    id="currentLevelDuration"
                    type="number"
                    min="1"
                    value={levels[currentLevel]?.duration ?? ''} // Use ?? '' for controlled input
                     // Update local state on input change - this updates the levels state in the hook
                    onChange={(e) => {
                       const newDuration = Number(e.target.value);
                       if (currentLevel >= 0 && currentLevel < levels.length) {
                          const updatedLevels = [...levels];
                          // Ensure it's a valid number before updating
                          updatedLevels[currentLevel] = {
                             ...updatedLevels[currentLevel],
                             duration: isNaN(newDuration) ? 0 : newDuration
                          };
                          setLevels(updatedLevels); // Use the setter from the hook
                       }
                    }}
                  />
                </div>
                 {/* Button to apply the duration change to the context/running timer */}
                <Button
                  onClick={() => updateCurrentLevelDuration(levels[currentLevel]?.duration || 0)} // Use the local state value
                  className="mt-4 sm:mt-0"
                  // Disable button if tournament is not running, current level is invalid, or duration is invalid
                  disabled={!state.isRunning || currentLevel < 0 || currentLevel >= levels.length || isNaN(levels[currentLevel]?.duration || 0) || (levels[currentLevel]?.duration || 0) <= 0}
                >
                  Apply Change
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs Component */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs List with three triggers */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="blinds">Blind Structure</TabsTrigger>
            <TabsTrigger value="payouts">Payout Structure</TabsTrigger>
          </TabsList>

          {/* Tabs Content for General Settings */}
          <TabsContent value="general" className="space-y-4 pt-4">
            {/* Use grid layout for the cards in the General tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buy-in Settings Card - Now on the LEFT */}
                 <BuyInSettingsCard
                     buyInAmount={buyInAmount}
                     setBuyInAmount={setBuyInAmount}
                     allowRebuy={allowRebuy}
                     setAllowRebuy={setAllowRebuy}
                     rebuyAmount={rebuyAmount}
                     setRebuyAmount={setRebuyAmount}
                     maxRebuys={maxRebuys}
                     setMaxRebuys={setMaxRebuys}
                     lastRebuyLevel={lastRebuyLevel}
                     setLastRebuyLevel={setLastRebuyLevel}
                     allowAddon={allowAddon}
                     setAllowAddon={setAllowAddon}
                     addOnAmount={addOnAmount}
                     setAddOnAmount={setAddOnAmount}
                     maxAddOns={maxAddOns}
                     setMaxAddOns={setMaxAddOns}
                     lastAddOnLevel={lastAddOnLevel}
                     setLastAddOnLevel={setLastAddOnLevel}
                     includeAnte={includeAnte}
                     setIncludeAnte={setIncludeAnte}
                     levelsCount={levels.length}
                 />

                {/* Tournament Parameters Card - Now on the RIGHT */}
                <TournamentParametersCard
                    tournamentFormat={tournamentFormat}
                    handleFormatChange={setTournamentFormat}
                    playerCount={playerCount}
                    handlePlayerCountChange={(e) => setPlayerCount(Number(e.target.value))}
                    durationHours={durationHours}
                    handleDurationHoursChange={(e) => setDurationHours(Number(e.target.value))}
                    // Removed handleGenerateBlindStructure and canGenerateBlinds props as the button is removed from this card
                />
             </div>
          </TabsContent> {/* End of General TabsContent */}


          {/* Tabs Content for Blind Structure - Two-column layout inside the tab */}
          <TabsContent value="blinds" className="space-y-4 pt-4">
             <div className="flex flex-col md:flex-row gap-6"> {/* Two-column layout INSIDE the tab */}

                 {/* Left Column (within Blinds Tab): Blind Levels Table */}
                 <div className="w-full md:w-1/2 lg:w-2/3 min-w-64"> {/* Flexible width */}
                     <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center text-lg">
                             <Clock className="mr-2 h-5 w-5" />
                             Blind Levels
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           {/* Use the existing BlindsSetupTab component */}
                           <BlindsSetupTab
                              levels={levels}
                              onLevelsChange={setLevels}
                              includeAnte={includeAnte}
                            />
                        </CardContent>
                     </Card>
                 </div>

                 {/* Right Column (within Blinds Tab): Chip Structure & Generation Controls */}
                 <div className="flex-1 space-y-6"> {/* Takes up the remaining space */}

                      {/* Use the extracted component for Chip Settings */}
                      <ChipSettingsCard
                          chipset={chipset}
                          handleChipsetChange={handleChipsetChange}
                          isCustomChipset={isCustomChipset}
                          handleCustomChipsetChange={handleCustomChipsetChange}
                          initialChips={initialChips}
                          handleInitialChipsChange={handleInitialChipsChange}
                          smallBlind={smallBlind}
                          bigBlind={bigBlind}
                          allowRebuy={allowRebuy}
                          rebuyChips={rebuyChips}
                          handleRebuyChipsChange={handleRebuyChipsChange}
                          allowAddon={allowAddon}
                          addOnChips={addOnChips}
                          handleAddOnChipsChange={handleAddOnChipsChange}
                      />

                      {/* Dedicated Card for Generate Blinds Button - This is where the button remains */}
                      <Card>
                           <CardHeader>
                              <CardTitle className="flex items-center">
                                 <Wand2 className="mr-2 h-5 w-5" />
                                  Generate Blinds
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                               <Button
                                 onClick={handleGenerateBlindStructure}
                                 className="w-full"
                                 disabled={!canGenerateBlinds}
                               >
                                 <Wand2 className="mr-2 h-4 w-4" />
                                 Generate Blind Structure
                               </Button>
                           </CardContent>
                      </Card>

                 </div>
             </div>
          </TabsContent>


          {/* Tabs Content for Payout Structure */}
          <TabsContent value="payouts" className="space-y-4 pt-4">
            {/* Use the extracted component for Payout Structure */}
            <PayoutStructureSection
                payoutPlaces={payoutPlaces}
                addPayoutPlace={addPayoutPlace}
                removePayoutPlace={removePayoutPlace}
                updatePayoutPercentage={updatePayoutPercentage}
                totalPayoutPercentage={totalPayoutPercentage}
            />
          </TabsContent>

        </Tabs>

      </div>
=======
          starting_chips: initialChips,
          max_rebuys: maxRebuys,
          max_addons: maxAddOns,
          last_rebuy_level: lastRebuyLevel,
          last_addon_level: lastAddOnLevel,
          blind_levels: JSON.stringify(levels),
          chipset: chipset
        };
        
        const { error } = await supabase
          .from('tournaments')
          .update(tournamentData)
          .eq('id', tournamentId);
        
        if (error) throw error;
        
        toast.success("Tournament updated in database");
      } catch (error) {
        console.error('Error updating tournament:', error);
        toast.error("Failed to update tournament in database");
      }
    } else {
      toast.success("Tournament settings saved locally");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tournament Setup</h2>
          <p className="text-muted-foreground">Configure tournament settings</p>
        </div>
        
        <Button onClick={saveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tournament Name</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tournamentName">Name</Label>
            <Input
              id="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Enter tournament name"
            />
          </div>
        </CardContent>
      </Card>
      
      {state.isRunning && (
        <Card className="border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5" />
              Current Level Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <Label htmlFor="currentLevelDuration">Duration (minutes)</Label>
                <Input
                  id="currentLevelDuration"
                  type="number"
                  min="1"
                  value={levels[currentLevel]?.duration || 0}
                  onChange={(e) => updateLevel(currentLevel, 'duration', Number(e.target.value))}
                />
              </div>
              <Button 
                onClick={() => updateCurrentLevelDuration(levels[currentLevel]?.duration || 0)}
                className="mt-4 sm:mt-0"
              >
                Apply Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="blinds">Blind Structure</TabsTrigger>
          <TabsTrigger value="payouts">Payout Structure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <Label htmlFor="rebuyAmount">Rebuy Amount ($)</Label>
                    <Input
                      id="rebuyAmount"
                      type="number"
                      value={rebuyAmount}
                      onChange={(e) => setRebuyAmount(Number(e.target.value))}
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="addOnAmount">Add-on Amount ($)</Label>
                    <Input
                      id="addOnAmount"
                      type="number"
                      value={addOnAmount}
                      onChange={(e) => setAddOnAmount(Number(e.target.value))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
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
                    value={isCustomChipset ? 'custom' : chipset}
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
                        onChange={(e) => handleCustomChipsetChange(e.target.value)}
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
                    onChange={(e) => setInitialChips(Number(e.target.value))}
                  />
                </div>
                
                {allowRebuy && (
                  <div className="space-y-2">
                    <Label htmlFor="rebuyChips">Rebuy Chips</Label>
                    <Input
                      id="rebuyChips"
                      type="number"
                      value={rebuyChips}
                      onChange={(e) => setRebuyChips(Number(e.target.value))}
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
                      onChange={(e) => setAddOnChips(Number(e.target.value))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Blind Structure Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerCount">Number of Players</Label>
                    <Input
                      id="playerCount"
                      type="number"
                      min="2"
                      value={playerCount}
                      onChange={(e) => setPlayerCount(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationHours">Tournament Duration (hours)</Label>
                    <Input
                      id="durationHours"
                      type="number"
                      min="1"
                      max="12"
                      step="0.5"
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tournamentFormat">Tournament Format</Label>
                  <Select
                    value={tournamentFormat}
                    onValueChange={(value) => setTournamentFormat(value)}
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
                
                <Button 
                  onClick={handleGenerateBlindStructure}
                  className="w-full mt-2"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Blind Structure
                </Button>
              </CardContent>
            </Card>
            
            {allowRebuy || allowAddon ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Rebuy & Add-on Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allowRebuy && (
                    <>
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
                          min="1"
                          max={levels.length}
                          value={lastRebuyLevel}
                          onChange={(e) => setLastRebuyLevel(Number(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                  
                  {allowAddon && (
                    <>
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
                          min="1"
                          max={levels.length}
                          value={lastAddOnLevel}
                          onChange={(e) => setLastAddOnLevel(Number(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>
        
        <TabsContent value="blinds" className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Blind Structure</h3>
              <p className="text-sm text-muted-foreground">Configure the tournament blind levels</p>
            </div>
            
            <Button 
              onClick={handleGenerateBlindStructure}
              variant="outline"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Blind Structure
            </Button>
          </div>
                
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={addLevel}>
              <Plus className="mr-2 h-4 w-4" />
              Add Level
            </Button>
            <Button variant="outline" onClick={addBreak}>
              <Plus className="mr-2 h-4 w-4" />
              Add Break
            </Button>
          </div>
          
          <div className="border rounded-md">
            <div className="bg-muted/50 border-b px-4 py-3 flex items-center">
              <div className="w-16 font-medium">Level</div>
              <div className="w-24 font-medium">Small Blind</div>
              <div className="w-24 font-medium">Big Blind</div>
              <div className="w-24 font-medium">Ante</div>
              <div className="w-24 font-medium">Duration</div>
              <div className="w-20 font-medium">Break</div>
              <div className="flex-1"></div>
            </div>
            
            <div className="divide-y">
              {levels.map((level, index) => (
                <div key={index} className="px-4 py-3 flex items-center">
                  <div className="w-16">{level.level}</div>
                  
                  <div className="w-24">
                    {level.isBreak ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <Input
                        type="number"
                        value={level.smallBlind}
                        onChange={(e) => updateLevel(index, 'smallBlind', Number(e.target.value))}
                        className="h-8"
                      />
                    )}
                  </div>
                  
                  <div className="w-24">
                    {level.isBreak ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <Input
                        type="number"
                        value={level.bigBlind}
                        onChange={(e) => updateLevel(index, 'bigBlind', Number(e.target.value))}
                        className="h-8"
                      />
                    )}
                  </div>
                  
                  <div className="w-24">
                    {level.isBreak ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <Input
                        type="number"
                        value={level.ante}
                        onChange={(e) => updateLevel(index, 'ante', Number(e.target.value))}
                        className="h-8"
                      />
                    )}
                  </div>
                  
                  <div className="w-24">
                    <Input
                      type="number"
                      value={level.duration}
                      onChange={(e) => updateLevel(index, 'duration', Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="w-20 flex items-center ml-1">
                    <input
                      type="checkbox"
                      checked={level.isBreak}
                      onChange={(e) => updateLevel(index, 'isBreak', e.target.checked)}
                      className="mr-2"
                    />
                    {level.isBreak ? 'Yes' : 'No'}
                  </div>
                  
                  <div className="flex-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLevel(index)}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="payouts" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              Total: <span className={totalPayoutPercentage === 100 ? "text-poker-green font-medium" : "text-poker-red font-medium"}>
                {totalPayoutPercentage}%
              </span> 
              {totalPayoutPercentage !== 100 && (
                <span className="text-poker-red ml-2">(Must equal 100%)</span>
              )}
            </div>
            
            <Button variant="outline" onClick={addPayoutPlace}>
              <Plus className="mr-2 h-4 w-4" />
              Add Place
            </Button>
          </div>
          
          <div className="border rounded-md">
            <div className="bg-muted/50 border-b px-4 py-3 flex items-center">
              <div className="w-20 font-medium">Position</div>
              <div className="w-60 font-medium">Percentage (%)</div>
              <div className="flex-1"></div>
            </div>
            
            <div className="divide-y">
              {payoutPlaces.map((place) => (
                <div key={place.position} className="px-4 py-3 flex items-center">
                  <div className="w-20">{place.position}</div>
                  
                  <div className="w-60">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={place.percentage}
                      onChange={(e) => updatePayoutPercentage(place.position, Number(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="flex-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePayoutPlace(place.position)}
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
  );
};

export default TournamentSetup;
