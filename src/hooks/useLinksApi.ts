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
    mutationFn: async ({ title, url, platform, sort_order }: { title: string; url: string; platform: SocialPlatform; sort_order?: number }) => {
      if (!userId) throw new Error("User not authenticated");
      
      let finalSortOrder = sort_order;
      if (finalSortOrder === undefined) {
        const { data: currentLinks } = await supabase
          .from("links")
          .select("sort_order")
          .eq("user_id", userId)
          .order("sort_order", { ascending: false })
          .limit(1);
        finalSortOrder = (currentLinks?.[0]?.sort_order ?? -1) + 1;
      }

      // Try RPC first for backward compatibility with existing migrations
      const { data: rpcData, error: rpcError } = await supabase.rpc("upsert_links", {
        p_user_id: userId,
        p_links: [{ title, url, platform, sort_order: finalSortOrder, is_active: true }]
      });

      if (!rpcError) return rpcData[0];

      // FALLBACK: Use standard table operation if RPC is missing (404/P0001)
      console.warn("RPC upsert_links failed, falling back to standard table insert:", rpcError.message);
      const { data, error } = await supabase
        .from("links")
        .insert({
          user_id: userId,
          title,
          url,
          platform,
          sort_order: finalSortOrder,
          enabled: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newLink) => {
      await queryClient.cancelQueries({ queryKey: ["links", userId] });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(["links", userId]);
      
      const optimisticLink: LinkItem = {
        id: `temp-${Date.now()}`,
        title: newLink.title,
        url: newLink.url,
        platform: newLink.platform,
        enabled: true,
        clicks: 0,
        sort_order: (previousLinks?.length || 0),
        user_id: userId || ""
      };

      if (previousLinks) {
        queryClient.setQueryData<LinkItem[]>(["links", userId], [...previousLinks, optimisticLink]);
      }

      return { previousLinks };
    },
    onError: (err, newLink, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links", userId], context.previousLinks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LinkItem> }) => {
      if (!userId) throw new Error("User not authenticated");
      
      // Try RPC first
      const { error: rpcError } = await supabase.rpc("upsert_links", { 
        p_user_id: userId, 
        p_links: [{ id, ...data }] 
      });

      if (!rpcError) return { id, data };

      // FALLBACK
      console.warn("RPC upsert_links failed for update, falling back to standard table update:", rpcError.message);
      const updatePayload: any = { ...data };
      if (updatePayload.platform) {
         // Handle possible renaming if platform contains layout
      }
      
      const { error } = await supabase
        .from("links")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", userId);

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
      
      // Try RPC first
      const { error: rpcError } = await supabase.rpc("delete_links", { 
        p_user_id: userId, 
        p_ids: [id] 
      });

      if (!rpcError) return id;

      // FALLBACK
      console.warn("RPC delete_links failed, falling back to standard table delete:", rpcError.message);
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

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
      
      // Try RPC first
      const { error: rpcError } = await supabase.rpc("upsert_links", { 
        p_user_id: userId, 
        p_links: [{ id, is_active: enabled }] 
      });

      if (!rpcError) return { id, enabled };

      // FALLBACK
      console.warn("RPC upsert_links failed for toggle, falling back to standard table update:", rpcError.message);
      const { error } = await supabase
        .from("links")
        .update({ enabled })
        .eq("id", id)
        .eq("user_id", userId);

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
      
      // Try RPC first
      const { error: rpcError } = await supabase.rpc("reorder_links", { 
        p_user_id: userId, 
        p_order: updates 
      });

      if (!rpcError) return links;

      // FALLBACK: Manual sequential updates (less efficient but reliable if RPC is missing)
      console.warn("RPC reorder_links failed, falling back to sequential table updates:", rpcError.message);
      for (const update of updates) {
        await supabase
          .from("links")
          .update({ sort_order: update.order_index })
          .eq("id", update.id)
          .eq("user_id", userId);
      }

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
