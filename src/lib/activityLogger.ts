import { supabase } from "@/integrations/supabase/client";

export const logActivity = async (action: string, details?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("user_activity_logs")
    .insert({ user_id: user.id, action, details: details || null })
    .then(() => {});
};
