import { type SocialPlatform } from "@/types/links";

export type LinkTemplate = {
  id: string;
  title: string;
  tag: string;
  platform?: SocialPlatform;
};

export type LinkTemplateCategory = {
  id: string;
  label: string;
  templates: LinkTemplate[];
};

const KNOWN_PLATFORMS: Set<SocialPlatform> = new Set([
  "instagram",
  "twitter",
  "youtube",
  "tiktok",
  "facebook",
  "linkedin",
  "github",
  "spotify",
  "twitch",
  "discord",
  "snapchat",
  "pinterest",
  "whatsapp",
  "telegram",
  "email",
  "website",
  "googlemeet",
  "zoom",
  "calendly",
  "calcom",
  "video-embed",
  "website-embed",
  "google-maps",
  "other",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeTemplate = (value: unknown, index: number, categoryId: string): LinkTemplate | null => {
  if (!isRecord(value)) return null;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const tag = typeof value.tag === "string" ? value.tag.trim() : "";
  if (!title || !tag) return null;

  const providedId = typeof value.id === "string" ? value.id.trim() : "";
  const template: LinkTemplate = {
    id: providedId || `${categoryId}-template-${index + 1}`,
    title,
    tag,
  };

  if (typeof value.platform === "string") {
    const platform = value.platform as SocialPlatform;
    if (KNOWN_PLATFORMS.has(platform)) {
      template.platform = platform;
    }
  }

  return template;
};

const normalizeCategory = (value: unknown, index: number): LinkTemplateCategory | null => {
  if (!isRecord(value)) return null;
  const label = typeof value.label === "string" ? value.label.trim() : "";
  if (!label) return null;

  const providedId = typeof value.id === "string" ? value.id.trim() : "";
  const id = providedId || `category-${index + 1}`;
  const templates = Array.isArray(value.templates)
    ? value.templates
        .map((template, templateIndex) => normalizeTemplate(template, templateIndex, id))
        .filter((template): template is LinkTemplate => template !== null)
    : [];

  if (templates.length === 0) return null;
  return { id, label, templates };
};

export const getLinkTemplateCategories = (settings: unknown): LinkTemplateCategory[] => {
  const raw = (settings as Record<string, unknown> | null)?.link_template_categories;
  if (!Array.isArray(raw)) return defaultLinkTemplateCategories;

  const parsed = raw
    .map((category, index) => normalizeCategory(category, index))
    .filter((category): category is LinkTemplateCategory => category !== null);

  return parsed.length > 0 ? parsed : defaultLinkTemplateCategories;
};

export const defaultLinkTemplateCategories: LinkTemplateCategory[] = [
  {
    id: "business-services",
    label: "Business & Services",
    templates: [
      { id: "bs-design-services", title: "Design Services", tag: "services" },
      { id: "bs-marketing-agency", title: "Marketing Agency", tag: "marketing" },
      { id: "bs-hire-me", title: "Hire Me", tag: "hire" },
      { id: "bs-services", title: "Services", tag: "services" },
      { id: "bs-commission-info", title: "Commission Info", tag: "commissions" },
      { id: "bs-brand-collabs", title: "Brand Collabs", tag: "collabs" },
      { id: "bs-collaboration", title: "Collaboration", tag: "collab" },
      { id: "bs-start-project", title: "Start a Project", tag: "project" },
    ],
  },
  {
    id: "portfolio-work",
    label: "Portfolio & Work",
    templates: [
      { id: "pw-portfolio", title: "Portfolio", tag: "portfolio" },
      { id: "pw-portfolio-archive", title: "Portfolio Archive", tag: "work" },
      { id: "pw-before-after", title: "Before & After", tag: "gallery" },
      { id: "pw-view-work", title: "View Our Work", tag: "work" },
      { id: "pw-design-philosophy", title: "Design Philosophy", tag: "about" },
    ],
  },
  {
    id: "booking-consultation",
    label: "Booking & Consultation",
    templates: [
      { id: "bc-free-consult", title: "Free Consultation", tag: "consult", platform: "calendly" },
      { id: "bc-book-shoot", title: "Book a Shoot", tag: "booking", platform: "calendly" },
      { id: "bc-book-appointment", title: "Book Appointment", tag: "booking", platform: "calendly" },
      { id: "bc-private-chef", title: "Private Chef Booking", tag: "booking", platform: "calendly" },
      { id: "bc-booking-inquiries", title: "Booking Inquiries", tag: "booking", platform: "email" },
    ],
  },
  {
    id: "contact-about",
    label: "Contact & About",
    templates: [
      { id: "ca-contact-us", title: "Contact Us", tag: "contact", platform: "email" },
      { id: "ca-inquiries", title: "Inquiries", tag: "contact", platform: "email" },
      { id: "ca-contact", title: "Contact", tag: "contact", platform: "email" },
      { id: "ca-about-me", title: "About Me", tag: "about" },
      { id: "ca-about-dr", title: "About Dr.", tag: "about" },
      { id: "ca-find-us", title: "Find Us", tag: "location", platform: "google-maps" },
      { id: "ca-clinic-location", title: "Clinic Location", tag: "location", platform: "google-maps" },
      { id: "ca-emergency", title: "Emergency Contact", tag: "emergency", platform: "other" },
    ],
  },
  {
    id: "content-media",
    label: "Content & Media",
    templates: [
      { id: "cm-podcast", title: "Podcast", tag: "podcast" },
      { id: "cm-spotify", title: "Listen on Spotify", tag: "spotify", platform: "spotify" },
      { id: "cm-watch-youtube", title: "Watch on YouTube", tag: "youtube", platform: "youtube" },
      { id: "cm-youtube", title: "YouTube", tag: "youtube", platform: "youtube" },
      { id: "cm-tiktok", title: "TikTok", tag: "tiktok", platform: "tiktok" },
      { id: "cm-latest-reel", title: "Latest Reel", tag: "reel", platform: "instagram" },
      { id: "cm-newest-video", title: "Newest Video", tag: "new", platform: "youtube" },
    ],
  },
  {
    id: "blog-education",
    label: "Blog & Education",
    templates: [
      { id: "be-design-blog", title: "Design Blog", tag: "blog" },
      { id: "be-latest-posts", title: "Latest Blog Posts", tag: "blog" },
      { id: "be-free-resources", title: "Free Resources", tag: "resources" },
      { id: "be-cookbook", title: "Cookbook", tag: "cookbook" },
      { id: "be-my-book", title: "My Book", tag: "book" },
      { id: "be-brand-story", title: "Brand Story", tag: "story" },
      { id: "be-show-notes", title: "Show Notes", tag: "notes" },
    ],
  },
  {
    id: "shop-products",
    label: "Shop & Products",
    templates: [
      { id: "sp-art-shop", title: "Art Shop", tag: "shop" },
      { id: "sp-merch-store", title: "Merch Store", tag: "shop" },
      { id: "sp-gaming-merch", title: "Gaming Merchandise", tag: "shop" },
      { id: "sp-exclusive", title: "Exclusive Pieces", tag: "exclusive" },
      { id: "sp-new-collection", title: "New Collection", tag: "collection" },
      { id: "sp-gift-guide", title: "Gift Guide", tag: "gifts" },
      { id: "sp-our-products", title: "Our Products", tag: "shop" },
    ],
  },
  {
    id: "community-social",
    label: "Community & Social",
    templates: [
      { id: "cs-newsletter-signup", title: "Newsletter Signup", tag: "newsletter" },
      { id: "cs-newsletter", title: "Newsletter", tag: "newsletter" },
      { id: "cs-discord", title: "Join My Discord", tag: "discord", platform: "discord" },
      { id: "cs-twitch", title: "Twitch Live", tag: "twitch", platform: "twitch" },
      { id: "cs-follow-kitchen", title: "Follow My Kitchen", tag: "instagram", platform: "instagram" },
    ],
  },
  {
    id: "music-entertainment",
    label: "Music & Entertainment",
    templates: [
      { id: "me-new-single", title: "New Single", tag: "music" },
      { id: "me-tour-dates", title: "Tour Dates", tag: "tour" },
      { id: "me-concert-tickets", title: "Concert Tickets", tag: "tickets" },
      { id: "me-vinyl-preorder", title: "Vinyl Pre-order", tag: "vinyl" },
      { id: "me-apple-music", title: "Apple Music", tag: "apple" },
      { id: "me-apple-podcasts", title: "Apple Podcasts", tag: "apple" },
    ],
  },
  {
    id: "developer-tech",
    label: "Developer / Tech",
    templates: [
      { id: "dt-tech-stack", title: "Tech Stack", tag: "stack" },
      { id: "dt-github", title: "Github", tag: "github", platform: "github" },
      { id: "dt-project-archive", title: "Project Archive", tag: "projects" },
    ],
  },
  {
    id: "courses-training",
    label: "Courses & Training",
    templates: [
      { id: "ct-course-material", title: "Course Material", tag: "courses" },
      { id: "ct-student-portal", title: "Student Portal", tag: "portal" },
      { id: "ct-training-programs", title: "Training Programs", tag: "train" },
      { id: "ct-wellness-coaching", title: "Wellness Coaching", tag: "coach" },
      { id: "ct-meditation-guide", title: "Meditation Guide", tag: "med" },
      { id: "ct-nutrition-plans", title: "Nutrition Plans", tag: "eat" },
    ],
  },
  {
    id: "creator-extras",
    label: "Creator Extras",
    templates: [
      { id: "ce-buy-coffee", title: "Buy Me A Coffee", tag: "coffee" },
      { id: "ce-gear-list", title: "Gear List", tag: "gear" },
      { id: "ce-vlog-gear", title: "Vlog Gear", tag: "gear" },
      { id: "ce-setup-tour", title: "Setup Tour", tag: "setup" },
      { id: "ce-live-feed", title: "Live Feed", tag: "live" },
      { id: "ce-beauty-routine", title: "My Beauty Routine", tag: "beauty" },
      { id: "ce-yoga-studio", title: "Join Yoga Studio", tag: "yoga" },
      { id: "ce-skincare-quiz", title: "Skincare Quiz", tag: "quiz" },
    ],
  },
];

export const linkTemplateCategories = defaultLinkTemplateCategories;

export const inferPlatformFromTag = (tag: string): SocialPlatform => {
  const key = tag.toLowerCase();
  const map: Record<string, SocialPlatform> = {
    spotify: "spotify",
    youtube: "youtube",
    tiktok: "tiktok",
    instagram: "instagram",
    discord: "discord",
    twitch: "twitch",
    git: "github",
    github: "github",
    booking: "calendly",
    consult: "calendly",
    contact: "email",
    location: "google-maps",
  };

  return map[key] || "website";
};

export const buildTemplateUrl = (tag: string, platform: SocialPlatform): string => {
  if (platform === "spotify") return "https://open.spotify.com/";
  if (platform === "youtube") return "https://youtube.com/";
  if (platform === "tiktok") return "https://tiktok.com/@username";
  if (platform === "instagram") return "https://instagram.com/username";
  if (platform === "discord") return "https://discord.gg/your-server";
  if (platform === "twitch") return "https://twitch.tv/username";
  if (platform === "github") return "https://github.com/username";
  if (platform === "calendly") return "https://calendly.com/your-name";
  if (platform === "email") return "mailto:you@example.com";
  if (platform === "google-maps") return "https://maps.google.com/?q=your+location";

  return `https://yourwebsite.com/${tag}`;
};




