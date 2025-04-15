
import { ExtendedTask } from '@/integrations/supabase/schema';

// Task type
export interface Task extends ExtendedTask {
  id: string;
  title: string;
  completed: boolean;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  user_id: string;
  stakes?: string | null;
  sharedWith?: string[] | null;
  description?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
}

export interface TasksContextType {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  filteredTasks: Task[];
  addTask: (title: string, stakes?: string, description?: string, priority?: 'high' | 'medium' | 'low', sharedWith?: string[], taskDate?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  addStakes: (id: string, stakes: string) => void;
  removeStakes: (id: string) => void;
  shareTask: (id: string, email: string) => Promise<void>;
  unshareTask: (id: string, email: string) => Promise<void>;
  isLoading: boolean;
}
