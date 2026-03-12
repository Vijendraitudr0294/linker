import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";

export interface AppearanceSettings {
  themeId: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  buttonStyle: "rounded" | "pill" | "square" | "outline" | "shadow";
  buttonBg: string;
  buttonText: string;
  gradientFrom?: string;
  gradientTo?: string;
  fontFamily: string;
  showAvatar: boolean;
  backgroundImage?: string;
  backgroundOverlay?: string;
  animatedGradient?: string;
  animationClass?: string;
}

interface AppearanceState {
  settings: AppearanceSettings;
  loading: boolean;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (data: Partial<AppearanceSettings>) => Promise<void>;
  applyTheme: (theme: {
    id: string;
    backgroundColor: string;
    cardColor: string;
    textColor: string;
    buttonStyle: "rounded" | "pill" | "square" | "outline" | "shadow";
    buttonBg: string;
    buttonText: string;
    gradientFrom?: string;
    gradientTo?: string;
    backgroundImage?: string;
    backgroundOverlay?: string;
    animatedGradient?: string;
    animationClass?: string;
    fontFamily?: string;
  }) => Promise<void>;
}

const defaultSettings: AppearanceSettings = {
  themeId: "clean-white",
  backgroundColor: "#ffffff",
  cardColor: "#f8fafc",
  textColor: "#1e293b",
  buttonStyle: "rounded",
  buttonBg: "#1e293b",
  buttonText: "#ffffff",
  fontFamily: "Inter",
  showAvatar: true,
};

const dbToSettings = (row: Record<string, unknown>): AppearanceSettings => ({
  themeId: (row.theme_id as string) || defaultSettings.themeId,
  backgroundColor: (row.background_color as string) || defaultSettings.backgroundColor,
  cardColor: (row.card_color as string) || defaultSettings.cardColor,
  textColor: (row.text_color as string) || defaultSettings.textColor,
  buttonStyle: (row.button_style as AppearanceSettings["buttonStyle"]) || defaultSettings.buttonStyle,
  buttonBg: (row.button_bg as string) || defaultSettings.buttonBg,
  buttonText: (row.button_text as string) || defaultSettings.buttonText,
  gradientFrom: row.gradient_from as string | undefined,
  gradientTo: row.gradient_to as string | undefined,
  fontFamily: (row.font_family as string) || defaultSettings.fontFamily,
  showAvatar: row.show_avatar !== undefined ? row.show_avatar as boolean : true,
  backgroundImage: (row.background_image as string) || undefined,
  backgroundOverlay: (row.background_overlay as string) || undefined,
  animatedGradient: (row.animated_gradient as string) || undefined,
  animationClass: (row.animation_class as string) || undefined,
});

const settingsToDb = (s: Partial<AppearanceSettings>) => {
  const map: Record<string, unknown> = {};
  if (s.themeId !== undefined) map.theme_id = s.themeId;
  if (s.backgroundColor !== undefined) map.background_color = s.backgroundColor;
  if (s.cardColor !== undefined) map.card_color = s.cardColor;
  if (s.textColor !== undefined) map.text_color = s.textColor;
  if (s.buttonStyle !== undefined) map.button_style = s.buttonStyle;
  if (s.buttonBg !== undefined) map.button_bg = s.buttonBg;
  if (s.buttonText !== undefined) map.button_text = s.buttonText;
  if (s.gradientFrom !== undefined) map.gradient_from = s.gradientFrom || null;
  if (s.gradientTo !== undefined) map.gradient_to = s.gradientTo || null;
  if (s.fontFamily !== undefined) map.font_family = s.fontFamily;
  if (s.showAvatar !== undefined) map.show_avatar = s.showAvatar;
  if (s.backgroundImage !== undefined) map.background_image = s.backgroundImage || null;
  if (s.backgroundOverlay !== undefined) map.background_overlay = s.backgroundOverlay || null;
  if (s.animatedGradient !== undefined) map.animated_gradient = s.animatedGradient || null;
  if (s.animationClass !== undefined) map.animation_class = s.animationClass || null;
  return map;
};

export const useAppearanceStore = create<AppearanceState>()((set, get) => ({
  settings: defaultSettings,
  loading: false,

  fetchSettings: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("appearance_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      set({ settings: dbToSettings(data as Record<string, unknown>), loading: false });
    } else {
      // No row exists yet — create one with defaults
      if (!error) {
        await supabase.from("appearance_settings").insert({ user_id: userId });
      }
      set({ loading: false });
    }
  },

  updateSettings: async (data) => {
    const newSettings = { ...get().settings, ...data };
    set({ settings: newSettings });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dbData = { ...settingsToDb(data), user_id: user.id, updated_at: new Date().toISOString() };
    await supabase
      .from("appearance_settings")
      .upsert(dbData, { onConflict: "user_id" });
    const changed = Object.keys(data).join(", ");
    logActivity("appearance_edit", `Updated: ${changed}`);
  },

  applyTheme: async (theme) => {
    const newSettings = {
      ...get().settings,
      themeId: theme.id,
      backgroundColor: theme.backgroundColor,
      cardColor: theme.cardColor,
      textColor: theme.textColor,
      buttonStyle: theme.buttonStyle,
      buttonBg: theme.buttonBg,
      buttonText: theme.buttonText,
      gradientFrom: theme.gradientFrom ?? null,
      gradientTo: theme.gradientTo ?? null,
      backgroundImage: theme.backgroundImage ?? null,
      backgroundOverlay: theme.backgroundOverlay ?? null,
      animatedGradient: theme.animatedGradient ?? null,
      animationClass: theme.animationClass ?? null,
      fontFamily: theme.fontFamily ?? get().settings.fontFamily,
    };
    set({ settings: newSettings });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dbData = { ...settingsToDb(newSettings), user_id: user.id, updated_at: new Date().toISOString() };
    await supabase
      .from("appearance_settings")
      .upsert(dbData, { onConflict: "user_id" });
    logActivity("theme_change", `Applied theme: ${theme.id}`);
  },
}));
