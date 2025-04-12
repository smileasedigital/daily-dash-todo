
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Streak interface
export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  streakHistory: Array<{date: string; streak: number}>;
}

interface StreakContextType {
  streak: UserStreak | null;
  isLoading: boolean;
  refreshStreak: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

interface StreakProviderProps {
  children: ReactNode;
}

export const StreakProvider: React.FC<StreakProviderProps> = ({ children }) => {
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  
  const fetchStreak = async () => {
    if (!currentUser) {
      setStreak(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No data found
          const { data: newData, error: createError } = await supabase
            .from('user_streaks')
            .insert([
              { user_id: currentUser.id }
            ])
            .select()
            .single();

          if (createError) throw createError;
          
          const formattedStreak: UserStreak = {
            id: newData.id,
            userId: newData.user_id,
            currentStreak: newData.current_streak,
            longestStreak: newData.longest_streak,
            lastCompletedDate: newData.last_completed_date,
            streakHistory: newData.streak_history || []
          };
          
          setStreak(formattedStreak);
        } else {
          throw error;
        }
      } else if (data) {
        const formattedStreak: UserStreak = {
          id: data.id,
          userId: data.user_id,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          lastCompletedDate: data.last_completed_date,
          streakHistory: data.streak_history || []
        };
        
        setStreak(formattedStreak);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
      toast.error('Failed to load streak data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh streak data - can be called after task completion
  const refreshStreak = async () => {
    await fetchStreak();
  };

  useEffect(() => {
    fetchStreak();
  }, [currentUser]);

  // Set up real-time subscription for streak updates
  useEffect(() => {
    if (currentUser) {
      const channel = supabase
        .channel('public:user_streaks')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_streaks',
            filter: `user_id=eq.${currentUser.id}`
          }, 
          () => {
            fetchStreak();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const value = {
    streak,
    isLoading,
    refreshStreak
  };

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
};
