import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activityLogger";
import { toast } from "sonner";

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
  shopTabLabel: string;
  linksTabLabel: string;
  backgroundImage?: string;
  backgroundOverlay?: string;
  animatedGradient?: string;
  animationClass?: string;
  heroImage?: string;
  layoutType: "list" | "grid" | "bento" | "timeline" | "brutalism";
  cardStyle: "classic" | "glass" | "glass-premium" | "neon";
  profileStyleVariant?: "default" | "music";
}

interface AppearanceState {
  settings: AppearanceSettings;
  loading: boolean;
  settingsFetched: boolean;
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
    heroImage?: string;
    layoutMode?: "list" | "grid" | "bento" | "timeline";
    cardStyle?: "classic" | "glass" | "glass-premium" | "neon";
    profileStyleVariant?: "default" | "music";
  }) => Promise<void>;
}

const defaultSettings: AppearanceSettings = {
  themeId: "liquid-sunset",
  backgroundColor: "#2a3147",
  cardColor: "rgba(255, 255, 255, 0.16)",
  textColor: "#f8fafc",
  buttonStyle: "pill",
  buttonBg: "#ffffff",
  buttonText: "#1f2937",
  gradientFrom: "#ff8a33",
  gradientTo: "#1e2f5d",
  animationClass: "fx-liquid-gradient",
  fontFamily: "Urbanist",
  showAvatar: true,
  shopTabLabel: "Shop",
  linksTabLabel: "Links",
  layoutType: "list",
  cardStyle: "classic",
  profileStyleVariant: "default",
};

type TabLabelSettings = Pick<AppearanceSettings, "shopTabLabel" | "linksTabLabel">;

