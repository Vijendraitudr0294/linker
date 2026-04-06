import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Link2,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  MapPin,
  Instagram,
  Download,
  Plus,
  BarChart3,
  Settings,
  Globe,
  Palette,
  Eye,
  Smartphone,
  Check,
  Copy,
  Trash2,
  Share2,
  Sparkles,
  Percent,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useQRCodes, useQRForgeMutations } from "@/hooks/useQRForgeApi";
import { useAuthStore } from "@/stores/authStore";
import { type QRCodeItem } from "@/types/qrforge";
import { Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type QRType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "location" | "instagram" | "apps" | "vcard_plus" | "coupon" | "social_links" | "feedback";

const qrTypes: { value: QRType; label: string; icon: any; placeholder: string }[] = [
  { value: "url", label: "Website URL", icon: Link2, placeholder: "https://example.com" },
  { value: "text", label: "Plain Text", icon: FileText, placeholder: "Enter your text here..." },
  { value: "email", label: "Email", icon: Mail, placeholder: "email@example.com" },
  { value: "phone", label: "Phone", icon: Phone, placeholder: "+1234567890" },
  { value: "sms", label: "SMS", icon: MessageSquare, placeholder: "Message content..." },
  { value: "wifi", label: "WiFi", icon: Wifi, placeholder: "Network Name" },
  { value: "vcard", label: "vCard (Static)", icon: Contact, placeholder: "Contact Name" },
  { value: "vcard_plus", label: "vCard Plus", icon: Contact, placeholder: "Business profile landing" },
  { value: "location", label: "Location", icon: MapPin, placeholder: "Latitude, Longitude" },
  { value: "instagram", label: "Instagram", icon: Instagram, placeholder: "@username" },
  { value: "apps", label: "Smart Link / App Install", icon: Smartphone, placeholder: "OS-aware deep linking" },
  { value: "coupon", label: "Coupon Offer", icon: Percent, placeholder: "Promo voucher configs" },
  { value: "social_links", label: "Social Link Bundle", icon: Share2, placeholder: "Bundle links neatly" },
  { value: "feedback", label: "Feedback Form", icon: MessageSquare, placeholder: "Gather ratings easily" },
];

// Mock removed

const QRForgePage = () => {
  const user = useAuthStore((s) => s.user);
  const { data: qrs = [], isLoading: loading } = useQRCodes(user?.id);
  const { addQRCode, deleteQRCode, clearAllQRCodes } = useQRForgeMutations(user?.id);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedType, setSelectedType] = useState<QRType>("url");
  const [qrContent, setQrContent] = useState("");
  const [qrName, setQrName] = useState("");
  const [isDynamic, setIsDynamic] = useState(true);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(25);
  const [saving, setSaving] = useState(false);

  // Apps Landing States
  const [appName, setAppName] = useState("");
  const [appSubtitle, setAppSubtitle] = useState("");
  const [googlePlayUrl, setGooglePlayUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [appIconUrl, setAppIconUrl] = useState("");
  const [webUrl, setWebUrl] = useState("");

  // vCard Plus States
  const [vCardFirstName, setVCardFirstName] = useState("");
  const [vCardLastName, setVCardLastName] = useState("");
  const [vCardOrg, setVCardOrg] = useState("");
  const [vCardTitle, setVCardTitle] = useState("");
  const [vCardEmail, setVCardEmail] = useState("");
  const [vCardPhone, setVCardPhone] = useState("");
  const [vCardWebsite, setVCardWebsite] = useState("");

  // Coupon States
  const [couponOffer, setCouponOffer] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStore, setCouponStore] = useState("");
  const [couponExpiry, setCouponExpiry] = useState("");

  // Bulk States
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Social Links States
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");

  // Feedback States
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackDesc, setFeedbackDesc] = useState("");

  const mockAnalyticsData = [
    { day: "Mon", scans: 24 },
    { day: "Tue", scans: 35 },
    { day: "Wed", scans: 18 },
    { day: "Thu", scans: 42 },
    { day: "Fri", scans: 38 },
    { day: "Sat", scans: 55 },
    { day: "Sun", scans: 48 },
  ];

  const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b"];

  const handleDownload = (elementId: string = "qr-preview", name: string = "qrforge") => {
    const svg = document.getElementById(elementId);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx?.drawImage(img, 0, 0);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.png`;
      a.click();
      toast.success("QR Code downloaded successfully!");
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handleEdit = (qr: QRCodeItem) => {
     setQrName(qr.name);
     setSelectedType(qr.type);
     setIsDynamic(qr.mode === "dynamic");
     setFgColor(qr.fg_color);
     setBgColor(qr.bg_color);
     setLogoUrl(qr.logo_url || "");
     
     // Parse content based on type
     if (["apps", "vcard_plus", "coupon", "social_links", "feedback"].includes(qr.type)) {
        try {
           const data = JSON.parse(qr.content);
           if (qr.type === "apps") {
              setAppName(data.appName || "");
              setAppSubtitle(data.appSubtitle || "");
              setAppIconUrl(data.appIconUrl || "");
              setGooglePlayUrl(data.googlePlayUrl || "");
              setAppStoreUrl(data.appStoreUrl || "");
              setWebUrl(data.webUrl || "");
           } else if (qr.type === "vcard_plus") {
              setVCardFirstName(data.vCardFirstName || "");
              setVCardLastName(data.vCardLastName || "");
              setVCardOrg(data.vCardOrg || "");
              setVCardTitle(data.vCardTitle || "");
              setVCardPhone(data.vCardPhone || "");
              setVCardEmail(data.vCardEmail || "");
              setVCardWebsite(data.vCardWebsite || "");
           } else if (qr.type === "coupon") {
              setCouponOffer(data.couponOffer || "");
              setCouponCode(data.couponCode || "");
              setCouponStore(data.couponStore || "");
              setCouponExpiry(data.couponExpiry || "");
           } else if (qr.type === "social_links") {
              setSocialInstagram(data.socialInstagram || "");
              setSocialFacebook(data.socialFacebook || "");
              setSocialYoutube(data.socialYoutube || "");
              setSocialTiktok(data.socialTiktok || "");
           } else if (qr.type === "feedback") {
              setFeedbackTitle(data.feedbackTitle || "");
              setFeedbackDesc(data.feedbackDesc || "");
           }
        } catch(e) {}
     } else {
        setQrContent(qr.content);
     }
     
     // Store the ID of the QR being edited
     setEditingId(qr.id);
     
     // Switch to builder tab
     setActiveTab("builder");
     toast.info("Switched to Builder. You can now modify and save changes.");
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleListDownload = (qr: QRCodeItem) => {
      // Find the SVG element in the list row
      const tempId = `qr-list-svg-${qr.id}`;
      handleDownload(tempId, qr.name);
  };

  const handleListShare = async (qr: QRCodeItem) => {
     const link = qr.mode === "dynamic" && qr.short_code ? `${window.location.origin}/r/${qr.short_code}` : qr.content;
     
     if (navigator.share) {
         try {
             await navigator.share({
                 title: `QR Code: ${qr.name}`,
                 url: link
             });
             return;
         } catch(e) {
             console.log("Native share cancelled or failed");
         }
     }
     
     try {
       await navigator.clipboard.writeText(link);
       toast.success("Link copied to clipboard!");
     } catch (e) {
       toast.error("Failed to copy link");
     }
  };

  const currentType = qrTypes.find((t) => t.value === selectedType);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10 selection:bg-primary selection:text-white px-4 md:px-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Matrix active • Core Sync</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground flex items-baseline gap-2">
            QR <span className="font-script text-primary text-xl font-medium lowercase opacity-80">intelligence.</span>
          </h1>
        </div>
        <Button onClick={() => { setActiveTab("builder"); setQrContent(""); setQrName(""); }} className="bg-primary hover:bg-foreground hover:text-background text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-primary/10 transition-all duration-300 active:scale-95 border-none text-[12px] uppercase tracking-widest">
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 p-1 rounded-2xl mb-8 overflow-x-auto no-scrollbar scrollbar-hide flex w-full md:w-fit border border-white/5 backdrop-blur-3xl shadow-sm">
          <TabsTrigger value="dashboard" className="rounded-xl px-5 py-2 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
            <Globe className="w-3.5 h-3.5 mr-1.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="builder" className="rounded-xl px-5 py-2 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
            <Palette className="w-3.5 h-3.5 mr-1.5" /> Builder
          </TabsTrigger>
          <TabsTrigger value="bulk" className="rounded-xl px-5 py-2 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Bulk
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-5 py-2 text-[11px] font-bold text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-500">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Insights
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total QR Codes", value: String(qrs.length), icon: QrCode },
              { label: "Total Scans", value: String(qrs.reduce((sum, q) => sum + (q.scans_count || 0), 0)), icon: Eye },
              { label: "Total Saved", value: "$0.00", icon: Check },
            ].map((stat) => (
              <Card key={stat.label} className="p-6 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Your Codes</h3>
              {qrs.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={async () => { if(confirm("Are you sure you want to delete ALL QR codes?")) { await clearAllQRCodes.mutateAsync(); toast.success("All codes deleted!"); } }} className="text-destructive h-8 text-xs hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete All
                 </Button>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {loading && (
                <div className="p-8 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading codes...
                </div>
              )}
              {!loading && qrs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No QR codes found. Create your first one.
                </div>
              )}
              {qrs.map((qr) => (
                <div key={qr.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-white/10">
                      <QRCodeSVG 
                        value={qr.mode === "dynamic" ? `${window.location.origin}/r/${qr.short_code}` : qr.content} 
                        size={40} 
                        fgColor={qr.fg_color} 
                        bgColor={qr.bg_color} 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        {qr.name}
                        {qr.mode === "dynamic" ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px] px-2 h-5 font-bold">Dynamic</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-400 border-0 text-[10px] px-2 h-5 font-bold">Static</Badge>
                        )}
                      </h4>
                      <p className="text-[11px] font-medium text-muted-foreground truncate max-w-[250px] mt-0.5">
                          {qr.mode === "dynamic" && qr.short_code ? (
                              <span className="text-primary tracking-wide">{`${window.location.origin}/r/${qr.short_code}`}</span>
                          ) : qr.type === "apps" 
                            ? (() => { try { return `Apps: ${JSON.parse(qr.content).appName}`; } catch (e) { return "Apps Landing"; } })() 
                            : qr.type === "vcard_plus"
                            ? (() => { try { const data = JSON.parse(qr.content); return `vCard: ${data.vCardFirstName || ""} ${data.vCardLastName || ""}`; } catch (e) { return "vCard Plus"; } })() 
                            : qr.type === "coupon"
                            ? (() => { try { const data = JSON.parse(qr.content); return `Coupon: ${data.couponOffer || "Offer"} at ${data.couponStore || "Store"}`; } catch (e) { return "Coupon"; } })() 
                            : qr.type === "social_links"
                            ? "Social Links Bundle"
                            : qr.type === "feedback"
                            ? (() => { try { const data = JSON.parse(qr.content); return `Feedback: ${data.feedbackTitle || "Form"}`; } catch (e) { return "Feedback Form"; } })()
                            : qr.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-black">{qr.scans_count || 0}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Scans</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(qr)} title="Edit QR Content"><Palette className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { const link = qr.mode === "dynamic" ? `${window.location.origin}/r/${qr.short_code}` : qr.content; window.open(link, '_blank'); }} title="Preview / View"><ExternalLink className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleListDownload(qr)} title="Download PNG"><Download className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleListShare(qr)} title="Copy Short Link"><Share2 className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { deleteQRCode.mutateAsync(qr.id); toast.success("QR Code deleted"); }} title="Delete Forever"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Creator Accordions */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> 1. Select QR Type
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {qrTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                         setSelectedType(type.value);
                         if (type.value === "apps" || type.value === "vcard_plus" || type.value === "coupon" || type.value === "social_links" || type.value === "feedback") setIsDynamic(true);
                      }}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-102",
                        selectedType === type.value
                          ? "border-primary bg-primary/10 shadow-lg text-primary"
                          : "border-white/5 bg-background/40 hover:bg-background/60"
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold tracking-tight">{type.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> 2. Content Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Code Name</Label>
                    <Input value={qrName} onChange={(e) => setQrName(e.target.value)} placeholder="e.g. Summer Sale 2026" className="rounded-xl h-11 border-white/10" />
                  </div>
                  {selectedType === "apps" ? (
                    <div className="space-y-3 mt-1">
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">App Name</Label>
                        <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="e.g. Mindful Comfort" className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Subtitle</Label>
                        <Input value={appSubtitle} onChange={(e) => setAppSubtitle(e.target.value)} placeholder="Mental Health Support App" className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">App Icon URL</Label>
                        <Input value={appIconUrl} onChange={(e) => setAppIconUrl(e.target.value)} placeholder="https://example.com/icon.png" className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Google Play URL</Label>
                        <Input value={googlePlayUrl} onChange={(e) => setGooglePlayUrl(e.target.value)} placeholder="https://play.google.com/..." className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">App Store URL (iOS)</Label>
                        <Input value={appStoreUrl} onChange={(e) => setAppStoreUrl(e.target.value)} placeholder="https://apps.apple.com/..." className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-primary" /> Web Fallback URL (Optional)
                        </Label>
                        <Input value={webUrl} onChange={(e) => setWebUrl(e.target.value)} placeholder="https://myapp.com/welcome" className="rounded-xl h-11 border-white/10" />
                        <p className="text-[10px] text-muted-foreground mt-1">Users on desktop will be sent here automatically.</p>
                      </div>
                    </div>
                  ) : selectedType === "vcard_plus" ? (
                    <div className="space-y-3 mt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">First Name</Label>
                          <Input value={vCardFirstName} onChange={(e) => setVCardFirstName(e.target.value)} placeholder="John" className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Last Name</Label>
                          <Input value={vCardLastName} onChange={(e) => setVCardLastName(e.target.value)} placeholder="Doe" className="rounded-xl h-11 border-white/10" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Company / Organization</Label>
                        <Input value={vCardOrg} onChange={(e) => setVCardOrg(e.target.value)} placeholder="BIOTRA Inc." className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Job Title</Label>
                        <Input value={vCardTitle} onChange={(e) => setVCardTitle(e.target.value)} placeholder="Product Designer" className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Email</Label>
                        <Input value={vCardEmail} onChange={(e) => setVCardEmail(e.target.value)} placeholder="john@example.com" className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Phone</Label>
                        <Input value={vCardPhone} onChange={(e) => setVCardPhone(e.target.value)} placeholder="+1 234 567 890" className="rounded-xl h-11 border-white/10" />
                      </div>
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Website</Label>
                        <Input value={vCardWebsite} onChange={(e) => setVCardWebsite(e.target.value)} placeholder="https://example.com" className="rounded-xl h-11 border-white/10" />
                      </div>
                    </div>
                  ) : selectedType === "coupon" ? (
                    <div className="space-y-3 mt-1">
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Offer Discount</Label>
                          <Input value={couponOffer} onChange={(e) => setCouponOffer(e.target.value)} placeholder="e.g. 50% OFF" className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Voucher Code</Label>
                          <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="SUMMER50" className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Store / Brand Name</Label>
                          <Input value={couponStore} onChange={(e) => setCouponStore(e.target.value)} placeholder="My Awesome Store" className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Expiry Info</Label>
                          <Input value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} placeholder="Ends Dec 31, 2026" className="rounded-xl h-11 border-white/10" />
                        </div>
                    </div>
                  ) : selectedType === "social_links" ? (
                    <div className="space-y-3 mt-1">
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Instagram URL</Label>
                          <Input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Facebook URL</Label>
                          <Input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">YouTube Channel</Label>
                          <Input value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://youtube.com/..." className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">TikTok URL</Label>
                          <Input value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/@..." className="rounded-xl h-11 border-white/10" />
                        </div>
                    </div>
                  ) : selectedType === "feedback" ? (
                    <div className="space-y-3 mt-1">
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Feedback Title</Label>
                          <Input value={feedbackTitle} onChange={(e) => setFeedbackTitle(e.target.value)} placeholder="e.g. Rate your experience" className="rounded-xl h-11 border-white/10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Short Description</Label>
                          <Input value={feedbackDesc} onChange={(e) => setFeedbackDesc(e.target.value)} placeholder="e.g. Leave us a comment" className="rounded-xl h-11 border-white/10" />
                        </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-bold uppercase text-muted-foreground">{currentType?.label} Destination</Label>
                      <Input value={qrContent} onChange={(e) => setQrContent(e.target.value)} placeholder={currentType?.placeholder} className="rounded-xl h-11 border-white/10" />
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5 mt-4">
                    <div>
                      <h4 className="text-sm font-bold">Enable Dynamic Features</h4>
                      <p className="text-[11px] text-muted-foreground">Allows full analytics tracking and editing after printing.</p>
                    </div>
                     <button 
                        onClick={() => (selectedType !== "apps" && selectedType !== "vcard_plus" && selectedType !== "coupon" && selectedType !== "social_links" && selectedType !== "feedback") && setIsDynamic(!isDynamic)} 
                        disabled={selectedType === "apps" || selectedType === "vcard_plus" || selectedType === "coupon" || selectedType === "social_links" || selectedType === "feedback"}
                        className={cn("w-10 h-5 rounded-full transition-colors relative", isDynamic ? "bg-primary" : "bg-muted", (selectedType === "apps" || selectedType === "vcard_plus" || selectedType === "coupon" || selectedType === "social_links" || selectedType === "feedback") && "opacity-50 cursor-not-allowed")}
                     >
                       <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform", isDynamic ? "left-[22px]" : "left-0.5")} />
                     </button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" /> 3. Style & Customization
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Foreground Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: fgColor }} />
                      <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="rounded-xl h-9 text-xs" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Background Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: bgColor }} />
                      <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="rounded-xl h-9 text-xs" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Embed Logo URL (Optional)</Label>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="rounded-xl h-11 border-white/10 mt-1" />
                </div>
              </Card>
            </div>

            {/* Right Column: Live Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="p-6 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Preview</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-white/10 shadow-2xl flex items-center justify-center">
                    <QRCodeSVG
                      id="qr-preview"
                      value={
                          selectedType === "apps" 
                             ? "https://BIOTRA.com/r/SAMPLE_CODE" 
                             : (qrContent || "QR Matrix")
                        }
                      size={200}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      imageSettings={
                        logoUrl
                          ? {
                              src: logoUrl,
                              x: undefined,
                              y: undefined,
                              height: logoSize,
                              width: logoSize,
                              excavate: true,
                            }
                          : undefined
                      }
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <h4 className="font-black text-sm">{qrName || "Untitled QR"}</h4>
                    <p className="text-xs text-muted-foreground truncate px-4">
                        {selectedType === "apps" 
                           ? `App: ${appName || "Not Configured"}` 
                           : selectedType === "vcard_plus"
                           ? `Contact: ${vCardFirstName || ""} ${vCardLastName || ""}`
                           : selectedType === "coupon"
                           ? `Coupon: ${couponOffer || "Offer"} at ${couponStore || "Store"}`
                           : selectedType === "social_links"
                           ? `Social Bundle: Active Links`
                           : selectedType === "feedback"
                           ? `Feedback: ${feedbackTitle || "Form"}`
                           : (qrContent || "No destination setup")}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {isDynamic ? (
                        <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px] px-2 h-5 font-bold">Dynamic</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-400 border-0 text-[10px] px-2 h-5 font-bold">Static</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full pt-2">
                    <Button variant="outline" onClick={() => handleDownload("qr-preview", qrName || "qrforge")} className="h-10 rounded-xl border-white/10 text-xs font-bold">
                      <Download className="w-3.5 h-3.5 mr-2" /> PNG
                    </Button>
                    <Button 
                      disabled={saving || (selectedType === "apps" ? !appName.trim() : selectedType === "vcard_plus" ? !vCardFirstName.trim() : selectedType === "coupon" ? !couponCode.trim() : selectedType === "social_links" ? !socialInstagram.trim() : selectedType === "feedback" ? !feedbackTitle.trim() : !qrContent.trim())} 
                      onClick={async () => {
                        if (!qrName.trim()) { toast.error("Please enter a QR name"); return; }
                        setSaving(true);
                        try {
                          
                          let finalContent = qrContent;
                          if (selectedType === "apps") {
                             finalContent = JSON.stringify({
                                appName,
                                appSubtitle,
                                appIconUrl,
                                googlePlayUrl,
                                appStoreUrl,
                                webUrl
                             });
                          } else if (selectedType === "vcard_plus") {
                             finalContent = JSON.stringify({
                                vCardFirstName,
                                vCardLastName,
                                vCardOrg,
                                vCardTitle,
                                vCardEmail,
                                vCardPhone,
                                vCardWebsite
                             });
                          } else if (selectedType === "coupon") {
                             finalContent = JSON.stringify({
                                couponOffer,
                                couponCode,
                                couponStore,
                                couponExpiry
                             });
                          } else if (selectedType === "social_links") {
                             finalContent = JSON.stringify({
                                socialInstagram,
                                socialFacebook,
                                socialYoutube,
                                socialTiktok
                             });
                          } else if (selectedType === "feedback") {
                             finalContent = JSON.stringify({
                                feedbackTitle,
                                feedbackDesc
                             });
                          }

                          if (editingId) {
                              // UPDATE FLOW
                              await (supabase.from('qr_codes') as any).update({
                                name: qrName,
                                type: selectedType,
                                mode: isDynamic ? "dynamic" : "static",
                                content: finalContent,
                                fg_color: fgColor,
                                bg_color: bgColor,
                                logo_url: logoUrl || null
                              }).eq('id', editingId);
                              
                              toast.success("QR Code updated successfully!");
                              setEditingId(null);
                          } else {
                              // CREATE FLOW
                              await addQRCode.mutateAsync({
                                name: qrName,
                                type: selectedType,
                                mode: isDynamic ? "dynamic" : "static",
                                content: finalContent,
                                fg_color: fgColor,
                                bg_color: bgColor,
                                logo_url: logoUrl || null,
                                is_active: true,
                                short_code: null
                              });
                              toast.success("QR Code created successfully!");
                          }
                           
                           // Reset UI if it was a new creation or if finished editing
                           setQrContent("");
                           setQrName("");
                           setAppName("");
                           setAppSubtitle("");
                           setAppIconUrl("");
                           setGooglePlayUrl("");
                           setAppStoreUrl("");
                           setWebUrl("");
                           setVCardFirstName("");
                           setVCardLastName("");
                           setVCardOrg("");
                           setVCardTitle("");
                           setVCardPhone("");
                           setVCardEmail("");
                           setVCardWebsite("");
                           setCouponOffer("");
                           setCouponCode("");
                           setCouponStore("");
                           setCouponExpiry("");
                           setSocialInstagram("");
                           setSocialFacebook("");
                           setSocialYoutube("");
                           setSocialTiktok("");
                           setFeedbackTitle("");
                           setFeedbackDesc("");
                           setLogoUrl("");

                           // Return to dashboard
                           setActiveTab("dashboard");
                        } catch (e: any) {
                          toast.error(e.message || "Something went wrong");
                        } finally {
                          setSaving(false);
                        }
                      }} 
                      className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : editingId ? <Check className="w-3.5 h-3.5 mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
                      {saving ? "Saving..." : editingId ? "Update Code" : "Create QR"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Bulk Generator Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card className="p-8 bg-background/20 backdrop-blur-md border border-white/5 rounded-[2rem] space-y-6">
             <div className="text-center max-w-xl mx-auto space-y-2">
                 <h3 className="text-xl font-black">Bulk QR Code Generator</h3>
                 <p className="text-sm text-muted-foreground">Upload a `.csv` list with columns for `Name` and `URL` to batch-create up to 500 codes immediately.</p>
             </div>

             <div className="border-2 border-dashed border-white/5 rounded-2xl p-12 text-center hover:border-primary/40 transition-colors cursor-pointer space-y-4 bg-white/[0.02] relative">
                <input 
                   type="file" 
                   accept=".csv" 
                   className="absolute inset-0 opacity-0 cursor-pointer" 
                   disabled={isProcessingBulk}
                   onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                           if (!file.name.endsWith(".csv")) {
                               toast.error("Please upload a valid CSV file");
                               return;
                           }
                           setBulkFile(file);
                           toast.success(`Loaded: ${file.name}`);
                       }
                   }} 
                />
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Download className="w-8 h-8 text-primary rotate-180" />
                </div>
                <div>
                   <p className="font-bold text-sm">{bulkFile ? `Loaded: ${bulkFile.name}` : "Drag and drop your template file here"}</p>
                   <p className="text-xs text-muted-foreground mt-1">or click to browse from device (CSV files only)</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-background/40">
                     <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">1. Required Columns</h4>
                     <div className="flex gap-2">
                         <Badge className="bg-white/5 border-white/10 text-white rounded-lg px-2 h-6">`name`</Badge>
                         <Badge className="bg-white/5 border-white/10 text-white rounded-lg px-2 h-6">`url` or `content`</Badge>
                     </div>
                     <p className="text-[11px] text-muted-foreground mt-2">Static mode is assumed. Upload standard valid links.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-background/40">
                     <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">2. Batch Defaults</h4>
                     <p className="text-xs text-muted-foreground mt-1">Codes will use dashboard standard black/white layouts safely configurations.</p>
                  </div>
             </div>

             <Button 
               disabled={!bulkFile || isProcessingBulk} 
               onClick={async () => {
                   if (!bulkFile) return;
                   setIsProcessingBulk(true);
                   const reader = new FileReader();
                   reader.onload = async (event) => {
                       const text = event.target?.result as string;
                       const rows = text.split("\n").filter(r => r.trim());
                       if (rows.length <= 1) {
                           toast.error("No data rows found in CSV");
                           setIsProcessingBulk(false);
                           return;
                       }

                       // Simple CSV Parser
                       const headers = rows[0].split(",");
                       const nameIndex = headers.findIndex(h => h.toLowerCase().trim() === "name");
                       const contentIndex = headers.findIndex(h => h.toLowerCase().trim() === "url") || headers.findIndex(h => h.toLowerCase().trim() === "content");

                       if (nameIndex === -1 || contentIndex === -1) {
                           toast.error("CSV must contain 'Name' and 'URL' or 'Content' columns");
                           setIsProcessingBulk(false);
                           return;
                       }

                       let successCount = 0;
                       for (let i = 1; i < rows.length; i++) {
                           const cols = rows[i].split(",");
                           if (cols.length <= Math.max(nameIndex, contentIndex)) continue;
                           const name = cols[nameIndex].trim().replace(/^"|"$/g, '');
                           const content = cols[contentIndex].trim().replace(/^"|"$/g, '');

                           if (!name || !content) continue;

                           try {
                               await addQRCode.mutateAsync({
                                   name,
                                   type: "url",
                                   mode: "static",
                                   content,
                                   fg_color: "#000000",
                                   bg_color: "#ffffff",
                                   logo_url: null,
                                   is_active: true,
                                   short_code: null
                               });
                               successCount++;
                           } catch (e) {
                               console.error("Bulk Item Fail:", e);
                           }
                       }
                       toast.success(`Bulk Generated ${successCount} QR codes successfully!`);
                       setIsProcessingBulk(false);
                       setBulkFile(null);
                       setTimeout(() => setActiveTab("dashboard"), 1000);
                   };
                   reader.readAsText(bulkFile);
               }}
               className="w-full bg-primary text-white font-bold h-12 rounded-xl mt-4"
             >
                  {isProcessingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} 
                  {isProcessingBulk ? "Processing Batch..." : "Generate Bulk Batch"}
             </Button>
          </Card>
        </TabsContent>

        {/* Analytics Tab (Simulation) */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm">Scans Over Time</h4>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockAnalyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", fontSize: "11px" }} />
                        <Area type="monotone" dataKey="scans" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-background/20 backdrop-blur-md border border-white/5 rounded-2xl space-y-4">
               <h4 className="font-bold text-sm">Device Distribution</h4>
               <div className="space-y-3 pt-2">
                   {[
                       { label: "Mobile", value: 65, color: "bg-purple-500" },
                       { label: "Desktop", value: 28, color: "bg-blue-500" },
                       { label: "Tablet", value: 7, color: "bg-green-500" },
                   ].map((item) => (
                       <div key={item.label} className="space-y-1">
                           <div className="flex items-center justify-between text-xs font-bold">
                               <span>{item.label}</span>
                               <span className="text-muted-foreground">{item.value}%</span>
                           </div>
                           <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                               <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                           </div>
                       </div>
                   ))}
               </div>
            </Card>
          </div>

          <Card className="p-12 text-center rounded-[2rem] border-dashed border-2 border-white/5 bg-background/20 backdrop-blur-md space-y-4">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl mx-auto flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-black">Analytical Locations Node</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Scan history, location tracking, and deep audience breakdown require upgrading to a Pro account to accurately mapping triggers and layout parameters.
            </p>
            <Button className="rounded-xl h-11 px-6 bg-primary font-bold text-white shadow-lg">Upgrade to Pro</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRForgePage;
