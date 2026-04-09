import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialIcon } from "@/components/SocialIcon";
import type { SocialPlatform } from "@/types/links";
import { Check, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useLinks } from "@/hooks/useLinksApi";
import { usePlatformStore } from "@/stores/platformStore";
import { getLinkTemplateCategories, inferPlatformFromTag } from "@/lib/linkTemplates";

type AppCategory = "all" | "social" | "video" | "music" | "booking" | "utility";
type ConnectionFilter = "all" | "connected" | "not-connected";

type DynamicApp = {
  id: string;
  name: string;
  platform: SocialPlatform;
  category: AppCategory;
  defaultTitle: string;
  layout: "default" | "video" | "article";
};

const categoryLabel: Record<AppCategory, string> = {
  all: "All",
  social: "Social",
  video: "Video",
  music: "Music",
  booking: "Booking",
  utility: "Utility",
};

const deriveCategory = (platform: SocialPlatform, title: string): AppCategory => {
  const t = title.toLowerCase();
  if (["youtube", "video-embed", "tiktok"].includes(platform) || t.includes("video")) return "video";
  if (["spotify", "apple-music", "soundcloud", "audiomack", "mixcloud", "tidal", "tunein"].includes(platform)) return "music";
  if (["calendly", "calcom", "zoom", "googlemeet"].includes(platform) || t.includes("book")) return "booking";
  if (["instagram", "twitter", "facebook", "linkedin", "whatsapp", "telegram", "discord", "snapchat", "pinterest", "github", "twitch"].includes(platform)) return "social";
  return "utility";
};

const deriveLayout = (platform: SocialPlatform, title: string): "default" | "video" | "article" => {
  const t = title.toLowerCase();
  if (platform === "youtube" || platform === "video-embed" || t.includes("video")) return "video";
  if (t.includes("blog") || t.includes("article") || t.includes("news") || t.includes("newsletter")) return "article";
  return "default";
};

