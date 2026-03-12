import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";

export type SocialPlatform = 
  | "instagram" | "twitter" | "youtube" | "tiktok" | "facebook" 
  | "linkedin" | "github" | "spotify" | "twitch" | "discord" 
  | "snapchat" | "pinterest" | "whatsapp" | "telegram" | "email" 
  | "website" | "googlemeet" | "zoom" | "calendly" | "calcom"
  | "video-embed" | "website-embed" | "google-maps"
  | "other";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  platform: SocialPlatform;
  clicks: number;
  sort_order: number;
  user_id: string;
}

interface LinksState {
  links: LinkItem[];
  loading: boolean;
  fetchLinks: (userId: string) => Promise<void>;
  addLink: (title: string, url: string, platform?: SocialPlatform) => Promise<void>;
  updateLink: (id: string, data: Partial<LinkItem>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  toggleLink: (id: string) => Promise<void>;
  reorderLinks: (links: LinkItem[]) => Promise<void>;
  trackClick: (id: string) => Promise<void>;
  getTotalClicks: () => number;
}

export const useLinksStore = create<LinksState>()((set, get) => ({
  links: [],
  loading: false,

  fetchLinks: async (userId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });
    
    if (data) {
      set({
        links: data.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          enabled: l.enabled,
          platform: l.platform as SocialPlatform,
          clicks: l.clicks,
          sort_order: l.sort_order,
          user_id: l.user_id,
        })),
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  addLink: async (title, url, platform = "website") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const links = get().links;
    const sort_order = links.length;
    
    const { data, error } = await supabase
      .from("links")
      .insert({ title, url, platform, user_id: user.id, sort_order })
      .select()
      .single();
    
    if (data && !error) {
      set({
        links: [...links, {
          id: data.id,
          title: data.title,
          url: data.url,
          enabled: data.enabled,
          platform: data.platform as SocialPlatform,
          clicks: data.clicks,
          sort_order: data.sort_order,
          user_id: data.user_id,
        }],
      });
      logActivity("link_add", `Added link: ${title}`);
    }
  },

  updateLink: async (id, data) => {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;

    await supabase.from("links").update(updateData).eq("id", id);
    set({
      links: get().links.map((l) => (l.id === id ? { ...l, ...data } : l)),
    });
    const link = get().links.find((l) => l.id === id);
    logActivity("link_edit", `Updated link: ${link?.title || id}`);
  },

  deleteLink: async (id) => {
    const link = get().links.find((l) => l.id === id);
    await supabase.from("links").delete().eq("id", id);
    set({ links: get().links.filter((l) => l.id !== id) });
    logActivity("link_delete", `Deleted link: ${link?.title || id}`);
  },

  toggleLink: async (id) => {
    const link = get().links.find((l) => l.id === id);
    if (!link) return;
    const newEnabled = !link.enabled;
    await supabase.from("links").update({ enabled: newEnabled }).eq("id", id);
    set({
      links: get().links.map((l) => (l.id === id ? { ...l, enabled: newEnabled } : l)),
    });
  },

  reorderLinks: async (links) => {
    set({ links });
    // Update sort_order in DB
    const updates = links.map((l, i) => 
      supabase.from("links").update({ sort_order: i }).eq("id", l.id)
    );
    await Promise.all(updates);
  },

  trackClick: async (id) => {
    await supabase.rpc("increment_link_clicks", { link_id: id });
    set({
      links: get().links.map((l) =>
        l.id === id ? { ...l, clicks: (l.clicks || 0) + 1 } : l
      ),
    });
  },

  getTotalClicks: () => get().links.reduce((sum, l) => sum + (l.clicks || 0), 0),
}));
