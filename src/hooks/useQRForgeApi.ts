import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type QRCodeItem, type QRType } from "@/types/qrforge";

const getLocalCodes = (): QRCodeItem[] => {
  try {
    return JSON.parse(localStorage.getItem("qrforge_codes") || "[]");
  } catch (e) {
    return [];
  }
};

const saveLocalCodes = (codes: QRCodeItem[]) => {
  localStorage.setItem("qrforge_codes", JSON.stringify(codes));
};

export const useQRCodes = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["qr_codes", userId],
    queryFn: async () => {
      // Always pull local storage codes as base
      const localCodes = getLocalCodes();
      
      if (!userId) return localCodes;

      try {
        const { data: qrData, error: qrError } = await supabase
          .from("qr_codes")
          .select(`
            *,
            qr_scans ( count )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (qrError) {
            console.warn("Supabase fetch error, returning local codes fallback.", qrError);
            return localCodes;
        }

        const supabaseCodes = (qrData || []).map((q) => ({
          id: q.id,
          user_id: q.user_id,
          name: q.name,
          type: q.type as QRType,
          mode: q.mode as "static" | "dynamic",
          content: q.content,
          short_code: q.short_code,
          fg_color: q.fg_color,
          bg_color: q.bg_color,
          logo_url: q.logo_url,
          is_active: q.is_active,
          created_at: q.created_at,
          updated_at: q.updated_at,
          scans_count: q.qr_scans?.[0]?.count ?? 0,
        })) as QRCodeItem[];

        // Merge keeping Supabase or filtering duplicates
        const merged = [...supabaseCodes];
        localCodes.forEach(local => {
           if (!merged.some(supa => supa.id === local.id)) {
               merged.push(local);
           }
        });
        return merged;

      } catch (e) {
        return localCodes;
      }
    },
    enabled: true, // Allow fetching even without userId so local storage works
  });
};

export const useQRForgeMutations = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const addQRCode = useMutation({
    mutationFn: async (payload: Omit<QRCodeItem, "id" | "user_id" | "scans_count">) => {
      // 1. Generate local entry payload with collision retry logic
      const generateUniqueCode = async (): Promise<string> => {
        let attempts = 0;
        let generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        while (attempts < 3) {
           generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
           if (!userId) break; // bypass for local offline tests
           const { count, error } = await supabase.from('qr_codes').select('*', { count: 'exact', head: true }).eq('short_code', generatedCode);
           if (!error && count === 0) return generatedCode;
           attempts++;
        }
        return generatedCode;
      };
      
      const shortCodeLocal = payload.mode === "dynamic" ? await generateUniqueCode() : null;
      
      const localItem: QRCodeItem = {
        id: crypto.randomUUID(),
        user_id: userId || "local-user",
        name: payload.name,
        type: payload.type,
        mode: payload.mode,
        content: payload.content,
        short_code: shortCodeLocal,
        fg_color: payload.fg_color,
        bg_color: payload.bg_color,
        logo_url: payload.logo_url,
        is_active: true,
        created_at: new Date().toISOString(),
        scans_count: 0
      };

      // 2. Try Supabase
      if (userId) {
         try {
             // Generate short code if dynamic
             let shortCode: string | null = null;
             if (payload.mode === "dynamic") {
                 shortCode = shortCodeLocal;
             }

             const { data, error } = await supabase
               .from("qr_codes")
               .insert({
                 user_id: userId,
                 name: payload.name,
                 type: payload.type,
                 mode: payload.mode,
                 content: payload.content,
                 short_code: shortCode,
                 fg_color: payload.fg_color,
                 bg_color: payload.bg_color,
                 logo_url: payload.logo_url,
                 is_active: payload.is_active,
               })
               .select()
               .single();

              if (!error && data) {
                  // Saved successfully to Supabase, return data setup
                  return data;
              }
              console.warn("Supabase insert error, falling back to LocalStorage:", error);
         } catch (supaErr) {
             console.warn("Supabase insertion exception, saving locally.", supaErr);
         }
      }

      // 3. Fallback to LocalStorage
      const localCodes = getLocalCodes();
      localCodes.push(localItem);
      saveLocalCodes(localCodes);
      return localItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", userId] });
    },
  });

  const updateQRCode = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QRCodeItem> }) => {
      try {
         const { error } = await supabase
           .from("qr_codes")
           .update(data as any)
           .eq("id", id);
         
         if (error) throw error;
      } catch (e) {
         // Local Fallback Update
         const codes = getLocalCodes();
         const updated = codes.map(c => c.id === id ? { ...c, ...data } : c);
         saveLocalCodes(updated);
      }
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", userId] });
    },
  });

  const deleteQRCode = useMutation({
    mutationFn: async (id: string) => {
      try {
         const { error } = await supabase
           .from("qr_codes")
           .delete()
           .eq("id", id);
         if (error) throw error;
      } catch (e) {
          // Local Delete Fallback
          const codes = getLocalCodes();
          const filtered = codes.filter(c => c.id !== id);
          saveLocalCodes(filtered);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", userId] });
    },
  });

  const toggleQRCode = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      try {
         const { error } = await supabase
           .from("qr_codes")
           .update({ is_active })
           .eq("id", id);
         if (error) throw error;
      } catch (e) {
         const codes = getLocalCodes();
         const updated = codes.map(c => c.id === id ? { ...c, is_active } : c);
         saveLocalCodes(updated);
      }
      return { id, is_active };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", userId] });
    },
  });

  const clearAllQRCodes = useMutation({
    mutationFn: async () => {
      try {
         if (userId) {
             const { error } = await supabase
               .from("qr_codes")
               .delete()
               .eq("user_id", userId);
             if (error) throw error;
         }
      } catch (e) {
         // Local fallback ignore
      }
      saveLocalCodes([]);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", userId] });
    },
  });

  return { addQRCode, updateQRCode, deleteQRCode, toggleQRCode, clearAllQRCodes };
};
