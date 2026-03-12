import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, Eye, Link2, MousePointerClick, AlertTriangle, Bell, Palette, ShoppingBag, ArrowRight, Rocket, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useLinksStore } from "@/stores/linksStore";
import { useCatalogStore } from "@/stores/catalogStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const LOW_STOCK_THRESHOLD = 5;

const quickStartSteps = [
  {
    icon: Link2,
    title: "Add your first link",
    description: "Add social profiles, website, or any URL to your bio page.",
    action: "/dashboard/links",
    actionLabel: "Add links",
    color: "from-primary/15 to-primary/5",
  },
  {
    icon: Palette,
    title: "Customize your look",
    description: "Pick a theme, colors, and fonts to match your brand.",
    action: "/dashboard/appearance",
    actionLabel: "Customize",
    color: "from-accent/15 to-accent/5",
  },
  {
    icon: ShoppingBag,
    title: "Set up your catalog",
    description: "Add products or services to sell directly from your page.",
    action: "/dashboard/catalog",
    actionLabel: "Add items",
    color: "from-primary/15 to-accent/5",
  },
  {
    icon: Share2,
    title: "Share your page",
    description: "Copy your unique link and paste it in your social bios!",
    action: "/dashboard/links",
    actionLabel: "Get link",
    color: "from-accent/15 to-primary/5",
  },
];

const steps = [
  { icon: Link2, title: "Add Links", action: "/dashboard/links", color: "from-blue-500 to-cyan-500", desc: "Your first step to fame." },
  { icon: Palette, title: "Custom Theme", action: "/dashboard/appearance", color: "from-primary to-accent", desc: "Design your aesthetic." },
  { icon: ShoppingBag, title: "List Products", action: "/dashboard/catalog", color: "from-orange-500 to-pink-500", desc: "Start stacking paper." },
  { icon: Share2, title: "Go Live", action: "/dashboard/links", color: "from-accent to-purple-500", desc: "Share your unique link." },
];

const DashboardOverview = () => {
  const user = useAuthStore((s) => s.user);
  const links = useLinksStore((s) => s.links);
  const totalClicks = useLinksStore((s) => s.getTotalClicks());
  const activeLinks = links.filter((l) => l.enabled).length;
  const { items, fetchItems } = useCatalogStore();
  const settings = useAppearanceStore((s) => s.settings);
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(true);
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    fetchItems(user.user_id);

    const fetchStats = async () => {
      setLoading(true);
      const { count } = await supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("profile_user_id", user.user_id);
      setProfileViews(count ?? 0);
      setLoading(false);
    };
    fetchStats();
  }, [user?.user_id]);

  const lowStockItems = items.filter(
    (i) => i.track_inventory && i.stock_quantity !== null && i.stock_quantity <= LOW_STOCK_THRESHOLD
  );

  const [sendingAlerts, setSendingAlerts] = useState(false);

  const handleSendAlerts = async () => {
    setSendingAlerts(true);
    try {
      const { error } = await supabase.functions.invoke("low-stock-notify");
      if (error) throw error;
      toast.success("Low stock alerts sent!");
    } catch {
      toast.error("Failed to send alerts");
    } finally {
      setSendingAlerts(false);
    }
  };

  const clickRate = profileViews && profileViews > 0
    ? `${((totalClicks / profileViews) * 100).toFixed(1)}%`
    : "—";

  const stats = [
    { label: "Profile Views", value: loading ? "…" : String(profileViews ?? 0), icon: Eye, change: "All time", color: "primary" },
    { label: "Total Clicks", value: String(totalClicks), icon: MousePointerClick, change: "All time", color: "accent" },
    { label: "Active Links", value: String(activeLinks), icon: Link2, change: `${links.length} total`, color: "blue" },
    { label: "Click Rate", value: clickRate, icon: BarChart3, change: "Clicks ÷ Views", color: "green" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black tracking-widest text-primary uppercase">
              Dashboard Overview
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-muted-foreground font-medium">Your digital empire is growing.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden p-6 glass border border-white/5 hover:border-primary/30 group transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] sm:text-[11px] font-bold border-white/10 uppercase tracking-tighter opacity-60">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-heading font-black text-foreground tracking-tighter mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Center / Quick Start */}
        {showTutorial && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-8 border-white/5 glass-strong relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-heading font-black text-foreground">Launchpad 🚀</h3>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Get your page ready for the world.</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setShowTutorial(false)}>
                    Dismiss
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps.map((step, i) => (
                    <motion.div
                      key={step.title}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="p-5 glass border border-white/5 hover:border-primary/30 rounded-2xl cursor-pointer group flex items-center gap-4 transition-all duration-300"
                      onClick={() => navigate(step.action)}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center p-3 shadow-lg group-hover:rotate-12 transition-transform`}>
                        <step.icon className="w-full h-full text-white" />
                      </div>
                      <div>
                        <p className="text-base font-black text-foreground">{step.title}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate opacity-70">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Lower Content */}
        {lowStockItems.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-6 border-amber-500/20 glass shadow-amber-500/5 shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-foreground">Low Stock Alert</h3>
                    <p className="text-xs text-muted-foreground font-medium">Dont let the money stop flowin'.</p>
                  </div>
                </div>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full" onClick={handleSendAlerts} disabled={sendingAlerts}>
                  {sendingAlerts ? "Sending…" : "Notify Team"}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-sm font-bold text-foreground truncate max-w-[150px]">{item.title}</span>
                    <Badge className={item.stock_quantity! <= 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                      {item.stock_quantity! <= 0 ? "DEAD" : `${item.stock_quantity} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Right Sidebar - Profile Preview */}
      <div className="w-full xl:w-[320px] 2xl:w-[380px] shrink-0">
        <motion.div
          className="sticky top-6 z-30 w-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Live Preview</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Online</span>
            </div>
          </div>

          <div className="relative group/preview flex flex-col gap-6">
            <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity duration-1000" />
            <div className="relative transform scale-[1.05] origin-top transition-all duration-700 ease-out">
              <ProfilePreview 
                settings={settings}
                user={user}
                links={links.filter(l => l.enabled).map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                catalogItems={items.filter(i => i.enabled)}
                compact={false}
              />
              {/* View Profile Overlay */}
              <div className="absolute inset-[4px] bottom-[10px] bg-black/70 opacity-0 group-hover/preview:opacity-100 transition-opacity z-40 flex flex-col items-center justify-center p-8 text-center rounded-[42px] shadow-2xl">
                <p className="text-white font-black text-2xl mb-4 tracking-tighter text-balance">Your Live Page 🔥</p>
                <a href={`/p/${user?.username}`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full font-black btn-glow bg-primary hover:bg-primary/90 text-sm h-12 px-8 uppercase tracking-widest shadow-2xl">
                    View My Page
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
