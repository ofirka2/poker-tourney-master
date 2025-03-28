import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Timer from "@/components/timer/Timer";
import TimerDisplay from "@/components/timer/TimerDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Timer as TimerIcon, Users, LayoutGrid, Settings, ChevronRight, 
  Play, Clock, Trophy, ArrowRight, UserMinus, Search, X, Check,
  RefreshCw, Plus, Wallet 
} from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import Scoreboard from "@/components/scoreboard/Scoreboard";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import ShareTournament from "@/components/share/ShareTournament";

const Index = () => {
  const { state, dispatch } = useTournament();
  const { players, settings, currentLevel, isRunning } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showTimeSetup, setShowTimeSetup] = useState(false);
  const [tournamentDuration, setTournamentDuration] = useState(120); // Default 2 hours
  
  const activePlayers = players.filter(p => !p.eliminated);
  const currentLevelData = settings.levels[currentLevel];
  const averageStack = activePlayers.length > 0 
    ? Math.round(activePlayers.reduce((sum, p) => sum + p.chips, 0) / activePlayers.length) 
    : 0;

  useEffect(() => {
    if (activePlayers.length === 1 && players.length > 1 && isRunning) {
      handleEndTournament();
    }
  }, [activePlayers.length, isRunning]);

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEliminatePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'MARK_ELIMINATED', payload: id });
    toast.info(`Player ${player.name} eliminated`);
  };
  
  const handleAddRebuy = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    // Check if player has reached max rebuys
    if (player.rebuys >= settings.maxRebuys) {
      toast.error(`Player has reached maximum ${settings.maxRebuys} rebuys`);
      return;
    }
    
    dispatch({ type: 'ADD_REBUY', payload: id });
    toast.success(`Added rebuy for ${player.name}`);
  };
  
  const handleAddAddOn = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    // Check if player has reached max add-ons
    if (player.addOns >= settings.maxAddOns) {
      toast.error(`Player has reached maximum ${settings.maxAddOns} add-ons`);
      return;
    }
    
    dispatch({ type: 'ADD_ADDON', payload: id });
    toast.success(`Added add-on for ${player.name}`);
  };
  
  const handleEndTournament = () => {
    if (activePlayers.length > 0) {
      const remainingPlayers = [...activePlayers].sort((a, b) => a.chips - b.chips);
      
      for (let i = 0; i < remainingPlayers.length - 1; i++) {
        dispatch({ type: 'MARK_ELIMINATED', payload: remainingPlayers[i].id });
      }
      
      if (remainingPlayers.length > 0) {
        const winner = remainingPlayers[remainingPlayers.length - 1];
        toast.success(`🏆 ${winner.name} wins the tournament!`);
      }
    }
    
    dispatch({ type: 'PAUSE_TOURNAMENT' });
    setShowSummary(true);
  };
  
  const getPayoutTable = () => {
    if (!settings.payoutStructure || !settings.payoutStructure.places) return [];
    
    return settings.payoutStructure.places.map(place => ({
      position: place.position,
      amount: (state.totalPrizePool * place.percentage) / 100
    }));
  };
  
  // Calculate money taken by the house
  const calculateHouseMoney = () => {
    // Calculate total money collected
    const totalCollected = players.reduce((total, player) => {
      let playerTotal = 0;
      if (player.buyIn) playerTotal += settings.buyInAmount;
      playerTotal += player.rebuys * settings.rebuyAmount;
      playerTotal += player.addOns * settings.addOnAmount;
      return total + playerTotal;
    }, 0);
    
    // House money is the difference between collected and prize pool
    return totalCollected - state.totalPrizePool;
  };
  
  const generateBlindLevels = (durationMinutes: number) => {
    // Simple algorithm to generate blind structure based on duration
    // For a two-hour tournament (120 mins), we'll have about 12 levels (10 mins each)
    const numLevels = Math.max(6, Math.floor(durationMinutes / 10));
    const breakFrequency = 4; // Break every 4 levels
    
    const levels = [];
    let smallBlind = 25;
    let bigBlind = 50;
    let ante = 0;
    
    for (let i = 1; i <= numLevels; i++) {
      // Add a break every breakFrequency levels
      if (i > 1 && (i - 1) % breakFrequency === 0) {
        levels.push({
          level: i,
          smallBlind: 0,
          bigBlind: 0,
          ante: 0,
          duration: 15,
          isBreak: true
        });
        // Skip level count for breaks
        i++;
      }
      
      levels.push({
        level: i,
        smallBlind,
        bigBlind,
        ante,
        duration: 10, // 10 minute levels by default
        isBreak: false
      });
      
      // Increase blinds for next level
      if (i % 2 === 0) {
        smallBlind = Math.round(smallBlind * 1.5);
        bigBlind = smallBlind * 2;
        
        // Start adding ante after level 3
        if (i >= 3 && ante === 0) {
          ante = Math.round(smallBlind * 0.2);
        } else if (ante > 0) {
          ante = Math.round(ante * 1.5);
        }
      }
    }
    
    return levels;
  };
  
  const handleGenerateStructure = () => {
    if (tournamentDuration < 30) {
      toast.error("Tournament duration must be at least 30 minutes");
      return;
    }
    
    const newLevels = generateBlindLevels(tournamentDuration);
    
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        levels: newLevels
      }
    });
    
    setShowTimeSetup(false);
    toast.success(`Generated ${newLevels.length} levels for a ${tournamentDuration} minute tournament`);
  };
  
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Tournament Status</CardTitle>
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <Badge variant="default" className="bg-poker-green">Running</Badge>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleEndTournament}
                      disabled={players.length === 0}
                    >
                      <X className="mr-1 h-4 w-4" />
                      End Tournament
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline">Not Started</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{players.length}</div>
                    <div className="text-sm text-muted-foreground">Total Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{activePlayers.length}</div>
                    <div className="text-sm text-muted-foreground">Active Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${state.totalPrizePool}</div>
                    <div className="text-sm text-muted-foreground">Prize Pool</div>
                  </div>
                </div>
                
                {currentLevelData && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Current Level</div>
                      <div className="font-medium">{currentLevelData.level}</div>
                    </div>
                    
                    {!currentLevelData.isBreak && (
                      <>
                        <div className="flex justify-between">
                          <div className="text-sm text-muted-foreground">Blinds</div>
                          <div className="font-medium">
                            {currentLevelData.smallBlind}/{currentLevelData.bigBlind}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <div className="text-sm text-muted-foreground">Ante</div>
                          <div className="font-medium">
                            {currentLevelData.ante || "-"}
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-medium">{currentLevelData.duration} min</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">Average Stack</div>
                      <div className="font-medium">{averageStack.toLocaleString()}</div>
                    </div>
                    
                    {currentLevel < settings.levels.length - 1 && (
                      <>
                        <Separator />
                        
                        <div className="flex items-center text-sm">
                          <ArrowRight className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Next: </span>
                          
                          {settings.levels[currentLevel + 1].isBreak ? (
                            <span className="ml-1 text-poker-green">Break</span>
                          ) : (
                            <span className="ml-1">
                              {settings.levels[currentLevel + 1].smallBlind}/
                              {settings.levels[currentLevel + 1].bigBlind}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col mt-4 sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <Link to="/timer">
                      <Clock className="mr-2 h-4 w-4" />
                      Full Timer
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="flex-1" onClick={() => setShowTimeSetup(true)}>
                    <Timer className="mr-2 h-4 w-4" />
                    Time Setup
                  </Button>
                  
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/setup">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                  
                  <div className="flex-1">
                    <ShareTournament />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <TimerDisplay />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Scoreboard />
        </div>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5" />
                Player Management
              </CardTitle>
              <Button asChild size="sm">
                <Link to="/players">
                  Manage All Players
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search players..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchTerm ? "No players match your search" : "No players added yet"}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground pb-1 border-b">
                  <div className="col-span-4">Player</div>
                  <div className="col-span-1">Table</div>
                  <div className="col-span-2">Chips</div>
                  <div className="col-span-1 text-center">Rebuys</div>
                  <div className="col-span-1 text-center">Add-ons</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {filteredPlayers.map((player) => (
                    <div key={player.id} className={`grid grid-cols-12 py-2 text-sm border-b border-dashed last:border-0 items-center ${player.eliminated ? "text-muted-foreground" : ""}`}>
                      <div className="col-span-4 font-medium">{player.name}</div>
                      <div className="col-span-1">{player.tableNumber || "-"}</div>
                      <div className="col-span-2">{player.chips.toLocaleString()}</div>
                      <div className="col-span-1 text-center">{player.rebuys}</div>
                      <div className="col-span-1 text-center">{player.addOns}</div>
                      <div className="col-span-3 text-right">
                        <div className="flex justify-end space-x-1">
                          {!player.eliminated && (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleEliminatePlayer(player.id)}
                                title="Eliminate Player"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleAddRebuy(player.id)}
                                title="Add Rebuy"
                                disabled={currentLevel > settings.lastRebuyLevel || player.rebuys >= settings.maxRebuys}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleAddAddOn(player.id)}
                                title="Add Add-On"
                                disabled={currentLevel > settings.lastAddOnLevel || player.addOns >= settings.maxAddOns}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          {player.eliminated && (
                            <Badge variant="outline" className="text-xs">
                              Eliminated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/players" className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Players</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage players
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Players</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/tables" className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Tables</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Assign & manage tables
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Tables</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/timer" className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Timer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Full screen timer
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Timer className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Timer</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/setup" className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Setup</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tournament settings
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Setup</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>
      </div>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              Tournament Complete
            </DialogTitle>
            <DialogDescription>
              Tournament has ended. Here's the final summary.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-medium">{players.length}</div>
                <div className="text-sm text-muted-foreground">Total Entries</div>
              </div>
              <div>
                <div className="text-lg font-medium">${state.totalPrizePool}</div>
                <div className="text-sm text-muted-foreground">Prize Pool</div>
              </div>
              <div>
                <div className="text-lg font-medium">
                  {players.reduce((total, p) => total + p.rebuys, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Rebuys</div>
              </div>
              <div>
                <div className="text-lg font-medium">
                  ${calculateHouseMoney()}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Wallet className="h-3 w-3 mr-1" />
                  House
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Payout Table</h3>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {getPayoutTable().map((payout) => (
                  <div key={payout.position} className="flex justify-between py-1 border-b border-dashed last:border-0">
                    <div className="font-medium">
                      {payout.position === 1 ? "1st" : 
                       payout.position === 2 ? "2nd" :
                       payout.position === 3 ? "3rd" : 
                       `${payout.position}th`} Place
                    </div>
                    <div>${payout.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSummary(false)} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showTimeSetup} onOpenChange={setShowTimeSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Timer className="mr-2 h-5 w-5" />
              Tournament Time Setup
            </DialogTitle>
            <DialogDescription>
              Set tournament duration to automatically generate blind structure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Tournament Duration (minutes)
              </label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  value={tournamentDuration}
                  onChange={(e) => setTournamentDuration(parseInt(e.target.value) || 120)}
                />
                <Select
                  value={tournamentDuration.toString()}
                  onValueChange={(value) => setTournamentDuration(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="300">5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                This will generate appropriate blind levels for the tournament duration.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowTimeSetup(false)} className="sm:flex-1">
              Cancel
            </Button>
            <Button onClick={handleGenerateStructure} className="sm:flex-1">
              Generate Structure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
