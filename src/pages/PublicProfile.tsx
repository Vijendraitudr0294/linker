import { useState, useEffect, useMemo, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { SocialIcon, isEmbedPlatform } from "@/components/SocialIcon";
import type { SocialLinkConfig } from "@/stores/authStore";
import { Zap, ExternalLink, User, ShoppingBag, Loader2, Share2, MessageCircle, Play, Newspaper, ArrowRight, Clapperboard, Link2, Star, Sparkles, Heart, Smile, Copy, Grid, List as ListIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type SocialPlatform } from "@/types/links";
import EmbedRenderer from "@/components/public/EmbedRenderer";
import ContactForm from "@/components/public/ContactForm";
import PublicCatalog from "@/components/public/PublicCatalog";
import StudioContentGrid from "@/components/public/StudioContentGrid";
import { ShareModal } from "@/components/public/ShareModal"; /* PREMIUM REDESIGN */
import ThemeEffects from "@/components/theme/ThemeEffects";
import TipJar from "@/components/public/TipJar";
import { computePalette, computeBgStyle, getLinkButtonClasses, getLinkButtonStyle, getLinkIconBgStyle, getFooterColor, getContrastColor, getProfileCardStyle, type ProfileAppearance } from "@/lib/profileRenderer";
import { parseStudioProfileState, type StudioCardItem } from "@/lib/publicStudio";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { usePublicProfileQuery } from "@/hooks/usePublicProfile";
import { UnifiedProfileHeader } from "@/components/public/UnifiedProfileHeader";
import { ProfileLinkBlock } from "@/components/public/ProfileLinkBlock";
import { RetroStickers } from "@/components/public/RetroStickers";
import { sendAnalyticsEvents } from "@/lib/analytics";

type CookiePreferences = {
  necessary: true;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
};

const COOKIE_PREFS_KEY = "biotra.cookie.preferences.v1";

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
  user_id: string;
  social_links: SocialLinkConfig[];
  upi_id: string;
  stats?: {
    ig_followers?: string;
    fb_likes?: string;
    tiktok_followers?: string;
    youtube_subs?: string;
    tab_labels?: { shop?: string; links?: string; };
  };
  role?: string;
  creator_metrics?: {
    engagement_rate?: string;
    avg_views?: string;
    reach?: string;
    tab_labels?: { shop?: string; links?: string; };
    design_overrides?: any;
  };
}

interface LinkData {
  id: string;
  title: string;
  url: string;
  platform: string;
}

interface AppearanceData {
  background_color: string;
  card_color: string;
  text_color: string;
  button_style: "rounded" | "pill" | "square" | "outline" | "shadow";
  button_bg: string;
  button_text: string;
  gradient_from: string | null;
  gradient_to: string | null;
  font_family: string;
  show_avatar: boolean;
  background_image?: string;
  background_overlay?: string;
  animated_gradient?: string;
  animation_class?: string;
  shop_tab_label?: string;
  links_tab_label?: string;
  layout_type?: "list" | "grid" | "bento" | "timeline" | "brutalism";
  card_style?: "classic" | "glass" | "glass-premium" | "neon";
  theme_id?: string;
  profile_style_variant?: "default" | "music";
}

type AppearanceRow = Tables<"appearance_settings">;
type LinkRow = Pick<Tables<"links">, "id" | "title" | "url" | "platform">;
type CatalogRow = Tables<"catalog_items"> & { media?: { type: "image" | "video"; url: string }[] | null };

const defaultAppearance: AppearanceData = {
  background_color: "#F0F2F5",
  card_color: "#ffffff",
  text_color: "#0f172a",
  button_style: "rounded",
  button_bg: "#111111",
  button_text: "#ffffff",
  gradient_from: null,
  gradient_to: null,
  font_family: "Inter",
  show_avatar: true,
  layout_type: "list",
  card_style: "glass",
  profile_style_variant: "default",
};


