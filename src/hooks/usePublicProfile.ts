import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toCatalogItem } from "@/lib/catalogUtils";

export const usePublicProfileQuery = (username: string | undefined) => {
  return useQuery({
    queryKey: ["publicProfile", username],
    queryFn: async () => {
      if (!username) return null;
      const lowerUsername = username.trim().toLowerCase();
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
        console.log("🔍 Fetching profile by username:", lowerUsername);
        const byUsername = await supabase.from("profiles").select("*").eq("username", lowerUsername).maybeSingle();
        profileData = byUsername.data;
        if (byUsername.error) console.error("❌ Profile fetch error:", byUsername.error);
      }

      console.log("📄 Profile data found:", profileData);

      if (!profileData) {
        console.warn("⚠️ Profile not found in database for username:", lowerUsername);
        return null;
      }

      if (profileData.status !== "active") {
        console.warn("⚠️ Profile status is not active:", profileData.status);
        return null;
      }

      if (typeof window !== "undefined" && profileData?.username) {
        window.localStorage.setItem("lv:lastProfileUsername", profileData.username);
      }

      const cacheBuster = Date.now();
      const [linksRes, appearanceRes, catalogRes] = await Promise.all([
        supabase.from("links").select("id, title, url, platform").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
        supabase.from("appearance_settings").select("*").eq("user_id", profileData.user_id).maybeSingle(),
        supabase.from("catalog_items").select("*").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
      ]);

      console.log("💎 DB Source Raw Check:", {
        appearance: appearanceRes.data?.theme_id,
        bgImage: appearanceRes.data?.background_image,
        ts: cacheBuster
      });

      // Designer Fix: Inject Elite Fitness demo content for vjsblr2 to show off components
      if (lowerUsername === "vjsblr2" && profileData.creator_metrics) {
        const demoState = {
          profile: {
            showSection: true,
            sectionTitle: "Elite Program",
            sectionSubtitle: "Summer Schedule & Apps",
            items: [
              {
                id: "demo-ticket",
                type: "ticket",
                title: "Miami Beach Masterclass",
                subtitle: "Elite Beach Workout",
                url: "#",
                date: "JUL 14",
                location: "Miami, FL"
              },
              {
                id: "demo-app",
                type: "download",
                title: "App Store",
                url: "#"
              }
            ]
          }
        };
        profileData.creator_metrics = {
          ...profileData.creator_metrics,
          studio_state_json: JSON.stringify(demoState)
        };
      }

      return {
        profileData,
        linksData: linksRes.data || [],
        appearanceData: appearanceRes.data || null,
        catalogData: (catalogRes.data || []).map(row => toCatalogItem(row as any)),
      };
    },
    enabled: !!username,
  });
};
