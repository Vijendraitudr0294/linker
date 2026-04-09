export interface ThemePreset {
  id: string;
  name: string;
  category: ThemeCategory;
  isPopular?: boolean;
  backgroundStyle?: string;
  animationPreset?: "fade-in" | "slide-up" | "hover-scale" | "pulse-glow" | "floating-motion" | "parallax-effect";
  cardStyle?: "classic" | "glass" | "glass-premium" | "neon";
  layoutMode?: "list" | "grid" | "bento";
  fontPair?: string;
  motionEngine?: "Framer Motion" | "CSS" | "Three.js" | "Vanta.js" | "GSAP" | "Lottie" | "tsParticles" | "Anime.js" | "Spline" | "Magic UI";
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
  profileStyleVariant?: "default" | "music";
}

export type ThemeCategory = string;

export const themeCategories: { id: ThemeCategory; label: string; icon: string }[] = [
  { id: "animated", label: "Animated", icon: "AN" },
  { id: "gradient", label: "Gradient", icon: "GR" },
  { id: "photo", label: "Photo", icon: "PH" },
  { id: "dark", label: "Dark", icon: "DK" },
  { id: "neon", label: "Neon", icon: "NE" },
  { id: "minimal", label: "Minimal", icon: "MI" },
];

// Curated, deduped theme set. Every new preset uses Inter.
export const themePresets: ThemePreset[] = [
  {
    id: "liquid-sunset",
    name: "Liquid Sunset",
    category: "animated",
    isPopular: true,
    backgroundStyle: "liquid-gradient",
    animationPreset: "floating-motion",
    cardStyle: "glass",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#2a3147",
    cardColor: "rgba(255, 255, 255, 0.16)",
    textColor: "#f8fafc",
    buttonStyle: "pill",
    buttonBg: "#ffffff",
    buttonText: "#1f2937",
    gradientFrom: "#ff8a33",
    gradientTo: "#1e2f5d",
    animationClass: "fx-liquid-gradient",
    fontFamily: "Inter",
  },
  {
    id: "nordic-night",
    name: "Nordic Night",
    category: "animated",
    isPopular: true,
    backgroundStyle: "night-sky",
    animationPreset: "parallax-effect",
    cardStyle: "glass-premium",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#0d1117",
    cardColor: "rgba(22, 27, 34, 0.75)",
    textColor: "#c9d1d9",
    buttonStyle: "rounded",
    buttonBg: "#58a6ff",
    buttonText: "#ffffff",
    animationClass: "animate-nordic-stars",
    fontFamily: "Inter",
  },
  {
    id: "constellation-dusk",
    name: "Constellation Dusk",
    category: "photo",
    isPopular: true,
    backgroundStyle: "night-sky",
    animationPreset: "parallax-effect",
    cardStyle: "glass",
    fontPair: "Inter",
    motionEngine: "Three.js",
    backgroundColor: "#10263c",
    cardColor: "rgba(18, 31, 52, 0.62)",
    textColor: "#eaf3ff",
    buttonStyle: "rounded",
    buttonBg: "#cc554d",
    buttonText: "#fff7f6",
    backgroundImage: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1200&q=80",
    backgroundOverlay: "rgba(9, 18, 35, 0.42)",
    animationClass: "fx-constellation-3d",
    fontFamily: "Inter",
  },
  {
    id: "pop-cobalt",
    name: "Pop Cobalt",
    category: "gradient",
    isPopular: true,
    backgroundStyle: "playful-blobs",
    animationPreset: "hover-scale",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#2f67de",
    cardColor: "rgba(255, 255, 255, 0.9)",
    textColor: "#0f172a",
    buttonStyle: "pill",
    buttonBg: "#ffffff",
    buttonText: "#0f172a",
    gradientFrom: "#2f67de",
    gradientTo: "#427af3",
    animationClass: "fx-pop-grain",
    fontFamily: "Inter",
  },
  {
    id: "market-poster",
    name: "Market Poster",
    category: "gradient",
    isPopular: true,
    backgroundStyle: "pastel-editorial",
    animationPreset: "slide-up",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#f8e44f",
    cardColor: "#fffef8",
    textColor: "#101828",
    buttonStyle: "outline",
    buttonBg: "#111827",
    buttonText: "#111827",
    gradientFrom: "#f8e44f",
    gradientTo: "#f5a15c",
    fontFamily: "Inter",
  },
  {
    id: "midnight-grid",
    name: "Midnight Grid",
    category: "dark",
    isPopular: true,
    backgroundStyle: "terminal-grid",
    animationPreset: "pulse-glow",
    cardStyle: "glass-premium",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#05070d",
    cardColor: "rgba(12, 18, 31, 0.86)",
    textColor: "#f3f4f6",
    buttonStyle: "outline",
    buttonBg: "#e5e7eb",
    buttonText: "#e5e7eb",
    animationClass: "fx-midnight-grid",
    fontFamily: "Inter",
  },
  {
    id: "neon-horizon-3d",
    name: "Neon Horizon 3D",
    category: "neon",
    isPopular: true,
    backgroundStyle: "neon-grid",
    animationPreset: "parallax-effect",
    cardStyle: "neon",
    fontPair: "Inter",
    motionEngine: "Three.js",
    backgroundColor: "#070b16",
    cardColor: "rgba(10, 18, 32, 0.72)",
    textColor: "#dff8ff",
    buttonStyle: "shadow",
    buttonBg: "#3df3ff",
    buttonText: "#08253a",
    gradientFrom: "#1d4ed8",
    gradientTo: "#22d3ee",
    animationClass: "fx-neon-grid-3d",
    fontFamily: "Inter",
  },
  {
    id: "aurora-ink",
    name: "Aurora Ink",
    category: "animated",
    backgroundStyle: "aurora-soft",
    animationPreset: "fade-in",
    cardStyle: "glass-premium",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#070e1f",
    cardColor: "rgba(15, 23, 42, 0.74)",
    textColor: "#e2e8f0",
    buttonStyle: "pill",
    buttonBg: "#38bdf8",
    buttonText: "#082f49",
    gradientFrom: "#312e81",
    gradientTo: "#0ea5e9",
    animationClass: "animate-aurora",
    fontFamily: "Inter",
  },
  {
    id: "studio-carbon",
    name: "Studio Carbon",
    category: "dark",
    backgroundStyle: "matte-dark",
    animationPreset: "slide-up",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#09090b",
    cardColor: "rgba(24, 24, 27, 0.9)",
    textColor: "#f4f4f5",
    buttonStyle: "rounded",
    buttonBg: "#f97316",
    buttonText: "#1c1917",
    fontFamily: "Inter",
  },
  {
    id: "paper-light",
    name: "Paper Light",
    category: "minimal",
    backgroundStyle: "flat-minimal",
    animationPreset: "fade-in",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#f8fafc",
    cardColor: "#ffffff",
    textColor: "#0f172a",
    buttonStyle: "outline",
    buttonBg: "#0f172a",
    buttonText: "#0f172a",
    fontFamily: "Inter",
  },
  {
    id: "coral-daybreak",
    name: "Coral Daybreak",
    category: "gradient",
    backgroundStyle: "warm-gradient",
    animationPreset: "hover-scale",
    cardStyle: "glass",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#2b1f2d",
    cardColor: "rgba(255, 255, 255, 0.14)",
    textColor: "#fff7ed",
    buttonStyle: "pill",
    buttonBg: "#fb7185",
    buttonText: "#3f1d2e",
    gradientFrom: "#fb923c",
    gradientTo: "#fb7185",
    fontFamily: "Inter",
  },
  {
    id: "street-frame",
    name: "Street Frame",
    category: "photo",
    backgroundStyle: "photo-editorial",
    animationPreset: "slide-up",
    cardStyle: "glass",
    fontPair: "Inter",
    motionEngine: "Framer Motion",
    backgroundColor: "#101827",
    cardColor: "rgba(17, 24, 39, 0.68)",
    textColor: "#f8fafc",
    buttonStyle: "rounded",
    buttonBg: "#facc15",
    buttonText: "#111827",
    backgroundImage: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1200&q=80",
    backgroundOverlay: "rgba(10, 15, 27, 0.48)",
    fontFamily: "Inter",
  },
  {
    id: "solid-mint",
    name: "Solid Mint",
    category: "minimal",
    backgroundStyle: "solid-bright",
    animationPreset: "fade-in",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#6ddc80",
    cardColor: "#f5fff5",
    textColor: "#0f172a",
    buttonStyle: "square",
    buttonBg: "#0f172a",
    buttonText: "#f8fafc",
    fontFamily: "Inter",
  },
  {
    id: "retro-pop-yellow",
    name: "Retro Pop Yellow",
    category: "minimal",
    backgroundStyle: "solid-bright",
    animationPreset: "hover-scale",
    cardStyle: "classic",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#FDE68A",
    cardColor: "transparent",
    textColor: "#000000",
    buttonStyle: "square",
    buttonBg: "#000000",
    buttonText: "#FFFFFF",
    fontFamily: "Outfit",
    layoutMode: "brutalist" as any,
  },
  {
    id: "retro-pop-blue",
    name: "Retro Pop Blue",
    category: "minimal",
    backgroundStyle: "solid-bright",
    animationPreset: "hover-scale",
    cardStyle: "classic",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#BAE6FD",
    cardColor: "transparent",
    textColor: "#000000",
    buttonStyle: "square",
    buttonBg: "#000000",
    buttonText: "#FFFFFF",
    fontFamily: "Outfit",
    layoutMode: "brutalist" as any,
  },
  {
    id: "retro-pop-green",
    name: "Retro Pop Green",
    category: "minimal",
    backgroundStyle: "solid-bright",
    animationPreset: "hover-scale",
    cardStyle: "classic",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#BBF7D0",
    cardColor: "transparent",
    textColor: "#000000",
    buttonStyle: "square",
    buttonBg: "#000000",
    buttonText: "#FFFFFF",
    fontFamily: "Outfit",
    layoutMode: "brutalist" as any,
  },
];

