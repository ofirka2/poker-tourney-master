import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from "@/context/TournamentContext";
import { formatTime } from "@/lib/utils";
import { Play, Pause, SkipForward, SkipBack, Refresh } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TimerProps {
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ className }) => {
  const { state, dispatch } = useTournament();
  const { levels, currentLevel, isRunning } = state;
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(!isRunning);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
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
          return prevTime - 1;
        } else {
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
      
      <div className="flex items-center justify-center mb-4">
        <h3 className="text-5xl font-semibold">
          {formatTime(timeRemaining)}
        </h3>
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
            <Refresh className="mr-2" />
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
