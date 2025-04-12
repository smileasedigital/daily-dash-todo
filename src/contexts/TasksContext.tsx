
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Task type
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

interface TasksContextType {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  filteredTasks: Task[];
  addTask: (title: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  isLoading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error('Error parsing stored tasks:', error);
      }
    } else {
      // Add some example tasks if no tasks exist
      const exampleTasks: Task[] = [
        {
          id: '1',
          title: 'Complete todo app design',
          completed: false,
          date: format(new Date(), 'yyyy-MM-dd'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Go for a 30-minute walk',
          completed: true,
          date: format(new Date(), 'yyyy-MM-dd'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setTasks(exampleTasks);
      localStorage.setItem('tasks', JSON.stringify(exampleTasks));
    }
    setIsLoading(false);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks based on selected date
  const filteredTasks = tasks.filter(
    (task) => task.date === format(selectedDate, 'yyyy-MM-dd')
  );

  // Add a new task
  const addTask = (title: string) => {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      date: format(selectedDate, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success('Task added');
  };

  // Update a task
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
    toast.success('Task updated');
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    toast.success('Task deleted');
  };

  const value = {
    tasks,
    selectedDate,
    setSelectedDate,
    filteredTasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    isLoading
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
