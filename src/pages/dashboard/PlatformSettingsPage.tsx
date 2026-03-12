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
  Users, BarChart3, Eye, EyeOff, Save, Sparkles, Mail, Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DEFAULT_CTA_LABELS,
  DEFAULT_CHECKOUT_STEP_LABELS,
  getCheckoutStepLabels,
  resolveItemCtaLabel,
  resolveCategoryLabel,
  resolveItemTypeLabel,
} from "@/lib/commerceConfig";

const PlatformSettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { settings, loading, fetchSettings, updateSettings } = usePlatformStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [localKey, setLocalKey] = useState("");
  const [checkoutStepLabels, setCheckoutStepLabels] = useState(DEFAULT_CHECKOUT_STEP_LABELS);
  const [ctaOverrides, setCtaOverrides] = useState<Record<string, string>>(DEFAULT_CTA_LABELS);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({});
  const [itemTypeOverrides, setItemTypeOverrides] = useState<Record<string, string>>({});
  const [catalogCategories, setCatalogCategories] = useState<string[]>([]);
  const [catalogItemTypes, setCatalogItemTypes] = useState<string[]>([]);

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
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalKey(settings.ai_api_key || "");
      setCheckoutStepLabels(getCheckoutStepLabels(settings));
      setCtaOverrides(toStringRecord(settings.cta_label_overrides));
      setCategoryOverrides(toStringRecord(settings.category_label_overrides));
      setItemTypeOverrides(toStringRecord(settings.item_type_label_overrides));
    }
  }, [settings]);

  useEffect(() => {
    const fetchCatalogMeta = async () => {
      const { data } = await supabase.from("catalog_items").select("category, item_type").limit(5000);
      const categories = new Set<string>();
      const itemTypes = new Set<string>();
      (data || []).forEach((row: { category?: string | null; item_type?: string | null }) => {
        if (row.category) categories.add(row.category);
        if (row.item_type) itemTypes.add(row.item_type);
      });
      setCatalogCategories(Array.from(categories).sort((a, b) => a.localeCompare(b)));
      setCatalogItemTypes(Array.from(itemTypes).sort((a, b) => a.localeCompare(b)));
    };
    void fetchCatalogMeta();
  }, []);

  if (!user || user.role !== "superadmin") return <Navigate to="/dashboard" replace />;

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
    }
    else toast.error("Failed to save");
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
    "physical_product",
    "digital_product",
    "service_booking",
    "appointment",
    "event_ticket",
    "course",
    "subscription",
    "donation",
    "lead_form",
    "external_link",
    "video",
    "music",
    "service",
    "car",
    "boat",
  ];

  const prettyTypeName = (value: string) =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());

  const editableCategoryKeys = catalogCategories;
  const editableItemTypeKeys = Array.from(new Set([...catalogItemTypes, ...ctaEditableKeys])).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your platform — site identity, features, notifications, and API keys
        </p>
      </div>

      {loading || !settings ? (
        <div className="text-muted-foreground text-sm py-10 text-center">Loading settings...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Site Identity */}
            <Card className="p-5 space-y-4">
              <Label className="text-base font-heading font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Site Identity
              </Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Site Name</Label>
                  <Input
                    value={settings.site_name}
                    onChange={(e) => updateSettings({ site_name: e.target.value })}
                    onBlur={() => handleSaveField({ site_name: settings.site_name })}
                    placeholder="LinkVertex"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Logo URL</Label>
                  <Input
                    value={settings.site_logo_url}
                    onChange={(e) => updateSettings({ site_logo_url: e.target.value })}
                    onBlur={() => handleSaveField({ site_logo_url: settings.site_logo_url })}
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Default Theme</Label>
                  <Input
                    value={settings.default_theme_id}
                    onChange={(e) => updateSettings({ default_theme_id: e.target.value })}
                    onBlur={() => handleSaveField({ default_theme_id: settings.default_theme_id })}
                    placeholder="clean-white"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Registration */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-heading font-semibold">Allow Registration</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    When disabled, no new users can sign up
                  </p>
                </div>
                <Switch
                  checked={settings.allow_registration}
                  onCheckedChange={(v) => handleToggle("allow_registration", v)}
                />
              </div>
            </Card>

            {/* AI API Key */}
            <Card className="p-5 space-y-4">
              <Label className="text-base font-heading font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> AI API Key
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" /> Gemini / OpenAI
                </Badge>
              </Label>
              <p className="text-xs text-muted-foreground">
                Used for AI Theme Creator and AI-powered features. Change anytime.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="sk-... or AIza..."
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSaveField({ ai_api_key: localKey.trim() })}
                  className="gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
              </div>
            </Card>

            {/* Email Notification Settings */}
            <Card className="p-5 space-y-4">
              <Label className="text-base font-heading font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Configure which email alerts you receive and where they're sent
              </p>
              <div className="space-y-4">
                {notificationToggles.map((nt, i) => (
                  <motion.div
                    key={nt.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <nt.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{nt.label}</p>
                          <p className="text-[10px] text-muted-foreground">{nt.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings[nt.key]}
                        onCheckedChange={(v) => handleToggle(nt.key, v)}
                      />
                    </div>
                    {settings[nt.key] && (
                      <Input
                        type="email"
                        value={settings[nt.emailKey] || ""}
                        onChange={(e) => updateSettings({ [nt.emailKey]: e.target.value })}
                        onBlur={() => handleSaveField({ [nt.emailKey]: settings[nt.emailKey] })}
                        placeholder="your@email.com"
                        className="text-sm"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column — Feature Toggles */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <Label className="text-base font-heading font-semibold flex items-center gap-2">
                <ToggleRight className="w-4 h-4 text-primary" /> Feature Toggles
              </Label>
              <p className="text-xs text-muted-foreground">
                Control which features are available to all users on the platform
              </p>
              <div className="space-y-3">
                {featureToggles.map((ft, i) => (
                  <motion.div
                    key={ft.key}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ft.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{ft.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ft.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[ft.key]}
                      onCheckedChange={(v) => handleToggle(ft.key, v)}
                    />
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Status Overview */}
            <Card className="p-5 space-y-3">
              <Label className="text-base font-heading font-semibold">Active Features</Label>
              <div className="flex flex-wrap gap-2">
                {featureToggles.map((ft) => (
                  <Badge
                    key={ft.key}
                    variant={settings[ft.key] ? "default" : "secondary"}
                    className="text-xs gap-1"
                  >
                    {settings[ft.key] ? "✓" : "✗"} {ft.label}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Notification Status */}
            <Card className="p-5 space-y-3">
              <Label className="text-base font-heading font-semibold">Notification Status</Label>
              <div className="flex flex-wrap gap-2">
                {notificationToggles.map((nt) => (
                  <Badge
                    key={nt.key}
                    variant={settings[nt.key] ? "default" : "secondary"}
                    className="text-xs gap-1"
                  >
                    {settings[nt.key] ? "✓" : "✗"} {nt.label}
                    {settings[nt.key] && settings[nt.emailKey] && (
                      <span className="text-[9px] opacity-70 ml-1">→ {settings[nt.emailKey]}</span>
                    )}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Checkout + CTA Configuration */}
            <Card className="p-5 space-y-5">
              <Label className="text-base font-heading font-semibold">Checkout & CTA Labels</Label>
              <p className="text-xs text-muted-foreground">
                Configure checkout step labels and item CTA labels globally. Existing logic stays unchanged.
              </p>

              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Checkout Steps</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(DEFAULT_CHECKOUT_STEP_LABELS) as Array<keyof typeof DEFAULT_CHECKOUT_STEP_LABELS>).map((stepKey) => (
                    <div key={stepKey}>
                      <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{prettyTypeName(stepKey)}</Label>
                      <Input
                        value={checkoutStepLabels[stepKey]}
                        onChange={(e) =>
                          setCheckoutStepLabels((prev) => ({
                            ...prev,
                            [stepKey]: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSaveField({ checkout_step_labels: checkoutStepLabels })}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Step Labels
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">CTA Labels by Item Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {ctaEditableKeys.map((itemTypeKey) => (
                    <div key={itemTypeKey}>
                      <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{prettyTypeName(itemTypeKey)}</Label>
                      <Input
                        value={ctaOverrides[itemTypeKey] ?? ""}
                        onChange={(e) =>
                          setCtaOverrides((prev) => ({
                            ...prev,
                            [itemTypeKey]: e.target.value,
                          }))
                        }
                        placeholder={resolveItemCtaLabel(itemTypeKey, null, prettyTypeName(itemTypeKey))}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSaveField({ cta_label_overrides: sanitizeOverrideRecord(ctaOverrides) })}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save CTA Labels
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Category Filter Labels</Label>
                {editableCategoryKeys.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No catalog categories found yet. Labels will appear here after creators add items.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {editableCategoryKeys.map((categoryKey) => (
                      <div key={categoryKey}>
                        <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{categoryKey}</Label>
                        <Input
                          value={categoryOverrides[categoryKey] ?? ""}
                          onChange={(e) =>
                            setCategoryOverrides((prev) => ({
                              ...prev,
                              [categoryKey]: e.target.value,
                            }))
                          }
                          placeholder={resolveCategoryLabel(categoryKey, null)}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSaveField({ category_label_overrides: sanitizeOverrideRecord(categoryOverrides) })}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Category Labels
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Item Type Filter Labels</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {editableItemTypeKeys.map((itemTypeKey) => (
                    <div key={`type-${itemTypeKey}`}>
                      <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{itemTypeKey}</Label>
                      <Input
                        value={itemTypeOverrides[itemTypeKey] ?? ""}
                        onChange={(e) =>
                          setItemTypeOverrides((prev) => ({
                            ...prev,
                            [itemTypeKey]: e.target.value,
                          }))
                        }
                        placeholder={resolveItemTypeLabel(itemTypeKey, null)}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSaveField({ item_type_label_overrides: sanitizeOverrideRecord(itemTypeOverrides) })}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Item Type Labels
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSettingsPage;
