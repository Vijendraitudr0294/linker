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
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    const fetchStats = async () => {
      setLoading(true);
      const [pvRes, ordersRes] = await Promise.all([
        supabase
          .from("profile_views")
          .select("id", { count: "exact", head: true })
          .eq("profile_user_id", user.user_id),
        supabase
          .from("catalog_orders")
          .select("id", { count: "exact", head: true })
          .eq("profile_user_id", user.user_id),
      ]);
      setProfileViews(pvRes.count ?? 0);
      setTotalOrders(ordersRes.count ?? 0);
      setLoading(false);
    };
    fetchStats();
  }, [user?.user_id]);

  const stats = [
    { label: "Total Links", value: loading ? "..." : String(links.length), color: "bg-[#D1FAE5]", icon: Users2 },
    { label: "Profile Views", value: loading ? "..." : String(profileViews ?? 0), color: "bg-white", icon: Eye },
    { label: "Total Clicks", value: loading ? "..." : String(totalClicks), color: "bg-[#FCE7F3]", icon: MousePointerClick },
    { label: "Total Orders", value: loading ? "..." : String(totalOrders), color: "bg-[#E0F2FE]", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-gray-50/50 p-4 rounded-[40px] font-bruddle min-h-screen">
      
      {/* MAIN CONTENT ZONE */}
      <div className="flex-1 flex flex-col gap-8 order-2 lg:order-1 overflow-hidden">
        
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
                    </div>
                </motion.div>
            ))}
        </div>

        {/* MODULE HUB / QUICK START */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/dashboard/appearance')}
                className="bg-white border-4 border-black p-6 shadow-[10px_10px_0_0_rgba(249,168,212,1)] cursor-pointer hover:shadow-none transition-all flex items-center justify-between"
            >
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">Visual Identity</p>
                   <h3 className="text-xl font-black uppercase tracking-tight text-black">Choose Theme</h3>
                </div>
                <div className="w-12 h-12 bg-pink-100 border-2 border-black rounded-2xl flex items-center justify-center">
                   <Palette className="w-6 h-6 text-black" />
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/dashboard/links')}
                className="bg-white border-4 border-black p-6 shadow-[10px_10px_0_0_rgba(16,185,129,1)] cursor-pointer hover:shadow-none transition-all flex items-center justify-between"
            >
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">Link Curation</p>
                   <h3 className="text-xl font-black uppercase tracking-tight text-black">Add Your Links</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 border-2 border-black rounded-2xl flex items-center justify-center">
                   <Link2 className="w-6 h-6 text-black" />
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/dashboard/catalog')}
                className="bg-white border-4 border-black p-6 shadow-[10px_10px_0_0_rgba(0,0,0,0.1)] cursor-pointer hover:shadow-none transition-all flex items-center justify-between"
            >
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">Commerce</p>
                   <h3 className="text-xl font-black uppercase tracking-tight text-black">Add Shop Items</h3>
                </div>
                <div className="w-12 h-12 bg-gray-100 border-2 border-black rounded-2xl flex items-center justify-center">
                   <ShoppingBag className="w-6 h-6 text-black" />
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/dashboard/analytics')}
                className="bg-white border-4 border-black p-6 shadow-[10px_10px_0_0_rgba(191,219,254,1)] cursor-pointer hover:shadow-none transition-all flex items-center justify-between"
            >
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">Performance</p>
                   <h3 className="text-xl font-black uppercase tracking-tight text-black">Check Analytics</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 border-2 border-black rounded-2xl flex items-center justify-center">
                   <BarChart3 className="w-6 h-6 text-black" />
                </div>
            </motion.div>

            <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/dashboard/settings')}
                className="bg-white border-4 border-black p-6 shadow-[10px_10px_0_0_rgba(224,231,255,1)] cursor-pointer hover:shadow-none transition-all flex items-center justify-between"
            >
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">Personal Info</p>
                   <h3 className="text-xl font-black uppercase tracking-tight text-black">Update Profile</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-100 border-2 border-black rounded-2xl flex items-center justify-center">
                   <Users2 className="w-6 h-6 text-black" />
                </div>
            </motion.div>
        </div>

        {/* REACH CHART SUBSTRATE */}
        <div className="bruddle-card p-6 sm:p-10 bg-white shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
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
            
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-[#F9FAFB] border-2 border-black rounded-[24px] flex items-center justify-center group overflow-hidden">
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
                   <button 
                     onClick={() => navigate('/dashboard/analytics')}
                     className="px-8 py-3 bg-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all"
                   >
                      Expand Analytics
                   </button>
                </div>
            </div>
        </div>

        {/* BOTTOM DOUBLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            {/* Table Card */}
            <div className="bruddle-card bg-white p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-2">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">Most visited pages</h3>
                    <MoreHorizontal className="w-5 h-5 text-black/20" />
                </div>
                <div className="space-y-4">
                    {activeLinks > 0 ? links.slice(0, 3).map((l, i) => (
                        <div key={l.id} className="flex items-center justify-between p-4 border-2 border-black rounded-2xl hover:bg-black/5 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center", ["bg-emerald-100", "bg-pink-100", "bg-blue-100"][i % 3])}>
                                    <Globe className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm uppercase truncate max-w-[140px]">{l.title}</span>
                            </div>
                            <div className="flex gap-8 text-[10px] font-black">
                                <span className="text-black/40">{l.clicks || 0} CLICKS</span>
                                <span className="text-emerald-500">LIVE</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed border-black/10 rounded-3xl bg-black/[0.02]">
                            <div className="w-16 h-16 rounded-full bg-white border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                                <Globe className="w-8 h-8 text-black/20" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-2">No nodes tracked yet</h4>
                            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-relaxed max-w-[200px]">
                                Add social links or digital nodes to start seeing visit metrics.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-8 border-2 border-black rounded-xl h-12 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none"
                                onClick={() => navigate('/dashboard/links')}
                            >
                                Create Node
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Donut Card */}
            <div className="bruddle-card bg-white p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-2">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">My Leads</h3>
                    <select className="bg-[#F3F4F6] border-2 border-black rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                    </select>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
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
                            { label: "Email", value: "24%", color: "bg-gray-200" },
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

      {/* RIGHT SIDEBAR PREVIEW - SWAPPED TO TOP PER USER REQUEST */}
      <div className="w-full xl:w-[420px] lg:w-[380px] flex flex-col gap-6 shrink-0 order-1">
          
          {/* PROFILE PREVIEW MINI - NOW ON TOP */}
          <div className="bruddle-card-blue p-5 sm:p-8 relative overflow-hidden group min-h-[500px] sm:min-h-[600px] flex flex-col">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-all pointer-events-none">
                  <Smartphone size={160} strokeWidth={1} />
              </div>
              <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
                <h3 className="text-xl font-black text-black uppercase tracking-tight">Live View</h3>
                <Badge className="bg-white/40 text-black border-2 border-black rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest">Live</Badge>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center py-2 sm:py-4">
                <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[9/18.5] relative z-10 transition-all transform origin-top mx-auto">
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
                    <Button className="flex-1 bg-black text-white border-2 border-black rounded-2xl py-7 font-black text-xs uppercase shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={() => navigate('/dashboard/appearance')}>
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
          <div className="bruddle-card-green p-5 sm:p-8">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-black uppercase tracking-tight">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                 <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border-2 border-black flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all">
                        <Plus className="w-4 h-4" />
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-10 text-center">
                 {['S','M','T','W','T','F','S'].map((d, index) => <span key={`${d}-${index}`} className="text-[10px] font-black text-black/30">{d}</span>)}
                 {(() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const today = now.getDate();
                    
                    const cells = [];
                    // Empty cells for first week offset
                    for (let i = 0; i < firstDay; i++) {
                       cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }
                    // Day cells
                    for (let i = 1; i <= daysInMonth; i++) {
                       const isToday = i === today;
                       cells.push(
                        <div key={i} className={cn(
                           "aspect-square flex items-center justify-center text-[10px] font-black border-2 border-transparent transition-all cursor-pointer rounded-xl",
                           isToday ? "bg-white border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-[#10b981]" : "hover:bg-white/50 text-black/80"
                        )}>
                           {i}
                        </div>
                       );
                    }
                    return cells;
                 })()}
              </div>
              
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-6">Social Schedule</h4>
                 {[
                    { time: "09:00", task: "Product Update V1", color: "border-l-pink-400", path: "/dashboard/catalog" },
                    { time: "11:30", task: "Sovereign Sync", color: "border-l-emerald-400", path: "/dashboard/links" },
                    { time: "14:00", task: "Community Node", color: "border-l-indigo-400", path: "/dashboard/apps" },
                 ].map((t) => (
                    <div 
                      key={t.task} 
                      onClick={() => navigate(t.path)}
                      className={cn("bg-white border-2 border-black p-4 rounded-2xl flex items-center justify-between border-l-[8px] cursor-pointer hover:translate-x-1 transition-all", t.color)}
                    >
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
