
import React, { useEffect, useState } from "react";
import { PlayCircle, PauseCircle, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTournament } from "@/context/TournamentContext";
import { playCountdownSequence, playLevelUpSound, playBreakSound } from "@/utils/sounds";

interface TimerDisplayProps {
  fullscreen?: boolean;
  className?: string;
  showDurationEditor?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  fullscreen = false, 
  className,
  showDurationEditor = false
}) => {
  const { state, dispatch } = useTournament();
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const { 
    isRunning, 
    currentLevel, 
    timeRemaining,
    settings 
  } = state;
  
  const currentLevelData = settings.levels[currentLevel];
  const isBreak = currentLevelData?.isBreak;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer progress percentage
  const getProgress = () => {
    if (!currentLevelData) return 0;
    const totalSeconds = currentLevelData.duration * 60;
    return Math.max(0, Math.min(100, (timeRemaining / totalSeconds) * 100));
  };
  
  // Timer color based on time remaining
  const getTimerColor = () => {
    if (isBreak) return "text-poker-green";
    
    if (timeRemaining <= 30) return "text-poker-red";
    if (timeRemaining <= 60) return "text-yellow-500";
    return "text-foreground";
  };
  
  // Color for progress bar
  const getProgressColor = () => {
    if (isBreak) return "bg-poker-green";
    
    const progress = getProgress();
    if (progress <= 10) return "bg-poker-red";
    if (progress <= 20) return "bg-yellow-500";
    return "bg-blue-500";
  };
  
  // Play sound effects
  useEffect(() => {
    if (soundEnabled && isRunning) {
      // Play countdown for last 5 seconds
      if (timeRemaining <= 5 && timeRemaining > 0) {
        playCountdownSequence(timeRemaining);
      }
      
      // Play level transition sounds
      if (timeRemaining === 0) {
        // Check if the next level is a break
        const nextLevelIndex = currentLevel + 1;
        if (nextLevelIndex < settings.levels.length) {
          const nextLevel = settings.levels[nextLevelIndex];
          if (nextLevel.isBreak) {
            playBreakSound();
          } else {
            playLevelUpSound();
          }
        }
      }
    }
  }, [timeRemaining, isRunning, soundEnabled, currentLevel, settings.levels]);
  
  const handleStartPause = () => {
    if (isRunning) {
      dispatch({ type: 'PAUSE_TOURNAMENT' });
    } else {
      dispatch({ type: 'START_TOURNAMENT' });
    }
  };
  
  const handleNextLevel = () => {
    dispatch({ type: 'NEXT_LEVEL' });
  };
  
  const handlePrevLevel = () => {
    dispatch({ type: 'PREVIOUS_LEVEL' });
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullscreen ? "h-[80vh]" : "h-full",
      className
    )}>
      {/* Current level info */}
      <div className={cn(
        "text-center mb-4",
        fullscreen ? "text-2xl" : "text-xl"
      )}>
        {isBreak ? (
          <span className="font-semibold text-poker-green">Break Time</span>
        ) : (
          <>
            <span className="text-muted-foreground">Level </span>
            <span className="font-semibold">{currentLevelData?.level}</span>
            <span className="text-muted-foreground"> • </span>
            <span className="font-medium">{currentLevelData?.smallBlind}/{currentLevelData?.bigBlind}</span>
            {currentLevelData?.ante > 0 && (
              <span className="text-muted-foreground ml-2">Ante: {currentLevelData.ante}</span>
            )}
          </>
        )}
      </div>
      
      {/* Timer display */}
      <div 
        className={cn(
          "flex flex-col items-center justify-center relative",
          fullscreen ? "w-64 h-64 md:w-80 md:h-80" : "w-40 h-40 md:w-48 md:h-48"
        )}
      >
        {/* Circular progress */}
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
            className={cn("transition-all duration-1000", getProgressColor())}
            strokeWidth="4"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * getProgress()) / 100}
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Time text */}
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-colors",
            getTimerColor(),
            fullscreen ? "text-5xl md:text-6xl font-bold" : "text-3xl md:text-4xl font-bold"
          )}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      {/* Timer controls */}
      <div className="flex items-center space-x-4 mt-6">
        <Button
          variant="outline"
          size={fullscreen ? "lg" : "default"}
          className="rounded-full"
          onClick={handlePrevLevel}
          disabled={currentLevel <= 0}
        >
          <SkipBack className="w-5 h-5" />
        </Button>
        
        <Button
          variant={isRunning ? "destructive" : "default"}
          size={fullscreen ? "lg" : "default"}
          className="rounded-full"
          onClick={handleStartPause}
        >
          {isRunning ? (
            <PauseCircle className="w-6 h-6 mr-1" />
          ) : (
            <PlayCircle className="w-6 h-6 mr-1" />
          )}
          {isRunning ? "Pause" : "Start"}
        </Button>
        
        <Button
          variant="outline"
          size={fullscreen ? "lg" : "default"}
          className="rounded-full"
          onClick={handleNextLevel}
          disabled={currentLevel >= settings.levels.length - 1}
        >
          <SkipForward className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size={fullscreen ? "icon" : "icon"}
          onClick={toggleSound}
          className="rounded-full"
        >
          {soundEnabled ? (
            <Volume2 className={fullscreen ? "w-6 h-6" : "w-5 h-5"} />
          ) : (
            <VolumeX className={fullscreen ? "w-6 h-6" : "w-5 h-5"} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default TimerDisplay;
