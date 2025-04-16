
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task.types';
import { mapSupabaseDataToTask } from '@/utils/taskUtils';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  console.log('TaskService: Fetching tasks for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching tasks:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    console.log(`TaskService: ${data?.length || 0} tasks fetched successfully`);
    
    if (!data) {
      console.warn('TaskService: No data returned from tasks query');
      return [];
    }

    return data.map(mapSupabaseDataToTask);
  } catch (e) {
    console.error('Exception in fetchTasks:', e);
    throw e;
  }
};

export const createTask = async (
  userId: string, 
  title: string, 
  date: string,
  description?: string,
  priority?: 'high' | 'medium' | 'low', 
  stakes?: string, 
  sharedWith?: string[]
): Promise<Task> => {
  if (!userId) {
    console.error('TaskService: Attempted to create task with no userId');
    throw new Error('User ID is required to create a task');
  }
  
  const newTaskData = {
    title: title.trim(),
    completed: false,
    date,
    user_id: userId,
    description: description?.trim() || null,
    priority: priority || null,
    stakes: stakes?.trim() || null,
    shared_with: sharedWith?.length ? sharedWith : null
  };
  
  console.log('TaskService: Creating new task with data:', newTaskData);
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTaskData])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error inserting task in Supabase:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
    
    if (!data) {
      console.error('No data returned from task insert');
      throw new Error('No data returned from task creation');
    }
    
    console.log('TaskService: Task created successfully:', data);
    return mapSupabaseDataToTask(data);
  } catch (e) {
    console.error('Exception in createTask:', e);
    throw e;
  }
};

export const updateTaskInDB = async (id: string, updates: any): Promise<void> => {
  console.log(`TaskService: Updating task ${id} with:`, updates);
  
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating task in Supabase:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
    
    console.log(`TaskService: Task ${id} updated successfully`);
  } catch (e) {
    console.error('Exception in updateTaskInDB:', e);
    throw e;
  }
};

export const deleteTaskFromDB = async (id: string): Promise<void> => {
  console.log(`TaskService: Deleting task ${id}`);
  
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task from Supabase:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
    
    console.log(`TaskService: Task ${id} deleted successfully`);
  } catch (e) {
    console.error('Exception in deleteTaskFromDB:', e);
    throw e;
  }
};

export const setupRealtimeSubscription = (userId: string, onUpdate: () => void) => {
  console.log(`TaskService: Setting up realtime subscription for user ${userId}`);
  
  try {
    const channel = supabase
      .channel('public:tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('TaskService: Realtime update received:', payload);
          onUpdate(); // Trigger refetch of tasks
        }
      )
      .subscribe((status) => {
        console.log('TaskService: Realtime subscription status:', status);
      });

    return channel;
  } catch (e) {
    console.error('Exception in setupRealtimeSubscription:', e);
    console.log('TaskService: Failed to set up realtime subscription, falling back to polling');
    return null;
  }
};
