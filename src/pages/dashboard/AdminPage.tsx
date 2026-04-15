import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";
import { usePlatformStore } from "@/stores/platformStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Shield, Users, Eye, MousePointerClick, ShoppingBag, MessageCircle,
  Ban, Trash2, UserCheck, Search, TrendingUp, Activity, Package,
  BarChart3, Globe, Pencil, Clock, CheckSquare, XSquare, Loader2, Palette,
  RefreshCw, MoreVertical, ShieldAlert, ShieldCheck, UserMinus, Snowflake,
  Settings, Layers, Zap, Database, Download, Upload, Monitor, Newspaper
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, formatDistanceToNow } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { isAdminUser, isSuperAdminUser } from "@/lib/authRoles";
import { MarketingCMS } from "@/components/admin/MarketingCMS";
import { ContentCMS } from "@/components/admin/BlogCMS";

interface UserRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
  theme_id?: string;
  views?: number;
  clicks?: number;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

interface KpiData {
  totalUsers: number;
  totalViews: number;
  totalClicks: number;
  totalOrders: number;
  totalMessages: number;
  totalCatalogItems: number;
  totalCatalogViews: number;
  totalCatalogClicks: number;
}

interface ChartPoint { date: string; views: number; clicks: number; orders: number; }

interface TemplateUsage {
  id: string;
  count: number;
}

type ProfileSummaryRow = Pick<
  Tables<"profiles">,
  "id" | "user_id" | "name" | "email" | "username" | "role" | "status" | "created_at" | "last_login_at"
>;
type ActivityLogRow = Pick<Tables<"user_activity_logs">, "id" | "user_id" | "action" | "details" | "created_at">;
type ThemeIdRow = Pick<Tables<"appearance_settings">, "theme_id">;
type RecentOrder = Tables<"catalog_orders"> & {
  catalog_items?: { title?: string | null; price?: number | null } | null;
  total_amount?: number | null;
  amount?: number | null;
  price?: number | null;
  total_price?: number | null;
};

