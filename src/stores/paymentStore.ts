import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentSettings {
  id: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  is_test_mode: boolean;
  currency: string;
  platform_fee_percentage: number;
}

interface PaymentState {
  settings: PaymentSettings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<PaymentSettings>) => Promise<boolean>;
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      // Create table check placeholder - logic for fetching from platform_settings or a dedicated payment_settings table
      const { data, error } = await supabase
        .from("platform_settings")
        .select("id, razorpay_key_id, razorpay_key_secret, stripe_publishable_key, stripe_secret_key, is_test_mode, currency, platform_fee_percentage")
        .single();
        
      if (data && !error) {
        set({ settings: data as any });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    if (!current) return false;
    
    set({ loading: true });
    const { error } = await supabase
      .from("platform_settings")
      .update(partial)
      .eq("id", current.id);
    
    if (!error) {
      set({ settings: { ...current, ...partial } });
      set({ loading: false });
      return true;
    }
    set({ loading: false });
    return false;
  }
}));
