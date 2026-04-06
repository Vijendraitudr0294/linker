import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { defaultAppearance } from "@/pages/PublicProfile"; // Re-export from PublicProfile or copy
import type { PostgrestError } from "@supabase/supabase-js";

export const usePublicProfileQuery = (username: string | undefined) => {
  return useQuery({
    queryKey: ["publicProfile", username],
    queryFn: async () => {
      if (!username || !isSupabaseConfigured) return null;
      const lowerUsername = username.toLowerCase();
      let profileData = null;

      if (lowerUsername === "user") {
        const { data: sessionData } = await supabase.auth.getSession();
        let authUserId = sessionData.session?.user?.id;
        if (!authUserId) {
          const { data: authUserData } = await supabase.auth.getUser();
          authUserId = authUserData.user?.id;
        }

        if (authUserId) {
          const fallback = await supabase.from("profiles").select("*").eq("user_id", authUserId).maybeSingle();
          profileData = fallback.data;
        }

        if (!profileData && typeof window !== "undefined") {
          const storedUsername = window.localStorage.getItem("lv:lastProfileUsername")?.trim().toLowerCase();
          if (storedUsername && storedUsername !== "user") {
            const byStoredUsername = await supabase.from("profiles").select("*").eq("username", storedUsername).maybeSingle();
            profileData = byStoredUsername.data;
          }
        }
      }

      if (!profileData) {
        const byUsername = await supabase.from("profiles").select("*").eq("username", lowerUsername).maybeSingle();
        profileData = byUsername.data;
      }

      if (!profileData || profileData.status !== "active") return null;

      if (typeof window !== "undefined" && profileData?.username) {
        window.localStorage.setItem("lv:lastProfileUsername", profileData.username);
      }

      const [linksRes, appearanceRes, catalogRes] = await Promise.all([
        supabase.from("links").select("id, title, url, platform").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
        supabase.from("appearance_settings").select("*").eq("user_id", profileData.user_id).maybeSingle(),
        supabase.from("catalog_items").select("*").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
      ]);

      return {
        profileData,
        linksData: linksRes.data || [],
        appearanceData: appearanceRes.data || null,
        catalogData: catalogRes.data || [],
      };
    },
    enabled: !!username && isSupabaseConfigured,
  });
};
