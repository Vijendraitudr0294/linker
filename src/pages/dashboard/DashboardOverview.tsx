import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, Eye, Link2, MousePointerClick, AlertTriangle, Palette, ShoppingBag, Share2, Users2, Smartphone, ExternalLink, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useLinks } from "@/hooks/useLinksApi";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import { useAppearanceStore } from "@/stores/appearanceStore";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ConnectAccountModule } from "@/components/dashboard/ConnectAccountModule";

import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

const essentialActions = [
  { icon: Users2, title: "Profile", action: "/dashboard/settings", color: "from-primary/20", description: "Identity & Bio", cta: "Edit" },
  { icon: Link2, title: "Links", action: "/dashboard/links", color: "from-blue-500/20", description: "Social & Web", cta: "Add" },
  { icon: ShoppingBag, title: "Products", action: "/dashboard/catalog", color: "from-orange-500/20", description: "Sell items", cta: "Manage" },
  { icon: Palette, title: "Design", action: "/dashboard/appearance", color: "from-emerald-500/20", description: "Theme & Style", cta: "Visuals" },
];

const DashboardOverview = () => {
  const user = useAuthStore((s) => s.user);
  const { data: links = [] } = useLinks(user?.user_id);
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const activeLinks = links.filter((l) => l.enabled).length;
  const { data: items = [] } = useCatalogItems(user?.user_id);
  const settings = useAppearanceStore((s) => s.settings);
  const navigate = useNavigate();
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
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

  const stats = [
    { label: "Profile Views", value: loading ? "..." : String(profileViews ?? 0), icon: Eye, trend: "All time" },
    { label: "Total Clicks", value: String(totalClicks), icon: MousePointerClick, trend: "Unique hits" },
    { label: "Active Links", value: String(activeLinks), icon: Link2, trend: `${links.length} Blocks` },
    { label: "CTR", value: profileViews ? `${((totalClicks / profileViews) * 100).toFixed(1)}%` : "0%", icon: BarChart3, trend: "Avg performance" },
  ];

  const profileUrl = user ? `${window.location.origin}/p/${user.username}` : "";
  const copyProfileLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied!");
  };

  const handleExportData = () => {
    const exportData = {
      appName: 'Biotra',
      version: '2.0',
      timestamp: new Date().toISOString(),
      store: { ...localStorage }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-vault-${new Date().getTime()}.biotra`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Vault exported successfully as .biotra!");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.biotra')) {
      toast.error('Invalid file type! Only .biotra files are accepted.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.appName === 'Biotra' && data.store) {
          Object.keys(data.store).forEach(key => {
            localStorage.setItem(key, data.store[key]);
          });
          toast.success("Vault restored securely! Reloading Biotra...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error("Corrupted .biotra vault file!");
        }
      } catch (err) {
        toast.error('Failed to parse the vault.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-10 selection:bg-primary selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
        .airbnb-card { box-shadow: 0 12px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04); }
        .dashboard-title { font-family: 'Outfit', sans-serif; }
      `}</style>
      
      {/* Hospitality Column */}
      <div className="flex-1 min-w-0 space-y-8">
        <header className="px-1 space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Studio active • Global Sync</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight dashboard-title text-foreground selection:bg-primary selection:text-white">
              Hello, <span className="text-primary italic font-medium">{user?.name?.split(" ")[0] || user?.username}.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground/70 font-medium tracking-tight max-w-[500px]">
              Your vision is live with <span className="text-foreground">{links.length} active links</span> and <span className="text-foreground">{profileViews || 0} visits</span> today.
            </p>
        </header>

        {/* Refined Insights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 bg-card border-white/5 rounded-2xl airbnb-card transition-all duration-300 hover:ring-4 hover:ring-primary/5 cursor-default group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <stat.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30 border-white/5">
                    {stat.trend}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</h4>
                  <span className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-widest">{stat.label}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Brand Connectivity Module */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl border border-surface-border bg-surface-glass backdrop-blur-3xl shadow-sm"
        >
          <ConnectAccountModule />
        </motion.div>

         {/* Action Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           {essentialActions.map((action, i) => (
             <motion.div
               key={action.title}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 + (i * 0.05) }}
             >
               <Card className="p-3 bg-surface-glass border-surface-border hover:border-primary/30 transition-all duration-300 rounded-xl flex items-center justify-between group relative shadow-sm">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border border-surface-border transition-all bg-background/40", action.color)}>
                       <action.icon className="w-4 h-4 text-foreground/80 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold tracking-tight text-foreground uppercase">{action.title}</h3>
                      <p className="text-[10px] text-muted-foreground/60 font-semibold">{action.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg px-3 h-7 text-[8px] font-black uppercase tracking-widest border-surface-border hover:bg-primary transition-all" onClick={() => navigate(action.action)}>
                    {action.cta}
                  </Button>
               </Card>
             </motion.div>
           ))}
        </div>

        {/* Offline Sync Vault */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/20 rounded-2xl overflow-hidden relative">
                 <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                       <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">Protocol Sync</h3>
                       <p className="text-[13px] text-muted-foreground/70 max-w-[400px]">Extract your identity nodes completely offline into a secure master file.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                       <Button onClick={handleExportData} className="w-full md:w-auto h-10 rounded-xl font-bold bg-primary text-black hover:bg-foreground hover:text-background transition-all group text-[12px] uppercase tracking-widest">
                          <ExternalLink className="w-4 h-4 mr-2" /> Export
                       </Button>
                       <Button variant="outline" className="w-full md:w-auto h-10 rounded-xl font-bold border-surface-border bg-surface-glass text-[12px] uppercase tracking-widest">
                          <input type="file" accept=".biotra" onChange={handleImportData} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <Smartphone className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" /> Import
                       </Button>
                    </div>
                 </div>
            </Card>
        </motion.div>

        {/* Low Stock Notifications */}
        {lowStockItems.length > 0 && (
          <Card className="p-6 bg-orange-500/5 border-orange-500/20 rounded-[28px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-[15px]">Low Stock Alert</h3>
              </div>
              <Button size="sm" className="h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-[11px] font-bold" onClick={() => navigate('/dashboard/catalog')}>
                Manage Inventory
              </Button>
            </div>
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-[13px] py-1 border-b border-white/5 last:border-0">
                  <span className="text-muted-foreground">{item.title}</span>
                  <span className="font-bold text-orange-400">{item.stock_quantity} left</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar Profile Preview */}
      <div className="w-full xl:w-[320px] shrink-0">
        <div className="sticky top-[80px] space-y-4">
          <Card className="p-5 bg-surface-glass border-surface-border rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-muted-foreground/70 uppercase tracking-widest leading-none">Live Status</span>
                    <span className="text-[12px] font-bold text-foreground">@{user?.username}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2.2rem] border border-surface-border overflow-hidden bg-black/40 shadow-2xl">
                <ProfilePreview 
                  settings={settings} 
                  user={user} 
                  links={links.filter(l => l.enabled).map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                  catalogItems={items.filter(i => i.enabled)}
                  compact
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-10 rounded-xl text-[11px] font-black uppercase tracking-widest border-surface-border bg-surface-glass" asChild>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Port
                  </a>
                </Button>
                <Button className="h-10 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white" onClick={copyProfileLink}>
                  <Copy className="w-3.5 h-3.5 mr-2" /> Sync
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-surface-glass border-surface-border rounded-2xl flex items-center gap-4 shadow-sm">
             <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-blue-400" />
             </div>
             <div>
                <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">Identity Verified</h4>
                <p className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-tighter">Node active on public substrate.</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
