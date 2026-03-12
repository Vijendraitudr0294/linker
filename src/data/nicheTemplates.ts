export interface NicheTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  theme: {
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
    animationClass?: string;
    fontFamily?: string;
    animatedGradient?: string;
  };
  defaultLinks: { title: string; url: string }[];
  suggestedBio: string;
}

export const nicheTemplates: NicheTemplate[] = [
  // ─── Wellness & Creative (Minimal) ───
  {
    id: "minimal-wellness",
    name: "Pure Wellness",
    category: "Wellness",
    description: "Ultra-minimal white aesthetic for high-end wellness and meditation coaches.",
    icon: "🧘",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#f9f9f9",
      textColor: "#1a1a1a",
      buttonStyle: "pill",
      buttonBg: "#1a1a1a",
      buttonText: "#ffffff",
      fontFamily: "Outfit",
    },
    defaultLinks: [
      { title: "Meditation Guide", url: "#med" },
      { title: "Wellness Coaching", url: "#coach" },
    ],
    suggestedBio: "Dedicated to helping you find clarity and balance in a busy world.",
  },
  {
    id: "minimal-creative",
    name: "Noir Creative",
    category: "Creative",
    description: "Deep black, high-contrast layout for photographers and visual artists.",
    icon: "📸",
    theme: {
      backgroundColor: "#000000",
      cardColor: "rgba(20, 20, 20, 0.8)",
      textColor: "#ffffff",
      buttonStyle: "square",
      buttonBg: "#ffffff",
      buttonText: "#000000",
      fontFamily: "Space Grotesk",
    },
    defaultLinks: [
      { title: "Portfolio Archive", url: "#projects" },
      { title: "Equipment List", url: "#gear" },
    ],
    suggestedBio: "Capturing the essence of light through a dark lens.",
  },

  // ─── Education / Teachers (Minimal) ───
  {
    id: "minimal-edu-1",
    name: "The Scholar",
    category: "Education",
    description: "Clean academic layout with refined typography and ivory tones.",
    icon: "📚",
    theme: {
      backgroundColor: "#F8F5F2",
      cardColor: "#ffffff",
      textColor: "#1A1A1A",
      buttonStyle: "outline",
      buttonBg: "#1A1A1A",
      buttonText: "#ffffff",
      fontFamily: "Playfair Display",
    },
    defaultLinks: [
      { title: "Course Material", url: "#courses" },
      { title: "Student Portal", url: "#portal" },
    ],
    suggestedBio: "Dedicated to the pursuit of knowledge through structured simplicity.",
  },
  {
    id: "minimal-edu-2",
    name: "Modern Tutor",
    category: "Education",
    description: "A professional, minimalist layout for private tutors and educators.",
    icon: "🎓",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#ffffff",
      textColor: "#334155",
      buttonStyle: "pill",
      buttonBg: "#334155",
      buttonText: "#ffffff",
      fontFamily: "Inter",
    },
    defaultLinks: [
      { title: "Book a Session", url: "#book" },
      { title: "Subject Notes", url: "#notes" },
    ],
    suggestedBio: "Expert guidance in mathematics and physics. Helping you achieve your goals.",
  },
  {
    id: "minimal-edu-3",
    name: "Language Lab",
    category: "Education",
    description: "Minimalist grid for language instructors and polyglots.",
    icon: "🗣️",
    theme: {
      backgroundColor: "#f1f5f9",
      cardColor: "#ffffff",
      textColor: "#1e293b",
      buttonStyle: "rounded",
      buttonBg: "#475569",
      buttonText: "#ffffff",
      fontFamily: "Outfit",
    },
    defaultLinks: [
      { title: "Free Mini-Course", url: "#free" },
      { title: "Learn Spanish", url: "#spanish" },
    ],
    suggestedBio: "Mastering languages through immersion and modern methodology.",
  },

  // ─── Salon & Beauty (Minimal) ───
  {
    id: "minimal-salon-1",
    name: "Serene Salon",
    category: "Salon",
    description: "Soft, minimalist aesthetic for beauty professionals and spas.",
    icon: "✂️",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#fafafa",
      textColor: "#44403c",
      buttonStyle: "pill",
      buttonBg: "#78716c",
      buttonText: "#ffffff",
      fontFamily: "Inter",
    },
    defaultLinks: [
      { title: "Treatment Menu", url: "#menu" },
      { title: "Book Appointment", url: "#book" },
    ],
    suggestedBio: "Experience the art of beauty in a tranquil, minimalist space.",
  },
  {
    id: "minimal-beauty-2",
    name: "Glow Studio",
    category: "Beauty",
    description: "Clean, high-end look for cosmetics and skincare specialists.",
    icon: "💅",
    theme: {
      backgroundColor: "#fff7ed",
      cardColor: "#ffffff",
      textColor: "#78350f",
      buttonStyle: "outline",
      buttonBg: "#78350f",
      buttonText: "#78350f",
      fontFamily: "Playfair Display",
    },
    defaultLinks: [
      { title: "Skincare Quiz", url: "#quiz" },
      { title: "Our Products", url: "#shop" },
    ],
    suggestedBio: "Science-backed skincare. Minimalist routines. Your skin, glowing.",
  },
  {
    id: "minimal-beauty-3",
    name: "Pure Cosmetics",
    category: "Beauty",
    description: "Ultra-minimal boutique feel for high-end cosmetic brands.",
    icon: "💄",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#ffffff",
      textColor: "#262626",
      buttonStyle: "rounded",
      buttonBg: "#262626",
      buttonText: "#ffffff",
      fontFamily: "Outfit",
    },
    defaultLinks: [
      { title: "New Collection", url: "#new" },
      { title: "Makeup Masterclass", url: "#class" },
    ],
    suggestedBio: "Luxury cosmetics designed for real skin. Minimalist, effective, and ethical.",
  },

  // ─── E-commerce (Minimal) ───
  {
    id: "minimal-ecommerce-1",
    name: "Direct Boutique",
    category: "E-commerce",
    description: "Product-focused layout for high-end boutique brands.",
    icon: "🛍️",
    theme: {
      backgroundColor: "#f4f4f4",
      cardColor: "#ffffff",
      textColor: "#000000",
      buttonStyle: "rounded",
      buttonBg: "#000000",
      buttonText: "#ffffff",
      fontFamily: "Inter",
    },
    defaultLinks: [
      { title: "Shop Now", url: "#shop" },
      { title: "Latest Drop", url: "#drop" },
    ],
    suggestedBio: "Curated quality. Minimalist supply. Directly to you.",
  },
  {
    id: "minimal-ecommerce-2",
    name: "The Essentials",
    category: "E-commerce",
    description: "Grid-focused layout for home and lifestyle essentials.",
    icon: "🏠",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#fcfcfc",
      textColor: "#404040",
      buttonStyle: "pill",
      buttonBg: "#404040",
      buttonText: "#ffffff",
      fontFamily: "Outfit",
    },
    defaultLinks: [
      { title: "Home Decor", url: "#decor" },
      { title: "Kitchenware", url: "#kitchen" },
    ],
    suggestedBio: "Beautiful things for your home. Curated for the modern minimalist.",
  },

  // ─── Creator & Media (Minimal) ───
  {
    id: "minimal-creator-1",
    name: "Studio Minimal",
    category: "Creator",
    description: "A content-first layout for modern digital creators.",
    icon: "🖋️",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#ffffff",
      textColor: "#000000",
      buttonStyle: "outline",
      buttonBg: "#000000",
      buttonText: "#ffffff",
      fontFamily: "Inter",
    },
    defaultLinks: [
      { title: "View Work", url: "#work" },
      { title: "Newsletter Sub", url: "#sub" },
    ],
    suggestedBio: "Creating stories with intent and minimalist precision.",
  },
  {
    id: "minimal-creator-2",
    name: "Podcast Hub",
    category: "Creator",
    description: "Dark, moody layout optimized for podcasters and audio creators.",
    icon: "🎙️",
    theme: {
      backgroundColor: "#0a0a0a",
      cardColor: "#1a1a1a",
      textColor: "#fafafa",
      buttonStyle: "square",
      buttonBg: "#fafafa",
      buttonText: "#000000",
      fontFamily: "Space Grotesk",
    },
    defaultLinks: [
      { title: "Listen on Spotify", url: "#spotify" },
      { title: "Watch on YouTube", url: "#yt" },
    ],
    suggestedBio: "Deep dives into tech and culture. New episodes every Tuesday.",
  },
  {
    id: "minimal-creator-3",
    name: "Vlog Feed",
    category: "Creator",
    description: "Clean, video-focused layout for daily vloggers and lifestyle creators.",
    icon: "🎥",
    theme: {
      backgroundColor: "#ffffff",
      cardColor: "#f8f8f8",
      textColor: "#171717",
      buttonStyle: "pill",
      buttonBg: "#ef4444",
      buttonText: "#ffffff",
      fontFamily: "Outfit",
    },
    defaultLinks: [
      { title: "Newest Video", url: "#new" },
      { title: "Vlog Gear", url: "#gear" },
    ],
    suggestedBio: "Capturing the beauty of everyday life. Join the journey.",
  },
];

