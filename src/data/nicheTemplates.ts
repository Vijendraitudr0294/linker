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
    heroImage?: string;
    layoutMode?: "list" | "grid" | "bento" | "timeline";
    cardStyle?: "classic" | "glass" | "glass-premium" | "neon";
  };
  defaultLinks: { title: string; url: string; icon?: string }[];
  suggestedBio: string;
}

export const nicheTemplates: NicheTemplate[] = [
  // ─── 01: Minimal Creator ───
  {
    id: "minimal-creator",
    name: "Pure Minimalist",
    category: "minimal creator",
    description: "Serene, airy design focusing purely on content.",
    icon: "🧘",
    theme: {
      backgroundColor: "#F8FAFC",
      cardColor: "rgba(255, 255, 255, 0.8)",
      textColor: "#475569",
      buttonStyle: "pill",
      buttonBg: "#94A3B8",
      buttonText: "#FFFFFF",
      fontFamily: "Outfit",
      layoutMode: "list",
      cardStyle: "glass",
    },
    defaultLinks: [
      { title: "My Portfolio", url: "#" },
      { title: "Weekly Journal", url: "#" },
      { title: "Work With Me", url: "#" },
    ],
    suggestedBio: "Curating intentional moments through design and thought.",
  },

  // ─── 02: Dark Theme Creator ───
  {
    id: "dark-stealth",
    name: "Stealth Mode",
    category: "dark theme creator",
    description: "Ultra-dark, premium aesthetic with subtle highlights.",
    icon: "🌑",
    theme: {
      backgroundColor: "#09090B",
      cardColor: "rgba(24, 24, 27, 0.6)",
      textColor: "#FAFAFA",
      buttonStyle: "rounded",
      buttonBg: "#3F3F46",
      buttonText: "#FFFFFF",
      fontFamily: "Inter",
      layoutMode: "list",
      cardStyle: "glass-premium",
    },
    defaultLinks: [
      { title: "Private Community", url: "#" },
      { title: "Consulting", url: "#" },
      { title: "Latest Drop", url: "#" },
    ],
    suggestedBio: "Building in silence. Moving with purpose.",
  },

  // ─── 03: Gradient Influencer ───
  {
    id: "gradient-vibe",
    name: "Sunset Glow",
    category: "gradient influencer page",
    description: "Vibrant mesh gradients for high-energy creators.",
    icon: "🌈",
    theme: {
      backgroundColor: "#FDF2F8",
      cardColor: "rgba(255, 255, 255, 0.3)",
      textColor: "#831843",
      buttonStyle: "pill",
      buttonBg: "#DB2777",
      buttonText: "#FFFFFF",
      fontFamily: "Outfit",
      animatedGradient: "linear-gradient(135deg, #F9A8D4, #FBCFE8, #FDA4AF)",
      layoutMode: "list",
      cardStyle: "glass",
    },
    defaultLinks: [
      { title: "Shop My Closet", url: "#" },
      { title: "Daily Vlogs", url: "#" },
      { title: "Brand Deals", url: "#" },
    ],
    suggestedBio: "Living life in full color. Sharing my journey daily. ✨",
  },

  // ─── 04: Bento Grid Portfolio ───
  {
    id: "bento-pro",
    name: "Architect Bento",
    category: "bento grid portfolio",
    description: "Modern asymmetrical grid for creative portfolios.",
    icon: "🍱",
    theme: {
      backgroundColor: "#18181B",
      cardColor: "rgba(39, 39, 42, 0.8)",
      textColor: "#F4F4F5",
      buttonStyle: "square",
      buttonBg: "#FFFFFF",
      buttonText: "#000000",
      fontFamily: "Space Grotesk",
      layoutMode: "bento",
      cardStyle: "glass-premium",
    },
    defaultLinks: [
      { title: "Selected Works", url: "#", icon: "video" },
      { title: "Architecture Case Study", url: "#", icon: "article" },
      { title: "Consulting Call", url: "#" },
    ],
    suggestedBio: "Designing structures that stand the test of time.",
  },

  // ─── 05: Creator Storefront ───
  {
    id: "shop-premium",
    name: "The Boutique",
    category: "creator storefront",
    description: "Refined aesthetic for physical products and lifestyle brands.",
    icon: "🛍️",
    theme: {
      backgroundColor: "#FAF7F2",
      cardColor: "rgba(255, 255, 255, 0.9)",
      textColor: "#45372E",
      buttonStyle: "pill",
      buttonBg: "#45372E",
      buttonText: "#FFFFFF",
      fontFamily: "Playfair Display",
      layoutMode: "grid",
      cardStyle: "classic",
    },
    defaultLinks: [
      { title: "New Arrivals", url: "#" },
      { title: "Summer Collection", url: "#" },
      { title: "Our Story", url: "#" },
    ],
    suggestedBio: "Handcrafted ceramics for intentional homes.",
  },

  // ─── 06: Course Creator ───
  {
    id: "edu-master",
    name: "Academy Glow",
    category: "course creator page",
    description: "High-trust layout for educators and masterclaims.",
    icon: "🎓",
    theme: {
      backgroundColor: "#F0F9FF",
      cardColor: "rgba(255, 255, 255, 0.95)",
      textColor: "#0369A1",
      buttonStyle: "rounded",
      buttonBg: "#0EA5E9",
      buttonText: "#FFFFFF",
      fontFamily: "Plus Jakarta Sans",
      layoutMode: "list",
      cardStyle: "glass",
    },
    defaultLinks: [
      { title: "Masterclass Sign Up", url: "#" },
      { title: "Free Mini-Course", url: "#" },
      { title: "Student Success Stories", url: "#" },
    ],
    suggestedBio: "Teaching 10k+ designers how to master their craft.",
  },

  // ─── 07: Music Artist Page ───
  {
    id: "music-neon",
    name: "Studio Night",
    category: "music artist page",
    description: "Vibrant neon dark mode for musicians and producers.",
    icon: "🎵",
    theme: {
      backgroundColor: "#000000",
      cardColor: "rgba(20, 20, 20, 0.9)",
      textColor: "#A855F7",
      buttonStyle: "shadow",
      buttonBg: "#9333EA",
      buttonText: "#FFFFFF",
      fontFamily: "Inter",
      layoutMode: "grid",
      cardStyle: "neon",
    },
    defaultLinks: [
      { title: "Listen on Spotify", url: "#", icon: "spotify" },
      { title: "Tour Dates", url: "#" },
      { title: "New Single: Midnight", url: "#" },
    ],
    suggestedBio: "Electronic soul from the heart of London.",
  },

  // ─── 08: Video Creator Page ───
  {
    id: "video-vanguard",
    name: "Director's Cut",
    category: "video creator page",
    description: "Cinematic layout for YouTubers and filmmakers.",
    icon: "🎬",
    theme: {
      backgroundColor: "#0F172A",
      cardColor: "rgba(15, 23, 42, 0.8)",
      textColor: "#F1F5F9",
      buttonStyle: "rounded",
      buttonBg: "#EF4444",
      buttonText: "#FFFFFF",
      fontFamily: "Plus Jakarta Sans",
      layoutMode: "bento",
      cardStyle: "glass-premium",
    },
    defaultLinks: [
      { title: "Watch Latest Video", url: "#", icon: "video" },
      { title: "Filmmaking Course", url: "#" },
      { title: "My Gear Setup", url: "#" },
    ],
    suggestedBio: "Capturing stories through a 35mm lens.",
  },

  // ─── 09: Photography Portfolio ───
  {
    id: "photo-essence",
    name: "The Gallery",
    category: "photography portfolio",
    description: "Clean, frame-focused design for visual storytellers.",
    icon: "📸",
    theme: {
      backgroundColor: "#FFFFFF",
      cardColor: "rgba(255, 255, 255, 0.9)",
      textColor: "#171717",
      buttonStyle: "square",
      buttonBg: "#171717",
      buttonText: "#FFFFFF",
      fontFamily: "Playfair Display",
      layoutMode: "grid",
      cardStyle: "classic",
    },
    defaultLinks: [
      { title: "Fine Art Prints", url: "#" },
      { title: "Portfolio 2024", url: "#" },
      { title: "Book a Shoot", url: "#" },
    ],
    suggestedBio: "Moment-based photography for modern brands.",
  },

  // ─── 10: Podcast Page ───
  {
    id: "podcast-flow",
    name: "The Mic",
    category: "podcast page",
    description: "Bold, audio-centric design for podcasters.",
    icon: "🎙️",
    theme: {
      backgroundColor: "#4C1D95",
      cardColor: "rgba(76, 29, 149, 0.7)",
      textColor: "#F5F3FF",
      buttonStyle: "pill",
      buttonBg: "#C084FC",
      buttonText: "#2E1065",
      fontFamily: "Plus Jakarta Sans",
      layoutMode: "list",
      cardStyle: "glass",
    },
    defaultLinks: [
      { title: "Listen on Apple Podcasts", url: "#" },
      { title: "Latest Episode", url: "#" },
      { title: "Join the Patron Group", url: "#" },
    ],
    suggestedBio: "Deep dive conversations into the future of tech.",
  },

  ...[
    { id: "travel-nomad-2", name: "Atlas Wander", cat: "Travel", icon: "✈️", bg: "#ECFDF5", btn: "#059669", font: "Outfit", layout: "list" },
    { id: "skin-care-pro", name: "Glow Skin", cat: "Beauty", icon: "✨", bg: "#FFF7ED", btn: "#EA580C", font: "Plus Jakarta Sans", layout: "grid" },
    { id: "real-estate-lux-pro", name: "Estate Prime", cat: "Business", icon: "🏰", bg: "#0F172A", btn: "#94A3B8", font: "Inter", layout: "bento" },
    { id: "lawyer-trust-pro", name: "Justice Ally", cat: "Business", icon: "⚖️", bg: "#1E293B", btn: "#334155", font: "Inter", layout: "list" },
    { id: "doctor-care-pro", name: "Wellness MD", cat: "Medical", icon: "🏥", bg: "#F0F9FF", btn: "#0284C7", font: "Plus Jakarta Sans", layout: "list" },
    { id: "pet-world-pro", name: "Paw Prints", cat: "Lifestyle", icon: "🐾", bg: "#FEF2F2", btn: "#EF4444", font: "Outfit", layout: "grid" },
    { id: "gaming-pink-pro", name: "Sakura Stream", cat: "Gaming", icon: "🌸", bg: "#FDF2F8", btn: "#DB2777", font: "Sora", layout: "bento" },
    { id: "dev-terminal-pro", name: "Root Shell", cat: "Tech", icon: "💻", bg: "#000000", btn: "#10B981", font: "Fira Code", layout: "list" },
    { id: "art-canvas-pro", name: "Oil & Ink", cat: "Creative", icon: "🎨", bg: "#F5F5F4", btn: "#44403C", font: "Playfair Display", layout: "grid", card: "glass-premium" },
    { id: "yoga-flow-pro", name: "Zen Path", cat: "Wellness", icon: "🕯️", bg: "#F0FDF4", btn: "#166534", font: "Outfit", layout: "list" },
    { id: "wedding-pro-2", name: "Ethereal Love", cat: "Photography", icon: "💍", bg: "#FAFAF9", btn: "#A8A29E", font: "Playfair Display", layout: "list" },
    { id: "finance-wise-pro", name: "Capital Mind", cat: "Business", icon: "📈", bg: "#064E3B", btn: "#10B981", font: "Inter", layout: "list" },
    { id: "vintage-soul-pro", name: "Retro Vibe", cat: "Lifestyle", icon: "📻", bg: "#78350F", btn: "#F59E0B", font: "Sora", layout: "grid" },
    { id: "garden-grow-pro", name: "Bloom Hub", cat: "Lifestyle", icon: "🌻", bg: "#F7FEE7", btn: "#65A30D", font: "Outfit", layout: "list" },
    { id: "tattoo-ink-pro", name: "Black Ink", cat: "Creative", icon: "🖋️", bg: "#09090B", btn: "#FAFAFA", font: "Space Grotesk", layout: "bento", card: "neon" },
    { id: "coffee-bar-pro", name: "Espresso Co.", cat: "Food", icon: "☕", bg: "#451A03", btn: "#D97706", font: "Sora", layout: "grid" },
    { id: "author-pen-pro", name: "Paper & Pen", cat: "Creative", icon: "📖", bg: "#FDFCFB", btn: "#5B21B6", font: "Playfair Display", layout: "list" },
    { id: "model-book-pro", name: "Portrait", cat: "Fashion", icon: "📸", bg: "white", btn: "black", font: "Urbanist", layout: "grid", card: "glass-premium" },
    { id: "interior-lux-pro", name: "Space Design", cat: "Freelance", icon: "🏢", bg: "#F8F8F8", btn: "#222", font: "Inter", layout: "bento", card: "glass-premium" },
    { id: "barber-shop-pro", name: "Razor Cut", cat: "Beauty", icon: "💈", bg: "#111", btn: "white", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "auto-prime-pro", name: "Drive Max", cat: "Automotive", icon: "🏎️", bg: "black", btn: "#3B82F6", font: "Inter", layout: "list", card: "neon" },
    { id: "charity-hope-pro", name: "Pure Give", cat: "Non-Profit", icon: "🤝", bg: "#F0FDF4", btn: "#16A34A", font: "Outfit", layout: "list" },
    { id: "dj-pulse-pro", name: "Beat Drop", cat: "Music", icon: "👽", bg: "black", btn: "#9333EA", font: "Inter", layout: "grid", card: "neon" },
    { id: "arch-struct-pro", name: "Lines", cat: "Creative", icon: "📐", bg: "#18181B", btn: "white", font: "Space Grotesk", layout: "bento", card: "glass-premium" },
    { id: "lifestyle-gold-pro", name: "Lux Life", cat: "Influencer", icon: "💎", bg: "#FEFCE8", btn: "#854D0E", font: "Playfair Display", layout: "list", card: "glass-premium" },
    { id: "app-showcase-pro", name: "App Hub", cat: "Tech", icon: "📱", bg: "#F9FAFB", btn: "#111827", font: "Plus Jakarta Sans", layout: "grid" },
    { id: "va-expert-pro", name: "Virtual Aid", cat: "Business", icon: "🗓️", bg: "#FDFCFB", btn: "#7C3AED", font: "Outfit", layout: "list" },
    { id: "esports-pro-pro", name: "Frag Log", cat: "Gaming", icon: "🎯", bg: "black", btn: "#EF4444", font: "Inter", layout: "bento", card: "neon" },
    { id: "coach-mind-pro", name: "Peak Mind", cat: "Wellness", icon: "🧠", bg: "#F0F9FF", btn: "#0EA5E9", font: "Outfit", layout: "list" },
    { id: "event-pro-pro", name: "Occasions", cat: "Business", icon: "🎈", bg: "#FDF2F8", btn: "#DB2777", font: "Urbanist", layout: "grid" },
    { id: "dentist-smile-pro", name: "Pure White", cat: "Medical", icon: "🦷", bg: "#F8FAFC", btn: "#0284C7", font: "Inter", layout: "list" },
    { id: "crypto-mint-pro", name: "Solana Vibe", cat: "Web3", icon: "☀️", bg: "#020617", btn: "#A855F7", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "fashion-retail-pro", name: "The Shop", cat: "Fashion", icon: "👘", bg: "white", btn: "black", font: "Inter", layout: "bento", card: "glass-premium" },
    { id: "music-studio-pro", name: "The Mix", cat: "Music", icon: "🎹", bg: "#111", btn: "#EC4899", font: "Sora", layout: "list" },
    { id: "photographer-mod-pro", name: "Capture", cat: "Photography", icon: "🎞️", bg: "#F5F5F5", btn: "#222", font: "Playfair Display", layout: "grid" },
    // ─── Phase 3 Expanding templates ───
    { id: "streamer-pro-x", name: "Twitch Hub", cat: "Gaming", icon: "👾", bg: "#000", btn: "#9146FF", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "news-letter-pro", name: "Substack core", cat: "Creator", icon: "📰", bg: "#FFF4E6", btn: "#FF671F", font: "Playfair Display", layout: "list" },
    { id: "podcast-mic-pro", name: "The Audio Log", cat: "Music", icon: "🎙️", bg: "#1E1B4B", btn: "#F43F5E", font: "Outfit", layout: "list" },
    { id: "startup-founders-x", name: "Pitch Elite", cat: "Business", icon: "💡", bg: "#F1F5F9", btn: "#2563EB", font: "Inter", layout: "bento", card: "glass-premium" },
    { id: "consultant-pro-y", name: "Global Adviser", cat: "Freelance", icon: "🤝", bg: "#FAF7F2", btn: "#78350F", font: "Sora", layout: "list" },
    { id: "affiliate-hub-pro", name: "Drop Matrix", cat: "Creator", icon: "🔗", bg: "#111827", btn: "#10B981", font: "Inter", layout: "grid", card: "neon" },
    { id: "jewelry-lux-pro", name: "Gold Standard", cat: "Luxury", icon: "👑", bg: "#0A0A0A", btn: "#EAB308", font: "Playfair Display", layout: "bento", card: "glass-premium" },
    { id: "dev-portfolio-x", name: "Code Block", cat: "Tech", icon: "👨‍💻", bg: "#020617", btn: "#22C55E", font: "monospace", layout: "list", card: "neon" },
    { id: "design-portfolio-y", name: "Mock Frames", cat: "Creative", icon: "🖼️", bg: "#FFFFFF", btn: "#111", font: "Outfit", layout: "grid", card: "glass-premium" },
    { id: "marketing-growth-y", name: "Scale Sync", cat: "Marketing", icon: "📊", bg: "#F8FAFC", btn: "#7C3AED", font: "Urbanist", layout: "list" },
    { id: "writer-elite", name: "Ink Page", cat: "Creative", icon: "🖋️", bg: "#FDFCFB", btn: "#333", font: "Outfit", layout: "list" },
    { id: "founder-classic", name: "Legacy Hub", cat: "Business", icon: "🏛️", bg: "#F8FAFC", btn: "#1E293B", font: "Inter", layout: "list" },
    { id: "vlogger-city", name: "Metro View", cat: "Creator", icon: "🏙️", bg: "#0F172A", btn: "#EF4444", font: "Plus Jakarta Sans", layout: "list" },
    { id: "chef-modern", name: "Bistro Flow", cat: "Food", icon: "🍳", bg: "#FEF2F2", btn: "#B91C1C", font: "Sora", layout: "list" },
    { id: "fitness-coach-v2", name: "Core Peak", cat: "Wellness", icon: "⚡", bg: "#000", btn: "#FACC15", font: "Space Grotesk", layout: "grid" },
    // ─── Additional Pro Expansion ───
    { id: "beauty-spa-v1", name: "Glow Parlor", cat: "Beauty", icon: "🧴", bg: "#FFF1F2", btn: "#E11D48", font: "Outfit", layout: "grid", card: "glass-premium" },
    { id: "realestate-prop", name: "Urban Dwelling", cat: "Business", icon: "🏡", bg: "#F8FAFC", btn: "#020617", font: "Inter", layout: "bento", card: "glass-premium" },
    { id: "travel-blogger-x", name: "Wanderlust", cat: "Travel", icon: "🧭", bg: "#F0FDFA", btn: "#0D9488", font: "Outfit", layout: "list" },
    { id: "crypto-elite-trade", name: "Web3 Nodes", cat: "Web3", icon: "💎", bg: "#0B0F19", btn: "#2563EB", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "artist-palette-y", name: "Studio Ink", cat: "Creative", icon: "🖌️", bg: "#FAF8F5", btn: "#D97706", font: "Playfair Display", layout: "grid" },
    { id: "saas-launch-elite", name: "Software Hub", cat: "Tech", icon: "🚀", bg: "#F9FAFB", btn: "#222", font: "Plus Jakarta Sans", layout: "bento", card: "glass-premium" },
    { id: "therapy-wellness-h", name: "Heal Space", cat: "Wellness", icon: "🍃", bg: "#F4F7F5", btn: "#2E5B42", font: "Outfit", layout: "list" },
    { id: "dance-studio-vibe", name: "Rhythm Lab", cat: "Creative", icon: "💃", bg: "#000", btn: "#E11D48", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "restaurant-pro-z", name: "Fine Dine", cat: "Food", icon: "🍷", bg: "#111", btn: "#9F1239", font: "Playfair Display", layout: "bento", card: "glass-premium" },
    // ─── Final 100 Bulk Extension ───
    { id: "fashion-street-pro", name: "Street Drop", cat: "Fashion", icon: "👟", bg: "#0F172A", btn: "#38BDF8", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "pet-grooming-love", name: "Paws & Co.", cat: "Pets", icon: "🐈", bg: "#FEF9C3", btn: "#CA8A04", font: "Outfit", layout: "list" },
    { id: "tutor-online-edu", name: "Class Point", cat: "Education", icon: "✏️", bg: "#EFF6FF", btn: "#2563EB", font: "Plus Jakarta Sans", layout: "list" },
    { id: "lawyer-legal-elite", name: "Counsel Pro", cat: "Business", icon: "⚖️", bg: "#1E1B4B", btn: "#EAB308", font: "Playfair Display", layout: "list", card: "glass-premium" },
    { id: "physio-rehab-wellness", name: "Move Free", cat: "Medical", icon: "🏃", bg: "#F0FDF4", btn: "#15803D", font: "Inter", layout: "grid" },
    { id: "charity-cause-pro", name: "Earth Save", cat: "Non-Profit", icon: "🌱", bg: "#F0FDF4", btn: "#16A34A", font: "Outfit", layout: "list" },
    { id: "video-editor-pro", name: "Timeline", cat: "Freelance", icon: "🎬", bg: "#0B0F19", btn: "#F43F5E", font: "Plus Jakarta Sans", layout: "bento", card: "glass-premium" },
    { id: "copywriter-elite-ink", name: "Word Craft", cat: "Creative", icon: "✍️", bg: "#FCFBF4", btn: "#1C1917", font: "Playfair Display", layout: "list" },
    { id: "jazz-lounge-music", name: "Smooth Note", cat: "Music", icon: "🎷", bg: "#1C1917", btn: "#D97706", font: "Sora", layout: "grid", card: "glass-premium" },
    { id: "crypto-safety-h", name: "Safe Ledger", cat: "Web3", icon: "🔒", bg: "#020617", btn: "#6366F1", font: "Space Grotesk", layout: "list", card: "neon" },
    { id: "eco-store-vibe", name: "Green Drop", cat: "Lifestyle", icon: "♻️", bg: "#F7FEE7", btn: "#4D7C0F", font: "Outfit", layout: "grid" },
    { id: "timeline-journey-pro", name: "Roadmap Log", cat: "Creator", icon: "🗓️", bg: "#09090B", btn: "#38BDF8", font: "Space Grotesk", layout: "timeline", card: "glass-premium" },
    // ─── Absolute Cap 100 Expansion ───
    { id: "discord-hub-vibe", name: "Guild Board", cat: "Gaming", icon: "🎮", bg: "#0A0515", btn: "#5865F2", font: "Space Grotesk", layout: "grid", card: "neon" },
    { id: "event-planner-x2", name: "Party Host", cat: "Business", icon: "🎈", bg: "#FFF1F2", btn: "#F43F5E", font: "Outfit", layout: "list" },
    { id: "news-letter-elite", name: "Daily Byte", cat: "Creator", icon: "📰", bg: "#FDFCFB", btn: "#EA580C", font: "Playfair Display", layout: "list" },
    { id: "community-fans-only", name: "Fan Hub", cat: "Influencer", icon: "⭐", bg: "#000", btn: "#00AFF0", font: "Inter", layout: "bento", card: "glass-premium" },
    { id: "artist-studio-pro", name: "Craft Space", cat: "Creative", icon: "🎨", bg: "#FAFAF5", btn: "#57534E", font: "Outfit", layout: "grid" },
    { id: "clinic-health-vibe", name: "Core Care", cat: "Medical", icon: "🏥", bg: "#F0F9FF", btn: "#0284C7", font: "Inter", layout: "list" },
    { id: "cafe-brew-co", name: "Bean House", cat: "Food", icon: "☕", bg: "#1C1917", btn: "#D97706", font: "Sora", layout: "list" },
    { id: "saas-dashboard-x", name: "Dashboard Preview", cat: "Tech", icon: "📊", bg: "#0F172A", btn: "#22C55E", font: "Space Grotesk", layout: "bento", card: "glass-premium" }
  ].map(t => ({
    id: t.id,
    name: t.name,
    category: t.cat,
    description: `Professional design for ${t.cat}.`,
    icon: t.icon,
    theme: {
      backgroundColor: t.bg,
      cardColor: t.bg === "white" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.7)",
      textColor: t.bg === "black" ? "white" : "#333",
      buttonStyle: "rounded" as "rounded",
      buttonBg: t.btn,
      buttonText: "white",
      fontFamily: t.font,
      layoutMode: (t as any).layout || "list",
      cardStyle: (t as any).card || (t.bg === "black" ? "neon" : "glass")
    },
    defaultLinks: [{ title: "My Portfolio", url: "#" }, { title: "Contact Me", url: "#" }],
    suggestedBio: `${t.name} | Professional ${t.cat}`
  }))
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
  const theme = value.theme;
  if (!isRecord(theme)) return null;

  const id = asString(value.id);
  const name = asString(value.name);
  const category = asString(value.category);
  const description = asString(value.description);
  const icon = asString(value.icon);
  const suggestedBio = asString(value.suggestedBio);

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
          const icon = asString(link.icon);
          return title && url ? { title, url, icon: icon || undefined } : null;
        })
        .filter((link): link is NonNullable<typeof link> => link !== null)
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
      heroImage: asString(theme.heroImage) || undefined,
      layoutMode: (asString(theme.layoutMode) as NicheTemplate["theme"]["layoutMode"]) || undefined,
      cardStyle: (asString(theme.cardStyle) as NicheTemplate["theme"]["cardStyle"]) || undefined,
    },
  };
};

