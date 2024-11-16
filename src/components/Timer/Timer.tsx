import React, { useEffect, useState } from 'react';
import useSound from 'use-sound';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import PomodoroSettings from './PomodoroSettings';
import { PomodoroSettings as PomodoroSettingsType } from '../../types';

interface TimerProps {
  taskId?: string;
  onTimeUpdate?: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ taskId, onTimeUpdate }) => {
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettingsType>({
    workDuration: 50 * 60, // 50 minutes
    breakDuration: 10 * 60, // 10 minutes
    isWorkTime: true,
    remainingTime: 50 * 60,
  });

  const [playSound] = useSound('/notification.mp3', { volume: 0.5 });

  useEffect(() => {
    let interval: number;

    if (isRunning) {
      interval = window.setInterval(() => {
        if (mode === 'stopwatch') {
          setTime((prev) => {
            const newTime = prev + 1;
            onTimeUpdate?.(newTime);
            return newTime;
          });
        } else {
          setPomodoroSettings((prev) => {
            const newRemainingTime = prev.remainingTime - 1;
            
            if (newRemainingTime <= 0) {
              playSound();
              const isWorkTime = !prev.isWorkTime;
              return {
                ...prev,
                isWorkTime,
                remainingTime: isWorkTime ? prev.workDuration : prev.breakDuration,
              };
            }
            
            return { ...prev, remainingTime: newRemainingTime };
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, onTimeUpdate, playSound]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setTime(0);
    } else {
      setPomodoroSettings((prev) => ({
        ...prev,
        isWorkTime: true,
        remainingTime: prev.workDuration,
      }));
    }
  };

  const handleModeToggle = () => {
    setIsRunning(false);
    setMode((prev) => (prev === 'stopwatch' ? 'pomodoro' : 'stopwatch'));
    handleReset();
  };

  const progress = mode === 'pomodoro'
    ? 1 - (pomodoroSettings.remainingTime / (pomodoroSettings.isWorkTime ? pomodoroSettings.workDuration : pomodoroSettings.breakDuration))
    : 0;

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-xl shadow-sm">
      <TimerDisplay
        mode={mode}
        time={mode === 'stopwatch' ? time : pomodoroSettings.remainingTime}
        progress={progress}
      />
      
      <TimerControls
        isRunning={isRunning}
        mode={mode}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onModeToggle={handleModeToggle}
      />
      
      {mode === 'pomodoro' && (
        <PomodoroSettings
          workDuration={pomodoroSettings.workDuration}
          breakDuration={pomodoroSettings.breakDuration}
          onWorkDurationChange={(duration) =>
            setPomodoroSettings((prev) => ({
              ...prev,
              workDuration: duration,
              remainingTime: prev.isWorkTime ? duration : prev.remainingTime,
            }))
          }
          onBreakDurationChange={(duration) =>
            setPomodoroSettings((prev) => ({
              ...prev,
              breakDuration: duration,
              remainingTime: prev.isWorkTime ? prev.remainingTime : duration,
            }))
          }
        />
      )}
    </div>
  );
};

export default Timer;