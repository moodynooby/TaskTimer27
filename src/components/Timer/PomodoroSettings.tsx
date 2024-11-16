import React from 'react';
import { Settings } from 'lucide-react';

interface PomodoroSettingsProps {
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (duration: number) => void;
  onBreakDurationChange: (duration: number) => void;
}

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
}) => {
  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-800">Pomodoro Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Work Duration (minutes)
          </label>
          <input
            type="number"
            value={workDuration / 60}
            onChange={(e) => onWorkDurationChange(Number(e.target.value) * 60)}
            min="1"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Break Duration (minutes)
          </label>
          <input
            type="number"
            value={breakDuration / 60}
            onChange={(e) => onBreakDurationChange(Number(e.target.value) * 60)}
            min="1"
            max="30"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default PomodoroSettings;