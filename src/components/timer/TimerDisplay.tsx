
import React from 'react';
import Timer from './Timer';

const TimerDisplay = () => {
  return (
    <div className="w-full">
      <Timer className="bg-muted/30 p-6 rounded-lg shadow-sm border border-border/20" showDurationEditor={false} />
    </div>
  );
};

export default TimerDisplay;
