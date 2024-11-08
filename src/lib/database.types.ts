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
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tweets: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      replies: {
        Row: {
          id: string
          tweet_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tweet_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tweet_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          tweet_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tweet_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tweet_id?: string
          created_at?: string
        }
      }
      retweets: {
        Row: {
          id: string
          user_id: string
          tweet_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tweet_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tweet_id?: string
          created_at?: string
        }
      }
    }
    Functions: {
      get_likes_count: {
        Args: { tweet_id: string }
        Returns: number
      }
      get_replies_count: {
        Args: { tweet_id: string }
        Returns: number
      }
      get_retweets_count: {
        Args: { tweet_id: string }
        Returns: number
      }
    }
  }
}