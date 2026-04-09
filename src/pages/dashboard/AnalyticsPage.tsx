import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLinks } from "@/hooks/useLinksApi";
import { useQRCodes } from "@/hooks/useQRForgeApi";
import { useCatalogItems } from "@/hooks/useCatalogApi";
import { useAuthStore } from "@/stores/authStore";
import { SocialIcon } from "@/components/SocialIcon";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, MousePointerClick, TrendingUp, Link2, ShoppingBag,
  Eye, ArrowUpDown, Users, Smartphone, Apple, QrCode, Globe,
  Activity, RefreshCw, Package
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangeFilter, type DateRange } from "@/components/dashboard/DateRangeFilter";

interface CatalogStat {
  item_id: string;
  title: string;
  views: number;
  clicks: number;
  orders: number;
  conversionRate: number;
}

interface QRScan {
  id: string;
  qr_code_id: string;
  platform: string | null;
  created_at: string;
  short_code_used: string | null;
}

type SortKey = "title" | "views" | "clicks" | "orders" | "conversionRate";

const CHART_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4"];

const chartConfig: ChartConfig = {
  views: { label: "Views", color: "#3B82F6" },
  clicks: { label: "Clicks", color: "#8B5CF6" },
  orders: { label: "Orders", color: "#10B981" },
};

const AnalyticsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: links = [] } = useLinks(user?.user_id);
  const { data: qrCodes = [] } = useQRCodes(user?.user_id);
  const { data: catalogItems = [] } = useCatalogItems(user?.user_id);

  const [profileViews, setProfileViews] = useState(0);
  const [profileViewsHistory, setProfileViewsHistory] = useState<{ date: string; views: number }[]>([]);
  const [catalogStats, setCatalogStats] = useState<CatalogStat[]>([]);
  const [totalCatalogViews, setTotalCatalogViews] = useState(0);
  const [totalCatalogClicks, setTotalCatalogClicks] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [qrScans, setQrScans] = useState<QRScan[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.enabled).length;
  const totalLinkClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalQRScans = qrCodes.reduce((sum, q) => sum + (q.scans_count || 0), 0);

  useEffect(() => {
    if (!user?.user_id) return;
    setLoading(true);

    const fetchAnalytics = async () => {
      try {
        // 1. Profile views from DB
        let pvQuery = (supabase as any)
          .from("profile_views")
          .select("id, created_at, country, referrer")
          .eq("profile_user_id", user.user_id)
          .order("created_at", { ascending: false });

        if (dateRange?.from) pvQuery = pvQuery.gte("created_at", dateRange.from.toISOString());
        if (dateRange?.to) pvQuery = pvQuery.lte("created_at", dateRange.to.toISOString());

        const { data: pvData } = await pvQuery;
        setProfileViews(pvData?.length ?? 0);

        // Build 7-day views history
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split("T")[0];
        });
        const pvByDate: Record<string, number> = {};
        (pvData || []).forEach((pv: any) => {
          const day = pv.created_at.split("T")[0];
          pvByDate[day] = (pvByDate[day] || 0) + 1;
        });
        setProfileViewsHistory(last7.map(date => ({ date: date.slice(5), views: pvByDate[date] || 0 })));

        // 2. Catalog analytics
        let caQuery = (supabase as any)
          .from("catalog_analytics")
          .select("id, item_id, event_type, created_at")
          .eq("profile_user_id", user.user_id);

        if (dateRange?.from) caQuery = caQuery.gte("created_at", dateRange.from.toISOString());
        if (dateRange?.to) caQuery = caQuery.lte("created_at", dateRange.to.toISOString());

        const { data: caData } = await caQuery;
        const catalogViews = (caData || []).filter((e: any) => e.event_type === "view");
        const catalogClicks = (caData || []).filter((e: any) => e.event_type === "click");
        setTotalCatalogViews(catalogViews.length);
        setTotalCatalogClicks(catalogClicks.length);

        // 3. Orders
        let ordersQuery = (supabase as any)
          .from("catalog_orders")
          .select("id, item_id, created_at, status")
          .eq("profile_user_id", user.user_id);

        if (dateRange?.from) ordersQuery = ordersQuery.gte("created_at", dateRange.from.toISOString());
        if (dateRange?.to) ordersQuery = ordersQuery.lte("created_at", dateRange.to.toISOString());

        const { data: ordersData } = await ordersQuery;
        setTotalOrders(ordersData?.length ?? 0);

        // 4. Build per-item catalog stats
        const viewsByItem: Record<string, number> = {};
        const clicksByItem: Record<string, number> = {};
        const ordersByItem: Record<string, number> = {};

        catalogViews.forEach((e: any) => { viewsByItem[e.item_id] = (viewsByItem[e.item_id] || 0) + 1; });
        catalogClicks.forEach((e: any) => { clicksByItem[e.item_id] = (clicksByItem[e.item_id] || 0) + 1; });
        (ordersData || []).forEach((o: any) => { ordersByItem[o.item_id] = (ordersByItem[o.item_id] || 0) + 1; });

        const stats: CatalogStat[] = catalogItems.map((item) => {
          const v = viewsByItem[item.id] || 0;
          const c = clicksByItem[item.id] || 0;
          const o = ordersByItem[item.id] || 0;
          return {
            item_id: item.id,
            title: item.title,
            views: v,
            clicks: c,
            orders: o,
            conversionRate: v > 0 ? parseFloat(((o / v) * 100).toFixed(1)) : 0,
          };
        }).filter(s => s.views > 0 || s.clicks > 0 || s.orders > 0);
        setCatalogStats(stats);

        // 5. QR Scans (device breakdown)
        if (qrCodes.length > 0) {
          const qrIds = qrCodes.map((q) => q.id);
          let scansQuery = (supabase as any)
            .from("qr_scans")
            .select("id, qr_code_id, platform, created_at, short_code_used")
            .in("qr_code_id", qrIds)
            .order("created_at", { ascending: false })
            .limit(100);

          if (dateRange?.from) scansQuery = scansQuery.gte("created_at", dateRange.from.toISOString());
          if (dateRange?.to) scansQuery = scansQuery.lte("created_at", dateRange.to.toISOString());

          const { data: scansData } = await scansQuery;
          setQrScans(scansData || []);
        }

        // 6. Recent Activity feed from user_activity_logs
        const { data: activityData } = await (supabase as any)
          .from("user_activity_logs")
          .select("id, action, details, created_at")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(10);
        setRecentActivity(activityData || []);

      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.user_id, dateRange, refreshKey, catalogItems.length, qrCodes.length]);

  const overallConversion = totalCatalogViews > 0
    ? ((totalOrders / totalCatalogViews) * 100).toFixed(1)
    : "0";

  const sortedCatalogStats = useMemo(() => [...catalogStats].sort((a, b) => {
    const aVal = sortKey === "title" ? a.title.toLowerCase() : a[sortKey];
    const bVal = sortKey === "title" ? b.title.toLowerCase() : b[sortKey];
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  }), [catalogStats, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const linkChartData = [...links]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 8)
    .map((l) => ({
      name: l.title.length > 12 ? l.title.slice(0, 12) + "…" : l.title,
      clicks: l.clicks || 0,
    }));

  const pieData = linkChartData.map((l, i) => ({
    name: l.name,
    value: Math.max(l.clicks, 1),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // QR device breakdown
  const iosScans = qrScans.filter(s => s.platform?.toLowerCase().includes("ios") || s.platform?.toLowerCase().includes("iphone") || s.platform?.toLowerCase().includes("ipad")).length;
  const androidScans = qrScans.filter(s => s.platform?.toLowerCase().includes("android")).length;
  const otherScans = qrScans.length - iosScans - androidScans;

  const qrDeviceData = [
    { name: "iOS", value: iosScans, fill: "#000000" },
    { name: "Android", value: androidScans, fill: "#3DDC84" },
    { name: "Other", value: otherScans, fill: "#94A3B8" },
  ].filter(d => d.value > 0);

  const stats = [
    { icon: Users, val: profileViews, lab: "Profile Views", bg: "bg-[#D1FAE5]" },
    { icon: MousePointerClick, val: totalLinkClicks, lab: "Link Clicks", bg: "bg-[#E0F2FE]" },
    { icon: Link2, val: activeLinks, lab: "Active Links", bg: "bg-[#FCE7F3]" },
    { icon: Eye, val: totalCatalogViews, lab: "Catalog Views", bg: "bg-[#FEF9C3]" },
    { icon: ShoppingBag, val: totalOrders, lab: "Total Orders", bg: "bg-[#D1FAE5]" },
    { icon: TrendingUp, val: `${overallConversion}%`, lab: "Conv. Rate", bg: "bg-[#E0E7FF]" },
    { icon: QrCode, val: totalQRScans, lab: "QR Scans", bg: "bg-[#FCE7F3]" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-black/5 animate-pulse rounded-xl" />
            <div className="h-8 w-64 bg-black/5 animate-pulse rounded-xl" />
          </div>
          <div className="h-10 w-44 bg-black/5 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-black/5 animate-pulse rounded-[28px] border-2 border-black" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-black/5 animate-pulse rounded-[28px] border-2 border-black" />
          <div className="h-72 bg-black/5 animate-pulse rounded-[28px] border-2 border-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-1">Performance Hub</p>
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-2 border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            onClick={() => setRefreshKey(k => k + 1)}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Grid — all from real DB */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
        {stats.map((s, idx) => (
          <Card key={idx} className={cn("bruddle-card p-5 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all", s.bg)}>
            <div className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center">
              <s.icon className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-2xl font-black text-black leading-none">{s.val}</p>
              <p className="text-[9px] uppercase font-black text-black/40 mt-1.5 tracking-widest leading-tight">{s.lab}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Profile Views Chart (7-day) */}
      {profileViewsHistory.length > 0 && (
        <Card className="bruddle-card p-6 md:p-8 bg-white">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Profile Views — Last 7 Days</h2>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <LineChart data={profileViewsHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 700 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="views" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#fff" }} />
            </LineChart>
          </ChartContainer>
        </Card>
      )}

      {/* Charts Row: Link Clicks + Click Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bruddle-card p-6 md:p-8 bg-white">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Link Clicks</h2>
          {linkChartData.length > 0 && linkChartData.some(d => d.clicks > 0) ? (
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={linkChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 700 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="clicks" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-black/30">
              <BarChart3 className="w-10 h-10" />
              <p className="text-xs font-black uppercase tracking-widest">No click data yet — share your links!</p>
            </div>
          )}
        </Card>

        <Card className="bruddle-card p-6 md:p-8 bg-white">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Click Distribution</h2>
          {pieData.length > 0 && pieData.some(d => d.value > 1) ? (
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name.slice(0, 10)}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-black/30">
              <TrendingUp className="w-10 h-10" />
              <p className="text-xs font-black uppercase tracking-widest">Add & share links to see breakdown</p>
            </div>
          )}
        </Card>
      </div>

      {/* QR Scan Analytics — Real data from qr_scans */}
      {qrCodes.length > 0 && (
        <Card className="bruddle-card p-6 md:p-8 bg-white">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <QrCode className="w-5 h-5" /> QR Scan Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Per-code table */}
            <div className="md:col-span-2 space-y-3">
              {qrCodes.length === 0 ? (
                <p className="text-sm text-black/40 font-black uppercase">No QR codes found</p>
              ) : (
                qrCodes.map((qr) => {
                  const codeScans = qrScans.filter(s => s.qr_code_id === qr.id).length;
                  const totalForPct = qrScans.length || 1;
                  return (
                    <div key={qr.id} className="flex items-center gap-3 p-4 border-2 border-black rounded-2xl hover:bg-black/[0.02] transition-all">
                      <div className="w-10 h-10 bg-[#FEF9C3] border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-black truncate">{qr.name}</p>
                          <span className="text-sm font-black">{qr.scans_count || 0}</span>
                        </div>
                        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all"
                            style={{ width: `${Math.max((qr.scans_count || 0) / Math.max(...qrCodes.map(q => q.scans_count || 0), 1) * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                      <Badge className={qr.mode === "dynamic" ? "bg-[#D1FAE5] text-emerald-900 border-2 border-emerald-900 text-[9px] px-2 h-5 font-black uppercase" : "bg-gray-100 text-gray-500 border text-[9px] px-2 h-5 font-black uppercase"}>
                        {qr.mode}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>

            {/* Device Breakdown */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-black/40">Device Breakdown</h3>
              {qrDeviceData.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {[
                      { label: "iOS / iPhone", count: iosScans, icon: Apple, color: "bg-black" },
                      { label: "Android", count: androidScans, icon: Smartphone, color: "bg-[#3DDC84]" },
                      { label: "Other", count: otherScans, icon: Globe, color: "bg-[#94A3B8]" },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center gap-3 p-3 border-2 border-black rounded-xl">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", d.color)}>
                          <d.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase">{d.label}</p>
                          <p className="text-xl font-black">{d.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-black/30 font-black uppercase tracking-widest text-center">Based on last 100 scans</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-black/30">
                  <Smartphone className="w-8 h-8" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">No scans recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Catalog Performance — real catalog_analytics data */}
      {catalogStats.length > 0 && (
        <Card className="bruddle-card p-6 md:p-8 bg-white">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Catalog Performance</h2>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={catalogStats.slice(0, 8).map((s) => ({
              name: s.title.length > 14 ? s.title.slice(0, 14) + "…" : s.title,
              views: s.views, clicks: s.clicks, orders: s.orders,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 700 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="#3B82F6" radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar dataKey="clicks" fill="#8B5CF6" radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ChartContainer>
        </Card>
      )}

      {/* Catalog Item Breakdown Table */}
      {catalogStats.length > 0 && (
        <Card className="bruddle-card p-6 md:p-8 bg-white overflow-hidden">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Item Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b-2 border-black">
                  {([
                    ["title", "Item"],
                    ["views", "Views"],
                    ["clicks", "Clicks"],
                    ["orders", "Orders"],
                    ["conversionRate", "Conv. %"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="text-left py-3 px-3 text-[10px] font-black uppercase tracking-widest">
                      <button onClick={() => handleSort(key)} className="flex items-center gap-1 hover:text-black/60 transition-colors">
                        {label} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCatalogStats.map((stat) => (
                  <tr key={stat.item_id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                    <td className="py-3 px-3 font-black text-black truncate max-w-[200px]">{stat.title}</td>
                    <td className="py-3 px-3 font-medium text-black/60">{stat.views}</td>
                    <td className="py-3 px-3 font-medium text-black/60">{stat.clicks}</td>
                    <td className="py-3 px-3 font-medium text-black/60">{stat.orders}</td>
                    <td className="py-3 px-3">
                      <Badge className={cn(
                        "text-[10px] font-black border-2 px-2 h-5 rounded-lg",
                        stat.conversionRate >= 20 ? "bg-[#D1FAE5] text-emerald-900 border-emerald-900" :
                        stat.conversionRate >= 5 ? "bg-[#FEF9C3] text-amber-900 border-amber-900" :
                        "bg-black/5 text-black/40 border-black/20"
                      )}>
                        {stat.conversionRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Link Performance — real clicks from DB */}
      <Card className="bruddle-card p-6 md:p-8 bg-white">
        <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Link Performance</h2>
        {links.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3 text-black/30">
            <Link2 className="w-10 h-10" />
            <p className="text-xs font-black uppercase tracking-widest">No links yet. Add links to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).map((link, index) => {
              const pct = totalLinkClicks > 0 ? ((link.clicks || 0) / totalLinkClicks) * 100 : 0;
              return (
                <div key={link.id} className="flex items-center gap-4">
                  <span className="text-xs font-black text-black/30 w-5">{index + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-black/5 border-2 border-black flex items-center justify-center shrink-0">
                    <SocialIcon platform={link.platform} className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-black text-black truncate">{link.title}</p>
                      <span className="text-sm font-black ml-2 shrink-0">{link.clicks || 0}</span>
                    </div>
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                        style={{ width: `${Math.max(pct, link.clicks ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <Badge className={link.enabled ? "bg-[#D1FAE5] text-emerald-900 border-2 border-emerald-900 text-[9px] px-2 h-5 font-black" : "bg-black/5 text-black/30 border text-[9px] px-2 h-5 font-black"}>
                    {link.enabled ? "Active" : "Off"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="bruddle-card p-6 md:p-8 bg-white">
        <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6 flex items-center gap-3">
          <Activity className="w-5 h-5" /> Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center gap-3 text-black/30">
            <Activity className="w-8 h-8" />
            <p className="text-xs font-black uppercase tracking-widest">No activity logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 p-3 border-2 border-black/5 rounded-2xl hover:border-black/10 transition-all">
                <div className="w-8 h-8 bg-[#E0F2FE] border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-black capitalize">{ev.action.replace(/_/g, " ")}</p>
                  {ev.details && <p className="text-[10px] font-medium text-black/40 mt-0.5 truncate">{ev.details}</p>}
                </div>
                <span className="text-[9px] font-black text-black/20 uppercase shrink-0">
                  {new Date(ev.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPage;
