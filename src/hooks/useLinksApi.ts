import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type SocialPlatform, type LinkItem } from "@/types/links";
import { logActivity } from "@/lib/activityLogger";
import { sendAnalyticsEvents } from "@/lib/analytics";

export const useLinks = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["links", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data || []).map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        enabled: l.enabled,
        platform: l.platform as SocialPlatform,
        clicks: l.clicks,
        sort_order: l.sort_order,
        user_id: l.user_id,
      })) as LinkItem[];
    },
    enabled: !!userId,
  });
};

export const useLinkMutations = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const addLink = useMutation({
    mutationFn: async ({ title, url, platform }: { title: string; url: string; platform: SocialPlatform }) => {
      if (!userId) throw new Error("User not authenticated");
      
      if (!title || title.trim().length === 0 || title.length > 80) {
          throw new Error("Title must be between 1 and 80 characters");
      }
      if (!/^https?:\/\//i.test(url)) {
          throw new Error("URL must be a valid HTTP/HTTPS URL");
      }
      
      const { data: currentLinks } = await supabase
        .from("links")
        .select("sort_order")
        .eq("user_id", userId)
        .order("sort_order", { ascending: false })
        .limit(1);
      
      const newSortOrder = (currentLinks?.[0]?.sort_order ?? -1) + 1;

      const { data, error } = await supabase.rpc("upsert_links", {
        p_user_id: userId,
        p_links: [{ title, url, platform, sort_order: newSortOrder, is_active: true }]
      });

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
      logActivity("link_add", `Added link: ${data.title}`);
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LinkItem> }) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await supabase.rpc("upsert_links", { 
        p_user_id: userId, 
        p_links: [{ id, ...data }] 
      });

      if (error) throw error;
      return { id, data };
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["links", userId] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(["links", userId]);
      if (previousLinks) {
         queryClient.setQueryData<LinkItem[]>(["links", userId], old => (old || []).map(l => l.id === id ? { ...l, ...data } : l));
      }
      return { previousLinks };
    },
    onError: (err, variables, context) => {
      if (context?.previousLinks) queryClient.setQueryData(["links", userId], context.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
    },
    onSuccess: ({ id }) => {
      logActivity("link_edit", `Updated link: ${id}`);
    }
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await supabase.rpc("delete_links", { 
        p_user_id: userId, 
        p_ids: [id] 
      });

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["links", userId] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(["links", userId]);
      if (previousLinks) {
         queryClient.setQueryData<LinkItem[]>(["links", userId], old => (old || []).filter(l => l.id !== id));
      }
      return { previousLinks };
    },
    onError: (err, id, context) => {
      if (context?.previousLinks) queryClient.setQueryData(["links", userId], context.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
    },
    onSuccess: (id) => {
      logActivity("link_delete", `Deleted link: ${id}`);
    }
  });

  const toggleLink = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      if (!userId) throw new Error("User not authenticated");
      const { error } = await supabase.rpc("upsert_links", { 
        p_user_id: userId, 
        p_links: [{ id, is_active: enabled }] 
      });

      if (error) throw error;
      return { id, enabled };
    },
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ["links", userId] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(["links", userId]);
      if (previousLinks) {
         queryClient.setQueryData<LinkItem[]>(["links", userId], old => (old || []).map(l => l.id === id ? { ...l, enabled } : l));
      }
      return { previousLinks };
    },
    onError: (err, variables, context) => {
      if (context?.previousLinks) queryClient.setQueryData(["links", userId], context.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
    },
  });

  const reorderLinks = useMutation({
    mutationFn: async (links: LinkItem[]) => {
      if (!userId) throw new Error("User not authenticated");
      const updates = links.map((l, i) => ({ id: l.id, order_index: i }));
      const { error } = await supabase.rpc("reorder_links", { 
        p_user_id: userId, 
        p_order: updates 
      });

      if (error) throw error;
      return links;
    },
    onMutate: async (newLinks) => {
      await queryClient.cancelQueries({ queryKey: ["links", userId] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(["links", userId]);
      
      queryClient.setQueryData(["links", userId], newLinks);
      return { previousLinks };
    },
    onError: (err, newLinks, context) => {
      if (context?.previousLinks) queryClient.setQueryData(["links", userId], context.previousLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
    },
  });

  const trackClick = useMutation({
    mutationFn: async (id: string) => {
      const tracked = await sendAnalyticsEvents({
        event_type: "link_click",
        entity_id: id,
        user_id: userId,
      });
      if (!tracked) {
        console.warn('Analytics API unavailable');
      }
      return id;
    },
    // We intentionally do not invalidate 'links' query to avoid UI reloading mid-click
  });

  return { addLink, updateLink, deleteLink, toggleLink, reorderLinks, trackClick };
};
