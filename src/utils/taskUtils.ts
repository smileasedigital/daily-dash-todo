
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task.types';

// Convert Supabase task data to our Task type
export const mapSupabaseDataToTask = (data: any): Task => {
  console.log('Mapping data to task:', data);
  
  return {
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
};

// Format date to yyyy-MM-dd
export const formatDateForTask = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Update user streak data in Supabase
export const updateUserStreak = async (userId: string) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log(`Updating streak for user ${userId} on date ${today}`);
    
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Error fetching user streak:', streakError);
      throw streakError;
    }
    
    let currentStreak = 1;
    let longestStreak = 1;
    let streakHistory = [];
    
    if (streakData) {
      console.log('Found existing streak data:', streakData);
      const lastCompletedDate = streakData.last_completed_date;
      const yesterday = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
      
      if (lastCompletedDate === today) {
        currentStreak = streakData.current_streak;
        console.log(`Already completed task today, maintaining streak at ${currentStreak}`);
      } else if (lastCompletedDate === yesterday) {
        currentStreak = streakData.current_streak + 1;
        console.log(`Completed task day after yesterday, increasing streak to ${currentStreak}`);
      } else if (lastCompletedDate && lastCompletedDate < yesterday) {
        currentStreak = 1;
        console.log('Streak broken, resetting to 1');
      }
      
      longestStreak = Math.max(currentStreak, streakData.longest_streak);
      
      streakHistory = streakData.streak_history || [];
      streakHistory.push({ date: today, streak: currentStreak });
      
      if (streakHistory.length > 30) {
        streakHistory = streakHistory.slice(-30);
      }
      
      console.log('Updating user_streaks table with new streak data');
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_completed_date: today,
          streak_history: streakHistory,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating streak:', updateError);
        throw updateError;
      }
    } else {
      console.log('No streak data found, creating new record');
      streakHistory = [{ date: today, streak: 1 }];
      
      const { error: insertError } = await supabase
        .from('user_streaks')
        .insert([{
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_completed_date: today,
          streak_history: streakHistory
        }]);
        
      if (insertError) {
        console.error('Error creating streak record:', insertError);
        throw insertError;
      }
    }
    
    if (currentStreak === 7 || currentStreak === 30 || currentStreak === 100) {
      toast.success(`🔥 ${currentStreak} day streak achieved!`, {
        description: "Keep up the great work!"
      });
    }

    console.log(`Streak updated successfully: ${currentStreak}`);
    return currentStreak;
  } catch (error) {
    console.error('Error in updateUserStreak:', error);
    return null;
  }
};

// Share task notification helper
export const sendShareTaskNotification = async (taskId: string, taskTitle: string, recipientEmail: string, senderName: string, senderEmail: string) => {
  console.log(`Sending share task notification for task ${taskId} to ${recipientEmail}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('share-task-notification', {
      body: { 
        taskId,
        taskTitle,
        recipientEmail,
        senderName,
        senderEmail
      }
    });
    
    if (error) {
      console.error('Error invoking share-task-notification function:', error);
      throw new Error(`Failed to send notification email: ${error.message}`);
    }
    
    console.log('Notification sent successfully:', data);
    return data;
  } catch (e) {
    console.error('Exception in sendShareTaskNotification:', e);
    throw e;
  }
};
