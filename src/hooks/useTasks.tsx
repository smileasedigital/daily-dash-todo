
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task.types';
import { formatDateForTask, updateUserStreak, sendShareTaskNotification } from '@/utils/taskUtils';
import {
  fetchTasks,
  createTask,
  updateTaskInDB,
  deleteTaskFromDB,
  setupRealtimeSubscription
} from '@/services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Debug log to check currentUser
  useEffect(() => {
    console.log('Current user in useTasks:', currentUser);
  }, [currentUser]);
  
  // Fetch tasks when currentUser changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) {
        console.log('No current user, clearing tasks');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const taskData = await fetchTasks(currentUser.id);
        setTasks(taskData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
    
    // Setup realtime subscription if user is logged in
    if (currentUser) {
      const channel = setupRealtimeSubscription(currentUser.id, loadTasks);
      
      return () => {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  // Filter tasks based on selected date
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => task.date === format(selectedDate, 'yyyy-MM-dd'));
  }, [tasks, selectedDate]);

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
      // Use the passed taskDate or default to the selectedDate
      const formattedDate = taskDate || formatDateForTask(selectedDate);
      
      console.log('Using date for task:', formattedDate);
      
      const newTask = await createTask(
        currentUser.id,
        title,
        formattedDate,
        description,
        priority,
        stakes,
        sharedWith
      );
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      toast.success('Task added');
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
      
      await updateTaskInDB(id, supabaseUpdates);
      
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

      await updateTaskInDB(id, { completed: !taskToToggle.completed });
      
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
        await updateUserStreak(currentUser.id);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) return;
    
    try {
      await deleteTaskFromDB(id);
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
      
      await sendShareTaskNotification(
        id,
        task.title,
        email,
        currentUser.user_metadata?.name || currentUser.email,
        currentUser.email
      );
      
      toast.success(`Task shared with ${email}`);
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

  return {
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
};
