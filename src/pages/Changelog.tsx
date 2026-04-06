import InfoPageLayout from "@/components/InfoPageLayout";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Palette, BarChart3, Zap, Shield, MessageCircle, Image } from "lucide-react";

const updates = [
  {
    version: "2.4.0",
    date: "Mar 5, 2026",
    icon: Sparkles,
    title: "AI Chatbot & Quick Replies",
    changes: [
      "Added AI-powered chatbot on landing page with streaming responses",
      "Quick reply suggestion buttons for common questions",
      "Improved typing indicator animation",
    ],
  },
  {
    version: "2.3.0",
    date: "Mar 1, 2026",
    icon: Palette,
    title: "Glassmorphism Redesign",
    changes: [
      "Complete landing page redesign with glass effects and glow animations",
      "Scroll-based reveal animations for all sections",
      "Parallax background orbs with depth effect",
      "Infinite marquee for category pills",
      "Floating rounded navbar on scroll",
      "Section dots navigator and scroll-to-top button",
    ],
  },
  {
    version: "2.2.0",
    date: "Feb 20, 2026",
    icon: ShoppingBag,
    title: "Catalog & Inventory",
    changes: [
      "Product variant support (size, color, etc.)",
      "Automatic inventory tracking with stock decrement",
      "Low-stock email alerts at threshold of 5 items",
      "Bulk order management in dashboard",
    ],
  },
  {
    version: "2.1.0",
    date: "Feb 10, 2026",
    icon: BarChart3,
    title: "Advanced Analytics",
    changes: [
      "Real-time analytics charts with Recharts",
      "Date range filtering for all analytics",
      "Catalog item view and click tracking",
      "Referrer and country tracking for profile views",
    ],
  },
  {
    version: "2.0.0",
    date: "Jan 28, 2026",
    icon: Image,
    title: "AI Background Generator",
    changes: [
      "Generate custom backgrounds with AI prompts",
      "8 animated gradient theme presets",
      "15 photo-based theme presets with high-quality images",
      "Background overlay opacity controls",
    ],
  },
  {
    version: "1.5.0",
    date: "Jan 15, 2026",
    icon: MessageCircle,
    title: "Contact Forms & Notifications",
    changes: [
      "Built-in contact form on public profiles",
      "Email notifications via Resend for orders, messages, and low stock",
      "Dashboard inbox for managing messages",
    ],
  },
  {
    version: "1.0.0",
    date: "Jan 1, 2026",
    icon: Zap,
    title: "Initial Launch",
    changes: [
      "Link-in-bio page builder with 60+ themes",
      "User authentication and profile management",
      "Social media links with icon support",
      "Admin dashboard with user management",
      "Mobile-responsive design",
    ],
  },
];

const Changelog = () => (
  <InfoPageLayout title="Changelog" subtitle="What's new in BIOTRA — every update, every feature.">
    <div className="not-prose space-y-8">
      {updates.map((update, i) => (
        <motion.div
          key={update.version}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="relative pl-8 border-l-2 border-border/30"
        >
          {/* Timeline dot */}
          <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center border-2 border-background">
            <update.icon className="w-3 h-3 text-primary" />
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">v{update.version}</span>
              <span className="text-xs text-muted-foreground">{update.date}</span>
            </div>
            <h3 className="font-heading font-bold text-foreground text-lg mb-3">{update.title}</h3>
            <ul className="space-y-1.5">
              {update.changes.map((change) => (
                <li key={change} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  </InfoPageLayout>
);

export default Changelog;
