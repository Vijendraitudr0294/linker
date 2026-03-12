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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appearance_settings: {
        Row: {
          animated_gradient: string | null
          animation_class: string | null
          background_color: string
          background_image: string | null
          background_overlay: string | null
          button_bg: string
          button_style: string
          button_text: string
          card_color: string
          created_at: string
          font_family: string
          gradient_from: string | null
          gradient_to: string | null
          hero_image: string | null
          id: string
          show_avatar: boolean
          text_color: string
          theme_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          animated_gradient?: string | null
          animation_class?: string | null
          background_color?: string
          background_image?: string | null
          background_overlay?: string | null
          button_bg?: string
          button_style?: string
          button_text?: string
          card_color?: string
          created_at?: string
          font_family?: string
          gradient_from?: string | null
          gradient_to?: string | null
          hero_image?: string | null
          id?: string
          show_avatar?: boolean
          text_color?: string
          theme_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          animated_gradient?: string | null
          animation_class?: string | null
          background_color?: string
          background_image?: string | null
          background_overlay?: string | null
          button_bg?: string
          button_style?: string
          button_text?: string
          card_color?: string
          created_at?: string
          font_family?: string
          gradient_from?: string | null
          gradient_to?: string | null
          hero_image?: string | null
          id?: string
          show_avatar?: boolean
          text_color?: string
          theme_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          item_id: string
          profile_user_id: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          item_id: string
          profile_user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          item_id?: string
          profile_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_analytics_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          allow_order_form: boolean
          category: string
          created_at: string
          description: string | null
          duration: string | null
          enabled: boolean
          external_url: string | null
          id: string
          image_url: string | null
          item_type: string
          location: string | null
          price: number | null
          price_label: string | null
          schedule: string | null
          sort_order: number
          stock_quantity: number | null
          tags: string[] | null
          title: string
          track_inventory: boolean
          updated_at: string
          user_id: string
          variants: Json | null
        }
        Insert: {
          allow_order_form?: boolean
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          enabled?: boolean
          external_url?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          location?: string | null
          price?: number | null
          price_label?: string | null
          schedule?: string | null
          sort_order?: number
          stock_quantity?: number | null
          tags?: string[] | null
          title: string
          track_inventory?: boolean
          updated_at?: string
          user_id: string
          variants?: Json | null
        }
        Update: {
          allow_order_form?: boolean
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          enabled?: boolean
          external_url?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          location?: string | null
          price?: number | null
          price_label?: string | null
          schedule?: string | null
          sort_order?: number
          stock_quantity?: number | null
          tags?: string[] | null
          title?: string
          track_inventory?: boolean
          updated_at?: string
          user_id?: string
          variants?: Json | null
        }
        Relationships: []
      }
      catalog_orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          item_id: string
          notes: string | null
          profile_user_id: string
          quantity: number
          selected_variant: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          item_id: string
          notes?: string | null
          profile_user_id: string
          quantity?: number
          selected_variant?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          profile_user_id?: string
          quantity?: number
          selected_variant?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          profile_user_id: string
          read: boolean
          sender_email: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          profile_user_id: string
          read?: boolean
          sender_email: string
          sender_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          profile_user_id?: string
          read?: boolean
          sender_email?: string
          sender_name?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          clicks: number
          created_at: string
          enabled: boolean
          id: string
          platform: string
          sort_order: number
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          clicks?: number
          created_at?: string
          enabled?: boolean
          id?: string
          platform?: string
          sort_order?: number
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          clicks?: number
          created_at?: string
          enabled?: boolean
          id?: string
          platform?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          ai_api_key: string | null
          allow_registration: boolean
          category_label_overrides: Json | null
          checkout_step_labels: Json | null
          created_at: string
          cta_label_overrides: Json | null
          default_theme_id: string
          enable_contact_notifications: boolean
          enable_low_stock_notifications: boolean
          enable_order_notifications: boolean
          feature_analytics: boolean
          feature_catalog: boolean
          feature_contact_form: boolean
          feature_social_links: boolean
          id: string
          item_type_label_overrides: Json | null
          notify_contact_email: string | null
          notify_low_stock_email: string | null
          notify_order_email: string | null
          site_logo_url: string | null
          site_name: string
          updated_at: string
        }
        Insert: {
          ai_api_key?: string | null
          allow_registration?: boolean
          category_label_overrides?: Json | null
          checkout_step_labels?: Json | null
          created_at?: string
          cta_label_overrides?: Json | null
          default_theme_id?: string
          enable_contact_notifications?: boolean
          enable_low_stock_notifications?: boolean
          enable_order_notifications?: boolean
          feature_analytics?: boolean
          feature_catalog?: boolean
          feature_contact_form?: boolean
          feature_social_links?: boolean
          id?: string
          item_type_label_overrides?: Json | null
          notify_contact_email?: string | null
          notify_low_stock_email?: string | null
          notify_order_email?: string | null
          site_logo_url?: string | null
          site_name?: string
          updated_at?: string
        }
        Update: {
          ai_api_key?: string | null
          allow_registration?: boolean
          category_label_overrides?: Json | null
          checkout_step_labels?: Json | null
          created_at?: string
          cta_label_overrides?: Json | null
          default_theme_id?: string
          enable_contact_notifications?: boolean
          enable_low_stock_notifications?: boolean
          enable_order_notifications?: boolean
          feature_analytics?: boolean
          feature_catalog?: boolean
          feature_contact_form?: boolean
          feature_social_links?: boolean
          id?: string
          item_type_label_overrides?: Json | null
          notify_contact_email?: string | null
          notify_low_stock_email?: string | null
          notify_order_email?: string | null
          site_logo_url?: string | null
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          country: string | null
          created_at: string
          id: string
          profile_user_id: string
          referrer: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          profile_user_id: string
          referrer?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          profile_user_id?: string
          referrer?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          last_login_at: string | null
          name: string
          notification_prefs: Json
          role: string
          social_links: Json | null
          status: string
          updated_at: string
          upi_id: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          notification_prefs?: Json
          role?: string
          social_links?: Json | null
          status?: string
          updated_at?: string
          upi_id?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          notification_prefs?: Json
          role?: string
          social_links?: Json | null
          status?: string
          updated_at?: string
          upi_id?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_link_clicks: { Args: { link_id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
