import React from 'react';
import { Timer, Plus, Check, Play, Pause, Trash2 } from 'lucide-react';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="w-8 h-8 text-indigo-600" />
              <h1 className="text-4xl font-bold text-gray-800">TaskTimer</h1>
            </div>
            <p className="text-gray-600">Manage your tasks and time efficiently</p>
          </header>
          
          <AddTask />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}

export default App;