import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLinksStore } from "@/stores/linksStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { SocialIcon } from "@/components/SocialIcon";
import { BarChart3, MousePointerClick, TrendingUp, Link2, ShoppingBag, Eye, ArrowUpDown, Users } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
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

type SortKey = "title" | "views" | "clicks" | "orders" | "conversionRate";

const CHART_COLORS = [
  "hsl(0, 90%, 50%)",
  "hsl(210, 90%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 70%, 55%)",
  "hsl(180, 70%, 45%)",
];

const chartConfig: ChartConfig = {
  views: { label: "Views", color: "hsl(210, 90%, 50%)" },
  clicks: { label: "Clicks", color: "hsl(0, 90%, 50%)" },
  orders: { label: "Orders", color: "hsl(142, 71%, 45%)" },
};

const AnalyticsPage = () => {
  const { links, getTotalClicks } = useLinksStore();
  const user = useAuthStore((s) => s.user);
  const totalClicks = getTotalClicks();
  const activeLinks = links.filter((l) => l.enabled);
  const sortedLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  const [catalogStats, setCatalogStats] = useState<CatalogStat[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalCatalogClicks, setTotalCatalogClicks] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch profile views
    const fetchProfileViews = async () => {
      let query = supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("profile_user_id", user.user_id);
      if (dateRange) {
        query = query.gte("created_at", dateRange.from.toISOString()).lte("created_at", dateRange.to.toISOString());
      }
      const { count } = await query;
      setProfileViews(count || 0);
    };
    fetchProfileViews();

    const fetchCatalogAnalytics = async () => {
      const { data: items } = await supabase
        .from("catalog_items")
        .select("id, title")
        .eq("user_id", user.user_id);

      if (!items || items.length === 0) return;

      let analyticsQuery = supabase
        .from("catalog_analytics")
        .select("item_id, event_type")
        .eq("profile_user_id", user.user_id);

      let ordersQuery = supabase
        .from("catalog_orders")
        .select("item_id")
        .eq("profile_user_id", user.user_id);

      if (dateRange) {
        const fromISO = dateRange.from.toISOString();
        const toISO = dateRange.to.toISOString();
        analyticsQuery = analyticsQuery.gte("created_at", fromISO).lte("created_at", toISO);
        ordersQuery = ordersQuery.gte("created_at", fromISO).lte("created_at", toISO);
      }

      const [{ data: analytics }, { data: orders }] = await Promise.all([
        analyticsQuery,
        ordersQuery,
      ]);

      const statsMap = new Map<string, { views: number; clicks: number; orders: number }>();
      items.forEach((i) => statsMap.set(i.id, { views: 0, clicks: 0, orders: 0 }));

      let views = 0, clicks = 0;
      (analytics || []).forEach((a) => {
        const stat = statsMap.get(a.item_id);
        if (!stat) return;
        if (a.event_type === "view") { stat.views++; views++; }
        else if (a.event_type === "click") { stat.clicks++; clicks++; }
      });

      let ordersCount = 0;
      (orders || []).forEach((o) => {
        const stat = statsMap.get(o.item_id);
        if (stat) { stat.orders++; ordersCount++; }
      });

      setTotalViews(views);
      setTotalCatalogClicks(clicks);
      setTotalOrders(ordersCount);
      setCatalogStats(
        items.map((i) => {
          const s = statsMap.get(i.id) || { views: 0, clicks: 0, orders: 0 };
          return {
            item_id: i.id,
            title: i.title,
            ...s,
            conversionRate: s.views > 0 ? (s.clicks / s.views) * 100 : 0,
          };
        })
      );
    };
    fetchCatalogAnalytics();
  }, [user, dateRange]);

  const overallConversion = totalViews > 0 ? ((totalCatalogClicks / totalViews) * 100).toFixed(1) : "0";

  const sortedCatalogStats = [...catalogStats].sort((a, b) => {
    const aVal = sortKey === "title" ? a.title.toLowerCase() : a[sortKey];
    const bVal = sortKey === "title" ? b.title.toLowerCase() : b[sortKey];
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const linkChartData = sortedLinks.slice(0, 6).map((l) => ({
    name: l.title.length > 12 ? l.title.slice(0, 12) + "…" : l.title,
    clicks: l.clicks || 0,
  }));

  const pieData = sortedLinks.filter((l) => l.clicks > 0).slice(0, 6).map((l, i) => ({
    name: l.title,
    value: l.clicks,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Track how your links and catalog are performing</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-4">
          <Users className="w-4 h-4 text-primary mb-2" />
          <p className="text-xl font-bold text-foreground">{profileViews}</p>
          <p className="text-[11px] text-muted-foreground">Page Views</p>
        </Card>
        <Card className="p-4">
          <MousePointerClick className="w-4 h-4 text-primary mb-2" />
          <p className="text-xl font-bold text-foreground">{totalClicks}</p>
          <p className="text-[11px] text-muted-foreground">Link Clicks</p>
        </Card>
        <Card className="p-4">
          <Link2 className="w-4 h-4 text-accent mb-2" />
          <p className="text-xl font-bold text-foreground">{activeLinks.length}</p>
          <p className="text-[11px] text-muted-foreground">Active Links</p>
        </Card>
        <Card className="p-4">
          <Eye className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xl font-bold text-foreground">{totalViews}</p>
          <p className="text-[11px] text-muted-foreground">Catalog Views</p>
        </Card>
        <Card className="p-4">
          <ShoppingBag className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xl font-bold text-foreground">{totalCatalogClicks}</p>
          <p className="text-[11px] text-muted-foreground">Catalog Clicks</p>
        </Card>
        <Card className="p-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xl font-bold text-foreground">{overallConversion}%</p>
          <p className="text-[11px] text-muted-foreground">Conversion Rate</p>
        </Card>
        <Card className="p-4">
          <BarChart3 className="w-4 h-4 text-muted-foreground mb-2" />
          <p className="text-xl font-bold text-foreground">{totalOrders}</p>
          <p className="text-[11px] text-muted-foreground">Total Orders</p>
        </Card>
      </div>

      {/* Catalog Performance Chart */}
      {catalogStats.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Catalog Performance</h2>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={catalogStats.slice(0, 8).map((s) => ({
              name: s.title.length > 14 ? s.title.slice(0, 14) + "…" : s.title,
              views: s.views,
              clicks: s.clicks,
              orders: s.orders,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="hsl(210, 90%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" fill="hsl(0, 90%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      )}

      {/* Catalog Per-Item Table */}
      {catalogStats.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Item Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {([
                    ["title", "Item"],
                    ["views", "Views"],
                    ["clicks", "Clicks"],
                    ["orders", "Orders"],
                    ["conversionRate", "Conv. Rate"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="text-left py-2 px-3 text-muted-foreground font-medium">
                      <button
                        onClick={() => handleSort(key)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {label}
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCatalogStats.map((stat) => (
                  <tr key={stat.item_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground truncate max-w-[200px]">{stat.title}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{stat.views}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{stat.clicks}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{stat.orders}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className={
                          stat.conversionRate >= 20
                            ? "bg-green-500/10 text-green-500 border-green-500/30"
                            : stat.conversionRate >= 5
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                            : "bg-muted text-muted-foreground"
                        }
                      >
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Link Clicks</h2>
          {linkChartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={linkChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No click data yet
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Click Distribution</h2>
          {pieData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name.slice(0, 10)}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No click data yet
            </div>
          )}
        </Card>
      </div>

      {/* Links Performance Table */}
      <Card className="p-5">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Link Performance</h2>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No links yet. Add links to start tracking analytics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLinks.map((link, index) => {
              const percentage = totalClicks > 0 ? ((link.clicks || 0) / totalClicks) * 100 : 0;
              return (
                <div key={link.id} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <SocialIcon platform={link.platform} className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                      <span className="text-sm font-semibold text-foreground ml-2">{link.clicks || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPage;
