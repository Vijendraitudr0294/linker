import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
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
  shopTabLabel: "Shop",
  linksTabLabel: "Links",
};

type TabLabelSettings = Pick<AppearanceSettings, "shopTabLabel" | "linksTabLabel">;

let hasShownTabLabelCompatibilityNotice = false;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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

const getTabLabelsFromCreatorMetrics = (creatorMetrics: unknown): Partial<TabLabelSettings> => {
  if (!isRecord(creatorMetrics)) return {};

  const tabLabels = creatorMetrics.tab_labels;
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

const mergeTabLabelsIntoCreatorMetrics = (
  creatorMetrics: unknown,
  labels: Partial<TabLabelSettings>
): Record<string, unknown> => {
  const base = isRecord(creatorMetrics) ? { ...creatorMetrics } : {};
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

const persistTabLabelFallback = async (userId: string, data: Partial<AppearanceSettings>) => {
  const tabLabelPatch: Partial<TabLabelSettings> = {};
  if (data.shopTabLabel !== undefined) tabLabelPatch.shopTabLabel = data.shopTabLabel;
  if (data.linksTabLabel !== undefined) tabLabelPatch.linksTabLabel = data.linksTabLabel;
  if (Object.keys(tabLabelPatch).length === 0) return;

  const { data: profileData, error: readError } = await supabase
    .from("profiles")
    .select("creator_metrics")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw readError;

  const nextCreatorMetrics = mergeTabLabelsIntoCreatorMetrics(profileData?.creator_metrics, tabLabelPatch);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      creator_metrics: nextCreatorMetrics,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) throw updateError;
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
  return map;
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

  while (Object.keys(pendingData).length > 0) {
    const { error } = await supabase
      .from("appearance_settings")
      .upsert(pendingData, { onConflict: "user_id" });

    if (!error) {
      return { error: null, skippedColumns };
    }

    const missingColumnMatch = /Could not find the '([^']+)' column/i.exec(error.message || "");
    const missingColumn = missingColumnMatch?.[1];

    if (missingColumn && Object.prototype.hasOwnProperty.call(pendingData, missingColumn)) {
      delete pendingData[missingColumn];
      skippedColumns.add(missingColumn);
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

  fetchSettings: async (userId: string) => {
    set({ loading: true });

    const [appearanceRes, profileRes] = await Promise.all([
      supabase.from("appearance_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("creator_metrics").eq("user_id", userId).maybeSingle(),
    ]);

    const fallbackTabLabels = getTabLabelsFromCreatorMetrics(profileRes.data?.creator_metrics);

    if (appearanceRes.data) {
      const appearanceRow = appearanceRes.data as Record<string, unknown>;
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

    const skippedTabLabelColumns =
      skippedColumns.has("shop_tab_label") || skippedColumns.has("links_tab_label");

    if (skippedTabLabelColumns) {
      try {
        await persistTabLabelFallback(user.id, data);
        if (!hasShownTabLabelCompatibilityNotice) {
          toast.warning("Tab labels were saved in compatibility mode. Run latest DB migration for full support.");
          hasShownTabLabelCompatibilityNotice = true;
        }
      } catch {
        toast.error("Could not save tab labels. Please run latest database migration.");
      }
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
      gradientFrom: theme.gradientFrom ?? null,
      gradientTo: theme.gradientTo ?? null,
      backgroundImage: theme.backgroundImage ?? null,
      backgroundOverlay: theme.backgroundOverlay ?? null,
      animatedGradient: theme.animatedGradient ?? null,
      animationClass: theme.animationClass ?? null,
      fontFamily: theme.fontFamily ?? get().settings.fontFamily,
    };

    set({ settings: newSettings });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error, skippedColumns } = await upsertAppearanceSettings(user.id, newSettings);

    if (error) {
      toast.error(error);
      return;
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
