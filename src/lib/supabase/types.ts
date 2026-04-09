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
        Relationships: [
          {
            foreignKeyName: 'intelligence_reports_video_id_fkey'
            columns: ['video_id']
            isOneToOne: false
            referencedRelation: 'videos'
            referencedColumns: ['id']
          },
        ]
      }
      seo_reports: {
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
        Relationships: [
          {
            foreignKeyName: 'seo_reports_video_id_fkey'
            columns: ['video_id']
            isOneToOne: false
            referencedRelation: 'videos'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: string
          stripe_customer_id: string | null
          subscription_active: boolean
          trial_used: boolean
        }
        Insert: {
          id: string
          email?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_active?: boolean
          trial_used?: boolean
        }
        Update: {
          id?: string
          email?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_active?: boolean
          trial_used?: boolean
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'videos_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      weekly_digests: {
        Row: {
          id: string
          user_id: string
          week_start: string
          topics: string[]
          connections: string[]
          suggested_questions: string[]
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          topics?: string[]
          connections?: string[]
          suggested_questions?: string[]
          dismissed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          topics?: string[]
          connections?: string[]
          suggested_questions?: string[]
          dismissed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'weekly_digests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'video_sections_video_id_fkey'
            columns: ['video_id']
            isOneToOne: false
            referencedRelation: 'videos'
            referencedColumns: ['id']
          },
        ]
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