const AdminPage = () => {
  const user = useAuthStore((s) => s.user);
  const { settings: platformSettings, updateSettings, fetchSettings } = usePlatformStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [kpis, setKpis] = useState<KpiData>({
    totalUsers: 0, totalViews: 0, totalClicks: 0, totalOrders: 0,
    totalMessages: 0, totalCatalogItems: 0, totalCatalogViews: 0, totalCatalogClicks: 0,
  });
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [templateUsage, setTemplateUsage] = useState<TemplateUsage[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [activeTab, setActiveTab ] = useState("orchestration");

  useEffect(() => {
    if (isSuperAdminUser(user)) {
       fetchAll();
       fetchSettings();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        uRes, vCountRes, lRes, oCountRes, mRes, cRes, aRes, vFullRes, oFullRes, logRes, appRes, rOrdersRes,
        allViewsRes, allLinksRes
      ] = await Promise.all([
        supabase.from("profiles").select("id, user_id, name, email, username, role, status, created_at, last_login_at"),
        supabase.from("profile_views").select("id", { count: "exact", head: true }),
        supabase.from("links").select("clicks"),
        supabase.from("catalog_orders").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("catalog_items").select("id", { count: "exact", head: true }),
        supabase.from("catalog_analytics").select("event_type"),
        supabase.from("profile_views").select("created_at"),
        supabase.from("catalog_orders").select("created_at"),
        supabase.from("user_activity_logs").select("id, user_id, action, details, created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("appearance_settings").select("theme_id"),
        supabase.from("catalog_orders").select("*, catalog_items(title, price)").order("created_at", { ascending: false }).limit(10),
        supabase.from("profile_views").select("profile_user_id"),
        supabase.from("links").select("user_id, clicks"),
      ]);

      const perUserViews: Record<string, number> = {};
      (allViewsRes.data || []).forEach((v: any) => {
        perUserViews[v.profile_user_id] = (perUserViews[v.profile_user_id] || 0) + 1;
      });

      const perUserClicks: Record<string, number> = {};
      (allLinksRes.data || []).forEach((l: any) => {
        perUserClicks[l.user_id] = (perUserClicks[l.user_id] || 0) + (l.clicks || 0);
      });

      if (uRes.data) {
        setUsers((uRes.data as any[]).map(u => ({
          ...u,
          views: perUserViews[u.user_id] || 0,
          clicks: perUserClicks[u.user_id] || 0
        })));
      }
      if (logRes.data) setActivityLogs(logRes.data as ActivityLogRow[]);
      if (rOrdersRes.data) setRecentOrders(rOrdersRes.data as RecentOrder[]);

      const themeCounts: Record<string, number> = {};
      (appRes.data || []).forEach((row: ThemeIdRow) => {
        const tid = row.theme_id || "default";
        themeCounts[tid] = (themeCounts[tid] || 0) + 1;
      });
      const sortedUsage = Object.entries(themeCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count);
      setTemplateUsage(sortedUsage);

      const totalClicks = (lRes.data || []).reduce((sum, linkRow) => sum + (linkRow.clicks || 0), 0);
      const catalogViews = (aRes.data || []).filter((eventRow) => eventRow.event_type === "view").length;
      const catalogClicks = (aRes.data || []).filter((eventRow) => eventRow.event_type === "click").length;

      setKpis({
        totalUsers: uRes.data?.length || 0,
        totalViews: vCountRes.count || 0,
        totalClicks,
        totalOrders: oCountRes.count || 0,
        totalMessages: mRes.count || 0,
        totalCatalogItems: cRes.count || 0,
        totalCatalogViews: catalogViews,
        totalCatalogClicks: catalogClicks,
      });

      const days = 7;
      const points: ChartPoint[] = [];
      const viewsHistory = vFullRes.data || [];
      const ordersHistory = oFullRes.data || [];

      for (let i = days - 1; i >= 0; i--) {
        const day = startOfDay(subDays(new Date(), i));
        const dayEnd = startOfDay(subDays(new Date(), i - 1));
        const dayStr = format(day, "MMM dd");
        const viewCountByDay = viewsHistory.filter((v) => { 
          const d = new Date(v.created_at); 
          return d >= day && d < dayEnd; 
        }).length;
        const orderCountByDay = ordersHistory.filter((v) => { 
          const d = new Date(v.created_at); 
          return d >= day && d < dayEnd; 
        }).length;
        points.push({ date: dayStr, views: viewCountByDay, clicks: 0, orders: orderCountByDay });
      }
      setChartData(points);
    } catch (err) {
      console.error("Critical matrix sync failure:", err);
      toast.error("Global intelligence matrix synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("user_id", userId);
    if (error) { toast.error("Failed to update user"); return; }
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, status: newStatus } : u));
    toast.success(`User identity ${newStatus === "blocked" ? "frozen" : "reactivated"}`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("user_id", userId);
    if (error) { toast.error("Failed to update role"); return; }
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
    toast.success(`Node privilege upgraded to ${newRole}`);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Permanently purge identity @${username}? This action is irreversible.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) { toast.error("Purge failed - dependency nodes active"); return; }
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    toast.success(`Identity @${username} purged from matrix`);
  };

  const handleBulkStatus = async (status: string) => {
    setBulkLoading(true);
    const ids = Array.from(selectedUsers);
    const { error } = await supabase.from("profiles").update({ status }).in("user_id", ids);
    if (error) { toast.error("Bulk update failed"); } else {
      setUsers((prev) => prev.map((u) => ids.includes(u.user_id) ? { ...u, status } : u));
      toast.success(`Bulk orchestrated: ${ids.length} nodes ${status === "blocked" ? "frozen" : "thawed"}`);
      setSelectedUsers(new Set());
    }
    setBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`PURGE ${selectedUsers.size} IDENTITY NODES? THIS CANNOT BE UNDONE.`)) return;
    setBulkLoading(true);
    const ids = Array.from(selectedUsers);
    const { error } = await supabase.from("profiles").delete().in("user_id", ids);
    if (error) { toast.error("Purge failed - external dependencies"); } else {
      setUsers((prev) => prev.filter((u) => !ids.includes(u.user_id)));
      toast.success(`Matrix purge complete: ${ids.length} nodes deleted`);
      setSelectedUsers(new Set());
    }
    setBulkLoading(false);
  };


  const toggleSelect = (userId: string) => {
    setSelectedUsers((prev) => {
      const n = new Set(prev);
      if (n.has(userId)) n.delete(userId); else n.add(userId);
      return n;
    });
  };

  const toggleSelectAll = () => {
    const selectable = filteredUsers.filter((u) => u.user_id !== user?.user_id);
    if (selectedUsers.size === selectable.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectable.map((u) => u.user_id)));
    }
  };

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    const success = await updateSettings({ [feature]: enabled });
    if (success) {
      toast.success(`Global Module ${feature.replace('feature_', '')} ${enabled ? 'Enabled' : 'Disabled'}`);
    } else {
      toast.error("Global matrix configuration failed");
    }
  };

  if (!isSuperAdminUser(user)) return <Navigate to="/dashboard" replace />;

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => u.user_id === user?.user_id || selectedUsers.has(u.user_id));

  const resolveOrderAmount = (order: RecentOrder) => {
    const quantity = Number(order?.quantity ?? 1);
    const directAmount = Number(order?.total_amount ?? order?.amount ?? order?.total_price ?? order?.price ?? 0);
    if (Number.isFinite(directAmount) && directAmount > 0) return directAmount;
    const catalogPrice = Number(order?.catalog_items?.price ?? 0);
    if (Number.isFinite(catalogPrice) && catalogPrice > 0) return quantity * catalogPrice;
    return 0;
  };

  const getUserName = (userId: string) => {
    const u = users.find((u) => u.user_id === userId);
    return u ? u.name || u.username : userId.slice(0, 8);
  };

  const kpiCards = [
    { label: "Total Users", value: kpis.totalUsers, icon: Users, color: "text-blue-500", trend: "+12%" },
    { label: "Identity Views", value: kpis.totalViews, icon: Eye, color: "text-purple-500", trend: "+24%" },
    { label: "Active Nodes", value: kpis.totalCatalogItems, icon: Package, color: "text-emerald-500", trend: "+5%" },
    { label: "Transactions", value: kpis.totalOrders, icon: ShoppingBag, color: "text-amber-500", trend: "+18%" },
  ];

  const tooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    border: "2px solid black",
    borderRadius: "16px",
    fontSize: "10px",
    fontWeight: "900",
    textTransform: "uppercase" as const,
    boxShadow: "8px 8px 0 0 rgba(0,0,0,0.1)",
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen font-bruddle relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-mono-grid { font-family: 'Space Grotesk', sans-serif; }
        .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 2px solid black; box-shadow: 8px 8px 0 0 rgba(0,0,0,1); }
      `}</style>
      
      {/* HUD Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/30 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 blur-[100px] rounded-full" />
      </div>

      {/* Header HUD */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Operational</div>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none uppercase">
            Concierge <span className="text-black/20">Portal</span>
          </h1>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.3em] text-black/40">Global Orchestration & Intelligence Matrix</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Synchronized Node</p>
              <p className="text-xs font-black text-black">NODE-{user?.user_id?.slice(0, 8).toUpperCase() || "LOADING"}</p>
           </div>
           <Button 
            className="h-12 px-8 bg-white border-2 border-black text-black font-black uppercase tracking-widest transition-all hover:bg-black hover:text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            onClick={fetchAll} 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Matrix
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-white border-2 border-black p-1 h-auto gap-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <TabsTrigger value="orchestration" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all">
             <Activity className="w-3.5 h-3.5 mr-2" /> Orchestration
          </TabsTrigger>
          <TabsTrigger value="matrix" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all">
             <Globe className="w-3.5 h-3.5 mr-2" /> Global Matrix
          </TabsTrigger>
          <TabsTrigger value="marketing" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all">
             <Monitor className="w-3.5 h-3.5 mr-2" /> Marketing Site
          </TabsTrigger>
          <TabsTrigger value="content" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all">
             <Newspaper className="w-3.5 h-3.5 mr-2" /> Content CMS
          </TabsTrigger>
          <TabsTrigger value="deployments" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white transition-all">
             <Zap className="w-3.5 h-3.5 mr-2" /> Deployments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orchestration" className="space-y-8 outline-none">
          {/* Primary KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl border-2 border-black flex items-center justify-center bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white transition-colors", kpi.color)}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                    <div className="text-[9px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md">{kpi.trend}</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-1">{kpi.label}</p>
                    <p className="text-3xl font-black tracking-tighter text-black tabular-nums">
                      {loading ? "--" : kpi.value.toLocaleString()}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-2 text-black leading-none uppercase">
                  <BarChart3 className="w-5 h-5" /> Expansion Analytics
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 font-black text-[9px] uppercase"><div className="w-2.5 h-2.5 bg-black rounded-sm" /> Views</div>
                  <div className="flex items-center gap-2 font-black text-[9px] uppercase"><div className="w-2.5 h-2.5 bg-black/20 rounded-sm" /> Orders</div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 900, fontFamily: 'Space Grotesk' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 900, fontFamily: 'Space Grotesk' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'black', strokeWidth: 2 }} />
                    <Area type="stepAfter" dataKey="views" stroke="black" strokeWidth={3} fill="url(#chartGradient)" />
                    <Area type="stepAfter" dataKey="orders" stroke="#CBD5E1" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="glass-card p-8">
              <h3 className="text-xl font-black flex items-center gap-2 text-black leading-none uppercase mb-8">
                <Palette className="w-5 h-5" /> Theme Pulse
              </h3>
              <div className="space-y-5">
                {templateUsage.slice(0, 5).map((theme) => (
                  <div key={theme.id} className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                      <span>{theme.id.replace(/-/g, ' ')}</span>
                      <span className="text-black/40">{theme.count} IDs</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden border border-black/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(theme.count / Math.max(...templateUsage.map(t => t.count), 1)) * 100}%` }} className="h-full bg-black rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-card overflow-hidden">
              <div className="p-8 border-b-2 border-black flex items-center justify-between bg-white/50">
                <h2 className="text-xl font-black text-black leading-none uppercase">Identity Registry</h2>
                <Input placeholder="Find node..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 border-2 border-black/10 focus:border-black text-[11px] font-bold uppercase tracking-widest" />
              </div>
              <div className="overflow-x-auto h-[500px] scrollbar-hide">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/5 text-[9px] font-black uppercase tracking-widest text-black border-b-2 border-black sticky top-0 z-10">
                      <th className="px-6 py-4 text-left"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} className="border-2 border-black" /></th>
                      <th className="px-2 py-4 text-left">Cognito Node</th>
                      <th className="px-4 py-4 text-left">Insight</th>
                      <th className="px-4 py-4 text-left">Status</th>
                      <th className="px-4 py-4 text-left">Rank</th>
                      <th className="px-6 py-4 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-black/[0.02] transition-colors group">
                        <td className="px-6 py-5"><Checkbox checked={selectedUsers.has(u.user_id)} onCheckedChange={() => toggleSelect(u.user_id)} className="border-2 border-black" /></td>
                        <td className="px-2 py-5 flex items-center gap-3">
                          <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center font-black text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">{u.username ? u.username[0].toUpperCase() : "?"}</div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-black text-black leading-tight">
                              {u.name || "Anon"} 
                              {u.user_id === user?.user_id && <span className="ml-1 text-[7px] bg-black text-white px-1 py-0.5 rounded">YOU</span>}
                            </p>
                            <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">@{u.username || "unset"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                 <Eye className="w-3 h-3 text-black/20" />
                                 <span className="text-[10px] font-bold text-black tabular-nums">{u.views?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <MousePointerClick className="w-3 h-3 text-black/20" />
                                 <span className="text-[10px] font-bold text-black tabular-nums">{u.clicks?.toLocaleString() || 0}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-5"><Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5 border-2", u.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-500/20" : "bg-red-50 text-red-700 border-red-500/20")}>{u.status}</Badge></td>
                        <td className="px-4 py-5 text-[9px] font-black uppercase text-black/40">{u.role}</td>
                        <td className="px-6 py-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 border-2 border-black/5 rounded-xl hover:border-black"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 glass-card bg-white mt-1 border-2 border-black p-1">
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/admin/user/${u.user_id}`)} className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-black hover:text-white rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /> Edit Profile</DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-black/5" />
                              <DropdownMenuItem onClick={() => handleStatusChange(u.user_id, u.status === 'active' ? 'blocked' : 'active')} className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-black hover:text-white rounded-lg transition-colors"><Snowflake className="w-3.5 h-3.5" /> {u.status === 'active' ? 'Freeze Node' : 'Thaw Node'}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(u.user_id, u.role === 'admin' ? 'user' : 'admin')} className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-black hover:text-white rounded-lg transition-colors"><Shield className="w-3.5 h-3.5" /> {u.role === 'admin' ? 'Demote User' : 'Grant Admin'}</DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-black/5" />
                              <DropdownMenuItem onClick={() => handleDeleteUser(u.user_id, u.username)} className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase text-red-600 cursor-pointer hover:bg-red-600 hover:text-white rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /> Purge User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="glass-card p-8 flex flex-col">
              <h3 className="text-xl font-black flex items-center gap-2 text-black leading-none uppercase mb-8"><Activity className="w-5 h-5 text-emerald-500" /> Pulse Node</h3>
              <div className="flex-1 space-y-6 overflow-y-auto max-h-[600px] scrollbar-hide">
                {activityLogs.map((log) => (
                  <div key={log.id} className="pl-6 border-l-2 border-black/10 pb-6 relative last:pb-0">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-black" />
                    <p className="text-[11px] font-black text-black">{getUserName(log.user_id)} <span className="text-black/30">{log.action}</span></p>
                    {log.details && <p className="text-[9px] text-black/50 italic mt-1">{log.details}</p>}
                    <p className="text-[8px] font-black text-emerald-500 uppercase mt-2">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {selectedUsers.size > 0 && (
             <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="p-4 bg-black text-white flex items-center justify-between sticky bottom-0 z-20 border-t-4 border-emerald-500 shadow-2xl">
               <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-black text-black">{selectedUsers.size}</div><p className="text-[10px] font-black uppercase tracking-widest">Selected Nodes</p></div>
               <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={() => handleBulkStatus('active')} className="h-8 bg-transparent text-white border-white text-[9px] font-black p-2 hover:bg-white hover:text-black transition-all">Thaw ALL</Button>
                 <Button size="sm" variant="outline" onClick={() => handleBulkStatus('blocked')} className="h-8 bg-transparent text-white border-white text-[9px] font-black p-2 hover:bg-white hover:text-black transition-all">Freeze ALL</Button>
                 <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="h-8 bg-red-600 text-white text-[9px] font-black p-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">PURGE ALL</Button>
                 <Button variant="ghost" size="sm" onClick={() => setSelectedUsers(new Set())} className="text-white/40 hover:text-white h-8 text-[9px] font-black">Cancel</Button>
               </div>
             </motion.div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl border-2 border-black bg-blue-50"><Monitor className="w-5 h-5 text-blue-600" /></div>
                  <h3 className="text-xl font-black uppercase">Core Identity Modules</h3>
               </div>
               <div className="space-y-6">
                  {[
                    { id: 'feature_social_links', label: 'Identity Connect', desc: 'Global social link matrix', icon: Globe },
                    { id: 'feature_contact_form', label: 'Message Matrix', desc: 'Secure contact infrastructure', icon: MessageCircle },
                    { id: 'feature_analytics', label: 'Insight Engine', desc: 'Global performance intelligence', icon: BarChart3 },
                    { id: 'feature_catalog', label: 'Commerce Node', desc: 'Transaction & inventory engine', icon: ShoppingBag }
                  ].map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-4 border-2 border-black/5 rounded-2xl hover:border-black transition-all group">
                       <div className="flex items-center gap-4">
                          <feature.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                          <div>
                             <p className="text-[11px] font-black uppercase tracking-widest">{feature.label}</p>
                             <p className="text-[9px] text-black/40 font-black uppercase">{feature.desc}</p>
                          </div>
                       </div>
                       <Switch 
                        checked={platformSettings ? Boolean((platformSettings as any)[feature.id]) : true} 
                        onCheckedChange={(val) => handleFeatureToggle(feature.id, val)}
                        className="data-[state=checked]:bg-emerald-500 border-2 border-black"
                       />
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="glass-card p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl border-2 border-black bg-emerald-50"><ShoppingBag className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="text-xl font-black uppercase">Financial Core</h3>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Razorpay Key ID</label>
                    <Input 
                      className="h-10 border-2 border-black/10 focus:border-black rounded-xl text-xs font-bold" 
                      placeholder="rzp_live_..." 
                      defaultValue={platformSettings?.razorpay_key_id}
                      onBlur={(e) => updateSettings({ razorpay_key_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Stripe Publishable Key</label>
                    <Input 
                      className="h-10 border-2 border-black/10 focus:border-black rounded-xl text-xs font-bold" 
                      placeholder="pk_live_..." 
                      defaultValue={platformSettings?.stripe_publishable_key}
                      onBlur={(e) => updateSettings({ stripe_publishable_key: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-black uppercase">Transaction Mode</p>
                      <p className="text-[9px] text-black/40 font-black uppercase">Switch between Sandbox/Live</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase text-amber-600">Test</span>
                      <Switch 
                        checked={!platformSettings?.is_test_mode} 
                        onCheckedChange={(val) => updateSettings({ is_test_mode: !val })}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className="text-[9px] font-black uppercase text-emerald-600">Live</span>
                    </div>
                  </div>
               </div>
            </Card>

            <Card className="glass-card p-8 col-span-1 md:col-span-2 lg:col-span-1">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl border-2 border-black bg-emerald-50"><Database className="w-5 h-5 text-emerald-600" /></div>
                  <h3 className="text-xl font-black uppercase">Platform Security & Ops</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-black/5 rounded-2xl space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Registration Protocol</p>
                     <div className="flex items-center justify-between">
                        <span className="text-[12px] font-black uppercase">Open Registration</span>
                        <Switch checked={platformSettings?.allow_registration} onCheckedChange={(val) => handleFeatureToggle('allow_registration', val)} />
                     </div>
                     <p className="text-[9px] text-black/30 font-medium leading-relaxed italic">Controls if new users can self-onboard to the platform.</p>
                  </div>
                  <div className="p-6 border-2 border-black/5 rounded-2xl space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Default Deployment</p>
                     <div className="flex items-center gap-3">
                        <Palette className="w-4 h-4 text-black/20" />
                        <span className="text-[12px] font-black uppercase">Standard {platformSettings?.default_theme_id}</span>
                     </div>
                     <p className="text-[9px] text-black/30 font-medium leading-relaxed italic">The baseline theme used for all new identities.</p>
                  </div>
               </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-8 outline-none">
          <Card className="glass-card p-8">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl border-2 border-black bg-amber-50"><Zap className="w-5 h-5 text-amber-600" /></div>
                  <h3 className="text-xl font-black uppercase">Template Deployment Matrix</h3>
                </div>
                <Button className="bg-black text-white text-[10px] font-black uppercase rounded-xl h-10 px-6 hover:bg-emerald-600 transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"><Upload className="w-4 h-4 mr-2" /> Global Deploy</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4 p-6 border-2 border-black rounded-2xl flex flex-col items-center text-center justify-center hover:bg-black hover:text-white transition-all group cursor-pointer">
                   <Palette className="w-12 h-12 mb-4 text-black group-hover:text-white" />
                   <h4 className="font-black uppercase tracking-widest text-[14px]">Theme Presets</h4>
                   <p className="text-[10px] uppercase font-black opacity-40">24 active designs</p>
                   <Button variant="ghost" className="mt-4 border-2 border-black/10 group-hover:border-white/40 text-[9px] font-black uppercase">Manage Catalog</Button>
                </div>
                <div className="space-y-4 p-6 border-2 border-black rounded-2xl flex flex-col items-center text-center justify-center hover:bg-black hover:text-white transition-all group cursor-pointer">
                   <Layers className="w-12 h-12 mb-4 text-black group-hover:text-white" />
                   <h4 className="font-black uppercase tracking-widest text-[14px]">Niche Templates</h4>
                   <p className="text-[10px] uppercase font-black opacity-40">12 operational sectors</p>
                   <Button variant="ghost" className="mt-4 border-2 border-black/10 group-hover:border-white/40 text-[9px] font-black uppercase">Configure Sectors</Button>
                </div>
                <div className="space-y-4 p-6 border-2 border-black rounded-2xl flex flex-col items-center text-center justify-center hover:bg-black hover:text-white transition-all group cursor-pointer">
                   <Package className="w-12 h-12 mb-4 text-black group-hover:text-white" />
                   <h4 className="font-black uppercase tracking-widest text-[14px]">Catalog Packs</h4>
                   <p className="text-[10px] uppercase font-black opacity-40">Demo asset libraries</p>
                   <Button variant="ghost" className="mt-4 border-2 border-black/10 group-hover:border-white/40 text-[9px] font-black uppercase">Sync Packs</Button>
                </div>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-8 outline-none">
          <MarketingCMS />
        </TabsContent>

        <TabsContent value="content" className="space-y-8 outline-none">
          <ContentCMS />
        </TabsContent>

      </Tabs>
      
      {/* Financial Matrix (Bottom Section) */}
      {activeTab === 'orchestration' && (
        <Card className="glass-card p-8 group">
          <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl border-2 border-black bg-emerald-100 flex items-center justify-center text-emerald-600"><ShoppingBag className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-black leading-none uppercase">Financial Stream</h3>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Latest 10 transactions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-5 rounded-2xl border-2 border-black/5 bg-white/50 hover:border-black hover:bg-white hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-300 relative overflow-hidden group/order">
                <div className="flex items-center justify-between mb-3"><span className="text-[8px] font-black uppercase tracking-widest text-black/30">ID_{order.id.slice(0,4)}</span><div className="w-2 h-2 rounded-full bg-emerald-500 opacity-50 group-hover/order:animate-ping" /></div>
                <p className="text-[12px] font-black text-black truncate leading-tight uppercase tracking-tight">{order.catalog_items?.title || "Product_Node"}</p>
                <div className="mt-4 pt-4 border-t-2 border-black/5 flex items-end justify-between"><span className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">{order.customer_name?.split(' ')[0]}</span><span className="text-lg font-black text-black tabular-nums leading-none">${resolveOrderAmount(order)}</span></div>
              </div>
            ))}
            {recentOrders.length === 0 && <div className="col-span-full py-12 text-center text-[10px] font-black uppercase text-black/20 tracking-[0.3em]">Matrix stream empty.</div>}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminPage;
