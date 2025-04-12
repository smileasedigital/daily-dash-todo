
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Task type
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  stakes?: string | null;
  sharedWith?: string[] | null;
}

interface TasksContextType {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  filteredTasks: Task[];
  addTask: (title: string, stakes?: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  addStakes: (id: string, stakes: string) => void;
  removeStakes: (id: string) => void;
  shareTask: (id: string, email: string) => Promise<void>;
  unshareTask: (id: string, email: string) => Promise<void>;
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
  const { currentUser } = useAuth();
  
  // Load tasks from Supabase when user is authenticated
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          date: task.date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          stakes: task.stakes,
          sharedWith: task.shared_with
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();

    // Set up real-time subscription for tasks
    if (currentUser) {
      const channel = supabase
        .channel('public:tasks')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tasks',
            filter: `user_id=eq.${currentUser.id}`
          }, 
          (payload) => {
            console.log('Realtime update:', payload);
            fetchTasks(); // Refresh tasks on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  // Filter tasks based on selected date
  const filteredTasks = tasks.filter(
    (task) => task.date === format(selectedDate, 'yyyy-MM-dd')
  );

  // Add a new task
  const addTask = async (title: string, stakes?: string) => {
    if (!title.trim() || !currentUser) return;
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const newTaskData: any = { 
        title: title.trim(),
        completed: false,
        date: formattedDate,
        user_id: currentUser.id
      };
      
      if (stakes) {
        newTaskData.stakes = stakes.trim();
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTaskData])
        .select()
        .single();
      
      if (error) throw error;
      
      const newTask: Task = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        stakes: data.stakes,
        sharedWith: data.shared_with
      };
      
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      toast.success('Task added');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!currentUser) return;

    try {
      // Prepare updates for Supabase (convert camelCase to snake_case)
      const supabaseUpdates: any = {};
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.completed !== undefined) supabaseUpdates.completed = updates.completed;
      if (updates.date !== undefined) supabaseUpdates.date = updates.date;
      if (updates.stakes !== undefined) supabaseUpdates.stakes = updates.stakes;
      if (updates.sharedWith !== undefined) supabaseUpdates.shared_with = updates.sharedWith;
      
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      );
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      if (!taskToToggle) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !taskToToggle.completed })
        .eq('id', id)
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      
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

      // If the task was marked as completed, check if it was a staked task
      if (!taskToToggle.completed && taskToToggle.stakes) {
        toast.success('Staked task completed successfully!', {
          description: `You've met your commitment: "${taskToToggle.stakes}"`
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task');
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Add stakes to a task
  const addStakes = async (id: string, stakes: string) => {
    return updateTask(id, { stakes: stakes.trim() });
  };

  // Remove stakes from a task
  const removeStakes = async (id: string) => {
    return updateTask(id, { stakes: null });
  };
  
  // Share task with a friend for accountability
  const shareTask = async (id: string, email: string) => {
    if (!currentUser) return;
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      
      const sharedWith = task.sharedWith || [];
      if (sharedWith.includes(email)) {
        toast.info('This task is already shared with this email');
        return;
      }
      
      // Add email to sharedWith array
      const updatedSharedWith = [...sharedWith, email];
      
      await updateTask(id, { sharedWith: updatedSharedWith });
      
      // Trigger email notification using edge function
      const { error } = await supabase.functions.invoke('share-task-notification', {
        body: { 
          taskId: id, 
          taskTitle: task.title,
          recipientEmail: email,
          senderName: currentUser.user_metadata?.name || currentUser.email,
          senderEmail: currentUser.email
        }
      });
      
      if (error) throw error;
      
      toast.success(`Task shared with ${email}`);
    } catch (error) {
      console.error('Error sharing task:', error);
      toast.error('Failed to share task');
      throw error;
    }
  };
  
  // Unshare task with a friend
  const unshareTask = async (id: string, email: string) => {
    if (!currentUser) return;
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task || !task.sharedWith) return;
      
      const updatedSharedWith = task.sharedWith.filter(e => e !== email);
      
      await updateTask(id, { sharedWith: updatedSharedWith.length ? updatedSharedWith : null });
      toast.success(`Removed ${email} from shared task`);
    } catch (error) {
      console.error('Error unsharing task:', error);
      toast.error('Failed to unshare task');
      throw error;
    }
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
    addStakes,
    removeStakes,
    shareTask,
    unshareTask,
    isLoading
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
