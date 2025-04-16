
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
  
  // Fetch tasks when currentUser changes
  useEffect(() => {
    console.log('useTasks: Current user changed:', currentUser?.id);
    
    const loadTasks = async () => {
      if (!currentUser) {
        console.log('useTasks: No current user, clearing tasks');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('useTasks: Fetching tasks for user ID:', currentUser.id);
        const taskData = await fetchTasks(currentUser.id);
        console.log('useTasks: Tasks fetched successfully:', taskData.length);
        setTasks(taskData);
      } catch (error) {
        console.error('useTasks: Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
    
    // Setup realtime subscription if user is logged in
    let channel: any = null;
    if (currentUser) {
      channel = setupRealtimeSubscription(currentUser.id, () => {
        console.log('useTasks: Realtime update triggered task refresh');
        loadTasks();
      });
    }
    
    return () => {
      if (channel) {
        console.log('useTasks: Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser]);

  // Filter tasks based on selected date
  const filteredTasks = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    console.log(`useTasks: Filtering tasks for date: ${dateStr}`);
    return tasks.filter(task => task.date === dateStr);
  }, [tasks, selectedDate]);

  // Enhanced debug logging for filtered tasks
  useEffect(() => {
    console.log('useTasks: Selected date:', format(selectedDate, 'yyyy-MM-dd'));
    console.log('useTasks: All tasks count:', tasks.length);
    console.log('useTasks: Filtered tasks count:', filteredTasks.length);
  }, [selectedDate, tasks, filteredTasks]);

  const addTask = async (
    title: string, 
    stakes?: string, 
    description?: string, 
    priority?: 'high' | 'medium' | 'low', 
    sharedWith?: string[], 
    taskDate?: string
  ): Promise<Task> => {
    console.log('useTasks: addTask called with:', { title, stakes, description, priority, sharedWith, taskDate });
    
    if (!title.trim()) {
      console.warn('useTasks: Cannot add task: missing title');
      throw new Error('Task title is required');
    }
    
    if (!currentUser) {
      console.warn('useTasks: Cannot add task: no current user');
      throw new Error('You must be logged in to add tasks');
    }
    
    try {
      // Use the passed taskDate or default to the selectedDate
      const formattedDate = taskDate || formatDateForTask(selectedDate);
      
      console.log(`useTasks: Adding task: "${title}" for date: ${formattedDate}`);
      console.log('useTasks: User ID:', currentUser.id);
      
      const newTask = await createTask(
        currentUser.id,
        title,
        formattedDate,
        description,
        priority,
        stakes,
        sharedWith
      );
      
      console.log('useTasks: Task created successfully:', newTask);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      toast.success('Task added successfully');
      return newTask;
    } catch (error) {
      console.error('useTasks: Error in addTask function:', error);
      toast.error('Failed to add task');
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!currentUser) {
      console.warn('useTasks: Cannot update task: no current user');
      return;
    }

    console.log(`useTasks: Updating task ${id} with:`, updates);

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

      console.log(`useTasks: Task ${id} updated successfully`);
    } catch (error) {
      console.error('useTasks: Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    if (!currentUser) {
      console.warn('useTasks: Cannot toggle task: no current user');
      return;
    }
    
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      if (!taskToToggle) {
        console.warn(`useTasks: Task ${id} not found for toggling`);
        return;
      }

      console.log(`useTasks: Toggling completion for task ${id} from ${taskToToggle.completed} to ${!taskToToggle.completed}`);
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
        console.log('useTasks: Task marked as completed, updating streak');
        await updateUserStreak(currentUser.id);
      }
    } catch (error) {
      console.error('useTasks: Error toggling task completion:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) {
      console.warn('useTasks: Cannot delete task: no current user');
      return;
    }
    
    try {
      console.log(`useTasks: Deleting task ${id}`);
      await deleteTaskFromDB(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('useTasks: Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const addStakes = async (id: string, stakes: string): Promise<boolean> => {
    console.log(`useTasks: Adding stakes for task ${id}:`, stakes);
    try {
      await updateTask(id, { stakes: stakes.trim() });
      return true;
    } catch (error) {
      console.error("useTasks: Error adding stakes:", error);
      throw error;
    }
  };

  const removeStakes = async (id: string): Promise<boolean> => {
    console.log(`useTasks: Removing stakes for task ${id}`);
    try {
      await updateTask(id, { stakes: null });
      return true;
    } catch (error) {
      console.error("useTasks: Error removing stakes:", error);
      throw error;
    }
  };

  const shareTask = async (id: string, email: string): Promise<void> => {
    if (!currentUser) {
      console.warn('useTasks: Cannot share task: no current user');
      return;
    }
    
    console.log(`useTasks: Sharing task ${id} with ${email}`);
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        console.error(`useTasks: Task ${id} not found for sharing`);
        throw new Error('Task not found');
      }
      
      const sharedWith = task.sharedWith || [];
      if (sharedWith.includes(email)) {
        console.log(`useTasks: Task ${id} already shared with ${email}`);
        toast.info('This task is already shared with this email');
        return;
      }
      
      const updatedSharedWith = [...sharedWith, email];
      
      await updateTask(id, { sharedWith: updatedSharedWith });
      
      const userName = currentUser.user_metadata?.name || currentUser.email;
      console.log(`useTasks: Sending share notification from ${userName} to ${email}`);
      
      await sendShareTaskNotification(
        id,
        task.title,
        email,
        userName,
        currentUser.email || ''
      );
      
      toast.success(`Task shared with ${email}`);
    } catch (error) {
      console.error('useTasks: Error sharing task:', error);
      toast.error('Failed to share task');
      throw error;
    }
  };

  const unshareTask = async (id: string, email: string): Promise<void> => {
    if (!currentUser) {
      console.warn('useTasks: Cannot unshare task: no current user');
      return;
    }
    
    console.log(`useTasks: Unsharing task ${id} from ${email}`);
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task || !task.sharedWith) {
        console.warn(`useTasks: Task ${id} not found or not shared`);
        return;
      }
      
      const updatedSharedWith = task.sharedWith.filter(e => e !== email);
      
      await updateTask(id, { sharedWith: updatedSharedWith.length ? updatedSharedWith : null });
      toast.success(`Removed ${email} from shared task`);
    } catch (error) {
      console.error('useTasks: Error unsharing task:', error);
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
