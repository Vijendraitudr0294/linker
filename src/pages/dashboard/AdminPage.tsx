import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Shield, Users, Eye, MousePointerClick, ShoppingBag, MessageCircle,
  Ban, Trash2, UserCheck, Search, TrendingUp, Activity, Package,
  BarChart3, Globe, Pencil, Clock, CheckSquare, XSquare, Loader2, Palette,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, formatDistanceToNow } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { isAdminUser } from "@/lib/authRoles";

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
};

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
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (isAdminUser(user)) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [usersRes, viewsRes, linksRes, ordersRes, msgsRes, catalogRes, analyticsRes, viewsFullRes, ordersFullRes, logsRes, appearanceRes, recentOrdersRes] = await Promise.all([
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
      supabase.from("catalog_orders").select("*, catalog_items(title)").order("created_at", { ascending: false }).limit(10),
    ]);

    if (usersRes.data) setUsers(usersRes.data as ProfileSummaryRow[]);
    if (logsRes.data) setActivityLogs(logsRes.data as ActivityLogRow[]);
    if (recentOrdersRes.data) setRecentOrders(recentOrdersRes.data as RecentOrder[]);

    // Calculate template usage
    const themeCounts: Record<string, number> = {};
    (appearanceRes.data || []).forEach((row: ThemeIdRow) => {
      const tid = row.theme_id || "default";
      themeCounts[tid] = (themeCounts[tid] || 0) + 1;
    });
    const sortedUsage = Object.entries(themeCounts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
    setTemplateUsage(sortedUsage);

    const totalClicks = (linksRes.data || []).reduce((sum, linkRow) => sum + (linkRow.clicks || 0), 0);
    const catalogViews = (analyticsRes.data || []).filter((eventRow) => eventRow.event_type === "view").length;
    const catalogClicks = (analyticsRes.data || []).filter((eventRow) => eventRow.event_type === "click").length;

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
      const viewCount = (viewsFullRes.data || []).filter((viewRow) => { const d = new Date(viewRow.created_at); return d >= day && d < dayEnd; }).length;
      const orderCount = (ordersFullRes.data || []).filter((orderRow) => { const d = new Date(orderRow.created_at); return d >= day && d < dayEnd; }).length;
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

  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectableCount = filteredUsers.filter((u) => u.user_id !== user.user_id).length;
  const allSelected = selectableCount > 0 && selectedUsers.size === selectableCount;

  const resolveOrderAmount = (order: RecentOrder) => {
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
    <div className="p-6 md:p-12 space-y-10 bg-[#F0F2F5] min-h-screen text-[#1D1D1F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-script { font-family: 'Dancing Script', cursive; }
        .gradient-blur-1 { background: radial-gradient(circle, #D1FAE5 0%, transparent 70%); }
        .gradient-blur-2 { background: radial-gradient(circle, #DBEAFE 0%, transparent 70%); }
      `}</style>
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] gradient-blur-1 opacity-40 -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] gradient-blur-2 opacity-30 translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Normalized Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 p-10 rounded-[40px] bg-white border border-black/5 shadow-2xl shadow-black/[0.02]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4">
            <Shield className="w-3.5 h-3.5" />
            Super Admin
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-3 text-black">
            Global command <span className="font-script text-primary text-2xl lowercase opacity-80">center</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] font-medium text-black/50">
            Enterprise orchestration node • <span className="text-black font-black tabular-nums">{kpis.totalUsers}</span> Active Identities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="rounded-full bg-black text-white hover:bg-black/90 px-8 py-6 h-12 text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.05] active:scale-95"
            onClick={fetchAll} 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
            Refresh Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="p-8 rounded-[32px] border-black/5 bg-white relative overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-all duration-500">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                <div className={cn("p-3 rounded-2xl bg-black/5 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6", kpi.color)}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tighter text-black tabular-nums leading-none">
                  {loading ? "-" : kpi.value.toLocaleString()}
                </p>
                <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mt-3">{kpi.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black flex items-center gap-3 text-black tracking-tight">
                <TrendingUp className="w-6 h-6 text-primary" /> Growth Analytics
              </h3>
              <p className="text-[13px] font-medium text-black/40">Node expansion metrics across the network</p>
            </div>
            <div className="flex gap-6">
              <span className="text-[10px] uppercase font-black text-black/30 tracking-[0.2em] flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" /> Views</span>
              <span className="text-[10px] uppercase font-black text-black/30 tracking-[0.2em] flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm" /> Clicks</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="vG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#vG)" strokeWidth={4} animationDuration={1500} />
                <Area type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" strokeWidth={4} fillOpacity={0} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Template Popularity */}
        <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] flex flex-col">
          <div className="flex flex-col gap-1 mb-8">
            <h3 className="text-xl font-black mb-1 flex items-center gap-3 text-black tracking-tight">
              <Palette className="w-6 h-6 text-accent" /> Intelligence
            </h3>
            <p className="text-[13px] font-medium text-black/40">Most frequent preset deployments</p>
          </div>
          <div className="flex-1 space-y-6">
            {templateUsage.slice(0, 6).map((theme) => (
              <div key={theme.id} className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                  <span className="text-black/60">{theme.id.replace(/-/g, ' ')}</span>
                  <span className="text-primary">{theme.count} Deployments</span>
                </div>
                <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(theme.count / Math.max(...templateUsage.map(t => t.count), 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full shadow-sm"
                  />
                </div>
              </div>
            ))}
            {templateUsage.length === 0 && <p className="text-sm text-black/40 text-center py-20 font-medium">Monitoring data pending...</p>}
          </div>
          <Button variant="ghost" size="sm" className="mt-8 w-full text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl h-11 hover:bg-black/5">See analytics matrix</Button>
        </Card>
      </div>

      {/* User Management & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] overflow-hidden">
          <div className="p-10 border-b border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-black flex items-center gap-3 text-black">
                <Users className="w-6 h-6 text-primary" /> Network Identities
              </h2>
              <p className="text-[13px] font-medium text-black/40 mt-1">Manage global platform contributors</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
              <Input placeholder="Search global registry..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 rounded-2xl border-black/5 bg-black/[0.02] text-[13px] font-medium focus:bg-white transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black/[0.01] border-b border-black/5">
                  <th className="px-8 py-5 text-left"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} className="rounded-md" /></th>
                  <th className="px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 text-left">Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 text-left">Internal Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 text-left">Access Role</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-black/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      {u.user_id !== user.user_id && <Checkbox checked={selectedUsers.has(u.user_id)} onCheckedChange={() => toggleSelect(u.user_id)} className="rounded-md" />}
                    </td>
                    <td className="px-2 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center font-black text-primary text-[11px] shadow-sm transition-transform group-hover:scale-110">
                          {u.name?.[0] || u.username?.[0] || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-black text-black truncate leading-tight">{u.name || "Anonymous"}</p>
                          <p className="text-[11px] font-medium text-black/30 truncate mt-0.5">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-medium">
                      <Badge variant={u.status === "active" ? "secondary" : "destructive"} className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full", u.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-none" : "bg-rose-500/10 text-rose-600 border-none")}>
                        {u.status === "active" ? "Operational" : "Frozen"}
                      </Badge>
                    </td>
                    <td className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.1em] text-black/40">
                      {u.role}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-black/5" onClick={() => navigate(`/dashboard/admin/user/${u.user_id}`)}><Pencil className="w-4 h-4 opacity-40" /></Button>
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-black/5" onClick={() => handleStatusChange(u.user_id, u.status === "active" ? "blocked" : "active")}><Ban className="w-4 h-4 opacity-40" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Global Activity Feed */}
        <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] flex flex-col">
          <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-black tracking-tight">
             <Activity className="w-6 h-6 text-primary" /> Pulse Feed
          </h3>
          <div className="flex-1 space-y-8 overflow-y-auto max-h-[600px] pr-4 scrollbar-hide">
            {activityLogs.map((log) => (
              <div key={log.id} className="relative pl-8 border-l-2 border-primary/10 pb-8 last:pb-0">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-sm" />
                <div className="space-y-2">
                  <p className="text-[13px] font-black leading-snug">
                    <span className="text-primary">{getUserName(log.user_id)}</span> 
                    <span className="text-black/40 font-medium"> {log.action}</span>
                  </p>
                  <p className="text-[12px] text-black/60 font-medium leading-relaxed italic pr-2">{log.details}</p>
                  <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>

      {/* Transactional Overview */}
      <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02]">
        <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-black tracking-tight">
           <ShoppingBag className="w-6 h-6 text-primary" /> Recent Transactions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentOrders.map((order) => (
            <div 
              key={order.id}
              className="group p-6 rounded-[32px] border border-black/5 bg-black/[0.01] transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white border-black/5">#{order.id.slice(0,8)}</Badge>
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
              </div>
              <p className="text-[15px] font-black text-black mb-4 truncate leading-tight group-hover:text-primary transition-colors">{order.catalog_items?.title || "Unknown Item"}</p>
              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                 <span className="text-[11px] font-black text-black/30 uppercase tracking-widest">{order.customer_name?.split(' ')[0]}</span>
                 <span className="text-lg font-black text-black tabular-nums">${resolveOrderAmount(order)}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && <div className="col-span-full py-24 text-center text-sm font-medium text-black/20 uppercase tracking-widest">No nodes found in transaction history.</div>}
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;

