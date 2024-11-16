import React from 'react';
import { Timer as TimerIcon, Clock } from 'lucide-react';

interface TimerDisplayProps {
  mode: 'stopwatch' | 'pomodoro';
  time: number;
  progress?: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ mode, time, progress = 0 }) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center">
      {mode === 'pomodoro' && (
        <div className="w-48 h-48 rounded-full border-4 border-gray-200 relative mb-4">
          <div
            className="absolute inset-0 rounded-full border-4 border-indigo-500 transition-all"
            style={{
              clipPath: `polygon(50% 50%, -50% -50%, ${progress * 100}% -50%, ${
                progress * 100
              }% ${progress * 100}%)`,
              transform: `rotate(${progress * 360}deg)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-800">{formatTime(time)}</span>
          </div>
        </div>
      )}
      
      {mode === 'stopwatch' && (
        <div className="text-5xl font-bold text-gray-800 mb-4">
          {formatTime(time)}
        </div>
      )}
      
      <div className="flex items-center gap-2 text-gray-600">
        {mode === 'stopwatch' ? (
          <TimerIcon className="w-5 h-5" />
        ) : (
          <Clock className="w-5 h-5" />
        )}
        <span className="capitalize">{mode} Mode</span>
      </div>
    </div>
  );
};

export default TimerDisplay;