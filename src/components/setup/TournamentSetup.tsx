
import React, { useState } from "react";
import { 
  Save, Plus, Trash, Clock, DollarSign, 
  Banknote, Percent, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { TournamentLevel, PayoutPlace } from "@/types/types";

export const TournamentSetup: React.FC = () => {
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
  
  // Save tournament settings
  const saveSettings = () => {
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
    
    dispatch({ type: 'UPDATE_SETTINGS', payload: updatedSettings });
    toast.success("Tournament settings saved");
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
