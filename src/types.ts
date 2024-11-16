export interface Task {
  id: string;
  title: string;
  completed: boolean;
  isRunning: boolean;
  elapsedTime: number;
  timerMode: 'stopwatch' | 'pomodoro' | null;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  isWorkTime: boolean;
  remainingTime: number;
}