import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Copy, ExternalLink, Link2, Mail, PlugZap, Unplug } from "lucide-react";
import { useLinks, useLinkMutations } from "@/hooks/useLinksApi";
import type { SocialPlatform } from "@/types/links";
import { usePlatformStore } from "@/stores/platformStore";
import { getLinkTemplateCategories, inferPlatformFromTag } from "@/lib/linkTemplates";

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
    <Card className="p-6 md:p-8 rounded-[28px] border-2 border-black bg-white space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl border-2 border-black bg-[#D1FAE5] flex items-center justify-center">
          <Mail className="w-5 h-5 text-black" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-black">Mailing List Integrations</h3>
          <p className="text-sm font-semibold text-black/60">
            Connect free newsletter tools. This creates working links on your public page.
          </p>
        </div>
      </div>

      {providers.length === 0 && (
        <div className="rounded-2xl border-2 border-black bg-[#F8FAFC] p-4">
          <p className="text-sm font-semibold text-black/70">No mailing providers found in your template settings yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleProviderState.map(({ provider, existing }) => {
          const isConnected = Boolean(existing?.enabled);
          const draftValue = urlDrafts[provider.key] ?? existing?.url ?? "";
          const loading = busyKey === provider.key;
          return (
            <div key={provider.key} className="rounded-2xl border-2 border-black p-4 bg-[#F8FAFC] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-black" />
                  <p className="font-black text-black">{provider.label}</p>
                </div>
                {isConnected ? (
                  <Badge className="rounded-full border-2 border-black bg-[#D1FAE5] text-black text-[10px] uppercase tracking-wider font-black">
                    Connected
                  </Badge>
                ) : (
                  <Badge className="rounded-full border-2 border-black bg-[#F1F5F9] text-black/70 text-[10px] uppercase tracking-wider font-black">
                    Not Connected
                  </Badge>
                )}
              </div>

              <Input
                value={draftValue}
                onChange={(e) => setUrlDrafts((prev) => ({ ...prev, [provider.key]: e.target.value }))}
                placeholder={provider.placeholder}
                className="h-11 rounded-xl border-2 border-black"
              />

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleConnect(provider, existing?.id)}
                  disabled={loading}
                  className="rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-black text-[11px] uppercase tracking-wider"
                >
                  {isConnected ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <PlugZap className="w-4 h-4 mr-2" />}
                  {isConnected ? "Update" : "Connect"}
                </Button>
                {existing?.id && (
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(provider.key, existing.id)}
                    disabled={loading}
                    className="rounded-full border-2 border-black font-black text-[11px] uppercase tracking-wider"
                  >
                    <Unplug className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleTest(provider, existing?.url)}
                  className="rounded-full border-2 border-black font-black text-[11px] uppercase tracking-wider"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(provider, existing?.url)}
                  className="rounded-full border-2 border-black font-black text-[11px] uppercase tracking-wider"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              {lastTested[provider.key] && (
                <p className="text-[11px] font-bold text-emerald-700">
                  Last tested: {lastTested[provider.key]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-black/60">
          {connectedProviders.length} connected • {disconnectedProviders.length} not connected
        </p>
        <Button
          variant="outline"
          onClick={() => setShowAllProviders((v) => !v)}
          className="rounded-full border-2 border-black font-black text-[11px] uppercase tracking-wider"
        >
          {showAllProviders ? "Show Connected Only" : "Show All Providers"}
        </Button>
      </div>
    </Card>
  );
};

export default MailingListIntegrations;
