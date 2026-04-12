import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, Eye, Link2, MousePointerClick, AlertTriangle, Palette, ShoppingBag, Share2, Users2, Smartphone, ExternalLink, Copy, Check, Search, Calendar, Plus, MoreHorizontal, ArrowUpRight, TrendingUp, Globe, Download } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  const stats = [
    { label: "Profile Registration", value: loading ? "..." : String(profileViews ?? 0), trend: "+12.2%", color: "bg-[#D1FAE5]", icon: Users2 },
    { label: "Profile Views", value: loading ? "..." : String(profileViews ?? 0), trend: "+5.1%", color: "bg-[#FEF9C3]", icon: Eye },
    { label: "Total Clicks", value: String(totalClicks), trend: "+8.4%", color: "bg-[#FCE7F3]", icon: MousePointerClick },
    { label: "Total Revenue", value: "$1,234", trend: "+20.5%", color: "bg-[#E0F2FE]", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-[#F5F5DC]/30 p-4 rounded-[40px] font-bruddle min-h-screen">
      
      {/* MAIN CONTENT ZONE */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* BRUDDLE TOP BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-black tracking-tight mb-1">Your Insights</h1>
                <p className="text-sm font-medium text-black/40">Check how your profile and links are performing.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 group-focus-within:text-black" />
                    <input 
                        type="text" 
                        placeholder="Quick Search..." 
                        className="bg-white border-2 border-black rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:outline-none w-[200px] md:w-[300px] shadow-sm transition-all focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                    />
                </div>
                <div className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center shadow-sm cursor-pointer hover:bg-black hover:text-white transition-all">
                    <Check className="w-5 h-5" />
                </div>
            </div>
        </header>

        {/* METRIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((s, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ translateX: 2, translateY: 2 }}
                    className={cn("p-6 border-2 border-black rounded-[28px] shadow-sm flex flex-col gap-6", s.color)}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{s.label}</span>
                        <div className="w-8 h-8 bg-white border-2 border-black rounded-xl flex items-center justify-center">
                            <s.icon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-3xl font-black text-black">{s.value}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                            <TrendingUp className="w-3 h-3" /> {s.trend}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* REACH CHART SUBSTRATE */}
        <div className="bruddle-card p-10 bg-white shadow-2xl">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h3 className="text-2xl font-black text-black tracking-tight">Your Audience</h3>
                    <p className="text-xs font-medium text-black/40 mt-1">See how many people are visiting your page over time.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
                        <span className="text-[10px] font-bold">This Month</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-400 border-2 border-black" />
                        <span className="text-[10px] font-bold">Last Month</span>
                    </div>
                </div>
            </div>
            
            <div className="relative w-full aspect-[21/9] bg-[#F9FAFB] border-2 border-black rounded-[24px] flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#000_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                {/* Visual Chart Placeholder */}
                <div className="w-3/4 h-2/3 flex items-end gap-2 px-4">
                    {[34, 45, 23, 67, 43, 89, 54, 32, 76, 45, 98, 23, 65, 43, 78].map((h, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05 }}
                            className={cn("flex-1 border-2 border-black rounded-t-lg transition-all", i % 2 === 0 ? "bg-emerald-400" : "bg-pink-400")}
                        />
                    ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/5 backdrop-blur-[2px]">
                   <button className="px-8 py-3 bg-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all">
                      Expand Analytics
                   </button>
                </div>
            </div>
        </div>

        {/* BOTTOM DOUBLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            {/* Table Card */}
            <div className="bruddle-card bg-white p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">Most visited pages</h3>
                    <MoreHorizontal className="w-5 h-5 text-black/20" />
                </div>
                <div className="space-y-4">
                    {[
                        { name: "Home", views: "7.8k", unique: "4.5k", bounce: "23%", color: "bg-emerald-100" },
                        { name: "About", views: "4.2k", unique: "3.1k", bounce: "15%", color: "bg-yellow-100" },
                        { name: "Products", views: "3.5k", unique: "2.8k", bounce: "34%", color: "bg-pink-100" },
                    ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between p-4 border-2 border-black rounded-2xl hover:bg-black/5 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center", p.color)}>
                                    <Globe className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm uppercase">{p.name}</span>
                            </div>
                            <div className="flex gap-8 text-[10px] font-black">
                                <span className="text-black/40">{p.views}</span>
                                <span className="text-black">{p.bounce}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Donut Card */}
            <div className="bruddle-card bg-white p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">My Leads</h3>
                    <select className="bg-[#F3F4F6] border-2 border-black rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                    </select>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative w-48 h-48">
                        <div className="absolute inset-0 border-[24px] border-black rounded-full" />
                        <div className="absolute inset-0 border-[24px] border-[#D1FAE5] rounded-full clip-path-donut-1" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black">18.4K</span>
                            <span className="text-[10px] font-black text-black/20">TOTAL</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        {[
                            { label: "Direct", value: "45%", color: "bg-emerald-400" },
                            { label: "Email", value: "24%", color: "bg-[#FEF9C3]" },
                            { label: "Call", value: "11%", color: "bg-[#FCE7F3]" },
                            { label: "Other", value: "20%", color: "bg-[#E0F2FE]" },
                        ].map((l) => (
                            <div key={l.label} className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-3 h-3 rounded-full border-2 border-black", l.color)} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{l.label}</span>
                                </div>
                                <span className="text-[10px] font-black">{l.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR PREVIEW - SWAPPED TO TOP PER USER REQUEST */}
      <div className="w-full lg:w-[420px] flex flex-col gap-8 shrink-0">
          
          {/* PROFILE PREVIEW MINI - NOW ON TOP */}
          <div className="bruddle-card-blue p-8 relative overflow-hidden group min-h-[600px] flex flex-col">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-all pointer-events-none">
                  <Smartphone size={160} strokeWidth={1} />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-black text-black uppercase tracking-tight">Live View</h3>
                <Badge className="bg-white/40 text-black border-2 border-black rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest">Live</Badge>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center py-4">
                <div className="w-full max-w-[320px] aspect-[9/18.5] relative z-10 transition-all transform scale-100 origin-center">
                  <ProfilePreview 
                    settings={settings} 
                    user={user} 
                    links={links.filter(l => l.enabled).map(l => ({ id: l.id, title: l.title, platform: l.platform || 'website' }))}
                    catalogItems={items.filter(i => i.enabled)}
                    compact
                    noFrame={false}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-8 relative z-10">
                  <div className="flex gap-4">
                    <Button className="flex-1 bg-black text-white border-2 border-black rounded-2xl py-7 font-black text-xs uppercase shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={() => navigate('/dashboard/links?tab=styles')}>
                        <Palette className="w-4 h-4 mr-2" /> Style Studio
                    </Button>
                    <Button variant="outline" className="flex-1 bg-white text-black border-2 border-black rounded-2xl py-7 font-black text-xs uppercase hover:bg-black/5" onClick={() => window.open(`${window.location.origin}/p/${user?.username}`, '_blank')}>
                        <Share2 className="w-4 h-4 mr-2" /> View Site
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full bg-[#D1FAE5] text-black border-2 border-black rounded-2xl py-7 font-black text-xs uppercase hover:bg-emerald-200 transition-all flex items-center justify-center gap-2" onClick={() => navigate('/dashboard/links')}>
                      <Download className="w-4 h-4" /> Add All Your Links
                  </Button>
              </div>
          </div>

          {/* CALENDAR BLOCK - NOW BELOW PREVIEW */}
          <div className="bruddle-card-green p-8">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-black uppercase tracking-tight">March, 2024</h3>
                 <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border-2 border-black flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-10 text-center">
                 {['S','M','T','W','T','F','S'].map((d, index) => <span key={`${d}-${index}`} className="text-[10px] font-black text-black/30">{d}</span>)}
                 {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className={cn(
                        "aspect-square flex items-center justify-center text-[10px] font-black border-2 border-transparent transition-all cursor-pointer rounded-xl",
                        i + 1 === 18 && "bg-white border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                        "hover:bg-white/50"
                    )}>
                        {i + 1}
                    </div>
                 ))}
              </div>
              
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-6">Social Schedule</h4>
                 {[
                    { time: "09:00", task: "Product Update V1", color: "border-l-pink-400" },
                    { time: "11:30", task: "Sovereign Sync", color: "border-l-emerald-400" },
                    { time: "14:00", task: "Community Node", color: "border-l-yellow-400" },
                 ].map((t) => (
                    <div key={t.task} className={cn("bg-white border-2 border-black p-4 rounded-2xl flex items-center justify-between border-l-[8px]", t.color)}>
                       <div className="flex flex-col">
                           <span className="text-[9px] font-black text-black/30">{t.time} AM</span>
                           <span className="text-xs font-black">{t.task}</span>
                       </div>
                       <MoreHorizontal className="w-4 h-4 text-black/20" />
                    </div>
                 ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
