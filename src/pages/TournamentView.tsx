
import React, { useEffect, useState } from "react";
import { useTournament } from "@/context/TournamentContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import Timer from "@/components/timer/Timer";
import { toast } from "sonner";

const TournamentView = () => {
  const { state, dispatch } = useTournament();
  const { currentLevel, isRunning, settings, players, timeRemaining } = state;
  const navigate = useNavigate();

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && startTime) {
      const intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
      setTimerIntervalId(intervalId);
    } else if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }

    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [isRunning, startTime]);

  const startTournament = () => {
    dispatch({ type: "START_TOURNAMENT" });
    setStartTime(new Date());
    toast.success("Tournament started!");
  };

  const pauseTournament = () => {
    dispatch({ type: "PAUSE_TOURNAMENT" });
    toast.info("Tournament paused.");
  };

  const resumeTournament = () => {
    dispatch({ type: "START_TOURNAMENT" });
    setStartTime(new Date(Date.now() - elapsedTime));
    toast.success("Tournament resumed!");
  };

  const stopTournament = () => {
    dispatch({ type: "RESET_TOURNAMENT" });
    setStartTime(null);
    setElapsedTime(0);
    toast.warning("Tournament stopped.");
  };

  const goToSetup = () => {
    navigate("/setup");
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Tournament View</h1>
        <p className="text-gray-600 mb-2">
          Current Level: {settings.levels[currentLevel]?.level || 1}
        </p>

        <div className="mb-4">
          {isRunning ? (
            <>
              <Button onClick={pauseTournament} variant="secondary">
                <Pause className="mr-2" /> Pause Tournament
              </Button>
              <Button onClick={stopTournament} variant="destructive" className="ml-2">
                <Square className="mr-2" /> Stop Tournament
              </Button>
            </>
          ) : startTime ? (
            <Button onClick={resumeTournament} variant="secondary">
              <Play className="mr-2" /> Resume Tournament
            </Button>
          ) : (
            <Button onClick={startTournament}>
              <Play className="mr-2" /> Start Tournament
            </Button>
          )}
          <Button onClick={goToSetup} className="ml-2">
            <SkipBack className="mr-2" />
            Go To Setup
          </Button>
        </div>

        <div className="mb-4">
          <Timer />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Blind Levels</h2>
          <table className="table-auto w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Level</th>
                <th className="p-2 border">Blinds</th>
                <th className="p-2 border">Ante</th>
                <th className="p-2 border">Duration</th>
              </tr>
            </thead>
            <tbody>
              {settings.levels.map((level, index) => (
                <tr key={index} className={level.isBreak ? 'bg-muted/30' : ''}>
                  <td className="p-2 border">{level.level}</td>
                  <td className="p-2 border">{level.isBreak ? 'Break' : `${level.smallBlind}/${level.bigBlind}`}</td>
                  <td className="p-2 border">{level.isBreak ? '-' : level.ante}</td>
                  <td className="p-2 border">{level.duration} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TournamentView;