let hasShownTabLabelCompatibilityNotice = false;
const unsupportedAppearanceColumns = new Set<string>();
const appearanceDbColumns = [
  "theme_id",
  "background_color",
  "card_color",
  "text_color",
  "button_style",
  "button_bg",
  "button_text",
  "gradient_from",
  "gradient_to",
  "font_family",
  "show_avatar",
  "shop_tab_label",
  "links_tab_label",
  "background_image",
  "background_overlay",
  "animated_gradient",
  "animation_class",
  "hero_image",
  "layout_type",
  "card_style",
  "profile_style_variant",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isMissingColumnError = (error: { message?: string } | null | undefined, columnName: string): boolean =>
  Boolean(error?.message && new RegExp(`Could not find the '${columnName}' column`, "i").test(error.message));

const resolveTabLabel = (
  primary: string | undefined,
  fallback: string | undefined,
  defaultValue: string
): string => {
  const primaryText = (primary || "").trim();
  const fallbackText = (fallback || "").trim();

  if (!primaryText) return fallbackText || defaultValue;
  if (primaryText === defaultValue && fallbackText && fallbackText !== defaultValue) return fallbackText;

  return primaryText;
};

const getTabLabelsFromMetricObject = (metricObject: unknown): Partial<TabLabelSettings> => {
  if (!isRecord(metricObject)) return {};

  const tabLabels = metricObject.tab_labels;
  if (!isRecord(tabLabels)) return {};

  const next: Partial<TabLabelSettings> = {};

  if (typeof tabLabels.shop === "string" && tabLabels.shop.trim()) {
    next.shopTabLabel = tabLabels.shop.trim();
  }

  if (typeof tabLabels.links === "string" && tabLabels.links.trim()) {
    next.linksTabLabel = tabLabels.links.trim();
  }

  return next;
};

const mergeTabLabelsIntoMetricObject = (
  metricObject: unknown,
  labels: Partial<TabLabelSettings>
): Record<string, unknown> => {
  const base = isRecord(metricObject) ? { ...metricObject } : {};
  const existingTabLabels = isRecord(base.tab_labels) ? { ...base.tab_labels } : {};

  if (labels.shopTabLabel !== undefined) {
    const nextValue = labels.shopTabLabel.trim() || defaultSettings.shopTabLabel;
    existingTabLabels.shop = nextValue;
  }

  if (labels.linksTabLabel !== undefined) {
    const nextValue = labels.linksTabLabel.trim() || defaultSettings.linksTabLabel;
    existingTabLabels.links = nextValue;
  }

  base.tab_labels = existingTabLabels;
  return base;
};

const combineFallbackTabLabels = (
  creatorMetricLabels: Partial<TabLabelSettings>,
  socialMetricLabels: Partial<TabLabelSettings>
): Partial<TabLabelSettings> => ({
  shopTabLabel: creatorMetricLabels.shopTabLabel || socialMetricLabels.shopTabLabel,
  linksTabLabel: creatorMetricLabels.linksTabLabel || socialMetricLabels.linksTabLabel,
});

const persistTabLabelFallback = async (userId: string, data: Partial<AppearanceSettings>): Promise<boolean> => {
  const tabLabelPatch: Partial<TabLabelSettings> = {};
  if (data.shopTabLabel !== undefined) tabLabelPatch.shopTabLabel = data.shopTabLabel;
  if (data.linksTabLabel !== undefined) tabLabelPatch.linksTabLabel = data.linksTabLabel;
  if (Object.keys(tabLabelPatch).length === 0) return true;

  const profileRead = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileRead.error) {
    throw profileRead.error;
  }

  const profileData = (profileRead.data as Record<string, unknown> | null) || {};
  const hasCreatorMetrics = Object.prototype.hasOwnProperty.call(profileData, "creator_metrics");
  const hasSocialStats = Object.prototype.hasOwnProperty.call(profileData, "social_stats");

  if (hasCreatorMetrics) {
    const nextCreatorMetrics = mergeTabLabelsIntoMetricObject(profileData.creator_metrics, tabLabelPatch);
    const creatorUpdate = await supabase
      .from("profiles")
      .update({
        creator_metrics: nextCreatorMetrics as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (!creatorUpdate.error) return true;
    if (!isMissingColumnError(creatorUpdate.error, "creator_metrics")) throw creatorUpdate.error;
  }

  if (hasSocialStats) {
    const nextSocialStats = mergeTabLabelsIntoMetricObject(profileData.social_stats, tabLabelPatch);
    const socialUpdate = await supabase
      .from("profiles")
      .update({
        social_stats: nextSocialStats as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (!socialUpdate.error) return true;
    if (!isMissingColumnError(socialUpdate.error, "social_stats")) throw socialUpdate.error;
  }

  return false;
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
  showAvatar: row.show_avatar !== undefined ? (row.show_avatar as boolean) : true,
  shopTabLabel: (row.shop_tab_label as string) || defaultSettings.shopTabLabel,
  linksTabLabel: (row.links_tab_label as string) || defaultSettings.linksTabLabel,
  backgroundImage: (row.background_image as string) || undefined,
  backgroundOverlay: (row.background_overlay as string) || undefined,
  animatedGradient: (row.animated_gradient as string) || undefined,
  animationClass: (row.animation_class as string) || undefined,
  heroImage: (row.hero_image as string) || undefined,
  layoutType: (row.layout_type as AppearanceSettings["layoutType"]) || defaultSettings.layoutType,
  cardStyle: (row.card_style as AppearanceSettings["cardStyle"]) || defaultSettings.cardStyle,
  profileStyleVariant: (row.profile_style_variant as AppearanceSettings["profileStyleVariant"]) || defaultSettings.profileStyleVariant,
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
  if (s.shopTabLabel !== undefined) map.shop_tab_label = s.shopTabLabel;
  if (s.linksTabLabel !== undefined) map.links_tab_label = s.linksTabLabel;
  if (s.backgroundImage !== undefined) map.background_image = s.backgroundImage || null;
  if (s.backgroundOverlay !== undefined) map.background_overlay = s.backgroundOverlay || null;
  if (s.animatedGradient !== undefined) map.animated_gradient = s.animatedGradient || null;
  if (s.animationClass !== undefined) map.animation_class = s.animationClass || null;
  if (s.heroImage !== undefined) map.hero_image = s.heroImage || null;
  if (s.layoutType !== undefined) map.layout_type = s.layoutType;
  if (s.cardStyle !== undefined) map.card_style = s.cardStyle;
  if (s.profileStyleVariant !== undefined) map.profile_style_variant = s.profileStyleVariant || null;
  return map;
};

const persistDesignOverridesFallback = async (userId: string, data: Partial<AppearanceSettings>): Promise<boolean> => {
  const overrides: Record<string, string> = {};
  if (data.layoutType !== undefined) overrides.layout_type = data.layoutType;
  if (data.cardStyle !== undefined) overrides.card_style = data.cardStyle;
  if (data.buttonBg !== undefined) overrides.button_bg = data.buttonBg;
  if (data.buttonText !== undefined) overrides.button_text = data.buttonText;
  if (data.backgroundColor !== undefined) overrides.background_color = data.backgroundColor;
  if (data.textColor !== undefined) overrides.text_color = data.textColor;
  if (data.cardColor !== undefined) overrides.card_color = data.cardColor;
  if (data.fontFamily !== undefined) overrides.font_family = data.fontFamily;
  if (data.buttonStyle !== undefined) overrides.button_style = data.buttonStyle;
  if (data.profileStyleVariant !== undefined) overrides.profile_style_variant = data.profileStyleVariant;
  
  if (Object.keys(overrides).length === 0) return true;

  const profileRead = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (profileRead.error) throw profileRead.error;

  const profileData = (profileRead.data as Record<string, unknown> | null) || {};
  const metrics = isRecord(profileData.creator_metrics) ? { ...profileData.creator_metrics } : {};
  const currentOverrides = isRecord(metrics.design_overrides) ? { ...metrics.design_overrides } : {};

  // Merge overrides
  Object.assign(currentOverrides, overrides);
  metrics.design_overrides = currentOverrides;

  const update = await supabase
    .from("profiles")
    .update({
      creator_metrics: metrics as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return !update.error;
};

const upsertAppearanceSettings = async (userId: string, data: Partial<AppearanceSettings>) => {
  const updateMap = settingsToDb(data);
  if (Object.keys(updateMap).length === 0) {
    return { error: null as string | null, skippedColumns: new Set<string>() };
  }

  const pendingData: Record<string, unknown> = {
    ...updateMap,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  const skippedColumns = new Set<string>();
  let lastError: string | null = null;

  unsupportedAppearanceColumns.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(pendingData, column)) {
      delete pendingData[column];
      skippedColumns.add(column);
    }
  });

  while (Object.keys(pendingData).length > 0) {
    const { error } = await supabase
      .from("appearance_settings")
      .upsert(pendingData as any, { onConflict: "user_id" });

    if (!error) {
      return { error: null, skippedColumns };
    }

    // 1. Handle missing columns
    const missingColumnMatch = /Could not find the '([^']+)' column/i.exec(error.message || "");
    const missingColumn = missingColumnMatch?.[1];

    if (missingColumn && Object.prototype.hasOwnProperty.call(pendingData, missingColumn)) {
      delete pendingData[missingColumn];
      skippedColumns.add(missingColumn);
      unsupportedAppearanceColumns.add(missingColumn);
      continue;
    }

    // 2. Handle button_style constraint violation
    if (error.message?.includes("appearance_settings_button_style_check") && pendingData.button_style) {
      console.warn("Retrying with fallback button style due to DB constraint");
      pendingData.button_style = "rounded"; // Safest fallback
      continue;
    }

    lastError = error.message || "Failed to save appearance settings";
    break;
  }

  return { error: lastError || "Failed to save appearance settings", skippedColumns };
};

export const useAppearanceStore = create<AppearanceState>()((set, get) => ({
  settings: defaultSettings,
  loading: false,
  settingsFetched: false,

  fetchSettings: async (userId: string) => {
    if (get().settingsFetched && userId) return;
    if (get().loading) return;

    set({ loading: true });

    const [appearanceRes, profileRes] = await Promise.all([
      supabase.from("appearance_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const profileData = (profileRes.data as Record<string, unknown> | null) || {};
    const creatorMetricLabels = getTabLabelsFromMetricObject(profileData.creator_metrics);
    const socialMetricLabels = getTabLabelsFromMetricObject(profileData.social_stats);
    const fallbackTabLabels = combineFallbackTabLabels(creatorMetricLabels, socialMetricLabels);

    if (appearanceRes.data) {
      const appearanceRow = appearanceRes.data as Record<string, unknown>;
      const existingColumns = new Set(Object.keys(appearanceRow));
      appearanceDbColumns.forEach((column) => {
        if (!existingColumns.has(column)) unsupportedAppearanceColumns.add(column);
      });
      const dbSettings = dbToSettings(appearanceRow);

      set({
        settings: {
          ...dbSettings,
          shopTabLabel: resolveTabLabel(
            appearanceRow.shop_tab_label as string | undefined,
            fallbackTabLabels.shopTabLabel,
            defaultSettings.shopTabLabel
          ),
          linksTabLabel: resolveTabLabel(
            appearanceRow.links_tab_label as string | undefined,
            fallbackTabLabels.linksTabLabel,
            defaultSettings.linksTabLabel
          ),
        },
        loading: false,
        settingsFetched: true,
      });
      return;
    }

    if (!appearanceRes.error) {
      await supabase.from("appearance_settings").insert({ user_id: userId });
    }

    set({
      settings: {
        ...defaultSettings,
        shopTabLabel: fallbackTabLabels.shopTabLabel || defaultSettings.shopTabLabel,
        linksTabLabel: fallbackTabLabels.linksTabLabel || defaultSettings.linksTabLabel,
      },
      loading: false,
    });
  },

  updateSettings: async (data) => {
    const newSettings = { ...get().settings, ...data };
    set({ settings: newSettings });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error, skippedColumns } = await upsertAppearanceSettings(user.id, data);

    if (error) {
      toast.error(error);
      return;
    }

    if (skippedColumns.size > 0) {
      const skippedNames = Array.from(skippedColumns).join(", ");
      console.warn(`Skipped columns in DB update: ${skippedNames}`);
      
      try {
         await persistDesignOverridesFallback(user.id, data);
      } catch (err) {
         console.error("Design fallback save error:", err);
      }

      // Silent fallback: just log and continue. Compatibility save is handled silently in DB.
      console.warn(`Design compatibility notice: Some fields [${skippedNames}] are using profile-fallback storage due to pending schema upgrades.`);
    }

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
      gradientFrom: theme.gradientFrom ?? undefined,
      gradientTo: theme.gradientTo ?? undefined,
      backgroundImage: theme.backgroundImage ?? undefined,
      backgroundOverlay: theme.backgroundOverlay ?? undefined,
      animatedGradient: theme.animatedGradient ?? undefined,
      animationClass: theme.animationClass ?? undefined,
      fontFamily: theme.fontFamily ?? get().settings.fontFamily,
      heroImage: theme.heroImage ?? undefined,
      layoutType: theme.layoutMode ?? get().settings.layoutType,
      cardStyle: theme.cardStyle ?? get().settings.cardStyle,
      profileStyleVariant: theme.profileStyleVariant ?? get().settings.profileStyleVariant,
    };

    set({ settings: newSettings });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error, skippedColumns } = await upsertAppearanceSettings(user.id, newSettings);

    if (error) {
      console.warn("Retrying theme application due to error:", error);
      // Wait a bit and try one more time as a simple retry
      await new Promise(r => setTimeout(r, 1000));
      await upsertAppearanceSettings(user.id, newSettings);
    }

    if (skippedColumns.size > 0) {
      try {
        await persistDesignOverridesFallback(user.id, newSettings);
      } catch (err) {
        console.error("Theme design fallback save error:", err);
      }
    }

    const skippedTabLabelColumns =
      skippedColumns.has("shop_tab_label") || skippedColumns.has("links_tab_label");

    if (skippedTabLabelColumns) {
      try {
        await persistTabLabelFallback(user.id, newSettings);
      } catch {
        // Keep theme application non-blocking even if compatibility fallback fails.
      }
    }

    logActivity("theme_change", `Applied theme: ${theme.id}`);
  },
}));
