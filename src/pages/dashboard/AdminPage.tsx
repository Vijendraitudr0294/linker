import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield, Users, Eye, MousePointerClick, ShoppingBag, MessageCircle,
  Ban, Trash2, UserCheck, Search, TrendingUp, Activity, Package,
  BarChart3, Globe, Pencil, Clock, CheckSquare, XSquare, Loader2, Palette,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, formatDistanceToNow } from "date-fns";

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

const AdminPage = () => {
  const user = useAuthStore((s) => s.user);
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
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === "superadmin") fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [usersRes, viewsRes, linksRes, ordersRes, msgsRes, catalogRes, analyticsRes, viewsFullRes, ordersFullRes, logsRes, appearanceRes, recentOrdersRes] = await Promise.all([
      (supabase.from("profiles") as any).select("id, user_id, name, email, username, role, status, created_at, last_login_at"),
      supabase.from("profile_views").select("id", { count: "exact", head: true }),
      supabase.from("links").select("clicks"),
      supabase.from("catalog_orders").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("catalog_items").select("id", { count: "exact", head: true }),
      supabase.from("catalog_analytics").select("event_type"),
      supabase.from("profile_views").select("created_at"),
      supabase.from("catalog_orders").select("created_at"),
      (supabase.from("user_activity_logs") as any).select("id, user_id, action, details, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("appearance_settings").select("theme_id"),
      supabase.from("catalog_orders").select("*, catalog_items(title)").order("created_at", { ascending: false }).limit(10),
    ]);

    if (usersRes.data) setUsers(usersRes.data as UserRow[]);
    if (logsRes.data) setActivityLogs(logsRes.data as ActivityLog[]);
    if (recentOrdersRes.data) setRecentOrders(recentOrdersRes.data);

    // Calculate template usage
    const themeCounts: Record<string, number> = {};
    (appearanceRes.data || []).forEach((row: any) => {
      const tid = row.theme_id || "default";
      themeCounts[tid] = (themeCounts[tid] || 0) + 1;
    });
    const sortedUsage = Object.entries(themeCounts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
    setTemplateUsage(sortedUsage);

    const totalClicks = (linksRes.data || []).reduce((sum, l) => sum + ((l as { clicks: number }).clicks || 0), 0);
    const catalogViews = (analyticsRes.data || []).filter((a) => (a as { event_type: string }).event_type === "view").length;
    const catalogClicks = (analyticsRes.data || []).filter((a) => (a as { event_type: string }).event_type === "click").length;

    setKpis({
      totalUsers: usersRes.data?.length || 0,
      totalViews: viewsRes.count || 0,
      totalClicks,
      totalOrders: ordersRes.count || 0,
      totalMessages: msgsRes.count || 0,
      totalCatalogItems: catalogRes.count || 0,
      totalCatalogViews: catalogViews,
      totalCatalogClicks: catalogClicks,
    });

    const days = 7;
    const points: ChartPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayEnd = startOfDay(subDays(new Date(), i - 1));
      const dayStr = format(day, "MMM dd");
      const viewCount = (viewsFullRes.data || []).filter((v) => { const d = new Date((v as { created_at: string }).created_at); return d >= day && d < dayEnd; }).length;
      const orderCount = (ordersFullRes.data || []).filter((o) => { const d = new Date((o as { created_at: string }).created_at); return d >= day && d < dayEnd; }).length;
      points.push({ date: dayStr, views: viewCount, clicks: 0, orders: orderCount });
    }
    setChartData(points);
    setLoading(false);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("user_id", userId);
    if (error) { toast.error("Failed to update user"); return; }
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, status: newStatus } : u));
    toast.success(`User ${newStatus === "blocked" ? "frozen" : "activated"}`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("user_id", userId);
    if (error) { toast.error("Failed to update role"); return; }
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
    toast.success(`Role updated to ${newRole}`);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) { toast.error("Failed to delete - profile may have dependencies"); return; }
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    setSelectedUsers((prev) => { const n = new Set(prev); n.delete(userId); return n; });
    toast.success("User profile deleted");
  };

  /* ── Bulk actions ── */
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

  const bulkAction = async (action: "freeze" | "unfreeze" | "delete") => {
    if (selectedUsers.size === 0) return;
    const count = selectedUsers.size;
    const label = action === "freeze" ? "freeze" : action === "unfreeze" ? "unfreeze" : "delete";
    if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${count} user(s)? ${action === "delete" ? "This cannot be undone." : ""}`)) return;

    setBulkLoading(true);
    const ids = Array.from(selectedUsers);

    if (action === "freeze" || action === "unfreeze") {
      const newStatus = action === "freeze" ? "blocked" : "active";
      const { error } = await supabase.from("profiles").update({ status: newStatus }).in("user_id", ids);
      if (error) { toast.error("Bulk update failed"); setBulkLoading(false); return; }
      setUsers((prev) => prev.map((u) => ids.includes(u.user_id) ? { ...u, status: newStatus } : u));
      toast.success(`${count} user(s) ${action === "freeze" ? "frozen" : "unfrozen"}`);
    } else {
      // Delete one by one due to potential FK constraints
      let deleted = 0;
      for (const id of ids) {
        const { error } = await supabase.from("profiles").delete().eq("user_id", id);
        if (!error) deleted++;
      }
      setUsers((prev) => prev.filter((u) => !ids.includes(u.user_id)));
      toast.success(`${deleted} user(s) deleted`);
    }

    setSelectedUsers(new Set());
    setBulkLoading(false);
  };

  if (!user || user.role !== "superadmin") return <Navigate to="/dashboard" replace />;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectableCount = filteredUsers.filter((u) => u.user_id !== user.user_id).length;
  const allSelected = selectableCount > 0 && selectedUsers.size === selectableCount;

  const resolveOrderAmount = (order: any) => {
    const quantity = Number(order?.quantity ?? 1);
    const directAmount = Number(order?.total_amount ?? order?.amount ?? order?.price ?? 0);
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
    { label: "Total Users", value: kpis.totalUsers, icon: Users, color: "text-primary" },
    { label: "Profile Views", value: kpis.totalViews, icon: Eye, color: "text-accent" },
    { label: "Link Clicks", value: kpis.totalClicks, icon: MousePointerClick, color: "text-[hsl(152,60%,42%)]" },
    { label: "Total Orders", value: kpis.totalOrders, icon: ShoppingBag, color: "text-[hsl(38,92%,50%)]" },
    { label: "Messages", value: kpis.totalMessages, icon: MessageCircle, color: "text-primary" },
    { label: "Catalog Items", value: kpis.totalCatalogItems, icon: Package, color: "text-accent" },
    { label: "Catalog Views", value: kpis.totalCatalogViews, icon: TrendingUp, color: "text-[hsl(152,60%,42%)]" },
    { label: "Catalog Clicks", value: kpis.totalCatalogClicks, icon: Activity, color: "text-[hsl(38,92%,50%)]" },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    fontSize: 12,
    color: "hsl(var(--foreground))",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground p-8 md:p-12 text-background shadow-2xl">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 rounded-full bg-accent/20 blur-[60px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Super Admin</h1>
            </div>
            <p className="text-sm md:text-lg opacity-60 font-medium">Platform Command Center · Monitoring {kpis.totalUsers} Active Digital Identities</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={fetchAll} disabled={loading} className="h-14 px-8 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold uppercase tracking-widest text-xs backdrop-blur-md">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative rounded-[2rem] border border-border bg-card p-6 md:p-8 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-xl"
          >
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <kpi.icon className={`w-16 h-16 ${kpi.color}`} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-1">
                {loading ? "—" : kpi.value.toLocaleString()}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Charts & Template Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-border bg-card p-6 md:p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" /> Growth Analytics
            </h3>
            <div className="flex gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> Views</span>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent" /> Clicks</span>
            </div>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="vG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#vG)" strokeWidth={4} />
                <Area type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" fill="url(#cG)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Template Popularity */}
        <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-10 shadow-sm flex flex-col">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
            <Palette className="w-6 h-6 text-accent" /> Popular Themes
          </h3>
          <div className="flex-1 space-y-4">
            {templateUsage.slice(0, 5).map((theme, i) => (
              <div key={theme.id} className="relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground">{i + 1}</span>
                    {theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-/g, ' ')}
                  </span>
                  <span className="text-xs font-black text-primary">{theme.count} Users</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(theme.count / kpis.totalUsers) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            ))}
            {templateUsage.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No template data available</p>}
          </div>
          <Button variant="outline" className="mt-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-border/50">Manage Template Library</Button>
        </div>
      </div>

      {/* User Management & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-6 md:p-10 border-b border-border space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Users className="w-7 h-7 text-primary" /> Active Creators
              </h2>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search creators by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 text-sm rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            {selectedUsers.size > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-2xl bg-foreground text-background">
                <span className="text-sm font-black uppercase tracking-widest ml-2">{selectedUsers.size} Users Selected</span>
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-black uppercase tracking-widest text-[10px]" onClick={() => bulkAction("freeze")}><Ban className="w-3.5 h-3.5 mr-2" /> Freeze</Button>
                  <Button size="sm" variant="destructive" className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => bulkAction("delete")}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-4 text-left"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} /></th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Creator</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-5">
                      {u.user_id !== user.user_id && <Checkbox checked={selectedUsers.has(u.user_id)} onCheckedChange={() => toggleSelect(u.user_id)} />}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center font-black text-primary text-xs border border-border/50">
                          {u.name?.[0] || u.username?.[0] || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{u.name || "Anonymous"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={u.status === "active" ? "outline" : "destructive"} className="text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1">
                        {u.status === "active" ? "Active" : "Frozen"}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{u.role}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate(`/dashboard/admin/user/${u.user_id}`)}><Pencil className="w-4 h-4" /></Button>
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleStatusChange(u.user_id, u.status === "active" ? "blocked" : "active")}><Ban className="w-4 h-4" /></Button>
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl" onClick={() => window.open(`/p/${u.username}`, "_blank")}><Globe className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-10 shadow-sm flex flex-col">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
             <Activity className="w-6 h-6 text-primary" /> Live Stream
          </h3>
          <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold leading-none">
                    <span className="text-primary">{getUserName(log.user_id)}</span> 
                    <span className="text-muted-foreground font-medium"> performed </span>
                    <span className="uppercase text-[10px] font-black tracking-widest opacity-80">{log.action}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight italic break-words">{log.details || "No data provided"}</p>
                  <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-tighter">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">Waiting for first signal...</p>}
          </div>
        </div>
      </div>

      {/* Robust Transactional Overview */}
      <div className="rounded-[2.5rem] border border-border bg-card p-6 md:p-10 shadow-sm overflow-hidden">
        <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
           <ShoppingBag className="w-6 h-6 text-primary" /> Platform Transactions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentOrders.map((order, i) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-[1.5rem] border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-background">#{order.id.slice(0,8)}</Badge>
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
              </div>
              <p className="text-sm font-black mb-1 truncate">{order.catalog_items?.title || "Unknown Item"}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{order.customer_name?.[0] || "?"}</div>
                   <span className="text-xs font-medium opacity-60">{order.customer_name}</span>
                </div>
                <span className="text-lg font-black text-primary">${resolveOrderAmount(order)}</span>
              </div>
            </motion.div>
          ))}
          {recentOrders.length === 0 && <div className="col-span-full py-12 text-center text-sm text-muted-foreground">No transactions recorded yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

