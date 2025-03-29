
import React from "react";
import Layout from "@/components/layout/Layout";
import Timer from "@/components/timer/Timer";
import TimerDisplay from "@/components/timer/TimerDisplay";
import Scoreboard from "@/components/scoreboard/Scoreboard";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PlayerDashboard from "@/components/dashboard/PlayerDashboard";

const Dashboard = () => {
  const { state, dispatch } = useTournament();
  const { players, settings, currentLevel, isRunning } = state;
  
  const activePlayers = players.filter(p => !p.eliminated);
  const currentLevelData = settings.levels[currentLevel];
  const averageStack = activePlayers.length > 0 
    ? Math.round(activePlayers.reduce((sum, p) => sum + p.chips, 0) / activePlayers.length) 
    : 0;

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
          <Scoreboard />
        </div>
      </div>
      
      <div className="mt-6">
        <PlayerDashboard />
      </div>
    </Layout>
  );
};

export default Dashboard;
