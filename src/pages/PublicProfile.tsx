import { useState, useEffect, useMemo, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { SocialIcon, isEmbedPlatform } from "@/components/SocialIcon";
import type { SocialLinkConfig } from "@/stores/authStore";
import { Zap, ExternalLink, User, ShoppingBag, Loader2, Share2, MessageCircle, Play, Newspaper, ArrowRight, Clapperboard, Link2, Star, Sparkles, Heart, Smile } from "lucide-react";
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
import { computePalette, computeBgStyle, getLinkButtonClasses, getLinkButtonStyle, getLinkIconBgStyle, getFooterColor, getContrastColor, type ProfileAppearance } from "@/lib/profileRenderer";
import { parseStudioProfileState, type StudioCardItem } from "@/lib/publicStudio";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { usePublicProfileQuery } from "@/hooks/usePublicProfile";
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

const RetroStickers = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
    <motion.div 
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 15 }}
      transition={{ type: "spring", delay: 0.5 }}
      className="absolute top-10 left-[5%] text-pink-400 opacity-60"
    >
      <Star className="w-12 h-12 fill-current" />
    </motion.div>
    <motion.div 
      initial={{ scale: 0, rotate: 20 }}
      animate={{ scale: 1, rotate: -10 }}
      transition={{ type: "spring", delay: 0.7 }}
      className="absolute bottom-40 right-[10%] text-blue-400 opacity-60"
    >
      <Sparkles className="w-16 h-16" />
    </motion.div>
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 0.4 }}
      transition={{ delay: 1 }}
      className="absolute top-[20%] right-[15%] text-yellow-400"
    >
      <Smile className="w-10 h-10 fill-current" />
    </motion.div>
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 10, 0]
      }}
      transition={{ duration: 4, repeat: Infinity }}
      className="absolute top-[60%] left-[8%] text-red-400 opacity-50"
    >
      <Heart className="w-8 h-8 fill-current" />
    </motion.div>
  </div>
);

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
    if (profile) document.title = `${profile.name || profile.username} | BIOTRA`;
  }, [profile]);

  useEffect(() => {
    if (!profile?.username) return;
    try {
      const raw = localStorage.getItem(COOKIE_PREFS_KEY);
      if (!raw) {
        setIsCookieOpen(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
      setCookiePrefs({
        necessary: true,
        performance: Boolean(parsed.performance),
        functional: parsed.functional === undefined ? true : Boolean(parsed.functional),
        marketing: Boolean(parsed.marketing),
      });
    } catch {
      setIsCookieOpen(true);
    }
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
    if (queryLoading) { setLoading(true); return; }
    if (queryError || (!queryLoading && !queryData)) { setNotFound(true); setLoading(false); return; }
    
    if (queryData) {
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

      if (appearanceData) {
        const a = appearanceData as any;
        setAppearance({
          ...defaultAppearance,
          background_color: a.background_color || defaultAppearance.background_color,
          text_color: a.text_color || defaultAppearance.text_color,
          card_color: a.card_color || defaultAppearance.card_color,
          button_style: (a.button_style || defaultAppearance.button_style) as AppearanceData["button_style"],
          button_bg: a.button_bg || defaultAppearance.button_bg,
          button_text: a.button_text || defaultAppearance.button_text,
          font_family: a.font_family || defaultAppearance.font_family,
          layout_type: (a.layout_type || defaultAppearance.layout_type) as AppearanceData["layout_type"],
          card_style: (a.card_style || defaultAppearance.card_style) as AppearanceData["card_style"],
          profile_style_variant: (a.profile_style_variant || defaultAppearance.profile_style_variant) as AppearanceData["profile_style_variant"],
          gradient_from: a.gradient_from, gradient_to: a.gradient_to,
          show_avatar: a.show_avatar !== undefined ? a.show_avatar : true,
          background_image: a.background_image || undefined,
          background_overlay: a.background_overlay || undefined,
          animated_gradient: a.animated_gradient || undefined,
          animation_class: a.animation_class || undefined,
          shop_tab_label: a.shop_tab_label || defaultAppearance.shop_tab_label,
          links_tab_label: a.links_tab_label || defaultAppearance.links_tab_label,
          theme_id: a.theme_id || undefined,
        });
      }
      setLoading(false);
      setNotFound(false);
    }
  }, [queryData, queryLoading, queryError]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    const subscribe = async () => {
      if (!isSupabaseConfigured || !username || !queryData?.profileData?.user_id) return;
      channel = supabase.channel(`profile_realtime_${queryData.profileData.user_id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${queryData.profileData.user_id}` },
          () => { void refetch(); }
        ).subscribe();
    };
    subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
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
  const isBrutalism = appearance.layout_type === "brutalism";
  const isRetroPop = appearance.theme_id?.startsWith("retro-pop-");
  const isMusicStyle = appearance.profile_style_variant === "music";

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
      
      <div className={cn("relative z-10 w-full max-w-[620px] mx-auto px-3 md:px-0 pt-4 md:pt-8")}>
        <div
          className={cn(
            "w-full min-h-[calc(100vh-1rem)] md:min-h-[860px] overflow-hidden rounded-[28px] md:rounded-[36px] border border-black/10 md:border-2 md:border-black/30 md:shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
            isBrutalism ? "bg-white" : "bg-black/20"
          )}
          style={bgStyle}
        >
          <div className="w-full px-3 md:px-5 pt-4 md:pt-6 pb-10">
        {/* Header Content */}
        <div className={cn(
          "w-full p-5 md:p-7 mb-6 relative overflow-hidden transition-all duration-500",
          isBrutalism ? "bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-none" : "bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-2xl",
          isRetroPop && "!shadow-[16px_16px_0_0_rgba(0,0,0,1)] !border-black border-4"
        )} style={{ borderColor: isBrutalism ? "#000" : palette.cardBorder }}>
          
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 md:gap-7">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6">
              <div className={cn(
                "shrink-0 relative group",
                isBrutalism ? "w-28 h-28 md:w-32 md:h-32 border-4 border-black rounded-none shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col" : "w-28 h-28 md:w-32 md:h-32 rounded-[28px] md:rounded-[32px] overflow-hidden shadow-2xl ring-4 ring-white/10",
                isRetroPop && "border-4 border-black !bg-white !p-2 !pb-8 !h-auto !shadow-none rotate-[-2deg] transition-transform hover:rotate-0"
              )}>
                <div className={cn(
                    "w-full h-full overflow-hidden",
                    isRetroPop ? "aspect-square border-2 border-black" : ""
                )}>
                  {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center"><User className="w-12 h-12 opacity-20" /></div>
                  )}
                </div>
                {isRetroPop && (
                    <div className="mt-2 text-center text-[8px] font-black uppercase tracking-widest text-black opacity-30">Studio Photo</div>
                )}
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h1 className={cn(
                  "font-black tracking-tight text-xl sm:text-2xl md:text-[1.9rem] leading-[1.08] mb-2 break-all",
                  isBrutalism ? "text-black" : "",
                  isRetroPop && "text-black drop-shadow-[4px_4px_0_rgba(255,255,255,1)]"
                )} style={{ color: isBrutalism ? "#000" : palette.cardText }}>
                  {profile.name || profile.username}
                </h1>
                <p className={cn(
                  "text-base md:text-lg opacity-60 leading-relaxed mb-5",
                  isBrutalism ? "text-black opacity-100 font-bold" : ""
                )} style={{ color: isBrutalism ? "#000" : palette.cardText }}>
                  {profile.bio || "Creative Designer & Builder"}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <button 
                    onClick={handleMessageAction}
                    className={cn(
                      "px-8 md:px-10 py-3.5 md:py-4 font-black uppercase tracking-widest text-xs transition-all",
                      isBrutalism ? "bg-black text-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none" : "rounded-2xl shadow-xl hover:opacity-90"
                    )}
                    style={{ backgroundColor: isBrutalism ? "#000" : palette.btnBg, color: isBrutalism ? "#fff" : palette.btnText }}
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>

            <div className={cn(
              "h-full p-4 md:p-5",
              isBrutalism ? "bg-white border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none" : "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
            )} style={{ borderColor: isBrutalism ? "#000" : palette.cardBorder }}>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-70",
                isBrutalism ? "text-black" : ""
              )} style={{ color: isBrutalism ? "#000" : palette.cardText }}>
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {headerSocials.length > 0 && headerSocials.slice(0, 5).map((l, i) => (
                  <a
                    key={`top-${i}`}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "w-9 h-9 flex items-center justify-center transition-all hover:scale-110",
                      isBrutalism
                        ? "bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none"
                        : "bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20"
                    )}
                    style={{ color: isBrutalism ? "#000" : palette.cardText }}
                  >
                    <SocialIcon platform={l.platform} className="w-4 h-4" />
                  </a>
                ))}
                <button 
                  onClick={handleShareProfile}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center transition-all",
                    isBrutalism ? "bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none" : "bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20"
                  )}
                  style={{ color: isBrutalism ? "#000" : palette.cardText }}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className={cn(
            "p-1.5 flex gap-2",
            isBrutalism ? "bg-black border-4 border-black rounded-none" : "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px]"
          )}>
            <button 
              onClick={() => setActiveTab("links")}
              className={cn(
                "px-8 py-2.5 rounded-[14px] font-black uppercase tracking-widest text-[10px] transition-all",
                activeTab === "links"
                  ? (isBrutalism
                      ? "bg-white text-black rounded-none"
                      : isMusicStyle
                        ? "bg-white/90 text-black shadow-lg rounded-full"
                        : "bg-white text-black shadow-lg")
                  : "opacity-40"
              )}
              style={{ color: activeTab === "links" ? "#000" : isBrutalism ? "#fff" : palette.cardText }}
            >
              Links
            </button>
            <button 
              onClick={() => setActiveTab("shop")}
              className={cn(
                "px-8 py-2.5 rounded-[14px] font-black uppercase tracking-widest text-[10px] transition-all",
                activeTab === "shop"
                  ? (isBrutalism
                      ? "bg-white text-black rounded-none"
                      : isMusicStyle
                        ? "bg-white/90 text-black shadow-lg rounded-full"
                        : "bg-white text-black shadow-lg")
                  : "opacity-40"
              )}
              style={{ color: activeTab === "shop" ? "#000" : isBrutalism ? "#fff" : palette.cardText }}
            >
              Shop
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {activeTab === "links" ? (
            links.map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className={cn(
                  "block w-full p-4 group transition-all duration-300",
                  isBrutalism ? "bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none" : "bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 shadow-lg"
                )}
                style={isMusicStyle && !isBrutalism ? { backgroundColor: `${palette.cardBg}`, borderColor: `${palette.cardBorder}` } : undefined}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12",
                    isBrutalism
                      ? "bg-black text-white rounded-none border-2 border-black"
                      : isMusicStyle
                        ? "rounded-full border-2"
                        : "bg-black/20 rounded-xl"
                  )} style={{ backgroundColor: isBrutalism ? "#000" : palette.btnBg }}>
                    {isMusicStyle ? <Play className="w-4 h-4 text-white ml-0.5" /> : <Link2 className="w-5 h-5 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={cn(
                      "font-black uppercase tracking-tight text-sm block truncate",
                      isBrutalism ? "text-black" : ""
                    )} style={{ color: isBrutalism ? "#000" : palette.cardText }}>
                      {link.title}
                    </span>
                    {isMusicStyle && (
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block truncate" style={{ color: isBrutalism ? "#000" : palette.cardText }}>
                        Tap to open
                      </span>
                    )}
                  </div>
                  <ExternalLink className="ml-auto w-4 h-4 opacity-20" />
                </div>
              </a>
            ))
          ) : (
            <PublicCatalog items={catalogItems} appearance={appearance} palette={palette} />
          )}
        </div>
        
        <div className="mt-8 w-full">
          <ContactForm
            profileUserId={profile.user_id}
            textColor={isBrutalism ? "#111111" : (palette.cardText || "#111111")}
            buttonBg={isBrutalism ? "#111111" : (palette.btnBg || "#111111")}
            buttonText={isBrutalism ? "#ffffff" : (palette.btnText || "#ffffff")}
            buttonStyle={isBrutalism ? "rounded" : appearance.button_style}
            hasPhoto={Boolean(profile.avatar_url)}
            cardBg={isBrutalism ? "#ffffff" : (palette.cardBg || "#ffffff")}
            cardBorder={isBrutalism ? "#111111" : (palette.cardBorder || "#111111")}
            inputBg={isBrutalism ? "#F3F4F6" : `${palette.cardText}10`}
            inputBorder={isBrutalism ? "#111111" : `${palette.cardText}22`}
          />
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
      </div>

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} username={profile.username} profileName={profile.name} />
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

