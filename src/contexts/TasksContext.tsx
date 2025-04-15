import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { ExtendedTask } from '@/integrations/supabase/schema';

// Task type
export interface Task extends ExtendedTask {
  id: string;
  title: string;
  completed: boolean;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  user_id: string; // Added this line to include user_id in the interface
  stakes?: string | null;
  sharedWith?: string[] | null;
  description?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
}

interface TasksContextType {
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
  
  // Debug log to check currentUser
  useEffect(() => {
    console.log('Current user in TasksContext:', currentUser);
  }, [currentUser]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) {
        console.log('No current user, clearing tasks');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching tasks for user:', currentUser.id);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Tasks fetched:', data);
        
        if (!data) {
          console.warn('No data returned from tasks query');
          setTasks([]);
          setIsLoading(false);
          return;
        }

        const formattedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          date: task.date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          stakes: task.stakes,
          sharedWith: task.shared_with,
          description: task.description,
          priority: task.priority,
          user_id: task.user_id
        }));

        console.log('Formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
    
    if (currentUser) {
      // Subscribe to real-time updates
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
            console.log('Realtime update received:', payload);
            fetchTasks(); // Refetch tasks when changes occur
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      return () => {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  // Filter tasks based on selected date
  const filteredTasks = tasks.filter(
    (task) => {
      const matches = task.date === format(selectedDate, 'yyyy-MM-dd');
      return matches;
    }
  );

  // Enhanced debug logging for filtered tasks
  useEffect(() => {
    console.log('Selected date:', format(selectedDate, 'yyyy-MM-dd'));
    console.log('All tasks:', tasks);
    console.log('Filtered tasks:', filteredTasks);
  }, [selectedDate, tasks, filteredTasks]);

  const addTask = async (title: string, stakes?: string, description?: string, priority?: 'high' | 'medium' | 'low', sharedWith?: string[], taskDate?: string) => {
    if (!title.trim() || !currentUser) {
      console.warn('Cannot add task: missing title or user', { title, currentUser });
      return;
    }
    
    try {
      console.log('Adding task for user:', currentUser.id);
      
      // Use the passed taskDate or default to the selectedDate
      const formattedDate = taskDate || format(selectedDate, 'yyyy-MM-dd');
      
      console.log('Using date for task:', formattedDate);
      
      const newTaskData = {
        title: title.trim(),
        completed: false,
        date: formattedDate,
        user_id: currentUser.id,
        description: description?.trim() || null,
        priority: priority || null,
        stakes: stakes?.trim() || null,
        shared_with: sharedWith?.length ? sharedWith : null
      };
      
      console.log('Creating new task with data:', newTaskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTaskData])
        .select('*')
        .single();
      
      if (error) {
        console.error('Error inserting task:', error);
        throw error;
      }
      
      console.log('Task created successfully:', data);
      
      // Use the returned data from Supabase
      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          completed: data.completed,
          date: data.date,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          stakes: data.stakes,
          sharedWith: data.shared_with,
          description: data.description,
          priority: data.priority,
          user_id: data.user_id
        };
        
        setTasks((prevTasks) => [newTask, ...prevTasks]);
        toast.success('Task added');
      } else {
        // If for some reason we don't get data back
        console.error('No data returned from task insert');
        toast.error('Failed to add task: No data returned');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!currentUser) return;

    try {
      const supabaseUpdates: any = {};
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.completed !== undefined) supabaseUpdates.completed = updates.completed;
      if (updates.date !== undefined) supabaseUpdates.date = updates.date;
      if (updates.stakes !== undefined) supabaseUpdates.stakes = updates.stakes;
      if (updates.sharedWith !== undefined) supabaseUpdates.shared_with = updates.sharedWith;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      if (!taskToToggle) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !taskToToggle.completed })
        .eq('id', id);
      
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

      if (!taskToToggle.completed && taskToToggle.stakes) {
        toast.success('Staked task completed successfully!', {
          description: `You've met your commitment: "${taskToToggle.stakes}"`
        });
      }
      
      if (!taskToToggle.completed) {
        try {
          const today = format(new Date(), 'yyyy-MM-dd');
          
          const { data: streakData, error: streakError } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
            
          if (streakError && streakError.code !== 'PGRST116') {
            throw streakError;
          }
          
          let currentStreak = 1;
          let longestStreak = 1;
          let streakHistory = [];
          
          if (streakData) {
            const lastCompletedDate = streakData.last_completed_date;
            const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
            
            if (lastCompletedDate === today) {
              currentStreak = streakData.current_streak;
            } else if (lastCompletedDate === yesterday) {
              currentStreak = streakData.current_streak + 1;
            } else if (lastCompletedDate && lastCompletedDate < yesterday) {
              currentStreak = 1;
            }
            
            longestStreak = Math.max(currentStreak, streakData.longest_streak);
            
            streakHistory = streakData.streak_history || [];
            streakHistory.push({ date: today, streak: currentStreak });
            
            if (streakHistory.length > 30) {
              streakHistory = streakHistory.slice(-30);
            }
            
            const { error: updateError } = await supabase
              .from('user_streaks')
              .update({
                current_streak: currentStreak,
                longest_streak: longestStreak,
                last_completed_date: today,
                streak_history: streakHistory,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', currentUser.id);
              
            if (updateError) throw updateError;
          } else {
            streakHistory = [{ date: today, streak: 1 }];
            
            const { error: insertError } = await supabase
              .from('user_streaks')
              .insert([{
                user_id: currentUser.id,
                current_streak: 1,
                longest_streak: 1,
                last_completed_date: today,
                streak_history: streakHistory
              }]);
              
            if (insertError) throw insertError;
          }
          
          if (currentStreak === 7 || currentStreak === 30 || currentStreak === 100) {
            toast.success(`🔥 ${currentStreak} day streak achieved!`, {
              description: "Keep up the great work!"
            });
          }
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      }
      
      if (!taskToToggle.completed && taskToToggle.sharedWith?.length) {
        // This could be implemented for completed tasks notification
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const addStakes = async (id: string, stakes: string) => {
    try {
      await updateTask(id, { stakes: stakes.trim() });
      return true;
    } catch (error) {
      console.error("Error adding stakes:", error);
      throw error;
    }
  };

  const removeStakes = async (id: string) => {
    try {
      await updateTask(id, { stakes: null });
      return true;
    } catch (error) {
      console.error("Error removing stakes:", error);
      throw error;
    }
  };

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
      
      const updatedSharedWith = [...sharedWith, email];
      
      await updateTask(id, { sharedWith: updatedSharedWith });
      
      console.log("Invoking share-task-notification for:", email);
      const { data, error } = await supabase.functions.invoke('share-task-notification', {
        body: { 
          taskId: id, 
          taskTitle: task.title,
          recipientEmail: email,
          senderName: currentUser.user_metadata?.name || currentUser.email,
          senderEmail: currentUser.email
        }
      });
      
      if (error) {
        console.error('Error invoking edge function:', error);
        toast.error('Failed to send notification email. Please check your Resend API key.');
      } else {
        console.log("Share notification result:", data);
        toast.success(`Task shared with ${email}`);
      }
    } catch (error) {
      console.error('Error sharing task:', error);
      toast.error('Failed to share task');
      throw error;
    }
  };

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
