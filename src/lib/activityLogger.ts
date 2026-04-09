import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export const logActivity = async (action: string, details?: string) => {
  // Read user ID from store to avoid an extra network round-trip per log call
  const userId = useAuthStore.getState().supabaseUser?.id;
  if (!userId) return;

  try {
    const { error } = await supabase
      .from("user_activity_logs")
      .insert({ user_id: userId, action, details: details || null });
    
    if (error) throw error;
  } catch (err) {
    console.error("Activity logging failed:", err);
  }
};
