export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          bio: string
          video_intro: string | null
          heat_score: number
          flame_customization: Json
          created_at: string
          gender: 'Male' | 'Female'
          photos: string[]
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bio?: string
          video_intro?: string | null
          heat_score?: number
          flame_customization?: Json
          created_at?: string
          gender: 'Male' | 'Female'
          photos?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bio?: string
          video_intro?: string | null
          heat_score?: number
          flame_customization?: Json
          created_at?: string
          gender?: 'Male' | 'Female'
          photos?: string[]
        }
      }
      matches: {
        Row: {
          id: string
          user_id: string
          matched_user_id: string
          created_at: string
          interaction_score: number
        }
        Insert: {
          id?: string
          user_id: string
          matched_user_id: string
          created_at?: string
          interaction_score?: number
        }
        Update: {
          id?: string
          user_id?: string
          matched_user_id?: string
          created_at?: string
          interaction_score?: number
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          created_at: string
          ai_generated: boolean
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          created_at?: string
          ai_generated?: boolean
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          ai_generated?: boolean
        }
      }
    }
  }
} 