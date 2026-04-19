export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'student' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string
          order_index: number
          created_at: string
        }
        Insert: {
          id: string
          title: string
          description: string
          order_index: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }
      topics: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          order_index: number
          starter_code: string | null
          created_at: string
        }
        Insert: {
          id: string
          module_id: string
          title: string
          description: string
          order_index: number
          starter_code?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['topics']['Insert']>
      }
      materials: {
        Row: {
          id: string
          topic_id: string
          content: string
          solution_code: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          topic_id: string
          content: string
          solution_code?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['materials']['Insert']>
      }
      questions: {
        Row: {
          id: string
          topic_id: string
          question_text: string
          order_index: number
          is_active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          topic_id: string
          question_text: string
          order_index?: number
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_label: 'A' | 'B' | 'C' | 'D'
          option_text: string
          is_correct: boolean
        }
        Insert: {
          id?: string
          question_id: string
          option_label: 'A' | 'B' | 'C' | 'D'
          option_text: string
          is_correct?: boolean
        }
        Update: Partial<Database['public']['Tables']['question_options']['Insert']>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          status: 'locked' | 'unlocked' | 'completed'
          best_score: number
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          status?: 'locked' | 'unlocked' | 'completed'
          best_score?: number
          completed_at?: string | null
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          score: number
          total_questions: number
          correct_answers: number
          passed: boolean
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          score: number
          total_questions: number
          correct_answers: number
          passed: boolean
          attempted_at?: string
        }
        Update: Partial<Database['public']['Tables']['quiz_attempts']['Insert']>
      }
    }
  }
}