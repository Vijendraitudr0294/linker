import { MarketingPage, SiteConfig } from "@/types/marketing";

export const DEFAULT_MARKETING_CONFIG: SiteConfig = {
  active_theme: "modern",
  navigation: [
    { label: "Features", href: "/features" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ],
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "Bio Profile", href: "/features#profile" },
          { label: "Shop", href: "/features#shop" },
          { label: "Bookings", href: "/features#bookings" },
        ]
      },
      {
        title: "Company",
        links: [
          { label: "Team", href: "/team" },
          { label: "Contact", href: "/contact" },
          { label: "Terms", href: "/terms" },
        ]
      }
    ]
  }
};

export const DEFAULT_HOME_PAGE: MarketingPage = {
  slug: "home",
  title: "Biotra - Turn One Link Into Your Complete Digital Business",
  description: "Build your profile, sell products, capture leads, accept bookings, and track performance — all from a single powerful bio link.",
  sections: [
    {
      id: "hero-1",
      type: "hero",
      enabled: true,
      order: 0,
      content: {
        title: "Turn One Link Into Your Complete Digital Business",
        subtitle: "Build your profile, sell products, capture leads, accept bookings, and track performance — all from a single powerful bio link.",
        primaryCTA: { label: "Create Your Profile Free", href: "/register" },
        secondaryCTA: { label: "View Live Demo", href: "/demo" },
        trustLine: "No coding required • Setup in 2 minutes • Free to start"
      }
    },
    {
      id: "preview-1",
      type: "preview",
      enabled: true,
      order: 1,
      content: {
        heading: "See Exactly How Your Profile Works",
        text: "Your Biotra profile is fully optimized for mobile. Add links, showcase products, collect leads, or accept bookings—all in one clean, high-converting page."
      }
    },
    {
      id: "features-1",
      type: "features",
      enabled: true,
      order: 2,
      content: {
        heading: "Everything You Need to Grow Online",
        items: [
          { title: "Profile (Bio Page)", description: "Create a professional link-in-bio page with real-time preview and full customization.", icon: "User" },
          { title: "Design & Customization", description: "Choose templates or fully customize colors, fonts, layouts, and sections.", icon: "Sparkles" },
          { title: "Shop", description: "Sell products or services directly using payment links or WhatsApp.", icon: "ShoppingBag" },
          { title: "Forms", description: "Capture leads, inquiries, or bookings with customizable smart forms.", icon: "Newspaper" },
          { title: "Bookings", description: "Allow users to book hotels, cars, yachts, or services directly.", icon: "Radio" },
          { title: "QR Code", description: "Generate QR codes to share your profile offline and online.", icon: "QrCode" },
          { title: "Analytics", description: "Track clicks, views, conversions, and performance insights.", icon: "BarChart3" }
        ]
      }
    },
    {
      id: "cta-final",
      type: "cta",
      enabled: true,
      order: 10,
      content: {
        title: "Start building your digital presence in minutes.",
        buttonLabel: "Create Your Profile Free",
        buttonHref: "/register"
      }
    }
  ]
};
