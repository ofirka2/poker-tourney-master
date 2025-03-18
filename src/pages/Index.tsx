
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { TimerDisplay } from "@/components/timer/Timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  Timer, Users, LayoutGrid, Settings, ChevronRight, 
  Play, Clock, Trophy, ArrowRight, UserMinus, Search
} from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import PayoutCalculator from "@/components/payout/PayoutCalculator";
import Scoreboard from "@/components/scoreboard/Scoreboard";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Index = () => {
  const { state, dispatch } = useTournament();
  const { players, settings, currentLevel, isRunning } = state;
  const [searchTerm, setSearchTerm] = useState("");
  
  const activePlayers = players.filter(p => !p.eliminated);
  const currentLevelData = settings.levels[currentLevel];
  const averageStack = activePlayers.length > 0 
    ? Math.round(activePlayers.reduce((sum, p) => sum + p.chips, 0) / activePlayers.length) 
    : 0;

  // Filter players based on search term
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle player elimination
  const handleEliminatePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    dispatch({ type: 'MARK_ELIMINATED', payload: id });
    toast.info(`Player ${player.name} eliminated`);
  };
  
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Tournament Status</CardTitle>
              {isRunning ? (
                <Badge variant="default" className="bg-poker-green">Running</Badge>
              ) : (
                <Badge variant="outline">Not Started</Badge>
              )}
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
                    
                    {/* Next level preview */}
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
                  
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/setup">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <TimerDisplay />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <PayoutCalculator />
          
          {/* Scoreboard instead of Buy-In Info */}
          <Scoreboard />
        </div>
      </div>
      
      {/* Player List Section (replaces Scoreboard) */}
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
                  <div className="col-span-5">Player</div>
                  <div className="col-span-2">Table</div>
                  <div className="col-span-2">Chips</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {filteredPlayers.map((player) => (
                    <div key={player.id} className={`grid grid-cols-12 py-2 text-sm border-b border-dashed last:border-0 items-center ${player.eliminated ? "text-muted-foreground" : ""}`}>
                      <div className="col-span-5 font-medium">{player.name}</div>
                      <div className="col-span-2">{player.tableNumber || "-"}</div>
                      <div className="col-span-2">{player.chips.toLocaleString()}</div>
                      <div className="col-span-3 text-right">
                        <div className="flex justify-end space-x-2">
                          {!player.eliminated && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8"
                              onClick={() => handleEliminatePlayer(player.id)}
                            >
                              <UserMinus className="h-3.5 w-3.5 mr-1" />
                              Eliminate
                            </Button>
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
        {/* Quick access cards */}
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
    </Layout>
  );
};

export default Index;
