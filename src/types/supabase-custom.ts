/**
 * Types customizados do Supabase
 * Extende os types auto-gerados para garantir que as tabelas sejam reconhecidas
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      championships: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          status: string;
          champion_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          nome: string;
          status?: string;
          champion_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          nome?: string;
          status?: string;
          champion_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          championship_id: string;
          nome: string;
          color_a: string;
          color_b: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          championship_id: string;
          nome: string;
          color_a: string;
          color_b?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          championship_id?: string;
          nome?: string;
          color_a?: string;
          color_b?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          nome: string;
          numero: number | null;
          posicao: string | null;
          total_gols: number;
          total_assists: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          nome: string;
          numero?: number | null;
          posicao?: string | null;
          total_gols?: number;
          total_assists?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          nome?: string;
          numero?: number | null;
          posicao?: string | null;
          total_gols?: number;
          total_assists?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          championship_id: string;
          time_a: string;
          time_b: string;
          type: string | null;
          scheduled_date: string;
          scheduled_time: string;
          score_a: number;
          score_b: number;
          finalized: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          championship_id: string;
          time_a: string;
          time_b: string;
          type?: string | null;
          scheduled_date: string;
          scheduled_time: string;
          score_a?: number;
          score_b?: number;
          finalized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          championship_id?: string;
          time_a?: string;
          time_b?: string;
          type?: string | null;
          scheduled_date?: string;
          scheduled_time?: string;
          score_a?: number;
          score_b?: number;
          finalized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      match_events: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          team_id: string;
          event_type: string;
          minute: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          team_id: string;
          event_type: string;
          minute?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          team_id?: string;
          event_type?: string;
          minute?: number | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          nome: string;
          telefone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          telefone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          telefone?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type TypedSupabaseClient = SupabaseClient<Database>;
