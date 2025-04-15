
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task.types';
import { mapSupabaseDataToTask } from '@/utils/taskUtils';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  console.log('Fetching tasks for user:', userId);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching tasks:', error);
    throw error;
  }

  console.log('Tasks fetched:', data);
  
  if (!data) {
    console.warn('No data returned from tasks query');
    return [];
  }

  return data.map(mapSupabaseDataToTask);
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
  
  console.log('Creating new task with data:', newTaskData);
  
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
  
  console.log('Task created successfully:', data);
  return mapSupabaseDataToTask(data);
};

export const updateTaskInDB = async (id: string, updates: any): Promise<void> => {
  console.log(`Updating task ${id} with:`, updates);
  
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating task in Supabase:', error);
    throw new Error(`Failed to update task: ${error.message}`);
  }
  
  console.log(`Task ${id} updated successfully`);
};

export const deleteTaskFromDB = async (id: string): Promise<void> => {
  console.log(`Deleting task ${id}`);
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting task from Supabase:', error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }
  
  console.log(`Task ${id} deleted successfully`);
};

export const setupRealtimeSubscription = (userId: string, onUpdate: () => void) => {
  console.log(`Setting up realtime subscription for user ${userId}`);
  
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
        console.log('Realtime update received:', payload);
        onUpdate(); // Trigger refetch of tasks
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  return channel;
};
