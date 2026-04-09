import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { getPublicSiteUrl } from "@/lib/publicUrl";
import type { User } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";

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
    tab_labels?: {
      shop?: string;
      links?: string;
    };
  };
  creator_metrics?: {
    engagement_rate?: string;
    avg_views?: string;
    reach?: string;
    tab_labels?: {
      shop?: string;
      links?: string;
    };
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

const rememberLastProfileUsername = (username: string | undefined) => {
  if (typeof window === "undefined" || !username) return;
  window.localStorage.setItem("lv:lastProfileUsername", username);
};

const isDuplicateUsernameError = (message?: string, details?: string) =>
  Boolean(message && message.includes("profiles_username_key")) ||
  Boolean(details && details.includes("(username)")) ||
  Boolean(message && /username/i.test(message) && /duplicate|already/i.test(message));

const parseStringRecord = (value: Json | null | undefined): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value as Record<string, Json>).reduce<Record<string, string>>((acc, [key, raw]) => {
    if (typeof raw === "string") acc[key] = raw;
    return acc;
  }, {});
};

// Guard against duplicate auth listener subscriptions
let _authListenerActive = false;

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  supabaseUser: null,
  isAuthenticated: false,
  loading: true,

  initialize: async () => {
    // Prevent duplicate listener setup if called multiple times
    if (_authListenerActive) return;

    try {
      // 1. Fetch initial session first to avoid token refresh deadlocks
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Supabase session error:", error);
        if (error.message?.includes("refresh_token_not_found") || error.message?.includes("Invalid Refresh Token")) {
          await supabase.auth.signOut();
        }
        set({ loading: false });
      } else if (session?.user) {
        set({ supabaseUser: session.user, isAuthenticated: true });
        const profile = await get().fetchProfile(session.user.id);
        set({ user: profile, loading: false });
      } else {
        set({ loading: false });
      }

      // 2. Setup auth state listener AFTER initial session is resolved
      _authListenerActive = true;
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          set({ supabaseUser: currentSession.user, isAuthenticated: true });
          
          if (event === "SIGNED_IN") {
            const profile = await get().fetchProfile(currentSession.user.id);
            set({ user: profile, loading: false });
          }
        } else {
          set({ user: null, supabaseUser: null, isAuthenticated: false, loading: false });
        }
      });
    } catch (err) {
      console.error("Auth initialization failed:", err);
      _authListenerActive = false;
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

    const profile: UserProfile = {
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
      social_stats: {
        ig_followers: "",
        fb_likes: "",
        tiktok_followers: "",
        youtube_subs: "",
        ...parseStringRecord(data.social_stats),
      },
      creator_metrics: {
        engagement_rate: "",
        avg_views: "",
        reach: "",
        ...parseStringRecord(data.creator_metrics),
      },
    };

    rememberLastProfileUsername(profile.username);
    return profile;
  },

  register: async (name, email, password) => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const publicSiteUrl = getPublicSiteUrl();
    const baseUsername = normalizedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || "creator";

    // Fast, user-friendly duplicate email guard (profiles table mirrors auth users).
    const { data: existingEmailProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingEmailProfile) {
      return { success: false, error: "This email is already registered. Please sign in." };
    }

    const usernameExists = async (username: string): Promise<boolean> => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      return Boolean(data);
    };

    const pickAvailableUsername = async (): Promise<string> => {
      if (!(await usernameExists(baseUsername))) return baseUsername;

      for (let i = 0; i < 8; i += 1) {
        const candidate = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        if (!(await usernameExists(candidate))) return candidate;
      }
      return `${baseUsername}${Date.now().toString().slice(-6)}`;
    };

    const signUpWithUsername = async (username: string) =>
      supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: trimmedName, username },
          emailRedirectTo: `${publicSiteUrl}/login`,
        },
      });

    let generatedUsername = await pickAvailableUsername();
    let { data, error } = await signUpWithUsername(generatedUsername);

    const errorDetails =
      typeof error === "object" &&
      error !== null &&
      "details" in error &&
      typeof (error as { details?: unknown }).details === "string"
        ? (error as { details?: string }).details
        : undefined;

    if (
      error &&
      (isDuplicateUsernameError(error.message, errorDetails) ||
        /database error saving new user/i.test(error.message || ""))
    ) {
      generatedUsername = await pickAvailableUsername();
      ({ data, error } = await signUpWithUsername(generatedUsername));
    }

    if (error) {
      const message = (error.message || "").toLowerCase();
      if (message.includes("already registered") || message.includes("already exists") || message.includes("email")) {
        return { success: false, error: "This email is already registered. Please sign in." };
      }
      return { success: false, error: error.message };
    }

    // Supabase may return an obfuscated user for existing email in some auth configurations.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { success: false, error: "This email is already registered. Please sign in." };
    }

    if (data.user) {
      // Optimize: Update and select in one round trip to avoid extra fetchProfile call
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ name: trimmedName })
        .eq("user_id", data.user.id)
        .select("*")
        .single();

      if (!updateError && updatedProfile) {
        // reuse the logic from fetchProfile but with already fetched data
        const profile: UserProfile = {
          id: updatedProfile.id,
          user_id: updatedProfile.user_id,
          name: updatedProfile.name,
          email: updatedProfile.email,
          username: updatedProfile.username,
          bio: updatedProfile.bio || "",
          avatar_url: updatedProfile.avatar_url || "",
          role: updatedProfile.role,
          status: updatedProfile.status,
          created_at: updatedProfile.created_at,
          social_links: (updatedProfile as Record<string, unknown>).social_links as SocialLinkConfig[] || [],
          upi_id: (updatedProfile as Record<string, unknown>).upi_id as string || "",
          social_stats: {
            ig_followers: "",
            fb_likes: "",
            tiktok_followers: "",
            youtube_subs: "",
            ...parseStringRecord(updatedProfile.social_stats),
          },
          creator_metrics: {
            engagement_rate: "",
            avg_views: "",
            reach: "",
            ...parseStringRecord(updatedProfile.creator_metrics),
          },
        };
        set({ user: profile, supabaseUser: data.user, isAuthenticated: true });
        rememberLastProfileUsername(profile.username);
      } else {
        // Fallback to separate fetch if update/select failed for some reason
        const profile = await get().fetchProfile(data.user.id);
        set({ user: profile, supabaseUser: data.user, isAuthenticated: true });
        rememberLastProfileUsername(profile?.username);
      }
    }
    return { success: true };
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ loading: false });
        console.error("Authentication failed:", error.message);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        // Fetch profile and wait for it to ensure consistent state
        const profile = await get().fetchProfile(data.user.id);
        
        if (profile?.status === "blocked") {
          await supabase.auth.signOut();
          set({ loading: false });
          return { success: false, error: "This account has been deactivated." };
        }

        rememberLastProfileUsername(profile?.username);

        set({ 
          user: profile, 
          supabaseUser: data.user, 
          isAuthenticated: true,
          loading: false 
        });

        // Background updates (swallowed errors to avoid blocking user)
        supabase.from("profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("user_id", data.user.id)
          .then(({ error }) => { if (error) console.warn("Profile timestamp update failed", error); });

        supabase.from("user_activity_logs")
          .insert({ user_id: data.user.id, action: "login", details: "Credential login successful" })
          .then(({ error }) => { if (error) console.warn("Activity log failed", error); });
          
        return { success: true };
      }
      set({ loading: false });
      return { success: false, error: "Access denied. Verification failed." };
    } catch (err: any) {
      set({ loading: false });
      console.error("Unexpected authentication error:", err);
      return { success: false, error: "Service unavailable. Please try again later." };
    }
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

        const nextUser = { ...user, ...appliedData };
        set({ user: nextUser });
        rememberLastProfileUsername(nextUser.username);

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
