import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatformStore } from "@/stores/platformStore";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Settings2, Globe, Key, ToggleRight, ShoppingBag, MessageCircle,
  Users, BarChart3, Save, Sparkles, Mail, Bell, Plus, Trash2,
  Activity, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_CTA_LABELS,
  DEFAULT_CHECKOUT_STEP_LABELS,
  getCheckoutStepLabels,
  resolveItemCtaLabel,
  resolveCategoryLabel,
  resolveItemTypeLabel,
} from "@/lib/commerceConfig";
import { parseCatalogCategory } from "@/lib/catalogCategory";
import { readCatalogTaxonomy, writeCatalogTaxonomy, type CatalogTaxonomyCategory } from "@/lib/catalogTaxonomy";
import { Textarea } from "@/components/ui/textarea";
import { isAdminUser } from "@/lib/authRoles";

const PlatformSettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { settings, loading, fetchSettings, updateSettings } = usePlatformStore();
  const [checkoutStepLabels, setCheckoutStepLabels] = useState(DEFAULT_CHECKOUT_STEP_LABELS);
  const [ctaOverrides, setCtaOverrides] = useState<Record<string, string>>(DEFAULT_CTA_LABELS);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [itemTypeOverrides, setItemTypeOverrides] = useState<Record<string, string>>({});
  const [catalogCategories, setCatalogCategories] = useState<string[]>([]);
  const [catalogItemTypes, setCatalogItemTypes] = useState<string[]>([]);
  const [catalogTaxonomy, setCatalogTaxonomy] = useState<CatalogTaxonomyCategory[]>([]);
  const [taxonomyCategoryInput, setTaxonomyCategoryInput] = useState("");
  const [taxonomySubcategoryInputs, setTaxonomySubcategoryInputs] = useState<Record<string, string>>({});

  const toStringRecord = (value: unknown): Record<string, string> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, raw]) => {
      if (typeof raw === "string") acc[key] = raw;
      return acc;
    }, {});
  };

  const sanitizeOverrideRecord = (record: Record<string, string>): Record<string, string> =>
    Object.entries(record).reduce<Record<string, string>>((acc, [key, value]) => {
      const trimmed = value.trim();
      if (trimmed.length > 0) acc[key] = trimmed;
      return acc;
    }, {});

  useEffect(() => {
    fetchSettings(true); // force refresh
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setCheckoutStepLabels(getCheckoutStepLabels(settings));
      setCtaOverrides(toStringRecord(settings.cta_label_overrides));
      setCategoryOverrides(toStringRecord(settings.category_label_overrides));
      setItemTypeOverrides(toStringRecord(settings.item_type_label_overrides));
      setCatalogTaxonomy(readCatalogTaxonomy(settings.demo_catalog_packs));
      setTaxonomyCategoryInput("");
      setTaxonomySubcategoryInputs({});
    }
  }, [settings]);

  useEffect(() => {
    const fetchCatalogMeta = async () => {
      const { data } = await supabase.from("catalog_items").select("category, item_type").limit(5000);
      const categories = new Set<string>();
      const itemTypes = new Set<string>();
      (data || []).forEach((row: { category?: string | null; item_type?: string | null }) => {
        if (row.category) {
          const parsed = parseCatalogCategory(row.category);
          if (parsed.primary) categories.add(parsed.primary);
        }
        if (row.item_type) itemTypes.add(row.item_type);
      });
      setCatalogCategories(Array.from(categories).sort((a, b) => a.localeCompare(b)));
      setCatalogItemTypes(Array.from(itemTypes).sort((a, b) => a.localeCompare(b)));
    };
    void fetchCatalogMeta();
  }, []);

  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;

  const handleToggle = async (key: string, value: boolean) => {
    const ok = await updateSettings({ [key]: value });
    if (ok) toast.success("Setting updated");
    else toast.error("Failed to save");
  };

  const handleSaveField = async (data: Parameters<typeof updateSettings>[0]) => {
    const ok = await updateSettings(data);
    if (ok) {
      await fetchSettings(true);
      toast.success("Saved");
      return true;
    }

    toast.error("Failed to save");
    return false;
  };

  const sortTaxonomy = (value: CatalogTaxonomyCategory[]) =>
    [...value]
      .map((entry) => ({
        name: entry.name.trim(),
        subcategories: Array.from(new Set(entry.subcategories.map((sub) => sub.trim()).filter(Boolean))).sort((a, b) =>
          a.localeCompare(b)
        ),
      }))
      .filter((entry) => entry.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

  const upsertTaxonomyCategory = () => {
    const nextName = taxonomyCategoryInput.trim();
    if (!nextName) return;

    setCatalogTaxonomy((current) => {
      const exists = current.some((entry) => entry.name.toLowerCase() === nextName.toLowerCase());
      if (exists) {
        toast.error("Category already exists");
        return current;
      }

      return sortTaxonomy([...current, { name: nextName, subcategories: [] }]);
    });

    setTaxonomyCategoryInput("");
  };

  const removeTaxonomyCategory = (categoryName: string) => {
    setCatalogTaxonomy((current) => current.filter((entry) => entry.name !== categoryName));
    setTaxonomySubcategoryInputs((current) => {
      const next = { ...current };
      delete next[categoryName];
      return next;
    });
  };

  const addTaxonomySubcategory = (categoryName: string) => {
    const inputValue = (taxonomySubcategoryInputs[categoryName] || "").trim();
    if (!inputValue) return;

    setCatalogTaxonomy((current) =>
      sortTaxonomy(
        current.map((entry) => {
          if (entry.name !== categoryName) return entry;

          const exists = entry.subcategories.some((sub) => sub.toLowerCase() === inputValue.toLowerCase());
          if (exists) return entry;

          return {
            ...entry,
            subcategories: [...entry.subcategories, inputValue],
          };
        })
      )
    );

    setTaxonomySubcategoryInputs((current) => ({
      ...current,
      [categoryName]: "",
    }));
  };

  const removeTaxonomySubcategory = (categoryName: string, subcategoryName: string) => {
    setCatalogTaxonomy((current) =>
      sortTaxonomy(
        current.map((entry) => {
          if (entry.name !== categoryName) return entry;
          return {
            ...entry,
            subcategories: entry.subcategories.filter((sub) => sub !== subcategoryName),
          };
        })
      )
    );
  };

  const saveCatalogTaxonomy = async () => {
    if (!settings) return;

    const payload = writeCatalogTaxonomy(settings.demo_catalog_packs, catalogTaxonomy);
    await handleSaveField({ demo_catalog_packs: payload });
  };

  const featureToggles = [
    { key: "feature_catalog" as const, label: "Catalog / Shop", desc: "Allow users to showcase products & services", icon: ShoppingBag },
    { key: "feature_contact_form" as const, label: "Contact Form", desc: "Show contact form on public profiles", icon: MessageCircle },
    { key: "feature_social_links" as const, label: "Social Links", desc: "Enable social media links section", icon: Users },
    { key: "feature_analytics" as const, label: "Analytics Dashboard", desc: "Show analytics to users", icon: BarChart3 },
  ];

  const notificationToggles = [
    { key: "enable_order_notifications" as const, emailKey: "notify_order_email" as const, label: "Order Alerts", desc: "Get notified when a new order is placed", icon: ShoppingBag },
    { key: "enable_contact_notifications" as const, emailKey: "notify_contact_email" as const, label: "Contact Form", desc: "Get notified on new contact messages", icon: Mail },
    { key: "enable_low_stock_notifications" as const, emailKey: "notify_low_stock_email" as const, label: "Low Stock", desc: "Alert when inventory is running low", icon: Bell },
  ];

  const ctaEditableKeys = [
    "physical_product", "digital_product", "service_booking", "appointment", "event_ticket", "course",
    "subscription", "donation", "lead_form", "external_link", "video", "music", "service", "car", "boat",
  ];

  const prettyTypeName = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());

  const editableCategoryKeys = Array.from(
    new Set([...catalogCategories, ...catalogTaxonomy.map((entry) => entry.name)])
  ).sort((a, b) => a.localeCompare(b));

  const editableItemTypeKeys = Array.from(new Set([...catalogItemTypes, ...ctaEditableKeys])).sort((a, b) => a.localeCompare(b));

  const removeThemePreset = async (themeId: string) => {
    if (!settings) return;
    const current = settings.theme_presets || (settings.demo_catalog_packs as any)?.__ai_themes || [];
    const updated = current.filter((p: any) => p.id !== themeId);
    
    if (current.length === updated.length) {
      toast.error("Theme not found in custom collection");
      return;
    }

    const payload: any = {
      theme_presets: updated,
      demo_catalog_packs: {
        ...(settings.demo_catalog_packs as any || {}),
        __ai_themes: updated
      }
    };

    let ok = await handleSaveField(payload);
    if (!ok) {
        ok = await handleSaveField({ demo_catalog_packs: payload.demo_catalog_packs });
    }
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
            <Settings2 className="w-3.5 h-3.5" />
            Config Core
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-3 text-black">
            System configuration <span className="font-script text-primary text-2xl lowercase opacity-80">node</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] font-medium text-black/50">
            Global orchestration parameters • <span className="text-black font-black uppercase tracking-widest text-[11px] ml-1">Live Environment</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="rounded-full bg-black text-white hover:bg-black/90 px-8 py-6 h-12 text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.05] active:scale-95"
            onClick={() => fetchSettings(true)} 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
            Refresh Node
          </Button>
        </div>
      </div>

      {loading || !settings ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p className="font-medium">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Site Identity */}
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight leading-none">Identity</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">Platform branding nodes</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Site Name</Label>
                  <Input
                    className="h-14 rounded-2xl border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all px-6"
                    value={settings.site_name}
                    onChange={(e) => updateSettings({ site_name: e.target.value })}
                    onBlur={() => handleSaveField({ site_name: settings.site_name })}
                    placeholder="BIOTRA"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Logo Source</Label>
                  <Input
                    className="h-14 rounded-2xl border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all px-6"
                    value={settings.site_logo_url}
                    onChange={(e) => updateSettings({ site_logo_url: e.target.value })}
                    onBlur={() => handleSaveField({ site_logo_url: settings.site_logo_url })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40">Initial Theme ID</Label>
                  <Input
                    className="h-14 rounded-2xl border-black/5 bg-black/[0.02] text-black font-bold focus:bg-white transition-all px-6"
                    value={settings.default_theme_id}
                    onChange={(e) => updateSettings({ default_theme_id: e.target.value })}
                    onBlur={() => handleSaveField({ default_theme_id: settings.default_theme_id })}
                    placeholder="liquid-sunset"
                  />
                </div>
              </div>
            </Card>

            {/* Registration */}
            <Card className="p-8 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-black">Inbound Nodes</h2>
                    <p className="text-[12px] font-medium text-black/40">Control public registration availability</p>
                  </div>
                </div>
                <Switch
                  className="data-[state=checked]:bg-emerald-500"
                  checked={settings.allow_registration}
                  onCheckedChange={(v) => handleToggle("allow_registration", v)}
                />
              </div>
            </Card>

            {/* AI API Key */}
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Intelligence</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">LLM core orchestration credentials</p>
                </div>
              </div>
              <p className="text-[13px] font-medium text-black/60 leading-relaxed">
                Theme generation keys are now managed server-side only. This keeps provider credentials out of the browser and out of publicly-readable config rows.
              </p>
              <div className="rounded-[28px] border border-black/5 bg-black/[0.02] p-6 space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30">Secure By Default</p>
                <p className="text-[13px] font-medium text-black/60 leading-relaxed">
                  Configure `LOVABLE_API_KEY`, `GEMINI_API_KEY`, or other provider secrets in the server or Supabase Edge Function environment instead of this admin UI.
                </p>
              </div>
            </Card>

            {/* Email Notification Settings */}
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Global Alerts</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">Communication channel management</p>
                </div>
              </div>
              <div className="space-y-6">
                {notificationToggles.map((nt) => (
                  <div
                    key={nt.key}
                    className="space-y-4 p-6 rounded-[32px] border border-black/5 bg-black/[0.01] hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-primary">
                          <nt.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-black">{nt.label}</p>
                          <p className="text-[12px] font-medium text-black/40">{nt.desc}</p>
                        </div>
                      </div>
                      <Switch className="data-[state=checked]:bg-emerald-500" checked={settings[nt.key]} onCheckedChange={(v) => handleToggle(nt.key, v)} />
                    </div>
                    {settings[nt.key] && (
                      <Input
                        type="email"
                        value={settings[nt.emailKey] || ""}
                        onChange={(e) => updateSettings({ [nt.emailKey]: e.target.value })}
                        onBlur={() => handleSaveField({ [nt.emailKey]: settings[nt.emailKey] })}
                        placeholder="alert@node.bio"
                        className="h-12 rounded-xl border-black/5 bg-white text-[13px] font-bold px-4"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <ToggleRight className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Feature Switches</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">Platform-wide module orchestration</p>
                </div>
              </div>
              <div className="grid gap-4">
                {featureToggles.map((ft) => (
                  <div
                    key={ft.key}
                    className="flex items-center justify-between p-6 rounded-[32px] border border-black/5 bg-black/[0.01] hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        <ft.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-black">{ft.label}</p>
                        <p className="text-[12px] font-medium text-black/40">{ft.desc}</p>
                      </div>
                    </div>
                    <Switch className="data-[state=checked]:bg-emerald-500" checked={settings[ft.key]} onCheckedChange={(v) => handleToggle(ft.key, v)} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Catalog Labels */}
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Commerce Experience</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">Global transaction and CTA labels</p>
                </div>
              </div>
              
              <div className="space-y-10">
                 <div className="space-y-6">
                   <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Checkout Steps</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {(Object.keys(DEFAULT_CHECKOUT_STEP_LABELS) as Array<keyof typeof DEFAULT_CHECKOUT_STEP_LABELS>).map((stepKey) => (
                       <div key={stepKey} className="space-y-2">
                         <Label className="text-[10px] uppercase font-black text-black/20 tracking-widest">{prettyTypeName(stepKey)}</Label>
                         <Input 
                           value={checkoutStepLabels[stepKey]} 
                           onChange={(e) => setCheckoutStepLabels(prev => ({ ...prev, [stepKey]: e.target.value }))} 
                           className="h-12 rounded-xl border-black/5 bg-black/[0.02] text-[13px] font-bold px-4 focus:bg-white transition-all" 
                         />
                       </div>
                     ))}
                   </div>
                   <Button 
                    onClick={() => handleSaveField({ checkout_step_labels: checkoutStepLabels })}
                    className="w-full h-12 rounded-xl bg-black text-white hover:bg-black/90 font-black uppercase tracking-widest text-[11px]"
                   >
                     Update Workflow Labels
                   </Button>
                 </div>

                 <div className="pt-10 border-t border-black/5">
                   <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Action Labels (CTA)</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 mt-6 scrollbar-hide">
                     {ctaEditableKeys.map(key => (
                       <div key={key} className="space-y-2 p-4 rounded-2xl bg-black/[0.01] border border-black/5">
                         <Label className="text-[10px] uppercase font-black text-black/20 tracking-widest">{prettyTypeName(key)}</Label>
                         <Input 
                           value={ctaOverrides[key] ?? ""} 
                           onChange={(e) => setCtaOverrides(prev => ({ ...prev, [key]: e.target.value }))} 
                           placeholder={resolveItemCtaLabel(key, null, prettyTypeName(key))} 
                           className="h-10 rounded-lg border-black/5 bg-white text-[12px] font-bold px-3" 
                         />
                       </div>
                     ))}
                   </div>
                   <Button 
                    className="mt-8 w-full h-12 rounded-xl bg-black text-white hover:bg-black/90 font-black uppercase tracking-widest text-[11px]" 
                    onClick={() => handleSaveField({ cta_label_overrides: sanitizeOverrideRecord(ctaOverrides) })}
                   >
                     Deploy CTA Overrides
                   </Button>
                 </div>
              </div>
            </Card>

            {/* Taxonomy Structure */}
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Commerce Taxonomy</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">Hierarchical catalog classification</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Input 
                    value={taxonomyCategoryInput} 
                    onChange={(e) => setTaxonomyCategoryInput(e.target.value)} 
                    placeholder="New category name..." 
                    className="h-14 rounded-2xl border-black/5 bg-black/[0.02] text-[13px] font-bold px-6 focus:bg-white transition-all shadow-inner"
                    onKeyDown={e => e.key === "Enter" && upsertTaxonomyCategory()} 
                  />
                  <Button onClick={upsertTaxonomyCategory} className="shrink-0 w-14 h-14 rounded-2xl bg-black text-white hover:bg-black/90 shadow-lg"><Plus className="w-6 h-6" /></Button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                  {catalogTaxonomy.map(entry => (
                    <div key={entry.name} className="p-6 rounded-[32px] border border-black/5 bg-black/[0.01] space-y-6 hover:bg-white transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-black text-black uppercase tracking-widest">{entry.name}</p>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-black/20 hover:text-destructive hover:bg-rose-50" onClick={() => removeTaxonomyCategory(entry.name)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {entry.subcategories.map(sub => (
                          <Badge key={sub} variant="secondary" className="pl-4 pr-1.5 py-1.5 text-[11px] font-black uppercase tracking-wider gap-2 bg-black/5 text-black/60 border-none rounded-full group">
                            {sub}
                            <button onClick={() => removeTaxonomySubcategory(entry.name, sub)} className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-2.5 h-2.5" /></button>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Input 
                          value={taxonomySubcategoryInputs[entry.name] || ""} 
                          onChange={e => setTaxonomySubcategoryInputs(p => ({ ...p, [entry.name]: e.target.value }))} 
                          placeholder="Inject subcategory..." 
                          className="h-11 rounded-xl border-black/5 bg-white text-[12px] font-bold px-4" 
                          onKeyDown={e => e.key === "Enter" && addTaxonomySubcategory(entry.name)} 
                        />
                        <Button variant="outline" size="sm" onClick={() => addTaxonomySubcategory(entry.name)} className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border-black/10 hover:bg-black/5">Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full h-14 rounded-2xl bg-primary text-white hover:opacity-90 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20" onClick={saveCatalogTaxonomy}>
                   Publish Global Taxonomy
                </Button>
              </div>
            </Card>

            {/* AI Themes Management */}
            <Card className="p-10 rounded-[40px] border-black/5 bg-white shadow-2xl shadow-black/[0.02] space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Intelligence Bank</h2>
                  <p className="text-[12px] font-medium text-black/40 mt-1">Managed AI-generated visual presets</p>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {((settings?.theme_presets || (settings?.demo_catalog_packs as any)?.__ai_themes) || []).length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-black/5 rounded-[32px] bg-black/[0.01]">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/20">Knowledge Bank Empty</p>
                  </div>
                ) : (
                  ((settings?.theme_presets || (settings?.demo_catalog_packs as any)?.__ai_themes) || []).map((theme: any) => (
                    <div key={theme.id} className="group flex items-center justify-between p-5 rounded-3xl border border-black/5 bg-black/[0.01] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl border-4 border-white shadow-lg overflow-hidden group-hover:rotate-6 transition-transform" style={{ backgroundColor: theme.backgroundColor }} />
                        <div>
                          <p className="text-[15px] font-black text-black">{theme.name}</p>
                          <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">{theme.category}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-black/20 hover:text-destructive hover:bg-rose-50"
                        onClick={() => removeThemePreset(theme.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSettingsPage;
