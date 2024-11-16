import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskItem from './TaskItem';

const TaskList = () => {
  const { tasks } = useTaskContext();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;