export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string
          id: string
          last_activity: string
          session_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity?: string
          session_token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_activity?: string
          session_token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_website_data: {
        Row: {
          created_at: string
          id: string
          last_scraped_at: string | null
          scraped_content: Json | null
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          scraped_content?: Json | null
          updated_at?: string
          user_id: string
          website_url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_scraped_at?: string | null
          scraped_content?: Json | null
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      course_assignments: {
        Row: {
          assigned_at: string
          course_id: string
          group_id: string
          id: string
        }
        Insert: {
          assigned_at?: string
          course_id: string
          group_id: string
          id?: string
        }
        Update: {
          assigned_at?: string
          course_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_course_assignments_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_course_assignments_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      course_usage: {
        Row: {
          bonus_courses_today: number | null
          courses_created_today: number
          created_at: string
          id: string
          last_bonus_date: string | null
          last_course_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bonus_courses_today?: number | null
          courses_created_today?: number
          created_at?: string
          id?: string
          last_bonus_date?: string | null
          last_course_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bonus_courses_today?: number | null
          courses_created_today?: number
          created_at?: string
          id?: string
          last_bonus_date?: string | null
          last_course_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_plan: Json
          course_title: string
          created_at: string
          creator_id: string
          id: string
          status: string
          system_prompt: string
          track_type: string
          website_data_id: string | null
        }
        Insert: {
          course_plan: Json
          course_title: string
          created_at?: string
          creator_id: string
          id?: string
          status?: string
          system_prompt: string
          track_type: string
          website_data_id?: string | null
        }
        Update: {
          course_plan?: Json
          course_title?: string
          created_at?: string
          creator_id?: string
          id?: string
          status?: string
          system_prompt?: string
          track_type?: string
          website_data_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_website_data_id_fkey"
            columns: ["website_data_id"]
            isOneToOne: false
            referencedRelation: "company_website_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_courses_creator_id"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          admin_id: string
          created_at: string
          group_name: string
          id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          group_name: string
          id?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          group_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_groups_admin_id"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      honest_box_feedback: {
        Row: {
          admin_notes: string | null
          flagged_inappropriate: boolean
          group_id: string
          id: string
          month_year: string
          monthly_question: string | null
          monthly_response: string | null
          open_feedback: string | null
          priority: string
          status: string
          submitted_at: string
        }
        Insert: {
          admin_notes?: string | null
          flagged_inappropriate?: boolean
          group_id: string
          id?: string
          month_year: string
          monthly_question?: string | null
          monthly_response?: string | null
          open_feedback?: string | null
          priority?: string
          status?: string
          submitted_at?: string
        }
        Update: {
          admin_notes?: string | null
          flagged_inappropriate?: boolean
          group_id?: string
          id?: string
          month_year?: string
          monthly_question?: string | null
          monthly_response?: string | null
          open_feedback?: string | null
          priority?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "honest_box_feedback_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      honest_box_monthly_questions: {
        Row: {
          created_at: string
          group_id: string
          id: string
          month_year: string
          question: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          month_year: string
          question: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          month_year?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "honest_box_monthly_questions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      honest_box_updates: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          published_at: string
          published_by: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          published_at?: string
          published_by: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          published_at?: string
          published_by?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "honest_box_updates_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_course_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          assigned_to_team: string | null
          course_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          assigned_to_team?: string | null
          course_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          assigned_to_team?: string | null
          course_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_course_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_course_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          group_id: string
          id: string
          invitee_email: string
          inviter_email: string
          inviter_id: string | null
          magic_link_token: string | null
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          group_id: string
          id?: string
          invitee_email: string
          inviter_email: string
          inviter_id?: string | null
          magic_link_token?: string | null
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          group_id?: string
          id?: string
          invitee_email?: string
          inviter_email?: string
          inviter_id?: string | null
          magic_link_token?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_logo: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          full_name: string
          group_id: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          role: Database["public"]["Enums"]["app_role"]
          team: string[] | null
          updated_at: string
        }
        Insert: {
          company_logo?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          full_name: string
          group_id?: string | null
          id: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          role?: Database["public"]["Enums"]["app_role"]
          team?: string[] | null
          updated_at?: string
        }
        Update: {
          company_logo?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          full_name?: string
          group_id?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          role?: Database["public"]["Enums"]["app_role"]
          team?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      session_feedback: {
        Row: {
          ai_feedback: string | null
          challenge_rating: number | null
          course_id: string
          created_at: string
          id: string
          notify_trial: boolean | null
          progress_percentage: number | null
          session_date: string
          session_duration_minutes: number | null
          suggestions: string | null
          total_interactions: number | null
          usefulness_rating: number | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          challenge_rating?: number | null
          course_id: string
          created_at?: string
          id?: string
          notify_trial?: boolean | null
          progress_percentage?: number | null
          session_date?: string
          session_duration_minutes?: number | null
          suggestions?: string | null
          total_interactions?: number | null
          usefulness_rating?: number | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          challenge_rating?: number | null
          course_id?: string
          created_at?: string
          id?: string
          notify_trial?: boolean | null
          progress_percentage?: number | null
          session_date?: string
          session_duration_minutes?: number | null
          suggestions?: string | null
          total_interactions?: number | null
          usefulness_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_feedback_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_session_feedback_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          licenses_purchased: number
          licenses_used: number
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          licenses_purchased?: number
          licenses_used?: number
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          licenses_purchased?: number
          licenses_used?: number
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_course_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          course_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          course_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          course_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_performance: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          points: number | null
          progress: number | null
          session_data: Json | null
          total_interactions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          points?: number | null
          progress?: number | null
          session_data?: Json | null
          total_interactions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          points?: number | null
          progress?: number | null
          session_data?: Json | null
          total_interactions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_performance_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_performance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_to_team: {
        Args: { user_id: string; team_name: string }
        Returns: undefined
      }
      cleanup_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_role: Database["public"]["Enums"]["app_role"]
          user_group_id: string
        }[]
      }
      get_inviter_group_id: {
        Args: { inviter_user_id: string }
        Returns: string
      }
      initialize_honest_box_for_group: {
        Args: { group_id_param: string }
        Returns: undefined
      }
      recalculate_license_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_license_usage_by_group: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_user_and_cleanup: {
        Args: { user_id_to_remove: string }
        Returns: undefined
      }
      remove_user_from_team: {
        Args: { user_id: string; team_name: string }
        Returns: undefined
      }
      update_team_name: {
        Args: { old_name: string; new_name: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "Admin" | "Standard"
      subscription_plan: "Free" | "Pro" | "Enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Admin", "Standard"],
      subscription_plan: ["Free", "Pro", "Enterprise"],
    },
  },
} as const
