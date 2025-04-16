
import React, { createContext, useContext, ReactNode } from 'react';
import { Task, TasksContextType } from '@/types/task.types';
import { useTasks as useTasksHook } from '@/hooks/useTasks';

// Create the context
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Export the consumer hook
export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

// For backward compatibility, also export as useTasks
export const useTasks = useTasksContext;

// Re-export Task type for convenience
export type { Task };

// Provider component
interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  // Use our custom hook to get all the task functionality
  const tasksData = useTasksHook();
  
  return (
    <TasksContext.Provider value={tasksData}>
      {children}
    </TasksContext.Provider>
  );
};
