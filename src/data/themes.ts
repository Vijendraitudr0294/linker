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
  { id: "modern", label: "Modern", icon: "MO" },
  { id: "professional", label: "Pro", icon: "PR" },
  { id: "genz", label: "Gen Z", icon: "GZ" },
  { id: "dark", label: "Dark", icon: "DK" },
  { id: "neon", label: "Neon", icon: "NE" },
  { id: "animated", label: "Animated", icon: "AN" },
];

// Premium curated theme set — Modern / Professional / Gen-Z / Dark / Neon / Animated
export const themePresets: ThemePreset[] = [

  // ─── MODERN ───────────────────────────────────────────────────────────────
  {
    id: "obsidian-aura",
    name: "Obsidian Aura",
    category: "modern",
    isPopular: true,
    backgroundStyle: "matte-dark",
    animationPreset: "floating-motion",
    cardStyle: "glass-premium",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#0a0a0f",
    cardColor: "rgba(255,255,255,0.06)",
    textColor: "#f1f5f9",
    buttonStyle: "pill",
    buttonBg: "#6366f1",
    buttonText: "#ffffff",
    gradientFrom: "#1e1b4b",
    gradientTo: "#0a0a0f",
    animationClass: "fx-obsidian-aura",
    fontFamily: "Inter",
  },
  {
    id: "frosted-ivory",
    name: "Frosted Ivory",
    category: "modern",
    isPopular: true,
    backgroundStyle: "soft-blur",
    animationPreset: "fade-in",
    cardStyle: "glass",
    fontPair: "Plus Jakarta Sans",
    motionEngine: "CSS",
    backgroundColor: "#f0f2f5",
    cardColor: "rgba(255,255,255,0.75)",
    textColor: "#0f172a",
    buttonStyle: "rounded",
    buttonBg: "#0f172a",
    buttonText: "#ffffff",
    fontFamily: "Plus Jakarta Sans",
    animationClass: "fx-frosted-blur",
  },
  {
    id: "slate-editorial",
    name: "Slate Editorial",
    category: "modern",
    backgroundStyle: "matte-dark",
    animationPreset: "slide-up",
    cardStyle: "classic",
    fontPair: "Space Grotesk",
    motionEngine: "CSS",
    backgroundColor: "#1a1f2e",
    cardColor: "rgba(30,36,54,0.9)",
    textColor: "#e2e8f0",
    buttonStyle: "outline",
    buttonBg: "#38bdf8",
    buttonText: "#38bdf8",
    fontFamily: "Space Grotesk",
  },
  {
    id: "soft-clay",
    name: "Soft Clay",
    category: "modern",
    backgroundStyle: "warm-gradient",
    animationPreset: "hover-scale",
    cardStyle: "glass",
    fontPair: "DM Sans",
    motionEngine: "CSS",
    backgroundColor: "#f5ede6",
    cardColor: "rgba(255,255,255,0.72)",
    textColor: "#2d1f14",
    buttonStyle: "pill",
    buttonBg: "#c2410c",
    buttonText: "#fff7ed",
    gradientFrom: "#f5ede6",
    gradientTo: "#f3d5c0",
    fontFamily: "DM Sans",
  },
  {
    id: "liquid-midnight",
    name: "Liquid Midnight",
    category: "modern",
    isPopular: true,
    backgroundStyle: "liquid-gradient",
    animationPreset: "floating-motion",
    cardStyle: "glass-premium",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#0d1117",
    cardColor: "rgba(22,27,44,0.72)",
    textColor: "#e2e8f0",
    buttonStyle: "pill",
    buttonBg: "#7c3aed",
    buttonText: "#ffffff",
    gradientFrom: "#4f46e5",
    gradientTo: "#0d1117",
    animationClass: "fx-liquid-gradient",
    fontFamily: "Outfit",
  },

  // ─── PROFESSIONAL ─────────────────────────────────────────────────────────
  {
    id: "executive-black",
    name: "Executive Black",
    category: "professional",
    isPopular: true,
    backgroundStyle: "matte-dark",
    animationPreset: "slide-up",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#09090b",
    cardColor: "rgba(24,24,27,0.98)",
    textColor: "#fafafa",
    buttonStyle: "rounded",
    buttonBg: "#ffffff",
    buttonText: "#09090b",
    fontFamily: "Inter",
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    category: "professional",
    isPopular: true,
    backgroundStyle: "solid-deep",
    animationPreset: "fade-in",
    cardStyle: "glass",
    fontPair: "Plus Jakarta Sans",
    motionEngine: "CSS",
    backgroundColor: "#0f2044",
    cardColor: "rgba(255,255,255,0.10)",
    textColor: "#e8f0fe",
    buttonStyle: "pill",
    buttonBg: "#2563eb",
    buttonText: "#ffffff",
    fontFamily: "Plus Jakarta Sans",
  },
  {
    id: "studio-carbon",
    name: "Studio Carbon",
    category: "professional",
    backgroundStyle: "matte-dark",
    animationPreset: "slide-up",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#09090b",
    cardColor: "rgba(24,24,27,0.9)",
    textColor: "#f4f4f5",
    buttonStyle: "rounded",
    buttonBg: "#f97316",
    buttonText: "#1c1917",
    fontFamily: "Inter",
  },
  {
    id: "crisp-linen",
    name: "Crisp Linen",
    category: "professional",
    backgroundStyle: "flat-minimal",
    animationPreset: "fade-in",
    cardStyle: "classic",
    fontPair: "DM Sans",
    motionEngine: "CSS",
    backgroundColor: "#faf9f7",
    cardColor: "#ffffff",
    textColor: "#1c1917",
    buttonStyle: "rounded",
    buttonBg: "#1c1917",
    buttonText: "#faf9f7",
    fontFamily: "DM Sans",
  },
  {
    id: "sage-consulting",
    name: "Sage Consulting",
    category: "professional",
    backgroundStyle: "warm-gradient",
    animationPreset: "slide-up",
    cardStyle: "glass",
    fontPair: "Space Grotesk",
    motionEngine: "CSS",
    backgroundColor: "#1a2e1f",
    cardColor: "rgba(255,255,255,0.09)",
    textColor: "#d1fae5",
    buttonStyle: "pill",
    buttonBg: "#10b981",
    buttonText: "#022c22",
    gradientFrom: "#1a2e1f",
    gradientTo: "#0d1f12",
    fontFamily: "Space Grotesk",
  },
  {
    id: "urban-lens",
    name: "Urban Lens",
    category: "professional",
    backgroundStyle: "photo-editorial",
    animationPreset: "slide-up",
    cardStyle: "glass",
    motionEngine: "Framer Motion",
    backgroundColor: "#101827",
    cardColor: "rgba(17,24,39,0.68)",
    textColor: "#f8fafc",
    buttonStyle: "rounded",
    buttonBg: "#facc15",
    buttonText: "#111827",
    backgroundImage: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1200&q=80",
    backgroundOverlay: "rgba(10,15,27,0.55)",
    fontFamily: "Inter",
  },

  // ─── GEN Z ────────────────────────────────────────────────────────────────
  {
    id: "brat-green",
    name: "Brat Green",
    category: "genz",
    isPopular: true,
    backgroundStyle: "solid-bright",
    animationPreset: "hover-scale",
    cardStyle: "classic",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#8ace00",
    cardColor: "rgba(0,0,0,0.08)",
    textColor: "#000000",
    buttonStyle: "square",
    buttonBg: "#000000",
    buttonText: "#8ace00",
    fontFamily: "Outfit",
  },
  {
    id: "y2k-chrome",
    name: "Y2K Chrome",
    category: "genz",
    isPopular: true,
    backgroundStyle: "liquid-gradient",
    animationPreset: "floating-motion",
    cardStyle: "glass-premium",
    fontPair: "Sora",
    motionEngine: "CSS",
    backgroundColor: "#c8c8e8",
    cardColor: "rgba(255,255,255,0.55)",
    textColor: "#1a1a2e",
    buttonStyle: "pill",
    buttonBg: "#6600cc",
    buttonText: "#ffffff",
    gradientFrom: "#e0c3fc",
    gradientTo: "#8ec5fc",
    animationClass: "fx-liquid-gradient",
    fontFamily: "Sora",
  },
  {
    id: "retro-sunset",
    name: "Retro Sunset",
    category: "genz",
    backgroundStyle: "warm-gradient",
    animationPreset: "hover-scale",
    cardStyle: "glass",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#ff6b35",
    cardColor: "rgba(255,255,255,0.2)",
    textColor: "#fff8f0",
    buttonStyle: "pill",
    buttonBg: "#1a1a2e",
    buttonText: "#ff6b35",
    gradientFrom: "#ff6b35",
    gradientTo: "#f7c59f",
    fontFamily: "Outfit",
  },
  {
    id: "tiktok-dark",
    name: "TikTok Dark",
    category: "genz",
    isPopular: true,
    backgroundStyle: "matte-dark",
    animationPreset: "pulse-glow",
    cardStyle: "glass-premium",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#010101",
    cardColor: "rgba(255,255,255,0.05)",
    textColor: "#ffffff",
    buttonStyle: "pill",
    buttonBg: "#fe2c55",
    buttonText: "#ffffff",
    animationClass: "fx-elite-glow",
    fontFamily: "Outfit",
  },
  {
    id: "aurora-pop",
    name: "Aurora Pop",
    category: "genz",
    backgroundStyle: "aurora-soft",
    animationPreset: "fade-in",
    cardStyle: "glass-premium",
    fontPair: "Sora",
    motionEngine: "CSS",
    backgroundColor: "#0d0521",
    cardColor: "rgba(255,255,255,0.07)",
    textColor: "#f0e6ff",
    buttonStyle: "pill",
    buttonBg: "#b455f5",
    buttonText: "#ffffff",
    gradientFrom: "#6d28d9",
    gradientTo: "#ec4899",
    animationClass: "animate-aurora",
    fontFamily: "Sora",
  },

  // ─── DARK ─────────────────────────────────────────────────────────────────
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
    cardColor: "rgba(12,18,31,0.86)",
    textColor: "#f3f4f6",
    buttonStyle: "outline",
    buttonBg: "#e5e7eb",
    buttonText: "#e5e7eb",
    animationClass: "fx-midnight-grid",
    fontFamily: "Inter",
  },
  {
    id: "nordic-night",
    name: "Nordic Night",
    category: "dark",
    isPopular: true,
    backgroundStyle: "night-sky",
    animationPreset: "parallax-effect",
    cardStyle: "glass-premium",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#0d1117",
    cardColor: "rgba(22,27,34,0.75)",
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
    category: "dark",
    isPopular: true,
    backgroundStyle: "night-sky",
    animationPreset: "parallax-effect",
    cardStyle: "glass",
    fontPair: "Inter",
    motionEngine: "Three.js",
    backgroundColor: "#10263c",
    cardColor: "rgba(18,31,52,0.62)",
    textColor: "#eaf3ff",
    buttonStyle: "rounded",
    buttonBg: "#cc554d",
    buttonText: "#fff7f6",
    backgroundImage: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1200&q=80",
    backgroundOverlay: "rgba(9,18,35,0.42)",
    animationClass: "fx-constellation-3d",
    fontFamily: "Inter",
  },

  // ─── NEON ─────────────────────────────────────────────────────────────────
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
    cardColor: "rgba(10,18,32,0.72)",
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
    id: "cyber-violet",
    name: "Cyber Violet",
    category: "neon",
    isPopular: true,
    backgroundStyle: "neon-grid",
    animationPreset: "pulse-glow",
    cardStyle: "neon",
    fontPair: "Sora",
    motionEngine: "CSS",
    backgroundColor: "#080010",
    cardColor: "rgba(138,43,226,0.10)",
    textColor: "#ede9fe",
    buttonStyle: "shadow",
    buttonBg: "#a855f7",
    buttonText: "#ffffff",
    gradientFrom: "#4c1d95",
    gradientTo: "#a855f7",
    animationClass: "fx-elite-glow",
    fontFamily: "Sora",
  },
  {
    id: "neon-coral",
    name: "Neon Coral",
    category: "neon",
    backgroundStyle: "liquid-gradient",
    animationPreset: "floating-motion",
    cardStyle: "glass",
    fontPair: "Outfit",
    motionEngine: "CSS",
    backgroundColor: "#0c0c14",
    cardColor: "rgba(255,255,255,0.06)",
    textColor: "#fff1f2",
    buttonStyle: "pill",
    buttonBg: "#ff4d6d",
    buttonText: "#ffffff",
    gradientFrom: "#c9184a",
    gradientTo: "#ff4d6d",
    animationClass: "fx-liquid-gradient",
    fontFamily: "Outfit",
  },

  // ─── ANIMATED ─────────────────────────────────────────────────────────────
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
    cardColor: "rgba(255,255,255,0.16)",
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
    id: "aurora-ink",
    name: "Aurora Ink",
    category: "animated",
    isPopular: true,
    backgroundStyle: "aurora-soft",
    animationPreset: "fade-in",
    cardStyle: "glass-premium",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#070e1f",
    cardColor: "rgba(15,23,42,0.74)",
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
    id: "pop-cobalt",
    name: "Pop Cobalt",
    category: "animated",
    isPopular: true,
    backgroundStyle: "playful-blobs",
    animationPreset: "hover-scale",
    cardStyle: "classic",
    fontPair: "Inter",
    motionEngine: "CSS",
    backgroundColor: "#2f67de",
    cardColor: "rgba(255,255,255,0.9)",
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
    id: "biotra-royale",
    name: "Biotra Royale",
    category: "modern",
    isPopular: true,
    backgroundStyle: "matte-dark",
    animationPreset: "floating-motion",
    cardStyle: "glass-premium",
    fontPair: "Outfit",
    motionEngine: "Framer Motion",
    backgroundColor: "#050505",
    cardColor: "rgba(255, 255, 255, 0.05)",
    textColor: "#ffffff",
    buttonStyle: "pill",
    buttonBg: "#f59e0b",
    buttonText: "#000000",
    gradientFrom: "#111827",
    gradientTo: "#050505",
    animationClass: "fx-elite-glow",
    fontFamily: "Outfit",
  },
  {
    id: "liquid-chrome",
    name: "Liquid Chrome",
    category: "modern",
    isPopular: true,
    backgroundStyle: "liquid-gradient",
    animationPreset: "floating-motion",
    cardStyle: "glass-premium",
    fontPair: "Plus Jakarta Sans",
    motionEngine: "CSS",
    backgroundColor: "#f8fafc",
    cardColor: "rgba(255, 255, 255, 0.8)",
    textColor: "#0f172a",
    buttonStyle: "pill",
    buttonBg: "#0f172a",
    buttonText: "#ffffff",
    gradientFrom: "#e2e8f0",
    gradientTo: "#f8fafc",
    animationClass: "fx-liquid-gradient",
    fontFamily: "Plus Jakarta Sans",
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
