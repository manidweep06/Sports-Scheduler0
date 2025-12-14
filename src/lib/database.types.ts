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
          name: string
          role: 'admin' | 'player'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          role: 'admin' | 'player'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'admin' | 'player'
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          title: string
          date: string
          venue: string
          team1_players: string[]
          team2_players: string[]
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          venue: string
          team1_players?: string[]
          team2_players?: string[]
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          venue?: string
          team1_players?: string[]
          team2_players?: string[]
          created_by?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
