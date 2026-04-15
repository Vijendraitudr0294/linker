import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSettings {
  id: string;
  site_name: string;
  site_logo_url: string;
  default_theme_id: string;
  allow_registration: boolean;
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
  link_template_categories?: any[] | null;
  theme_categories?: any[] | null;
  theme_presets?: any[] | null;
  niche_templates?: any[] | null;
  demo_catalog_packs?: Record<string, any> | null;
  razorpay_key_id?: string | null;
  stripe_publishable_key?: string | null;
  is_test_mode?: boolean | null;
}

interface PlatformState {
  settings: PlatformSettings | null;
  loading: boolean;
  initialized: boolean;
  fetchSettings: (force?: boolean) => Promise<void>;
  updateSettings: (data: Partial<PlatformSettings>) => Promise<boolean>;
}

const PLATFORM_SETTINGS_SELECT = [
  "id",
  "site_name",
  "site_logo_url",
  "default_theme_id",
  "allow_registration",
  "feature_catalog",
  "feature_contact_form",
  "feature_social_links",
  "feature_analytics",
  "notify_order_email",
  "notify_contact_email",
  "notify_low_stock_email",
  "enable_order_notifications",
  "enable_contact_notifications",
  "enable_low_stock_notifications",
  "checkout_step_labels",
  "cta_label_overrides",
  "category_label_overrides",
  "item_type_label_overrides",
  "link_template_categories",
  "theme_categories",
  "theme_presets",
  "niche_templates",
  "demo_catalog_packs",
  "razorpay_key_id",
  "stripe_publishable_key",
  "is_test_mode",
  "created_at",
  "updated_at",
].join(", ");

export const usePlatformStore = create<PlatformState>()((set, get) => ({
  settings: null,
  loading: false,
  initialized: false,

  fetchSettings: async (force = false) => {
    if ((get().initialized || get().loading) && !force) return;
    
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select(PLATFORM_SETTINGS_SELECT)
        .limit(1)
        .single();
        
      if (data && !error) {
        set({ settings: data as any as PlatformSettings, initialized: true });
      } else if (error) {
        // FALLBACK: If a column is missing (e.g. database not migrated), try fetching only the essential columns
        if (error.message.includes("column") || error.code === 'PGRST204' || error.message.includes("does not exist")) {
          console.warn("Schema mismatch in platform_settings, retrying with safe column list...");
          const SAFE_SELECT = PLATFORM_SETTINGS_SELECT.split(", ")
            .filter(col => ![
              "link_template_categories", 
              "theme_categories", 
              "theme_presets", 
              "niche_templates", 
              "demo_catalog_packs"
            ].includes(col))
            .join(", ");
            
          const { data: safeData, error: safeError } = await supabase
            .from("platform_settings")
            .select(SAFE_SELECT)
            .limit(1)
            .single();
            
          if (safeData && !safeError) {
            set({ settings: safeData as any as PlatformSettings, initialized: true });
            return;
          }
          console.error("Failed to fetch platform settings even with safe list:", safeError?.message);
        } else {
          console.error("Failed to fetch platform settings:", error.message);
        }

        set({ initialized: true });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    if (!current) return false;
    const previous = { ...current };
    const updated = { ...current, ...partial };
    set({ settings: updated });
    
    const { error } = await supabase
      .from("platform_settings")
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