export const getTemplatesByCategoryFromTemplates = (templates: NicheTemplate[]) => {
  return templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, NicheTemplate[]>);
};

export const getTemplatesByCategory = () => getTemplatesByCategoryFromTemplates(nicheTemplates);

export const getTemplateById = (id: string) => {
  return nicheTemplates.find((t) => t.id === id);
};

const TEMPLATE_BUTTON_STYLES = new Set(["rounded", "pill", "square", "outline", "shadow"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeNicheTemplate = (value: unknown): NicheTemplate | null => {
  if (!isRecord(value)) return null;
  if (!isRecord(value.theme)) return null;

  const id = asString(value.id);
  const name = asString(value.name);
  const category = asString(value.category);
  const description = asString(value.description);
  const icon = asString(value.icon);
  const suggestedBio = asString(value.suggestedBio);

  const theme = value.theme;
  const backgroundColor = asString(theme.backgroundColor);
  const cardColor = asString(theme.cardColor);
  const textColor = asString(theme.textColor);
  const buttonStyle = asString(theme.buttonStyle);
  const buttonBg = asString(theme.buttonBg);
  const buttonText = asString(theme.buttonText);

  if (!id || !name || !category || !description || !icon || !suggestedBio || !backgroundColor || !cardColor || !textColor || !buttonStyle || !buttonBg || !buttonText) {
    return null;
  }
  if (!TEMPLATE_BUTTON_STYLES.has(buttonStyle)) return null;

  const defaultLinks = Array.isArray(value.defaultLinks)
    ? value.defaultLinks
        .map((link) => {
          if (!isRecord(link)) return null;
          const title = asString(link.title);
          const url = asString(link.url);
          return title && url ? { title, url } : null;
        })
        .filter((link): link is { title: string; url: string } => link !== null)
    : [];

  if (defaultLinks.length === 0) return null;

  return {
    id,
    name,
    category,
    description,
    icon,
    suggestedBio,
    defaultLinks,
    theme: {
      backgroundColor,
      cardColor,
      textColor,
      buttonStyle: buttonStyle as NicheTemplate["theme"]["buttonStyle"],
      buttonBg,
      buttonText,
      gradientFrom: asString(theme.gradientFrom) || undefined,
      gradientTo: asString(theme.gradientTo) || undefined,
      backgroundImage: asString(theme.backgroundImage) || undefined,
      backgroundOverlay: asString(theme.backgroundOverlay) || undefined,
      animationClass: asString(theme.animationClass) || undefined,
      fontFamily: asString(theme.fontFamily) || undefined,
      animatedGradient: asString(theme.animatedGradient) || undefined,
    },
  };
};

export const getNicheTemplatesFromSettings = (settings: unknown): NicheTemplate[] => {
  const raw = (settings as Record<string, unknown> | null)?.niche_templates;
  if (!Array.isArray(raw)) return nicheTemplates;

  const parsed = raw
    .map((value) => normalizeNicheTemplate(value))
    .filter((template): template is NicheTemplate => template !== null);

  return parsed.length > 0 ? parsed : nicheTemplates;
};

