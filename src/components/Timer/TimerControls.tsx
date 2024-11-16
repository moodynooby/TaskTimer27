import React from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  mode: 'stopwatch' | 'pomodoro';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeToggle: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
  onModeToggle,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={isRunning ? onPause : onStart}
          className={`p-3 rounded-full transition-colors ${
            isRunning
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={onReset}
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
      
      <button
        onClick={onModeToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {mode === 'stopwatch' ? (
          <>
            <Clock className="w-4 h-4" />
            <span>Switch to Pomodoro</span>
          </>
        ) : (
          <>
            <TimerIcon className="w-4 h-4" />
            <span>Switch to Stopwatch</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TimerControls;