import React, { createContext, useContext, useReducer } from 'react';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'UPDATE_ELAPSED_TIME'; payload: { id: string; time: number } };

const TaskContext = createContext<{
  tasks: Task[];
  addTask: (title: string) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  updateElapsedTime: (id: string, time: number) => void;
} | null>(null);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        tasks: [
          ...state.tasks,
          {
            id: Date.now().toString(),
            title: action.payload,
            completed: false,
            isRunning: false,
            elapsedTime: 0,
            timerMode: null,
          },
        ],
      };
    case 'DELETE_TASK':
      return {
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'TOGGLE_COMPLETE':
      return {
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, isRunning: false }
            : task
        ),
      };
    case 'UPDATE_ELAPSED_TIME':
      return {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, elapsedTime: action.payload.time }
            : task
        ),
      };
    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] });

  const addTask = (title: string) =>
    dispatch({ type: 'ADD_TASK', payload: title });
  const deleteTask = (id: string) =>
    dispatch({ type: 'DELETE_TASK', payload: id });
  const toggleComplete = (id: string) =>
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
  const updateElapsedTime = (id: string, time: number) =>
    dispatch({ type: 'UPDATE_ELAPSED_TIME', payload: { id, time } });

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        addTask,
        deleteTask,
        toggleComplete,
        updateElapsedTime,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};