const AppsIntegrationsPage = () => {
  const [category, setCategory] = useState<AppCategory>("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>("all");
  const [recentAdded, setRecentAdded] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const { data: links = [] } = useLinks(user?.user_id);
  const navigate = useNavigate();
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);

  useEffect(() => {
    if (!platformInitialized) void fetchPlatformSettings();
  }, [platformInitialized, fetchPlatformSettings]);

  const dynamicApps = useMemo<DynamicApp[]>(() => {
    const categories = getLinkTemplateCategories(platformSettings);
    const seen = new Set<string>();
    const apps: DynamicApp[] = [];
    for (const cat of categories) {
      for (const t of cat.templates) {
        const platform = (t.platform || inferPlatformFromTag(t.tag)) as SocialPlatform;
        const key = `${platform}:${t.title.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        apps.push({
          id: t.id,
          name: t.title,
          platform,
          category: deriveCategory(platform, t.title),
          defaultTitle: t.title,
          layout: deriveLayout(platform, t.title),
        });
      }
    }
    return apps;
  }, [platformSettings]);

  const connectedPlatforms = useMemo(() => {
    const set = new Set<string>();
    links.forEach((link) => {
      const base = (link.platform || "website").split("|")[0];
      if ((link.url || "").trim().length > 0) set.add(base);
    });
    return set;
  }, [links]);

  const totalCount = dynamicApps.length;
  const connectedCount = useMemo(
    () => dynamicApps.filter((app) => connectedPlatforms.has(app.platform)).length,
    [dynamicApps, connectedPlatforms]
  );
  const notConnectedCount = Math.max(0, totalCount - connectedCount);

  const filtered = useMemo(() => {
    const byCategory = category === "all" ? dynamicApps : dynamicApps.filter((app) => app.category === category);
    const byConnection = byCategory.filter((app) => {
      const isConnected = connectedPlatforms.has(app.platform);
      if (connectionFilter === "connected") return isConnected;
      if (connectionFilter === "not-connected") return !isConnected;
      return true;
    });
    const bySearch = byConnection.filter((app) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return app.name.toLowerCase().includes(q) || app.platform.toLowerCase().includes(q);
    });
    return showAll ? bySearch : bySearch.slice(0, 12);
  }, [category, search, showAll, connectionFilter, connectedPlatforms, dynamicApps]);

  const addToLinks = (app: DynamicApp) => {
    const params = new URLSearchParams({
      add: "true",
      platform: app.platform,
      title: app.defaultTitle,
      layout: app.layout,
    });
    setRecentAdded(app.id);
    navigate(`/dashboard/links?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <Card className="bruddle-card p-6 md:p-8 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
          <div className="space-y-2">
            <Badge className="rounded-full border-2 border-black bg-[#D1FAE5] text-black text-[10px] uppercase tracking-widest font-black px-4 py-1">
              Apps + Integrations
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase">App Center</h2>
            <p className="text-base md:text-lg text-black/70 font-semibold">
              Pick a template, add it, then paste your real URL in Links.
            </p>
          </div>
          <div className="w-full lg:w-[360px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 h-11 rounded-xl border-2 border-black"
            />
          </div>
        </div>
      </Card>

      <Card className="bruddle-card p-5 md:p-6 bg-white space-y-5">
        <Tabs value={category} onValueChange={(v) => setCategory(v as AppCategory)}>
          <TabsList className="h-auto flex flex-wrap justify-start bg-transparent p-0 gap-2">
            {(Object.keys(categoryLabel) as AppCategory[]).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  "rounded-xl border-2 border-black px-4 py-2 text-[11px] uppercase tracking-wider font-black",
                  category === key ? "bg-black text-white" : "bg-white text-black"
                )}
              >
                {categoryLabel[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all" as ConnectionFilter, label: `All (${totalCount})` },
            { id: "connected" as ConnectionFilter, label: `Connected (${connectedCount})` },
            { id: "not-connected" as ConnectionFilter, label: `Not Connected (${notConnectedCount})` },
          ].map((f) => (
            <Button
              key={f.id}
              variant="outline"
              onClick={() => setConnectionFilter(f.id)}
              className={cn(
                "rounded-full border-2 border-black text-[11px] font-black uppercase tracking-wide",
                connectionFilter === f.id ? "bg-black text-white" : "bg-white text-black"
              )}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {dynamicApps.length === 0 ? (
          <div className="rounded-2xl border-2 border-black bg-[#F8FAFC] p-6 text-center">
            <p className="text-sm font-bold text-black/70">No app templates found in platform settings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((app) => (
              <div key={app.id} className="rounded-3xl border-[3px] border-black bg-[#F9FAFB] p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl border-2 border-black bg-white flex items-center justify-center">
                    <SocialIcon platform={app.platform} className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="rounded-full border-2 border-black bg-white text-[9px] uppercase tracking-widest font-black text-black">
                      {categoryLabel[app.category]}
                    </Badge>
                    {connectedPlatforms.has(app.platform) ? (
                      <Badge className="rounded-full border-2 border-black bg-[#D1FAE5] text-[9px] uppercase tracking-widest font-black text-black">
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="rounded-full border-2 border-black bg-[#F3F4F6] text-[9px] uppercase tracking-widest font-black text-black/70">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="text-xl font-black text-black">{app.name}</h3>
                  <p className="text-sm text-black/70 font-semibold min-h-[40px]">
                    Add this template and set your own URL in Links.
                  </p>
                </div>

                <div className="mt-3 rounded-xl border-2 border-black/20 bg-white px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest font-black text-black/50 mb-1">Quick setup</p>
                  <ul className="space-y-0.5">
                    <li className="text-xs font-semibold text-black/70">- Click Add to Links</li>
                    <li className="text-xs font-semibold text-black/70">- Paste your real URL</li>
                    <li className="text-xs font-semibold text-black/70">- Save and publish</li>
                  </ul>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    onClick={() => addToLinks(app)}
                    className="flex-1 h-11 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-black uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Links
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-1">
          <p className="text-sm text-black/60 font-semibold">
            {showAll ? "Showing all templates." : "Showing first 12 templates."}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAll((s) => !s)}
              className="rounded-full border-2 border-black font-black uppercase tracking-wide"
            >
              {showAll ? "Show Less" : "View All"}
            </Button>
            <Button
              onClick={() => navigate("/dashboard/links")}
              className="rounded-full border-2 border-black bg-[#D1FAE5] text-black hover:bg-black hover:text-white font-black uppercase tracking-wide"
            >
              <Check className="w-4 h-4 mr-2" />
              Go to Links
            </Button>
          </div>
        </div>

        {recentAdded && (
          <div className="rounded-xl border-2 border-emerald-600 bg-[#ECFDF5] px-4 py-3 text-sm font-bold text-emerald-800">
            Template added. Next step: paste your real URL in Links and click save.
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppsIntegrationsPage;
