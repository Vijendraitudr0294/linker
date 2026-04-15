import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Copy, ExternalLink, Link2, Mail, PlugZap, Unplug } from "lucide-react";
import { useLinks, useLinkMutations } from "@/hooks/useLinksApi";
import type { SocialPlatform } from "@/types/links";
import { cn } from "@/lib/utils";
import { usePlatformStore } from "@/stores/platformStore";
import { getLinkTemplateCategories, inferPlatformFromTag } from "@/lib/linkTemplates";
import { RefreshCw } from "lucide-react";

type MailingProvider = {
  key: string;
  label: string;
  platform: SocialPlatform;
  defaultTitle: string;
  placeholder: string;
  matcherTerms: string[];
};

const validUrl = (value: string) => /^https?:\/\//i.test(value.trim());
const MAIL_KEYWORDS = /(newsletter|subscribe|mail|email|substack|convertkit|mailchimp|beehiiv|buttondown)/i;

const MailingListIntegrations = ({ userId }: { userId?: string }) => {
  const { data: links = [] } = useLinks(userId);
  const { addLink, updateLink, toggleLink } = useLinkMutations(userId);
  const platformSettings = usePlatformStore((s) => s.settings);
  const platformInitialized = usePlatformStore((s) => s.initialized);
  const fetchPlatformSettings = usePlatformStore((s) => s.fetchSettings);
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [lastTested, setLastTested] = useState<Record<string, string>>({});
  const [showAllProviders, setShowAllProviders] = useState(false);
  const testedStorageKey = userId ? `lv:mail-last-tested:${userId}` : "lv:mail-last-tested:anon";

  useEffect(() => {
    if (!platformInitialized) void fetchPlatformSettings();
  }, [platformInitialized, fetchPlatformSettings]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(testedStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setLastTested(parsed as Record<string, string>);
      }
    } catch {
      // ignore parse/storage errors
    }
  }, [testedStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(testedStorageKey, JSON.stringify(lastTested));
    } catch {
      // ignore storage errors
    }
  }, [lastTested, testedStorageKey]);

  const providers = useMemo<MailingProvider[]>(() => {
    const categories = getLinkTemplateCategories(platformSettings);
    const fromTemplates: MailingProvider[] = [];
    for (const cat of categories) {
      for (const t of cat.templates) {
        const probe = `${t.title} ${t.tag}`;
        if (!MAIL_KEYWORDS.test(probe)) continue;
        const platform = (t.platform || inferPlatformFromTag(t.tag)) as SocialPlatform;
        const terms = probe.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
        fromTemplates.push({
          key: t.id,
          label: t.title,
          platform,
          defaultTitle: t.title,
          placeholder: "https://your-newsletter-link.com",
          matcherTerms: terms,
        });
      }
    }

    const fromLinks: MailingProvider[] = links
      .filter((l) => MAIL_KEYWORDS.test(`${l.title} ${l.url}`) || ["email", "substack", "website"].includes((l.platform || "").split("|")[0]))
      .map((l) => ({
        key: `link-${l.id}`,
        label: l.title || "Mailing Link",
        platform: ((l.platform || "website").split("|")[0] as SocialPlatform),
        defaultTitle: l.title || "Mailing Link",
        placeholder: "https://your-newsletter-link.com",
        matcherTerms: `${l.title} ${l.url}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3),
      }));

    const merged = [...fromTemplates, ...fromLinks];
    const unique = new Map<string, MailingProvider>();
    merged.forEach((p) => {
      const key = `${p.platform}:${p.label.toLowerCase()}`;
      if (!unique.has(key)) unique.set(key, p);
    });
    return Array.from(unique.values());
  }, [platformSettings, links]);

  const providerState = useMemo(() => {
    return providers.map((provider) => {
      const existing = links.find((link) => {
        const hay = `${link.title} ${link.url} ${link.platform}`.toLowerCase();
        return provider.matcherTerms.some((term) => hay.includes(term));
      });
      return { provider, existing };
    });
  }, [providers, links]);

  const connectedProviders = providerState.filter((entry) => Boolean(entry.existing?.enabled));
  const disconnectedProviders = providerState.filter((entry) => !entry.existing?.enabled);
  const visibleProviderState = showAllProviders ? providerState : connectedProviders.length > 0 ? connectedProviders : providerState.slice(0, 3);

  const handleConnect = async (provider: MailingProvider, existingId?: string) => {
    const url = (urlDrafts[provider.key] || "").trim();
    if (!validUrl(url)) {
      toast.error("Please enter a valid URL starting with https://");
      return;
    }
    setBusyKey(provider.key);
    try {
      if (existingId) {
        await updateLink.mutateAsync({
          id: existingId,
          data: { title: provider.defaultTitle, url, enabled: true, platform: provider.platform },
        });
      } else {
        await addLink.mutateAsync({ title: provider.defaultTitle, url, platform: provider.platform });
      }
      toast.success(`${provider.label} connected`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to connect");
    } finally {
      setBusyKey(null);
    }
  };

  const handleDisconnect = async (providerKey: string, linkId?: string) => {
    if (!linkId) return;
    setBusyKey(providerKey);
    try {
      await toggleLink.mutateAsync({ id: linkId, enabled: false });
      toast.success("Integration disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setBusyKey(null);
    }
  };

  const handleTest = (provider: MailingProvider, existingUrl?: string) => {
    const url = (existingUrl || urlDrafts[provider.key] || "").trim();
    if (!validUrl(url)) {
      toast.error(`Connect ${provider.label} first, then test.`);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    setLastTested((prev) => ({
      ...prev,
      [provider.key]: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));
    toast.success(`${provider.label} test opened`);
  };

  const handleCopy = async (provider: MailingProvider, existingUrl?: string) => {
    const url = (existingUrl || urlDrafts[provider.key] || "").trim();
    if (!validUrl(url)) {
      toast.error(`No valid ${provider.label} link to copy`);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${provider.label} link copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Card className="p-8 md:p-12 rounded-[48px] border-2 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] space-y-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] border-2 border-black bg-[#D1FAE5] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Mail className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-black tracking-tight uppercase">Mailing Matrix</h3>
            <p className="text-[12px] font-black uppercase text-black/40 tracking-widest mt-1">
              Connect your audience directly to your newsletter stack.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAllProviders((v) => !v)}
          className="rounded-full border-2 border-black h-12 px-6 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {showAllProviders ? "Hide Inactive" : "Show All Providers"}
        </Button>
      </div>

      {providers.length === 0 && (
        <div className="rounded-[32px] border-2 border-black border-dashed bg-black/5 p-12 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-black/40">No integration seeds found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
        {visibleProviderState.map(({ provider, existing }) => {
          const isConnected = Boolean(existing?.enabled);
          const draftValue = urlDrafts[provider.key] ?? existing?.url ?? "";
          const loading = busyKey === provider.key;
          
          return (
            <div 
              key={provider.key} 
              className={cn(
                "rounded-[32px] border-2 border-black p-8 transition-all duration-300 relative group/item",
                isConnected ? "bg-emerald-50/50 shadow-[6px_6px_0_0_rgba(16,185,129,0.3)]" : "bg-white hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center",
                    isConnected ? "bg-emerald-400" : "bg-black/5"
                  )}>
                    <Link2 className="w-5 h-5 text-black" />
                  </div>
                  <p className="text-lg font-black text-black tracking-tight">{provider.label}</p>
                </div>
                <Badge className={cn(
                  "rounded-full border-2 border-black px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-black",
                  isConnected ? "bg-emerald-400 text-black" : "bg-white text-black/30"
                )}>
                  {isConnected ? "Active" : "Standby"}
                </Badge>
              </div>

              <div className="relative mb-6">
                <Input
                  value={draftValue}
                  onChange={(e) => setUrlDrafts((prev) => ({ ...prev, [provider.key]: e.target.value }))}
                  placeholder={provider.placeholder}
                  className="h-16 rounded-2xl border-2 border-black bg-white text-black font-bold focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all px-6 text-[15px]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleConnect(provider, existing?.id)}
                  disabled={loading}
                  className={cn(
                    "flex-1 h-14 rounded-2xl border-2 border-black font-black text-[11px] uppercase tracking-[0.2em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                    isConnected ? "bg-black text-white" : "bg-emerald-400 text-black hover:bg-emerald-500"
                  )}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : isConnected ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <PlugZap className="w-4 h-4 mr-2" />}
                  {isConnected ? "Update Link" : "Sync Provider"}
                </Button>

                <div className="flex items-center gap-3">
                   {existing?.id && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDisconnect(provider.key, existing.id)}
                      disabled={loading}
                      title="Disconnect"
                      className="w-14 h-14 rounded-2xl border-2 border-black bg-rose-100/50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Unplug className="w-6 h-6" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleTest(provider, existing?.url)}
                    title="Open Live Test"
                    className="w-14 h-14 rounded-2xl border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(provider, existing?.url)}
                    title="Copy URI"
                    className="w-14 h-14 rounded-2xl border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Copy className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {lastTested[provider.key] && (
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Connection Verified: {lastTested[provider.key]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-8 border-t-2 border-black/5 flex items-center justify-between">
        <p className="text-[12px] font-black uppercase tracking-[0.25em] text-black/20">
          Network Status: <span className="text-black">{connectedProviders.length} Active</span> • <span className="text-black/40">{disconnectedProviders.length} Dormant</span>
        </p>
      </div>
    </Card>
  );
};

export default MailingListIntegrations;
