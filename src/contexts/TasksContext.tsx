
import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TasksContextType, Task } from '@/types/task.types';

// Create the context
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Export the consumer hook
export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

// Re-export Task type for convenience
export type { Task };

// Provider component
interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  // Use our custom hook to get all the task functionality
  const tasksData = useTasks();
  
  return (
    <TasksContext.Provider value={tasksData}>
      {children}
    </TasksContext.Provider>
  );
};
