
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { UserStreak } from '@/integrations/supabase/schema';

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
          
          // Map the returned data to our UserStreak interface
          const formattedStreak: UserStreak = {
            id: newData.id,
            user_id: newData.user_id,
            current_streak: newData.current_streak,
            longest_streak: newData.longest_streak,
            last_completed_date: newData.last_completed_date,
            streak_history: newData.streak_history || [],
            created_at: newData.created_at,
            updated_at: newData.updated_at
          };
          
          setStreak(formattedStreak);
        } else {
          throw error;
        }
      } else if (data) {
        // Map the returned data to our UserStreak interface
        const formattedStreak: UserStreak = {
          id: data.id,
          user_id: data.user_id,
          current_streak: data.current_streak,
          longest_streak: data.longest_streak,
          last_completed_date: data.last_completed_date,
          streak_history: data.streak_history || [],
          created_at: data.created_at,
          updated_at: data.updated_at
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
