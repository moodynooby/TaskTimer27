import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types';
import Timer from './Timer/Timer';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { deleteTask, toggleComplete, updateElapsedTime } = useTaskContext();

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 transition-all ${
      task.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => toggleComplete(task.id)}
            className={`rounded-full p-2 transition-colors ${
              task.completed
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Check className="w-5 h-5" />
          </button>
          <h3 className={`text-lg font-medium ${
            task.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}>
            {task.title}
          </h3>
        </div>
        
        <button
          onClick={() => deleteTask(task.id)}
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {!task.completed && (
        <Timer
          taskId={task.id}
          onTimeUpdate={(time) => updateElapsedTime(task.id, time)}
        />
      )}
    </div>
  );
};

export default TaskItem;