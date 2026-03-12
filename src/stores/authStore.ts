import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import type { User } from "@supabase/supabase-js";

export interface SocialLinkConfig {
  platform: string;
  url: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar_url: string;
  role: string;
  status: string;
  created_at: string;
  social_links: SocialLinkConfig[];
  upi_id: string;
  social_stats?: {
    ig_followers?: string;
    fb_likes?: string;
    tiktok_followers?: string;
    youtube_subs?: string;
  };
  creator_metrics?: {
    engagement_rate?: string;
    avg_views?: string;
    reach?: string;
  };
}

interface AuthState {
  user: UserProfile | null;
  supabaseUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  supabaseUser: null,
  isAuthenticated: false,
  loading: true,

  initialize: async () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ supabaseUser: session.user, isAuthenticated: true });
        // Defer profile fetch to avoid deadlock
        setTimeout(async () => {
          const profile = await get().fetchProfile(session.user.id);
          set({ user: profile, loading: false });
        }, 0);
      } else {
        set({ user: null, supabaseUser: null, isAuthenticated: false, loading: false });
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ supabaseUser: session.user, isAuthenticated: true });
      const profile = await get().fetchProfile(session.user.id);
      set({ user: profile, loading: false });
    } else {
      set({ loading: false });
    }
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      username: data.username,
      bio: data.bio || "",
      avatar_url: data.avatar_url || "",
      role: data.role,
      status: data.status,
      created_at: data.created_at,
      social_links: (data as Record<string, unknown>).social_links as SocialLinkConfig[] || [],
      upi_id: (data as Record<string, unknown>).upi_id as string || "",
      social_stats: (data as Record<string, unknown>).social_stats as any || {
        ig_followers: "", fb_likes: "", tiktok_followers: "", youtube_subs: ""
      },
      creator_metrics: (data as Record<string, unknown>).creator_metrics as any || {
        engagement_rate: "", avg_views: "", reach: ""
      },
    };
  },

  register: async (name, email, password) => {
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username },
      },
    });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      // Profile is auto-created by trigger, but update name
      await supabase
        .from("profiles")
        .update({ name })
        .eq("user_id", data.user.id);
      const profile = await get().fetchProfile(data.user.id);
      set({ user: profile, supabaseUser: data.user, isAuthenticated: true });
    }
    return { success: true };
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      const profile = await get().fetchProfile(data.user.id);
      if (profile?.status === "blocked") {
        await supabase.auth.signOut();
        return { success: false, error: "Your account has been blocked" };
      }
      set({ user: profile, supabaseUser: data.user, isAuthenticated: true });
      // Track last login and log activity
      (supabase.from("profiles") as any).update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id).then(() => {});
      (supabase.from("user_activity_logs") as any).insert({ user_id: data.user.id, action: "login", details: "User logged in" }).then(() => {});
    }
    return { success: true };
  },

  logout: async () => {
    await logActivity("logout", "User logged out");
    await supabase.auth.signOut();
    set({ user: null, supabaseUser: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
    if (data.social_links !== undefined) updateData.social_links = data.social_links;
    if (data.upi_id !== undefined) updateData.upi_id = data.upi_id;
    if (data.social_stats !== undefined) updateData.social_stats = data.social_stats;
    if (data.creator_metrics !== undefined) updateData.creator_metrics = data.creator_metrics;

    const pendingData: Record<string, unknown> = { ...updateData };
    const skippedColumns = new Set<string>();

    while (Object.keys(pendingData).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(pendingData)
        .eq("user_id", user.user_id);

      if (!error) {
        const appliedData = Object.fromEntries(
          Object.entries(data).filter(([key]) => Object.prototype.hasOwnProperty.call(pendingData, key))
        ) as Partial<UserProfile>;

        set({ user: { ...user, ...appliedData } });

        const changed = Object.keys(pendingData).join(", ");
        logActivity("profile_edit", `Updated: ${changed}`);
        return;
      }

      const missingColumnMatch = /Could not find the '([^']+)' column/i.exec(error.message || "");
      const missingColumn = missingColumnMatch?.[1];

      if (missingColumn && Object.prototype.hasOwnProperty.call(pendingData, missingColumn)) {
        delete pendingData[missingColumn];
        skippedColumns.add(missingColumn);
        continue;
      }

      const duplicateUsername =
        error.code === "23505" &&
        (error.message?.includes("profiles_username_key") || error.details?.includes("(username)"));

      if (duplicateUsername) {
        throw new Error("This username is already taken. Try another one.");
      }

      throw new Error(error.message || "Failed to update profile");
    }

    if (skippedColumns.size > 0) {
      logActivity("profile_edit", `Skipped unsupported fields: ${Array.from(skippedColumns).join(", ")}`);
    }
  },
}));