export const getNicheTemplatesFromSettings = (settings: unknown): NicheTemplate[] => {
  const dedupeTemplates = (templates: NicheTemplate[]) => {
    const seenIds = new Set<string>();
    const seenNameCategory = new Set<string>();

    return templates.filter((template) => {
      if (seenIds.has(template.id)) return false;
      seenIds.add(template.id);

      const signature = `${template.name.toLowerCase()}::${template.category.toLowerCase()}`;
      if (seenNameCategory.has(signature)) return false;
      seenNameCategory.add(signature);

      return true;
    });
  };

  const generateAlgorithmicTemplates = (base: NicheTemplate[]): NicheTemplate[] => {
    const expanded: NicheTemplate[] = [...base];
    const layouts: ("list" | "grid" | "bento" | "timeline")[] = ["list", "grid", "bento", "timeline"];
    const styles: ("classic" | "glass" | "glass-premium" | "neon")[] = ["classic", "glass", "glass-premium", "neon"];
    const animations = ["animate-aurora", "animate-mesh", "fx-liquid-gradient", "animate-stars", "fx-neon-grid-3d", "animate-cyber-grid", "fm-pulse-glow"];
    const fonts = ["Outfit", "Inter", "Space Grotesk", "Playfair Display", "Sora"];
    const btns: ("rounded" | "pill" | "square" | "outline" | "shadow")[] = ["rounded", "pill", "square", "outline", "shadow"];

    // We take base items and multiply them to cross 500+
    base.forEach((t) => {
      layouts.forEach((lay) => {
        styles.forEach((st) => {
          if (expanded.length >= 500) return;
          const anim = animations[expanded.length % animations.length];
          const font = fonts[expanded.length % fonts.length];
          const btn = btns[expanded.length % btns.length];
          
          expanded.push({
            ...t,
            id: `${t.id}-gen-${lay}-${st}-${expanded.length}`,
            name: `${t.name} (${lay.toUpperCase()})`,
            theme: {
              ...t.theme,
              layoutMode: lay,
              cardStyle: st,
              animationClass: anim,
              fontFamily: font,
              buttonStyle: btn
            }
          });
        });
      });
    });
    return expanded;
  };

  const raw = (settings as Record<string, unknown> | null)?.niche_templates;
  if (!Array.isArray(raw)) return dedupeTemplates(generateAlgorithmicTemplates(nicheTemplates));

  const parsed = raw
    .map((value) => normalizeNicheTemplate(value))
    .filter((template): template is NicheTemplate => template !== null);

  return parsed.length > 0 ? dedupeTemplates(generateAlgorithmicTemplates(parsed)) : dedupeTemplates(generateAlgorithmicTemplates(nicheTemplates));
};
