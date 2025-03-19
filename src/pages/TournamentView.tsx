// src/pages/TournamentView.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Trophy, Clock, AlertTriangle } from "lucide-react";
import { TournamentState, Player, Table } from "@/types/types";

// Custom read-only timer display for the shared view
const ReadOnlyTimerDisplay: React.FC<{ 
  initialTime: number; 
  isRunning: boolean;
  isPaused?: boolean; 
}> = ({ initialTime, isRunning, isPaused = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Only count down if the tournament is running and not paused in the shared view
  useEffect(() => {
    let timer: number | null = null;
    
    if (isRunning && !isPaused && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isPaused, timeRemaining]);
  
  // Calculate progress percentage
  const progress = (timeRemaining / (initialTime || 1)) * 100;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Progress circle */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-muted stroke-current"
            strokeWidth="4"
            cx="50"
            cy="50"
            r="45"
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            className={`transition-all duration-1000 ${isBreak ? "text-poker-green" : "text-primary"}`}
            strokeWidth="4"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 text-sm text-muted-foreground">
        {isPaused ? (
          <span className="text-yellow-500">Paused</span>
        ) : isRunning ? (
          <span className="text-poker-green">Running</span>
        ) : (
          <span>Not Started</span>
        )}
      </div>
    </div>
  );
};

// Simplified version of the tournament state for the view-only mode
interface SharedTournamentData {
  id: string;
  timestamp: string;
  tournament: {
    currentLevel: number;
    isRunning: boolean;
    timeRemaining: number;
    activePlayers: number;
    totalPlayers: number;
    totalPrizePool: number;
    settings: {
      levels: any[];
      payoutStructure: any;
    };
    players?: Player[];
    tables?: Table[];
  };
}

const TournamentView: React.FC = () => {
  const location = useLocation();
  const [tournamentData, setTournamentData] = useState<SharedTournamentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  useEffect(() => {
    // Parse the shared data from URL
    try {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get('data');
      
      if (!encodedData) {
        setError("No tournament data found");
        return;
      }
      
      const decodedData = atob(encodedData);
      const parsedData = JSON.parse(decodedData) as SharedTournamentData;
      
      // Validate the data
      if (!parsedData || !parsedData.tournament) {
        setError("Invalid tournament data");
        return;
      }
      
      setTournamentData(parsedData);
      
      // Store the data in localStorage to persist after refresh
      localStorage.setItem('sharedTournamentData', encodedData);
    } catch (err) {
      console.error("Error parsing tournament data:", err);
      setError("Failed to load tournament data");
      
      // Try to load from localStorage if URL parsing fails
      const savedData = localStorage.getItem('sharedTournamentData');
      if (savedData) {
        try {
          const decodedData = atob(savedData);
          const parsedData = JSON.parse(decodedData) as SharedTournamentData;
          setTournamentData(parsedData);
        } catch (e) {
          console.error("Error parsing saved tournament data:", e);
        }
      }
    }
  }, [location.search]);
  
  // Handle page visibility changes to pause/resume timer when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AlertTriangle className="text-yellow-500 w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Tournament</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Layout>
    );
  }
  
  if (!tournamentData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  const tournament = tournamentData.tournament;
  const currentLevel = tournament.settings.levels[tournament.currentLevel];
  const isBreak = currentLevel.isBreak;
  const nextLevelIndex = tournament.currentLevel + 1;
  const nextLevel = nextLevelIndex < tournament.settings.levels.length 
    ? tournament.settings.levels[nextLevelIndex] 
    : null;
  
  // Calculate time until next break
  const getTimeUntilBreak = () => {
    let timeUntilBreak = 0;
    let levelIdx = tournament.currentLevel;
    
    // If current level is a break, return 0
    if (currentLevel.isBreak) return 0;
    
    // Calculate time through remaining levels until we hit a break
    while (levelIdx < tournament.settings.levels.length) {
      const level = tournament.settings.levels[levelIdx];
      
      if (levelIdx === tournament.currentLevel) {
        // For current level, only count remaining time
        timeUntilBreak += tournament.timeRemaining;
      } else if (level.isBreak) {
        // We found a break, stop counting
        break;
      } else {
        // Add full level duration
        timeUntilBreak += level.duration * 60;
      }
      
      levelIdx++;
    }
    
    return timeUntilBreak;
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time in hours and minutes
  const formatLongTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Calculate average stack
  const calculateAverageStack = () => {
    if (!tournament.players || tournament.activePlayers === 0) return 0;
    
    const activePlayers = tournament.players.filter(p => !p.eliminated);
    const totalChips = activePlayers.reduce((sum, p) => sum + p.chips, 0);
    
    return Math.round(totalChips / activePlayers.length);
  };
  
  // Render the scoreboard
  const renderScoreboard = () => {
    if (!tournament.players) return null;
    
    // Get eliminated players
    const eliminatedPlayers = tournament.players
      .filter(p => p.eliminated)
      .map(player => {
        // Calculate position based on total players and elimination order
        const position = tournament.totalPlayers + 1 - (player.eliminationPosition || 0);
        return { ...player, displayPosition: position };
      })
      .sort((a, b) => a.displayPosition - b.displayPosition);
    
    // Check if position is in the money
    const isInTheMoney = (position: number): boolean => {
      if (!tournament.settings.payoutStructure || !tournament.settings.payoutStructure.places) {
        return false;
      }
      
      return tournament.settings.payoutStructure.places.some(p => p.position === position);
    };
    
    // Calculate payout for position
    const calculatePayout = (position: number): number | null => {
      if (!tournament.settings.payoutStructure || !tournament.settings.payoutStructure.places) {
        return null;
      }
      
      const payoutPlace = tournament.settings.payoutStructure.places.find(p => p.position === position);
      if (!payoutPlace) return null;
      
      return (tournament.totalPrizePool * payoutPlace.percentage) / 100;
    };
    
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground pb-1 border-b">
          <div className="col-span-3">Position</div>
          <div className="col-span-6">Name</div>
          <div className="col-span-3 text-right">Prize</div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto pr-2">
          {eliminatedPlayers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No players have been eliminated yet
            </div>
          ) : (
            eliminatedPlayers.map((player) => {
              const position = player.displayPosition;
              const inTheMoney = isInTheMoney(position);
              const payout = inTheMoney ? calculatePayout(position) : null;
              
              return (
                <div key={player.id} className="grid grid-cols-12 py-2 text-sm border-b border-dashed last:border-0">
                  <div className="col-span-3">#{position}</div>
                  <div className="col-span-6 font-medium">{player.name}</div>
                  <div className="col-span-3 text-right">
                    {inTheMoney && payout !== null ? `$${payout.toFixed(2)}` : '-'}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <div className="text-sm font-medium">
            {tournament.activePlayers} player{tournament.activePlayers !== 1 ? 's' : ''} remaining
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
              View Only Mode
            </div>
            <h1 className="text-2xl font-bold">Poker Tournament</h1>
            <p className="text-muted-foreground">
              Shared on {new Date(tournamentData.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer and Current Level */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tournament Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="my-6">
                  <ReadOnlyTimerDisplay 
                    initialTime={tournament.timeRemaining} 
                    isRunning={tournament.isRunning}
                    isPaused={isPaused}
                  />
                </div>
                
                <div className="grid grid-cols-2 w-full gap-6 mt-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Current Level</div>
                    <div className="text-xl font-bold">{currentLevel.level}</div>
                  </div>
                  
                  {!currentLevel.isBreak && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Blinds</div>
                      <div className="text-xl font-bold">
                        {currentLevel.smallBlind}/{currentLevel.bigBlind}
                      </div>
                    </div>
                  )}
                  
                  {currentLevel.isBreak ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="text-xl font-bold text-green-600">Break</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Ante</div>
                      <div className="text-xl font-bold">{currentLevel.ante || "-"}</div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Average Stack</div>
                    <div className="text-xl font-bold">{calculateAverageStack().toLocaleString()}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Time to Break</div>
                    <div className="text-xl font-bold">
                      {currentLevel.isBreak ? "-" : formatLongTime(getTimeUntilBreak())}
                    </div>
                  </div>
                </div>
                
                {nextLevel && (
                  <>
                    <Separator className="my-4" />
                    <div className="w-full">
                      <div className="flex items-center mb-2">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Coming up next</span>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md">
                        {nextLevel.isBreak ? (
                          <div className="font-medium">Break ({nextLevel.duration} min)</div>
                        ) : (
                          <div className="font-medium">
                            Level {nextLevel.level}: {nextLevel.smallBlind}/{nextLevel.bigBlind}
                            {nextLevel.ante > 0 ? ` (ante: ${nextLevel.ante})` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Scoreboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Tournament Scoreboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderScoreboard()}
            </CardContent>
          </Card>
        </div>
        
        {/* Tournament Info */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle>Tournament Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Total Players</div>
                <div className="text-xl font-bold">{tournament.totalPlayers}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Active Players</div>
                <div className="text-xl font-bold">{tournament.activePlayers}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Prize Pool</div>
                <div className="text-xl font-bold">${tournament.totalPrizePool}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-xl font-bold">
                  {tournament.isRunning ? (
                    <span className="text-green-600">Running</span>
                  ) : (
                    <span className="text-yellow-600">Paused</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TournamentView;