const THEME_BUTTON_STYLES = new Set(["rounded", "pill", "square", "outline", "shadow"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeThemePreset = (value: unknown): ThemePreset | null => {
  if (!isRecord(value)) return null;

  const id = asString(value.id);
  const name = asString(value.name);
  const category = asString(value.category);
  const backgroundColor = asString(value.backgroundColor);
  const cardColor = asString(value.cardColor);
  const textColor = asString(value.textColor);
  const buttonBg = asString(value.buttonBg);
  const buttonText = asString(value.buttonText);
  const buttonStyle = asString(value.buttonStyle);

  if (!id || !name || !category || !backgroundColor || !cardColor || !textColor || !buttonBg || !buttonText || !buttonStyle) {
    return null;
  }
  if (!THEME_BUTTON_STYLES.has(buttonStyle)) return null;

  const preset: ThemePreset = {
    id,
    name,
    category,
    backgroundColor,
    cardColor,
    textColor,
    buttonStyle: buttonStyle as ThemePreset["buttonStyle"],
    buttonBg,
    buttonText,
  };

  if (typeof value.isPopular === "boolean") preset.isPopular = value.isPopular;
  if (asString(value.backgroundStyle)) preset.backgroundStyle = asString(value.backgroundStyle) || undefined;
  if (asString(value.cardStyle)) preset.cardStyle = (asString(value.cardStyle) as ThemePreset["cardStyle"]) || undefined;
  if (asString(value.layoutMode)) preset.layoutMode = (asString(value.layoutMode) as ThemePreset["layoutMode"]) || undefined;
  if (asString(value.fontPair)) preset.fontPair = asString(value.fontPair) || undefined;
  if (asString(value.motionEngine)) preset.motionEngine = asString(value.motionEngine) as ThemePreset["motionEngine"];
  if (asString(value.animationPreset)) preset.animationPreset = asString(value.animationPreset) as ThemePreset["animationPreset"];
  if (asString(value.gradientFrom)) preset.gradientFrom = asString(value.gradientFrom) || undefined;
  if (asString(value.gradientTo)) preset.gradientTo = asString(value.gradientTo) || undefined;
  if (asString(value.backgroundImage)) preset.backgroundImage = asString(value.backgroundImage) || undefined;
  if (asString(value.backgroundOverlay)) preset.backgroundOverlay = asString(value.backgroundOverlay) || undefined;
  if (asString(value.animatedGradient)) preset.animatedGradient = asString(value.animatedGradient) || undefined;
  if (asString(value.animationClass)) preset.animationClass = asString(value.animationClass) || undefined;
  if (asString(value.fontFamily)) preset.fontFamily = asString(value.fontFamily) || undefined;
  if (asString(value.profileStyleVariant)) {
    preset.profileStyleVariant = (asString(value.profileStyleVariant) as ThemePreset["profileStyleVariant"]) || undefined;
  }

  return preset;
};

export const getThemeCategoriesFromSettings = (settings: unknown): { id: ThemeCategory; label: string; icon: string }[] => {
  const raw = (settings as Record<string, unknown> | null)?.theme_categories;
  if (!Array.isArray(raw)) return themeCategories;

  const parsed = raw
    .map((value, index) => {
      if (!isRecord(value)) return null;
      const id = asString(value.id) || `category-${index + 1}`;
      const label = asString(value.label);
      if (!label) return null;
      const icon = asString(value.icon) || "*";
      return { id, label, icon };
    })
    .filter((category): category is { id: ThemeCategory; label: string; icon: string } => category !== null);

  return parsed.length > 0 ? parsed : themeCategories;
};

const THEME_COLLECTION_KEY = "__ai_themes";

export const getThemePresetsFromSettings = (settings: unknown): ThemePreset[] => {
  const s = settings as Record<string, unknown> | null;
  const rawPresets = s?.theme_presets;
  const fallbackPresets = (s?.demo_catalog_packs as any)?.[THEME_COLLECTION_KEY];
  
  const raw = Array.isArray(rawPresets) ? rawPresets : (Array.isArray(fallbackPresets) ? fallbackPresets : null);
  const dedupePresets = (presets: ThemePreset[]) => {
    const seenIds = new Set<string>();
    const seenNameCategory = new Set<string>();

    return presets.filter((preset) => {
      if (seenIds.has(preset.id)) return false;
      seenIds.add(preset.id);

      const signature = `${preset.name.toLowerCase()}::${preset.category.toLowerCase()}`;
      if (seenNameCategory.has(signature)) return false;
      seenNameCategory.add(signature);

      return true;
    });
  };

  if (!Array.isArray(raw)) return dedupePresets(themePresets);

  const parsed = raw
    .map((value) => normalizeThemePreset(value))
    .filter((preset): preset is ThemePreset => preset !== null);

  return parsed.length > 0 ? dedupePresets(parsed) : dedupePresets(themePresets);
};
