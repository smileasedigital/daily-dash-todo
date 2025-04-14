
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import { ExtendedDatabase } from './schema';

const SUPABASE_URL = "https://fqevwmrcgkaraeevivoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZXZ3bXJjZ2thcmFlZXZpdm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDY2MjksImV4cCI6MjA2MDAyMjYyOX0.1ryABkZ7I6nnZ8V1mlQVuka2aEPnSYErcT4jycq6f_I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create the Supabase client with proper configuration
export const supabase = createClient<ExtendedDatabase>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Enable realtime for tasks table with better error handling
try {
  const channel = supabase.channel('public:tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, 
      payload => {
        console.log('Realtime change:', payload);
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });
    
  console.log('Realtime subscription initialized for tasks table');
} catch (error) {
  console.error('Error setting up realtime subscription:', error);
}
