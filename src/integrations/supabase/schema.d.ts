
// Extend the Database type definition to include our new fields and tables
import { Database as OriginalDatabase } from './types';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  streak_history: Array<{date: string; streak: number}>;
  created_at: string;
  updated_at: string;
}

export interface ExtendedTask extends OriginalDatabase['public']['Tables']['tasks']['Row'] {
  stakes?: string | null;
  shared_with?: string[] | null;
}

export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: {
      profiles: OriginalDatabase['public']['Tables']['profiles'];
      tasks: {
        Row: ExtendedTask;
        Insert: OriginalDatabase['public']['Tables']['tasks']['Insert'] & {
          stakes?: string | null;
          shared_with?: string[] | null;
        };
        Update: OriginalDatabase['public']['Tables']['tasks']['Update'] & {
          stakes?: string | null;
          shared_with?: string[] | null;
        };
        Relationships: OriginalDatabase['public']['Tables']['tasks']['Relationships'];
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_completed_date: string | null;
          streak_history: Array<{date: string; streak: number}> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed_date?: string | null;
          streak_history?: Array<{date: string; streak: number}> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed_date?: string | null;
          streak_history?: Array<{date: string; streak: number}> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}
