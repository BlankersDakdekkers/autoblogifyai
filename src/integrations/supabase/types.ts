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
      ai_personas: {
        Row: {
          created_at: string | null
          description: string
          examples: string[]
          expertise: string[]
          id: string
          name: string
          system_prompt: string | null
          tone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          examples?: string[]
          expertise?: string[]
          id?: string
          name: string
          system_prompt?: string | null
          tone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          examples?: string[]
          expertise?: string[]
          id?: string
          name?: string
          system_prompt?: string | null
          tone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          ai_enhanced: boolean | null
          author: string | null
          body_markdown: string | null
          canonical_url: string | null
          city: string | null
          cms_published: boolean | null
          created_at: string
          csv_job_id: string | null
          csv_row_index: number | null
          cta_heading: string | null
          cta_subtext: string | null
          error_message: string | null
          faq_json: Json | null
          hero_image_alt: string | null
          hero_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          processing_status: string | null
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
          ai_enhanced?: boolean | null
          author?: string | null
          body_markdown?: string | null
          canonical_url?: string | null
          city?: string | null
          cms_published?: boolean | null
          created_at?: string
          csv_job_id?: string | null
          csv_row_index?: number | null
          cta_heading?: string | null
          cta_subtext?: string | null
          error_message?: string | null
          faq_json?: Json | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          processing_status?: string | null
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
          ai_enhanced?: boolean | null
          author?: string | null
          body_markdown?: string | null
          canonical_url?: string | null
          city?: string | null
          cms_published?: boolean | null
          created_at?: string
          csv_job_id?: string | null
          csv_row_index?: number | null
          cta_heading?: string | null
          cta_subtext?: string | null
          error_message?: string | null
          faq_json?: Json | null
          hero_image_alt?: string | null
          hero_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          processing_status?: string | null
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
        Relationships: [
          {
            foreignKeyName: "blog_posts_csv_job_id_fkey"
            columns: ["csv_job_id"]
            isOneToOne: false
            referencedRelation: "csv_processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_integrations: {
        Row: {
          api_credentials: Json
          cms_type: string
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          name: string
          site_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_credentials: Json
          cms_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          name: string
          site_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_credentials?: Json
          cms_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          name?: string
          site_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cms_publish_history: {
        Row: {
          blog_post_id: string
          cms_integration_id: string
          cms_post_id: string | null
          cms_post_url: string | null
          created_at: string
          error_message: string | null
          id: string
          published_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          blog_post_id: string
          cms_integration_id: string
          cms_post_id?: string | null
          cms_post_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          published_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          blog_post_id?: string
          cms_integration_id?: string
          cms_post_id?: string | null
          cms_post_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          published_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_publish_history_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_publish_history_cms_integration_id_fkey"
            columns: ["cms_integration_id"]
            isOneToOne: false
            referencedRelation: "cms_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_processing_analytics: {
        Row: {
          ai_calls_made: number | null
          cms_publications_attempted: number | null
          cms_publications_successful: number | null
          created_at: string
          credits_consumed: number | null
          error_types: Json | null
          id: string
          job_id: string | null
          performance_metrics: Json | null
          processing_completed_at: string | null
          processing_started_at: string
          rows_failed: number | null
          rows_processed: number | null
          total_processing_time_seconds: number | null
          user_id: string
        }
        Insert: {
          ai_calls_made?: number | null
          cms_publications_attempted?: number | null
          cms_publications_successful?: number | null
          created_at?: string
          credits_consumed?: number | null
          error_types?: Json | null
          id?: string
          job_id?: string | null
          performance_metrics?: Json | null
          processing_completed_at?: string | null
          processing_started_at?: string
          rows_failed?: number | null
          rows_processed?: number | null
          total_processing_time_seconds?: number | null
          user_id: string
        }
        Update: {
          ai_calls_made?: number | null
          cms_publications_attempted?: number | null
          cms_publications_successful?: number | null
          created_at?: string
          credits_consumed?: number | null
          error_types?: Json | null
          id?: string
          job_id?: string | null
          performance_metrics?: Json | null
          processing_completed_at?: string | null
          processing_started_at?: string
          rows_failed?: number | null
          rows_processed?: number | null
          total_processing_time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "csv_processing_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "csv_processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_processing_jobs: {
        Row: {
          created_at: string
          csv_url: string
          error_count: number | null
          error_message: string | null
          id: string
          max_retries: number | null
          options: Json | null
          priority: number | null
          processed_rows: number | null
          processing_time_seconds: number | null
          retry_count: number | null
          scheduled_at: string | null
          status: string
          success_count: number | null
          total_rows: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          csv_url: string
          error_count?: number | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          options?: Json | null
          priority?: number | null
          processed_rows?: number | null
          processing_time_seconds?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string
          success_count?: number | null
          total_rows?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          csv_url?: string
          error_count?: number | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          options?: Json | null
          priority?: number | null
          processed_rows?: number | null
          processing_time_seconds?: number | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: string
          success_count?: number | null
          total_rows?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      csv_processing_limits: {
        Row: {
          created_at: string
          current_hour_jobs: number | null
          current_hour_start: string | null
          id: string
          is_premium: boolean | null
          max_concurrent_jobs: number
          max_jobs_per_hour: number
          max_rows_per_job: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_hour_jobs?: number | null
          current_hour_start?: string | null
          id?: string
          is_premium?: boolean | null
          max_concurrent_jobs?: number
          max_jobs_per_hour?: number
          max_rows_per_job?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_hour_jobs?: number | null
          current_hour_start?: string | null
          id?: string
          is_premium?: boolean | null
          max_concurrent_jobs?: number
          max_jobs_per_hour?: number
          max_rows_per_job?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      csv_processing_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_id: string | null
          max_retries: number | null
          priority: number
          processing_options: Json | null
          retry_count: number | null
          scheduled_for: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_id?: string | null
          max_retries?: number | null
          priority?: number
          processing_options?: Json | null
          retry_count?: number | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_id?: string | null
          max_retries?: number | null
          priority?: number
          processing_options?: Json | null
          retry_count?: number | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csv_processing_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "csv_processing_jobs"
            referencedColumns: ["id"]
          },
        ]
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
      media_items: {
        Row: {
          alt_text: string
          category: string
          created_at: string | null
          description: string | null
          dimensions: Json | null
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          meta_description: string
          name: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alt_text: string
          category: string
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          meta_description: string
          name: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alt_text?: string
          category?: string
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          file_path?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          meta_description?: string
          name?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
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
      resources: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          download_url: string | null
          duration: string | null
          external_url: string | null
          featured: boolean | null
          id: string
          rating: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          download_url?: string | null
          duration?: string | null
          external_url?: string | null
          featured?: boolean | null
          id?: string
          rating?: number | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          download_url?: string | null
          duration?: string | null
          external_url?: string | null
          featured?: boolean | null
          id?: string
          rating?: number | null
          title?: string
          type?: string
          updated_at?: string
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
          credits_reset_date: string | null
          email: string
          id: string
          monthly_credit_limit: number | null
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
          credits_reset_date?: string | null
          email: string
          id?: string
          monthly_credit_limit?: number | null
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
          credits_reset_date?: string | null
          email?: string
          id?: string
          monthly_credit_limit?: number | null
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
      user_analytics: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          direct_traffic: number | null
          id: string
          organic_traffic: number | null
          page_views: number | null
          referral_traffic: number | null
          revenue: number | null
          social_traffic: number | null
          unique_visitors: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date: string
          direct_traffic?: number | null
          id?: string
          organic_traffic?: number | null
          page_views?: number | null
          referral_traffic?: number | null
          revenue?: number | null
          social_traffic?: number | null
          unique_visitors?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          direct_traffic?: number | null
          id?: string
          organic_traffic?: number | null
          page_views?: number | null
          referral_traffic?: number | null
          revenue?: number | null
          social_traffic?: number | null
          unique_visitors?: number | null
          updated_at?: string
          user_id?: string
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
      admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_processing_rate_limit: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      cleanup_old_analytics: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      deduct_credit: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      generate_sample_analytics: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_credit_limit_for_tier: {
        Args: { tier_name: string }
        Returns: number
      }
      get_processing_stats: {
        Args: { days_back?: number; user_uuid: string }
        Returns: {
          avg_processing_time: number
          credits_used: number
          failed_jobs: number
          success_rate: number
          successful_jobs: number
          total_jobs: number
          total_rows_processed: number
        }[]
      }
      get_queue_stats: {
        Args: { time_range_hours?: number }
        Returns: {
          avg_processing_time_minutes: number
          count: number
          status: string
        }[]
      }
      get_user_processing_limits: {
        Args: { user_uuid: string }
        Returns: {
          current_hour_jobs: number
          is_premium: boolean
          jobs_remaining: number
          max_concurrent_jobs: number
          max_jobs_per_hour: number
          max_rows_per_job: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_processing_counter: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      make_self_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_monthly_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_subscription_tier: {
        Args: {
          p_new_tier: string
          p_stripe_subscription_id?: string
          p_user_id: string
        }
        Returns: undefined
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
