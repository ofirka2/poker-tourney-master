
import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from "@/context/TournamentContext";
import { formatTime } from "@/lib/utils";
import { Play, Pause, SkipForward, SkipBack, RefreshCw, Clock, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { playCountdownSequence, playLevelUpSound } from "@/utils/sounds";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

interface TimerProps {
  className?: string;
  fullscreen?: boolean;
}

const Timer: React.FC<TimerProps> = ({ className, fullscreen }) => {
  const { state, dispatch } = useTournament();
  const { currentLevel, isRunning } = state;
  const levels = state.settings.levels;
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(!isRunning);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [timeAdjustmentOpen, setTimeAdjustmentOpen] = useState(false);
  const [minutesToAdjust, setMinutesToAdjust] = useState(0);
  const [secondsToAdjust, setSecondsToAdjust] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate the total duration of all levels
  const totalDuration = levels.reduce((acc, level) => acc + level.duration, 0);
  
  // Calculate the elapsed time based on the current level and time remaining
  const elapsedTime = levels
    .slice(0, currentLevel)
    .reduce((acc, level) => acc + level.duration, 0) + (levels[currentLevel]?.duration - timeRemaining);
  
  // Calculate the progress percentage
  const progress = isNaN((elapsedTime / totalDuration) * 100) ? 0 : (elapsedTime / totalDuration) * 100;
  
  // Calculate the end time of the current level
  const currentLevelEndTime = new Date();
  currentLevelEndTime.setMinutes(currentLevelEndTime.getMinutes() + (levels[currentLevel]?.duration || 0));
  
  // Calculate the end time of the tournament
  const tournamentEndTime = new Date();
  tournamentEndTime.setMinutes(tournamentEndTime.getMinutes() + totalDuration);
  
  // Function to start the timer
  const startTimer = () => {
    setIsPaused(false);
    dispatch({ type: 'START_TOURNAMENT' });
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime > 0) {
          // Play sound for the last 5 seconds
          if (prevTime <= 5) {
            playCountdownSequence(prevTime);
          }
          return prevTime - 1;
        } else {
          // Play level up sound
          playLevelUpSound();
          
          // Move to the next level
          if (currentLevel < levels.length - 1) {
            dispatch({ type: 'NEXT_LEVEL' });
            return levels[currentLevel + 1].duration * 60;
          } else {
            // Tournament is over
            stopTimer();
            dispatch({ type: 'END_TOURNAMENT' });
            toast.success("Tournament Completed!");
            return 0;
          }
        }
      });
    }, 1000);
  };
  
  // Function to stop the timer
  const stopTimer = () => {
    setIsPaused(true);
    dispatch({ type: 'PAUSE_TOURNAMENT' });
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Function to toggle the timer
  const toggleTimer = () => {
    if (isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
  };
  
  // Function to move to the next level
  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      stopTimer();
      dispatch({ type: 'NEXT_LEVEL' });
      setTimeRemaining(levels[currentLevel + 1].duration * 60);
      startTimer();
    } else {
      toast.message("This is the last level");
    }
  };
  
  // Function to move to the previous level
  const prevLevel = () => {
    if (currentLevel > 0) {
      stopTimer();
      dispatch({ type: 'PREV_LEVEL' });
      setTimeRemaining(levels[currentLevel - 1].duration * 60);
      startTimer();
    } else {
      toast.message("This is the first level");
    }
  };
  
  // Function to reset the timer
  const resetTimer = () => {
    setIsResetting(true);
    stopTimer();
    dispatch({ type: 'RESET_TOURNAMENT' });
    setTimeRemaining(levels[0].duration * 60);
    setIsResetting(false);
    setResetDialogOpen(false);
  };
  
  // Function to update the level duration
  const updateLevelDuration = (duration: number) => {
    if (currentLevel >= 0 && currentLevel < levels.length) {
      dispatch({ 
        type: 'UPDATE_CURRENT_LEVEL_DURATION', 
        payload: { 
          levelIndex: currentLevel, 
          duration 
        }
      });
      setTimeRemaining(duration * 60);
    }
  };
  
  // Function to manually adjust the timer
  const adjustTime = () => {
    const totalSecondsToAdd = (minutesToAdjust * 60) + secondsToAdjust;
    
    // Get current time remaining in seconds
    let newTimeRemaining = timeRemaining + totalSecondsToAdd;
    
    // Make sure it doesn't go below 0
    if (newTimeRemaining < 0) newTimeRemaining = 0;
    
    setTimeRemaining(newTimeRemaining);
    toast.success(`Timer adjusted by ${minutesToAdjust}m ${secondsToAdjust}s`);
    setTimeAdjustmentOpen(false);
    
    // Reset adjustment values
    setMinutesToAdjust(0);
    setSecondsToAdjust(0);
  };
  
  // Helper function to increment/decrement time
  const quickAdjustTime = (seconds: number) => {
    let newTimeRemaining = timeRemaining + seconds;
    if (newTimeRemaining < 0) newTimeRemaining = 0;
    setTimeRemaining(newTimeRemaining);
    
    const sign = seconds > 0 ? '+' : '';
    toast.success(`Timer adjusted by ${sign}${seconds}s`);
  };
  
  // useEffect to initialize the timer when the component mounts
  useEffect(() => {
    if (levels.length > 0) {
      setTimeRemaining(levels[currentLevel].duration * 60);
    }
  }, [levels, currentLevel]);
  
  // useEffect to start the timer when the component mounts if the tournament is running
  useEffect(() => {
    if (isRunning && levels.length > 0) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, levels]);
  
  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          Level {levels[currentLevel]?.level || 0}
          {levels[currentLevel]?.isBreak ? ' - Break' : ''}
        </h2>
        <p className="text-muted-foreground">
          {levels[currentLevel]?.isBreak 
            ? 'Enjoy your break!' 
            : `Blinds: ${levels[currentLevel]?.smallBlind}/${levels[currentLevel]?.bigBlind} Ante: ${levels[currentLevel]?.ante}`}
        </p>
      </div>
      
      <div className="flex items-center justify-center mb-4 relative">
        <div className="text-center">
          <h3 className="text-6xl md:text-7xl font-bold font-mono tracking-wider py-4 px-6 bg-gradient-to-b from-background to-background/80 shadow-inner rounded-xl border border-border/30">
            {formatTime(timeRemaining)}
          </h3>
          
          <div className="flex justify-center mt-2 space-x-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => quickAdjustTime(-10)}
              className="h-8 w-8"
            >
              <Minus size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => quickAdjustTime(-60)}
              className="h-8 w-8"
            >
              <span className="text-xs">-1m</span>
            </Button>
            
            <Drawer open={timeAdjustmentOpen} onOpenChange={setTimeAdjustmentOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Clock className="mr-2 h-4 w-4" />
                  Adjust
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Adjust Timer</DrawerTitle>
                    <DrawerDescription>
                      Manually adjust the remaining time for this level.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <div className="flex flex-col space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="minutes" className="text-sm font-medium mb-1 block">
                            Minutes
                          </label>
                          <div className="flex">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setMinutesToAdjust(prev => prev - 1)}
                              className="rounded-r-none"
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              id="minutes"
                              type="number"
                              value={minutesToAdjust}
                              onChange={(e) => setMinutesToAdjust(parseInt(e.target.value) || 0)}
                              className="rounded-none text-center"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setMinutesToAdjust(prev => prev + 1)}
                              className="rounded-l-none"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="seconds" className="text-sm font-medium mb-1 block">
                            Seconds
                          </label>
                          <div className="flex">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setSecondsToAdjust(prev => prev - 15)}
                              className="rounded-r-none"
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              id="seconds"
                              type="number"
                              value={secondsToAdjust}
                              onChange={(e) => setSecondsToAdjust(parseInt(e.target.value) || 0)}
                              className="rounded-none text-center"
                              step={15}
                              min={-59}
                              max={59}
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setSecondsToAdjust(prev => prev + 15)}
                              className="rounded-l-none"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Current time: {formatTime(timeRemaining)}<br />
                        New time: {formatTime(timeRemaining + (minutesToAdjust * 60) + secondsToAdjust)}
                      </p>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button onClick={adjustTime}>Apply Changes</Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => quickAdjustTime(60)}
              className="h-8 w-8"
            >
              <span className="text-xs">+1m</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => quickAdjustTime(10)}
              className="h-8 w-8"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          disabled
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Button variant="outline" onClick={prevLevel} disabled={currentLevel === 0}>
          <SkipBack className="mr-2" />
          Previous
        </Button>
        <Button 
          variant="default"  
          size="lg" 
          onClick={toggleTimer} 
          className="w-full text-xl h-14"
        >
          {!isPaused ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {!isPaused ? "Pause" : "Resume"}
        </Button>
        <Button variant="outline" onClick={nextLevel} disabled={currentLevel === levels.length - 1}>
          Next
          <SkipForward className="ml-2" />
        </Button>
      </div>
      
      <div className="mb-4">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Level Duration (minutes)
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            name="duration"
            id="duration"
            className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
            placeholder="Enter duration"
            value={levels[currentLevel]?.duration || 0}
            onChange={(e) => updateLevelDuration(Number(e.target.value))}
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            min
          </span>
        </div>
      </div>
      
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <RefreshCw className="mr-2" />
            Reset Timer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will reset the timer to the beginning of the first level.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetTimer} disabled={isResetting}>
              {isResetting ? "Resetting..." : "Reset Timer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timer;
