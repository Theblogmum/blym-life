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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          brand: string
          category: string | null
          code: string | null
          commission_rate: string | null
          created_at: string
          id: string
          notes: string | null
          product: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          brand: string
          category?: string | null
          code?: string | null
          commission_rate?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          brand?: string
          category?: string | null
          code?: string | null
          commission_rate?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_goals: {
        Row: {
          created_at: string
          current_value: number
          deadline: string | null
          id: string
          kind: string
          target_value: number
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          kind?: string
          target_value?: number
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          kind?: string
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_profile: {
        Row: {
          content_style: string | null
          created_at: string
          follower_goal: number | null
          goals: string[]
          hook_style: string | null
          kids_ages: string | null
          known_for: string | null
          location: string | null
          niches: string[]
          platforms: string[]
          posting_frequency: string | null
          target_audience: string | null
          tax_rate: number
          tone: string | null
          updated_at: string
          user_id: string
          vibe: string | null
          work_status: string | null
        }
        Insert: {
          content_style?: string | null
          created_at?: string
          follower_goal?: number | null
          goals?: string[]
          hook_style?: string | null
          kids_ages?: string | null
          known_for?: string | null
          location?: string | null
          niches?: string[]
          platforms?: string[]
          posting_frequency?: string | null
          target_audience?: string | null
          tax_rate?: number
          tone?: string | null
          updated_at?: string
          user_id: string
          vibe?: string | null
          work_status?: string | null
        }
        Update: {
          content_style?: string | null
          created_at?: string
          follower_goal?: number | null
          goals?: string[]
          hook_style?: string | null
          kids_ages?: string | null
          known_for?: string | null
          location?: string | null
          niches?: string[]
          platforms?: string[]
          posting_frequency?: string | null
          target_audience?: string | null
          tax_rate?: number
          tone?: string | null
          updated_at?: string
          user_id?: string
          vibe?: string | null
          work_status?: string | null
        }
        Relationships: []
      }
      creator_xp: {
        Row: {
          created_at: string
          last_claim_date: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          last_claim_date?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          last_claim_date?: string | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      daily_briefs: {
        Row: {
          brief_date: string
          caption: string
          created_at: string
          film: string
          filmed: boolean
          hook: string
          id: string
          post_at: string | null
          saved: boolean
          shot_list: Json
          user_id: string
          why_it_works: string | null
        }
        Insert: {
          brief_date?: string
          caption: string
          created_at?: string
          film: string
          filmed?: boolean
          hook: string
          id?: string
          post_at?: string | null
          saved?: boolean
          shot_list?: Json
          user_id: string
          why_it_works?: string | null
        }
        Update: {
          brief_date?: string
          caption?: string
          created_at?: string
          film?: string
          filmed?: boolean
          hook?: string
          id?: string
          post_at?: string | null
          saved?: boolean
          shot_list?: Json
          user_id?: string
          why_it_works?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          brand: string | null
          created_at: string
          done: boolean
          due_date: string
          id: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          done?: boolean
          due_date?: string
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          done?: boolean
          due_date?: string
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_entries: {
        Row: {
          amount: number
          brand: string | null
          category: string
          created_at: string
          currency: string
          entry_date: string
          id: string
          notes: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount?: number
          brand?: string | null
          category?: string
          created_at?: string
          currency?: string
          entry_date?: string
          id?: string
          notes?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          brand?: string | null
          category?: string
          created_at?: string
          currency?: string
          entry_date?: string
          id?: string
          notes?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          brand_address: string | null
          brand_email: string | null
          brand_name: string
          created_at: string
          currency: string
          due_date: string | null
          from_address: string | null
          from_email: string | null
          from_name: string | null
          id: string
          issue_date: string
          items: Json
          notes: string | null
          number: string
          status: string
          tax_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_address?: string | null
          brand_email?: string | null
          brand_name: string
          created_at?: string
          currency?: string
          due_date?: string | null
          from_address?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          number: string
          status?: string
          tax_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_address?: string | null
          brand_email?: string | null
          brand_name?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          from_address?: string | null
          from_email?: string | null
          from_name?: string | null
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          number?: string
          status?: string
          tax_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lifetime_purchases: {
        Row: {
          created_at: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          brand: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          link: string | null
          metrics: Json | null
          platform: string | null
          posted_on: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          metrics?: Json | null
          platform?: string | null
          posted_on?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          metrics?: Json | null
          platform?: string | null
          posted_on?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts_logged: {
        Row: {
          comments: number | null
          created_at: string
          description: string
          hook: string | null
          id: string
          likes: number | null
          platform: string
          posted_at: string
          saves: number | null
          shares: number | null
          user_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          description: string
          hook?: string | null
          id?: string
          likes?: number | null
          platform: string
          posted_at?: string
          saves?: number | null
          shares?: number | null
          user_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          description?: string
          hook?: string | null
          id?: string
          likes?: number | null
          platform?: string
          posted_at?: string
          saves?: number | null
          shares?: number | null
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded: boolean
          public_bio: string | null
          public_slug: string | null
          tier: string
          trial_started_at: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded?: boolean
          public_bio?: string | null
          public_slug?: string | null
          tier?: string
          trial_started_at?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          public_bio?: string | null
          public_slug?: string | null
          tier?: string
          trial_started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_content: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          meta: Json | null
          title: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind: string
          meta?: Json | null
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          meta?: Json | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tax_reminders: {
        Row: {
          amount: number
          created_at: string
          done: boolean
          due_date: string
          id: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          done?: boolean
          due_date: string
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          done?: boolean
          due_date?: string
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trial_claims: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          ip_hash: string
          reminder_1h_sent_at: string | null
          reminder_24h_sent_at: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string
          id?: string
          ip_hash: string
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          ip_hash?: string
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
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
      weekly_plans: {
        Row: {
          caption: string | null
          created_at: string
          done: boolean
          hook: string | null
          id: string
          idea: string
          notes: string | null
          plan_date: string
          slot_label: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          done?: boolean
          hook?: string | null
          id?: string
          idea: string
          notes?: string | null
          plan_date: string
          slot_label?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          done?: boolean
          hook?: string | null
          id?: string
          idea?: string
          notes?: string | null
          plan_date?: string
          slot_label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: { _amount: number; _reason: string; _user_id: string }
        Returns: undefined
      }
      claim_daily_xp: {
        Args: { _user_id: string }
        Returns: {
          awarded: boolean
          xp: number
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
