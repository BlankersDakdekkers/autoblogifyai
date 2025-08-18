export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          attempt_type: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          attempt_type?: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          body_markdown: string | null
          canonical_url: string | null
          city: string | null
          created_at: string
          cta_heading: string | null
          cta_subtext: string | null
          faq_json: Json | null
          hero_image_alt: string | null
          hero_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          publish_date: string
          slug: string
          status: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          author?: string | null
          body_markdown?: string | null
          canonical_url?: string | null
          city?: string | null
          created_at?: string
          cta_heading?: string | null
          cta_subtext?: string | null
          faq_json?: Json | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          publish_date: string
          slug: string
          status?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          author?: string | null
          body_markdown?: string | null
          canonical_url?: string | null
          city?: string | null
          created_at?: string
          cta_heading?: string | null
          cta_subtext?: string | null
          faq_json?: Json | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string
          slug?: string
          status?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      csv_processing_jobs: {
        Row: {
          created_at: string
          csv_url: string
          error_message: string | null
          id: string
          processed_rows: number | null
          status: string
          total_rows: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          csv_url: string
          error_message?: string | null
          id?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          csv_url?: string
          error_message?: string | null
          id?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_integrations: {
        Row: {
          created_at: string
          encrypted_tokens: string | null
          google_email: string
          google_name: string | null
          id: string
          integration_status: string
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_tokens?: string | null
          google_email: string
          google_name?: string | null
          id?: string
          integration_status?: string
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_tokens?: string | null
          google_email?: string
          google_name?: string | null
          id?: string
          integration_status?: string
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_items: {
        Row: {
          author: string | null
          category: string
          content: string
          created_at: string
          id: string
          rating: number | null
          source_file: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          author?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          source_file?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          source_file?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      queue_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          data: Json
          error_message: string | null
          id: string
          max_retries: number
          priority: number
          retry_count: number
          started_at: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data: Json
          error_message?: string | null
          id?: string
          max_retries?: number
          priority?: number
          retry_count?: number
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          error_message?: string | null
          id?: string
          max_retries?: number
          priority?: number
          retry_count?: number
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_audit: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          old_role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_health_logs: {
        Row: {
          checks: Json
          created_at: string
          id: string
          overall_status: string
          timestamp: string
        }
        Insert: {
          checks: Json
          created_at?: string
          id?: string
          overall_status: string
          timestamp?: string
        }
        Update: {
          checks?: Json
          created_at?: string
          id?: string
          overall_status?: string
          timestamp?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          last_credit_update: string
          total_credits_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          last_credit_update?: string
          total_credits_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          last_credit_update?: string
          total_credits_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: { credit_amount: number; user_uuid: string }
        Returns: undefined
      }
      deduct_credit: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      get_queue_stats: {
        Args: { time_range_hours?: number }
        Returns: {
          avg_processing_time_minutes: number
          count: number
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
