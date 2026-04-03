// biome-ignore lint/suspicious/noExplicitAny: Supabase JSONB columns use recursive Json
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      intelligence_reports: {
        Row: {
          id: string
          video_id: string
          report: Json
          generated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          report: Json
          generated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          report?: Json
          generated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: string
          stripe_customer_id: string | null
          subscription_active: boolean
        }
        Insert: {
          id: string
          email?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_active?: boolean
        }
        Update: {
          id?: string
          email?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_active?: boolean
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string | null
          youtube_id: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          youtube_id: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          youtube_id?: string
          title?: string | null
          created_at?: string
        }
      }
      video_sections: {
        Row: {
          id: string
          video_id: string | null
          content: string | null
          embedding: number[] | null
        }
        Insert: {
          id?: string
          video_id?: string | null
          content?: string | null
          embedding?: number[] | null
        }
        Update: {
          id?: string
          video_id?: string | null
          content?: string | null
          embedding?: number[] | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      match_video_sections: {
        Args: {
          query_embedding: number[]
          user_id: string
          match_threshold: number
          match_count: number
        }
        Returns: Array<{
          id: string
          video_id: string
          content: string
          similarity: number
        }>
      }
    }
    Enums: Record<string, never>
  }
}
