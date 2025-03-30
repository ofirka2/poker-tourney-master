
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
  const [activeTab, setActiveTab] = useState("general");
  
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
  
  // Function to round to the nearest denomination
  const roundToDenom = (value: number, denominations: number[]): number => {
    if (!denominations.length) return value;
    return denominations.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };
  
  // Generate blind structure based on provided logic
  const generateBlindStructure = (
    denominations: number[],
    startingStack: number,
    durationHrs: number,
    players: number,
    format: string,
    rebuyLimit: number
  ): TournamentLevel[] => {
    const levelDuration = 20;
    let numLevels = Math.floor(durationHrs * 60 / levelDuration);
    // Ensure we have at least 6 levels
    numLevels = Math.max(numLevels, 6);
    
    const totalChips = startingStack * players * (format === "Rebuy" ? (1 + rebuyLimit) : 1);
    const startingBB = startingStack / (format === "Deep Stack" ? 200 : 100);
    
    let blinds: TournamentLevel[] = [{
      level: 1,
      smallBlind: roundToDenom(startingBB / 2, denominations),
      bigBlind: roundToDenom(startingBB, denominations),
      ante: 0,
      duration: levelDuration,
      isBreak: false
    }];

    const rates: any = {
      "Freezeout": 1.5,
      "Rebuy": [1.25, 1.5], // Rebuy period, post-rebuy
      "Deep Stack": 1.25,
      "Bounty": 1.5
    };
    
    const rebuyEnd = format === "Rebuy" ? Math.floor(numLevels / 2) : numLevels;
    let totalLevelsWithBreaks = numLevels;

    for (let i = 1; i < numLevels; i++) {
      // Add a break every 4 levels
      if (i > 0 && i % 4 === 0) {
        blinds.push({
          level: blinds.length + 1,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: 15,
          isBreak: true
        });
        totalLevelsWithBreaks++;
      }
      
      const prevBB = blinds[blinds.length - 1].isBreak ? 
                     blinds[blinds.length - 2].bigBlind : 
                     blinds[blinds.length - 1].bigBlind;
                     
      const rate = (format === "Rebuy" && i < rebuyEnd) ? 
                   rates[format][0] : 
                   (rates[format][1] || rates[format]);
                   
      const newBB = roundToDenom(prevBB * rate, denominations);
      const ante = i > 3 ? Math.round(newBB * 0.1) : 0; // Add antes after level 3
      
      blinds.push({
        level: blinds.length + 1,
        smallBlind: roundToDenom(newBB / 2, denominations),
        bigBlind: newBB,
        ante: ante,
        duration: levelDuration,
        isBreak: false
      });
    }

    // Adjust final level to hit target BB
    const targetBB = totalChips / 15;
    const finalIndex = blinds.length - 1;
    blinds[finalIndex].bigBlind = roundToDenom(targetBB, denominations);
    blinds[finalIndex].smallBlind = roundToDenom(blinds[finalIndex].bigBlind / 2, denominations);

    // Renumber levels to ensure sequential ordering
    return blinds.map((blind, index) => ({
      ...blind,
      level: index + 1
    }));
  };
  
  // Update initial stack based on chipset
  const calculateOptimalStartingStack = (denominations: number[]): number => {
    // Find a starting stack that works well with the chipset
    // Base on 100 BB to start
    const biggestChip = Math.max(...denominations);
    let startingStack = 0;
    
    if (biggestChip >= 1000) {
      // For large chips, make stack size multiple of biggest chip
      startingStack = Math.round(biggestChip * 10 / 1000) * 1000;
    } else if (biggestChip >= 100) {
      // For medium chips
      startingStack = Math.round(biggestChip * 100 / 1000) * 1000;
    } else {
      // For small chips
      startingStack = 5000; // Default
    }
    
    // Ensure stack is at least 5000 and divisible by 1000
    return Math.max(startingStack, 5000);
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
  
  const handleGenerateBlindStructure = () => {
    try {
      // Update initial stack first based on chipset
      const optimalStack = calculateOptimalStartingStack(chipset);
      setInitialChips(optimalStack);
      setRebuyChips(optimalStack);
      setAddOnChips(optimalStack);
      
      // Generate blind structure
      const newLevels = generateBlindStructure(
        chipset, 
        optimalStack,
        durationHours,
        playerCount,
        tournamentFormat,
        maxRebuys
      );
      
      setLevels(newLevels);
      
      // Switch to the blinds tab to show the user the generated structure
      setActiveTab("blinds");
      
      toast.success("Blind structure generated successfully");
    } catch (error) {
      console.error("Error generating blind structure:", error);
      toast.error("Failed to generate blind structure");
    }
  };
  
  const saveSettings = async () => {
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
      payload: chipset.join(',')
    });
    
    if (tournamentId) {
      try {
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
