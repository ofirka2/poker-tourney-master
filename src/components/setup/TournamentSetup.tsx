
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
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { TournamentLevel, PayoutPlace } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";

interface TournamentSetupProps {
  tournamentId?: string | null;
}

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
  const [chipset, setChipset] = useState<number[]>([25, 100, 500, 1000, 5000]);
  const [playerCount, setPlayerCount] = useState(9);
  const [durationHours, setDurationHours] = useState(4);
  const [tournamentFormat, setTournamentFormat] = useState("Rebuy");
  
  // Update local state when settings change (e.g., when a tournament is loaded)
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
    
    // Parse chipset from string if available
    if (state.chipset) {
      try {
        const chipValues = state.chipset.split(',').map(val => parseInt(val.trim()));
        if (chipValues.length > 0 && !chipValues.some(isNaN)) {
          setChipset(chipValues);
        }
      } catch (error) {
        console.error("Error parsing chipset:", error);
      }
    }
  }, [settings, state.name, state.chipset]);
  
  // Function to add a new blind level
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
  
  // Function to add a break
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
  
  // Function to remove a level
  const removeLevel = (levelIndex: number) => {
    // Don't allow removing the first level
    if (levelIndex === 0) {
      toast.error("Cannot remove the first level");
      return;
    }
    
    const newLevels = levels.filter((_, index) => index !== levelIndex);
    // Renumber levels
    const renumberedLevels = newLevels.map((level, index) => ({
      ...level,
      level: index + 1
    }));
    
    setLevels(renumberedLevels);
  };
  
  // Update a level
  const updateLevel = (index: number, field: keyof TournamentLevel, value: number | boolean) => {
    const newLevels = [...levels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: value
    };
    setLevels(newLevels);
  };
  
  // Apply current level duration change immediately
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
  
  // Add a payout place
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
  
  // Remove a payout place
  const removePayoutPlace = (position: number) => {
    const newPayoutPlaces = payoutPlaces.filter(place => place.position !== position);
    // Renumber positions
    const renumberedPlaces = newPayoutPlaces.map((place, index) => ({
      ...place,
      position: index + 1
    }));
    
    setPayoutPlaces(renumberedPlaces);
  };
  
  // Update a payout place percentage
  const updatePayoutPercentage = (position: number, percentage: number) => {
    const newPayoutPlaces = payoutPlaces.map(place => 
      place.position === position ? { ...place, percentage } : place
    );
    setPayoutPlaces(newPayoutPlaces);
  };
  
  // Calculate total payout percentage
  const totalPayoutPercentage = payoutPlaces.reduce((sum, place) => sum + place.percentage, 0);
  
  // Helper functions for blind structure generation
  const roundToDenom = (value: number, denominations: number[]) => {
    return denominations.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };
  
  const generateInitialBlindStructure = () => {
    const totalChips = initialChips * playerCount * (tournamentFormat === "Rebuy" ? (1 + maxRebuys) : 1);
    const levelDuration = 20;
    const numLevels = Math.floor(durationHours * 60 / levelDuration);
    const startingBB = initialChips / (tournamentFormat === "Deep Stack" ? 200 : 100);
    
    let blinds = [{ 
      level: 1, 
      smallBlind: roundToDenom(startingBB / 2, chipset),
      bigBlind: roundToDenom(startingBB, chipset),
      ante: 0,
      duration: levelDuration,
      isBreak: false
    }];

    const rates: any = { 
      "Freezeout": 1.5, 
      "Rebuy": [1.25, 1.5], 
      "Deep Stack": 1.25,
      "Bounty": 1.5
    };
    
    const rebuyEnd = tournamentFormat === "Rebuy" ? Math.floor(numLevels / 2) : numLevels;

    for (let i = 1; i < numLevels; i++) {
      let prevBB = blinds[i - 1].bigBlind;
      let rate = (tournamentFormat === "Rebuy" && i < rebuyEnd) 
        ? rates[tournamentFormat][0] 
        : (rates[tournamentFormat][1] || rates[tournamentFormat]);
      
      let newBB = roundToDenom(prevBB * rate, chipset);
      let ante = i > 3 ? Math.round(newBB * 0.1) : 0; // Add antes after level 3
      
      // Add break every 4 levels
      if (i > 0 && i % 4 === 0) {
        blinds.push({
          level: i + 1,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: 15,
          isBreak: true
        });
        numLevels++; // Extend to account for break
      } else {
        blinds.push({
          level: i + 1,
          smallBlind: roundToDenom(newBB / 2, chipset),
          bigBlind: newBB,
          ante: ante,
          duration: levelDuration,
          isBreak: false
        });
      }
    }

    // Adjust final level
    const targetBB = totalChips / 15;
    const finalIndex = blinds.length - 1;
    blinds[finalIndex].bigBlind = roundToDenom(targetBB, chipset);
    blinds[finalIndex].smallBlind = roundToDenom(blinds[finalIndex].bigBlind / 2, chipset);

    return blinds;
  };
  
  // Generate blind structure based on parameters
  const handleGenerateBlindStructure = () => {
    try {
      const newLevels = generateInitialBlindStructure();
      setLevels(newLevels);
      toast.success("Blind structure generated successfully");
    } catch (error) {
      console.error("Error generating blind structure:", error);
      toast.error("Failed to generate blind structure");
    }
  };
  
  // Save tournament settings
  const saveSettings = async () => {
    // Validate payout percentages
    if (Math.abs(totalPayoutPercentage - 100) > 0.01) {
      toast.error("Payout percentages must sum to 100%");
      return;
    }
    
    const updatedSettings = {
      buyInAmount,
      rebuyAmount,
      addOnAmount,
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
    
    // Update local state first
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: updatedSettings 
    });
    
    // Update tournament name
    dispatch({
      type: 'UPDATE_TOURNAMENT_NAME',
      payload: tournamentName
    });
    
    // Update chipset
    dispatch({
      type: 'UPDATE_TOURNAMENT_CHIPSET',
      payload: chipset.join(',')
    });
    
    // If we have a tournament ID, save to Supabase as well
    if (tournamentId) {
      try {
        // Prepare data for Supabase
        const tournamentData = {
          name: tournamentName,
          buy_in: buyInAmount,
          rebuy_amount: rebuyAmount,
          addon_amount: addOnAmount,
          starting_chips: initialChips,
          max_rebuys: maxRebuys,
          max_addons: maxAddOns,
          last_rebuy_level: lastRebuyLevel,
          last_addon_level: lastAddOnLevel,
          blind_levels: JSON.stringify(levels),
          chipset: chipset.join(',')
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
      
      {/* Tournament Name Input */}
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
      
      {/* Current Level Duration Adjustment */}
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
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="blinds">Blind Structure</TabsTrigger>
          <TabsTrigger value="payouts">Payout Structure</TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
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
                  <Label htmlFor="addOnAmount">Add-on Amount ($)</Label>
                  <Input
                    id="addOnAmount"
                    type="number"
                    value={addOnAmount}
                    onChange={(e) => setAddOnAmount(Number(e.target.value))}
                  />
                </div>
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
                  <Label htmlFor="chipset">Chipset (comma separated values)</Label>
                  <Input
                    id="chipset"
                    value={chipset.join(',')}
                    onChange={(e) => {
                      try {
                        const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                        setChipset(values.length ? values : [25, 100, 500, 1000, 5000]);
                      } catch (error) {
                        console.error("Error parsing chipset:", error);
                      }
                    }}
                    placeholder="25,100,500,1000,5000"
                  />
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
                
                <div className="space-y-2">
                  <Label htmlFor="rebuyChips">Rebuy Chips</Label>
                  <Input
                    id="rebuyChips"
                    type="number"
                    value={rebuyChips}
                    onChange={(e) => setRebuyChips(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addOnChips">Add-on Chips</Label>
                  <Input
                    id="addOnChips"
                    type="number"
                    value={addOnChips}
                    onChange={(e) => setAddOnChips(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Rebuy & Add-on Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="tournamentFormat">Tournament Format</Label>
                  <select
                    id="tournamentFormat"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={tournamentFormat}
                    onChange={(e) => setTournamentFormat(e.target.value)}
                  >
                    <option value="Freezeout">Freezeout</option>
                    <option value="Rebuy">Rebuy</option>
                    <option value="Deep Stack">Deep Stack</option>
                    <option value="Bounty">Bounty</option>
                  </select>
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
          </div>
        </TabsContent>
        
        {/* Blind Structure Tab */}
        <TabsContent value="blinds" className="space-y-4 pt-4">
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
        
        {/* Payout Structure Tab */}
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
  );
};

export default TournamentSetup;