const PublicProfile = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: queryData, isLoading: queryLoading, error: queryError, refetch } = usePublicProfileQuery(username);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [appearance, setAppearance] = useState<AppearanceData>(defaultAppearance);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "shop">("shop");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCookieOpen, setIsCookieOpen] = useState(false);
  const [showCookieDetails, setShowCookieDetails] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences>({
    necessary: true,
    performance: false,
    functional: true,
    marketing: false,
  });
  const contactFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (profile?.user_id) {
       // Designer Fix: Traffic Logic Synchronization
       supabase.from("profile_views").insert({
          profile_user_id: profile.user_id,
          username: profile.username,
          ip_address: null, // Privacy-first tracking
          user_agent: navigator.userAgent,
          referrer: document.referrer
       }).then(({ error }) => {
          if (error) console.error("Traffic log fail:", error);
       });
    }
  }, [profile?.user_id]);

  useEffect(() => {
    if (profile) document.title = `${profile.name || profile.username} | BIOTRA`;
  }, [profile]);

  useEffect(() => {
    if (!profile?.username) return;
    try {
      const raw = localStorage.getItem(COOKIE_PREFS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
      setCookiePrefs({
        necessary: true,
        performance: Boolean(parsed.performance),
        functional: parsed.functional === undefined ? true : Boolean(parsed.functional),
        marketing: Boolean(parsed.marketing),
      });
    } catch {}
  }, [profile?.username]);

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify({ ...prefs, updatedAt: new Date().toISOString() }));
    } catch {}
    setCookiePrefs(prefs);
    setIsCookieOpen(false);
    setShowCookieDetails(false);
  };

  const acceptAllCookies = () => {
    saveCookiePreferences({ necessary: true, performance: true, functional: true, marketing: true });
  };

  useEffect(() => {
    console.log("📍 PublicProfile Query Status:", { queryLoading, queryError, hasData: !!queryData, username });
    if (queryLoading) {
      setLoading(true);
      return;
    }
    if (queryError || (!queryLoading && !queryData)) {
      console.warn("🚫 PublicProfile Not Found Triggered", { queryError, queryData, username });
      setNotFound(true);
      setLoading(false);
      return;
    }
    
    if (queryData) {
      console.log("✅ PublicProfile Data Received:", queryData.profileData?.username);
      const { profileData, linksData, appearanceData, catalogData } = queryData;
      
      let sLinks = (profileData as any).social_links || [];
      if (typeof sLinks === "string") {
        try { sLinks = JSON.parse(sLinks); } catch { sLinks = []; }
      }

      setProfile({
        name: profileData.name, username: profileData.username, bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "", user_id: profileData.user_id,
        social_links: sLinks,
        upi_id: (profileData as any).upi_id || "",
        stats: (profileData.social_stats as any) || {},
        creator_metrics: (profileData.creator_metrics as any) || {},
      });

      setLinks(linksData.map((l: any) => ({ 
        id: l.id, title: l.title, url: l.url, platform: l.platform || "website" 
      })));

      setCatalogItems(catalogData || []);

      if (appearanceData || profileData?.creator_metrics) {
        const a = appearanceData as any || {};
        const metrics = profileData?.creator_metrics as any || {};
        const overrides = metrics.design_overrides || {};
        
        setAppearance({
          ...defaultAppearance,
          background_color: overrides.background_color || a.background_color || defaultAppearance.background_color,
          text_color: overrides.text_color || a.text_color || defaultAppearance.text_color,
          card_color: overrides.card_color || a.card_color || defaultAppearance.card_color,
          button_style: (overrides.button_style || a.button_style || defaultAppearance.button_style) as AppearanceData["button_style"],
          button_bg: overrides.button_bg || a.button_bg || defaultAppearance.button_bg,
          button_text: overrides.button_text || a.button_text || defaultAppearance.button_text,
          font_family: overrides.font_family || a.font_family || defaultAppearance.font_family,
          layout_type: (overrides.layout_type || a.layout_type || defaultAppearance.layout_type) as AppearanceData["layout_type"],
          card_style: (overrides.card_style || a.card_style || defaultAppearance.card_style) as AppearanceData["card_style"],
          profile_style_variant: (overrides.profile_style_variant || a.profile_style_variant || defaultAppearance.profile_style_variant) as AppearanceData["profile_style_variant"],
          gradient_from: overrides.gradient_from || a.gradient_from, 
          gradient_to: overrides.gradient_to || a.gradient_to,
          show_avatar: overrides.show_avatar !== undefined ? overrides.show_avatar : (a.show_avatar !== undefined ? a.show_avatar : true),
          background_image: overrides.background_image || a.background_image || undefined,
          background_overlay: overrides.background_overlay || a.background_overlay || undefined,
          animated_gradient: overrides.animated_gradient || a.animated_gradient || undefined,
          animation_class: overrides.animation_class || a.animation_class || undefined,
          shop_tab_label: overrides.shop_tab_label || a.shop_tab_label || defaultAppearance.shop_tab_label,
          links_tab_label: overrides.links_tab_label || a.links_tab_label || defaultAppearance.links_tab_label,
          theme_id: overrides.theme_id || a.theme_id || undefined,
        });
      }
      setLoading(false);
      setNotFound(false);
    }
  }, [queryData, queryLoading, queryError]);

  useEffect(() => {
    let channels: RealtimeChannel[] = [];
    const subscribe = async () => {
      if (!username || !queryData?.profileData?.user_id) return;
      const userId = queryData.profileData.user_id;
      
      // Monitor Profile Changes
      const profileChannel = supabase.channel(`public_profile_${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${userId}` },
          () => { void refetch(); }
        ).subscribe();
      
      // Monitor Appearance Changes (Theme/Layout)
      const appearanceChannel = supabase.channel(`public_appearance_${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appearance_settings', filter: `user_id=eq.${userId}` },
          () => { void refetch(); }
        ).subscribe();

      // Monitor Link Changes
      const linksChannel = supabase.channel(`public_links_${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'links', filter: `user_id=eq.${userId}` },
          () => { void refetch(); }
        ).subscribe();
        
      channels = [profileChannel, appearanceChannel, linksChannel];
    };
    subscribe();
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, [username, queryData, refetch]);

  const headerSocials = useMemo(() => {
    if (profile?.social_links && profile.social_links.length > 0) return profile.social_links.slice(0, 5);
    const socialPlatforms = ["instagram", "twitter", "youtube", "tiktok", "facebook", "linkedin", "github", "twitch", "discord", "whatsapp", "telegram", "email", "appstore", "playstore"];
    return links
      .filter(l => socialPlatforms.includes(l.platform.toLowerCase()))
      .slice(0, 5)
      .map(l => ({ platform: l.platform.toLowerCase() as SocialPlatform, url: l.url }));
  }, [profile?.social_links, links]);

  const palette = useMemo(() => computePalette(appearance), [appearance]);
  const bgStyle = useMemo(() => computeBgStyle(appearance), [appearance]);
  const themeId = (appearance.theme_id || "").toLowerCase();
  const isBrutalism = appearance.layout_type === "brutalism" || 
                     themeId.includes("brutal") || 
                     themeId.includes("poster") || 
                     themeId.includes("retro");
  const isRetroPop = themeId.includes("retro-pop");
  const isMusicStyle = appearance.profile_style_variant === "music";

  // Derived: whether each tab has content to show
  const hasLinks = links.length > 0;
  const hasShop = catalogItems.length > 0;

  // Auto-select the first available tab after data loads
  useEffect(() => {
    if (loading) return;
    if (!hasLinks && hasShop) setActiveTab("shop");
    else setActiveTab("links");
  }, [loading, hasLinks, hasShop]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] p-4">
        <div className="rounded-2xl border-4 border-black bg-white px-8 py-7 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-center">
          <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-black" />
          <p className="text-xs font-black uppercase tracking-[0.16em] text-black/70">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] p-6">
        <div className="max-w-xl rounded-3xl border-4 border-black bg-white p-8 text-center shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">Profile Not Found</h1>
          <p className="font-bold text-black/60 mb-7">This page is not ready yet.</p>
          <Link to="/" className="inline-block px-7 py-3 bg-black text-white border-4 border-black rounded-xl font-black uppercase tracking-[0.14em] shadow-[6px_6px_0_0_rgba(16,185,129,1)]">
            Claim your username
          </Link>
        </div>
      </div>
    );
  }

  const handleShareProfile = () => setIsShareOpen(true);
  const handleMessageAction = () => setIsContactOpen(true);

  return (
    <div className={cn("min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white pb-10 md:pb-16", isBrutalism ? "bg-white md:bg-[#17191c]" : "md:bg-[#17191c]")}>
      <ThemeEffects appearance={appearance} />
      {isRetroPop && <RetroStickers />}
      
      {!isBrutalism && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
      )}
      
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("relative z-10 w-full max-w-[620px] mx-auto px-4 md:px-0 pt-4 md:pt-8")}
        >
        <div
          className={cn(
            "w-full min-h-[calc(100vh-2rem)] md:min-h-[860px] overflow-hidden rounded-[40px] border-4 border-black/10 md:border-2 md:border-black/30 md:shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative",
            isBrutalism ? "bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]" : "bg-black/20 backdrop-blur-3xl"
          )}
          style={bgStyle}
        >
          {/* Subtle noise texture for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
          
          <div className="w-full px-4 md:px-8 pt-6 md:pt-10 pb-16 relative z-10">
        <UnifiedProfileHeader 
          user={profile}
          appearance={appearance}
          palette={palette}
          isBrutalism={isBrutalism}
          socialLinks={headerSocials}
          onShare={handleShareProfile}
          onConnect={handleMessageAction}
        />

        {hasLinks && hasShop && (
          <div className="w-full flex justify-center mb-6 mt-2">
            <div className={cn(
              "flex items-center w-full max-w-md",
              isBrutalism ? "border-b-4 border-black" : "border-b border-white/10"
            )}>
              <button 
                onClick={() => setActiveTab("shop")}
                className={cn(
                  "flex-1 relative z-10 py-3 flex justify-center items-center gap-2 transition-all duration-300",
                  activeTab === "shop"
                    ? (isBrutalism ? "text-black" : "")
                    : (isBrutalism ? "text-black/40 hover:text-black/70" : "text-white/40 hover:text-white/80")
                )}
                style={(!isBrutalism && activeTab === "shop") ? { color: palette.cardText } : {}}
              >
                <Grid className="w-4 h-4" />
                <span className={cn("font-bold tracking-widest uppercase text-[10px] sm:text-[11px]")}>
                  {profile.creator_metrics?.tab_labels?.shop || appearance.shop_tab_label || "Grid"}
                </span>
                
                {activeTab === "shop" && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className={cn("absolute bottom-0 left-0 right-0 h-[2px]", isBrutalism ? "bg-black h-[4px] -mb-[4px]" : "")}
                    style={!isBrutalism ? { backgroundColor: palette.cardText } : {}}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </button>

              <button 
                onClick={() => setActiveTab("links")}
                className={cn(
                  "flex-1 relative z-10 py-3 flex justify-center items-center gap-2 transition-all duration-300",
                  activeTab === "links"
                    ? (isBrutalism ? "text-black" : "")
                    : (isBrutalism ? "text-black/40 hover:text-black/70" : "text-white/40 hover:text-white/80")
                )}
                style={(!isBrutalism && activeTab === "links") ? { color: palette.cardText } : {}}
              >
                <ListIcon className="w-4 h-4" />
                <span className={cn("font-bold tracking-widest uppercase text-[10px] sm:text-[11px]")}>
                  {profile.creator_metrics?.tab_labels?.links || appearance.links_tab_label || "Links"}
                </span>
                
                {activeTab === "links" && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className={cn("absolute bottom-0 left-0 right-0 h-[2px]", isBrutalism ? "bg-black h-[4px] -mb-[4px]" : "")}
                    style={!isBrutalism ? { backgroundColor: palette.cardText } : {}}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </button>
            </div>
          </div>
        )}

        <div className={cn(
          "w-full",
          (appearance.layout_type === "grid" || appearance.layout_type === "bento") && activeTab === "links"
            ? "grid gap-5 md:gap-6 grid-cols-2" 
            : "flex flex-col gap-6"
        )}>
          <AnimatePresence mode="wait">
            {activeTab === "links" ? (
              <motion.div
                key="links-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className={cn(
                  "w-full",
                  (appearance.layout_type === "grid" || appearance.layout_type === "bento") 
                    ? "grid gap-5 md:gap-6 grid-cols-2" 
                    : "flex flex-col gap-5"
                )}
              >
                {links.map((link, i) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProfileLinkBlock 
                      index={i}
                      link={link}
                      appearance={appearance}
                      palette={palette}
                      isMusicStyle={isMusicStyle}
                      isBrutalism={isBrutalism}
                      layoutType={appearance.layout_type}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="shop-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="w-full"
              >
                <PublicCatalog 
                  items={catalogItems} 
                  profileUserId={profile.user_id}
                  textColor={isBrutalism ? "#000000" : palette.cardText}
                  buttonBg={isBrutalism ? "#000000" : palette.btnBg}
                  buttonText={isBrutalism ? "#ffffff" : getContrastColor(palette.btnBg)}
                  buttonStyle={isBrutalism ? "square" : appearance.button_style}
                  catalogCardBg={isBrutalism ? "#ffffff" : palette.cardBg}
                  cardBorder={isBrutalism ? "#000000" : palette.cardBorder}
                  hasPhoto={Boolean(profile.avatar_url)}
                  upiId={profile.upi_id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-12 w-full">
          <ContactForm
            profileUserId={profile.user_id}
            textColor={isBrutalism ? "#111111" : (palette.cardText || "#111111")}
            buttonBg={isBrutalism ? "#111111" : (palette.btnBg || "#111111")}
            buttonText={isBrutalism ? "#ffffff" : (palette.btnText || "#ffffff")}
            buttonStyle={isBrutalism ? "rounded" : appearance.button_style}
            hasPhoto={Boolean(profile.avatar_url)}
            cardBg={isBrutalism ? "#ffffff" : (palette.cardBg || "#ffffff")}
            cardBorder={isBrutalism ? "#111111" : (palette.cardBorder || "#111111")}
            inputBg={isBrutalism ? "#ffffff" : `${palette.cardText}10`}
            inputBorder={isBrutalism ? "#111111" : `${palette.cardText}22`}
            isBrutalism={isBrutalism}
          />
        </div>

        {/* Floating Share Button on Mobile */}
        <div className="fixed bottom-6 right-6 z-[100] md:hidden">
             <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShareProfile}
                className="w-14 h-14 bg-black text-white border-4 border-white border-opacity-20 rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.5)] active:shadow-none transition-all"
             >
                <Share2 size={24} />
             </motion.button>
        </div>

        <footer className="mt-16 py-8 border-t border-white/10 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 opacity-70">
            <Zap className="w-4 h-4" />
            <span className="font-bold text-xs tracking-[0.08em] uppercase">Built with Biotra Open Platform</span>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-80">
            <button type="button" onClick={() => setIsCookieOpen(true)} className="hover:opacity-100 underline-offset-2 hover:underline">
              Cookie Preferences
            </button>
            <span>&bull;</span>
            <Link to={`/contact?topic=report&profile=${encodeURIComponent(profile.username)}`} className="hover:opacity-100 underline-offset-2 hover:underline">Report</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:opacity-100 underline-offset-2 hover:underline">Privacy</Link>
          </div>
        </footer>
      </div>
        </div>
      </motion.div>

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} url={window.location.href} name={profile.name} />
      {isCookieOpen && (
        <div className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-[740px] max-h-[88vh] overflow-auto border-4 border-black bg-white p-4 sm:p-6 shadow-[14px_14px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-black text-black/60 mb-1">Privacy Settings</p>
                <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight">Cookie Preferences</h2>
                <p className="text-sm text-black/70 mt-2">We use cookies to keep Biotra secure and improve your experience.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCookieOpen(false)}
                className="h-10 w-10 border-3 border-black bg-white font-black text-black hover:bg-black hover:text-white transition-colors"
                aria-label="Close cookie settings"
              >
                x
              </button>
            </div>

            <p className="text-sm text-black/85 mb-4 font-medium">
              Necessary cookies are always on. You can choose optional cookies below.
            </p>

            <div className="space-y-2.5">
              <div className="border-3 border-black p-3 bg-black/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black uppercase tracking-[0.08em] text-black text-sm">Strictly Necessary</p>
                    <p className="text-xs text-black/65">Required for login, security, and core page features.</p>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.08em] px-3 py-1 border-2 border-black bg-white">Always on</span>
                </div>
              </div>

              <div className="border-3 border-black p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black uppercase tracking-[0.08em] text-black text-sm">Performance</p>
                    <p className="text-xs text-black/65">Helps us improve speed and reliability.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookiePrefs.performance}
                    onChange={(e) => setCookiePrefs((prev) => ({ ...prev, performance: e.target.checked }))}
                    className="h-5 w-5 accent-black border-2 border-black"
                  />
                </div>
              </div>

              <div className="border-3 border-black p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black uppercase tracking-[0.08em] text-black text-sm">Functional</p>
                    <p className="text-xs text-black/65">Remembers your UI and profile viewing preferences.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookiePrefs.functional}
                    onChange={(e) => setCookiePrefs((prev) => ({ ...prev, functional: e.target.checked }))}
                    className="h-5 w-5 accent-black border-2 border-black"
                  />
                </div>
              </div>

              {showCookieDetails && (
                <div className="border-3 border-black p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black uppercase tracking-[0.08em] text-black text-sm">Marketing</p>
                      <p className="text-xs text-black/65">Used for campaign attribution and messaging relevance.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cookiePrefs.marketing}
                      onChange={(e) => setCookiePrefs((prev) => ({ ...prev, marketing: e.target.checked }))}
                      className="h-5 w-5 accent-black border-2 border-black"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowCookieDetails((v) => !v)}
                className="text-sm font-semibold underline underline-offset-2"
              >
                {showCookieDetails ? "Hide advanced options" : "Manage all options"}
              </button>
              <Link to="/cookies" className="text-sm font-semibold underline underline-offset-2">Read cookie policy</Link>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => saveCookiePreferences({ necessary: true, performance: false, functional: false, marketing: false })}
                className="h-11 border-3 border-black bg-white font-black uppercase tracking-[0.08em] text-xs"
              >
                Reject optional
              </button>
              <button
                type="button"
                onClick={() => saveCookiePreferences(cookiePrefs)}
                className="h-11 border-3 border-black bg-white font-black uppercase tracking-[0.08em] text-xs"
              >
                Save choices
              </button>
              <button
                type="button"
                onClick={acceptAllCookies}
                className="h-11 border-3 border-black bg-black text-white font-black uppercase tracking-[0.08em] text-xs shadow-[4px_4px_0_0_rgba(16,185,129,1)]"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
