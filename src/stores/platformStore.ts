import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSettings {
  id: string;
  site_name: string;
  site_logo_url: string;
  default_theme_id: string;
  allow_registration: boolean;
  ai_api_key: string;
  feature_catalog: boolean;
  feature_contact_form: boolean;
  feature_social_links: boolean;
  feature_analytics: boolean;
  notify_order_email: string;
  notify_contact_email: string;
  notify_low_stock_email: string;
  enable_order_notifications: boolean;
  enable_contact_notifications: boolean;
  enable_low_stock_notifications: boolean;
  checkout_step_labels?: Record<string, string> | null;
  cta_label_overrides?: Record<string, string> | null;
  category_label_overrides?: Record<string, string> | null;
  item_type_label_overrides?: Record<string, string> | null;
}

interface PlatformState {
  settings: PlatformSettings | null;
  loading: boolean;
  initialized: boolean;
  fetchSettings: (force?: boolean) => Promise<void>;
  updateSettings: (data: Partial<PlatformSettings>) => Promise<boolean>;
}

export const usePlatformStore = create<PlatformState>()((set, get) => ({
  settings: null,
  loading: false,
  initialized: false,

  fetchSettings: async (force = false) => {
    if (get().initialized && !force) return;
    set({ loading: true });
    const { data, error } = await (supabase.from("platform_settings") as any)
      .select("*")
      .limit(1)
      .single();
    if (data && !error) {
      set({ settings: data as PlatformSettings, initialized: true });
    } else if (error) {
      console.error("Failed to fetch platform settings:", error.message);
    }
    set({ loading: false });
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    if (!current) return false;
    const previous = { ...current };
    const updated = { ...current, ...partial };
    set({ settings: updated });
    
    const { error } = await (supabase.from("platform_settings") as any)
      .update(partial)
      .eq("id", current.id);
    
    if (error) {
      console.error("Failed to update platform settings:", error.message);
      set({ settings: previous }); // rollback
      return false;
    }
    return true;
  },
}));
