import { useState, useEffect, useMemo, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { SocialIcon, isEmbedPlatform } from "@/components/SocialIcon";
import type { SocialLinkConfig } from "@/stores/authStore";
import { Zap, ExternalLink, User, ShoppingBag, Loader2, Share2, MessageCircle, Play, Newspaper, ArrowRight, Clapperboard, Link2 } from "lucide-react";
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
  layout_type?: "list" | "grid" | "bento" | "timeline";
  card_style?: "classic" | "glass" | "glass-premium" | "neon";
}

interface CatalogItemData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: string;
  tags: string[];
  external_url: string;
  allow_order_form: boolean;
  variants?: { label: string; options: string[] }[];
  track_inventory?: boolean;
  stock_quantity?: number | null;
  media?: { type: "image" | "video"; url: string }[];
}

type AppearanceRow = Tables<"appearance_settings">;
type LinkRow = Pick<Tables<"links">, "id" | "title" | "url" | "platform">;
type CatalogRow = Tables<"catalog_items"> & { media?: { type: "image" | "video"; url: string }[] | null };

const defaultAppearance: AppearanceData = {
  background_color: "#0f172a",
  card_color: "rgba(15, 23, 42, 0.7)",
  text_color: "#f8fafc",
  button_style: "pill",
  button_bg: "#38bdf8",
  button_text: "#ffffff",
  layout_type: "list",
  card_style: "classic",
  gradient_from: "#1e293b",
  gradient_to: "#0f172a",
  font_family: "Inter",
  show_avatar: true,
  shop_tab_label: "Shop",
  links_tab_label: "Links",
  animation_class: "animate-aurora",
};

interface MediaCardItem {
  id: string;
  title: string;
  url: string;
  platform: SocialPlatform;
  platformLabel: string;
  kind: "video" | "news";
  thumbnailUrl?: string;
}

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/i);
  return match?.[1] || null;
};

const inferSocialPlatform = (url: string, platform: string): SocialPlatform => {
  const current = (platform || "website") as SocialPlatform;
  const lower = url.toLowerCase();
  if (current !== "website" && current !== "other") return current;
  if (lower.includes("youtu")) return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("facebook.com")) return "facebook";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("vimeo.com")) return "video-embed";
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("music.apple.com")) return "apple-music";
  if (lower.includes("soundcloud.com")) return "soundcloud";
  if (lower.includes("audiomack.com")) return "audiomack";
  if (lower.includes("substack.com")) return "substack";
  if (lower.includes("typeform.com")) return "typeform";
  if (lower.includes("calendly.com")) return "calendly";
  if (lower.includes("gofundme.com")) return "gofundme";
  if (lower.includes("kick.com")) return "kick";
  return current;
};

const toMediaCardItem = (link: LinkData): MediaCardItem | null => {
  const rawPlatform = (link.platform || "website");
  const parts = rawPlatform.split("|");
  const basePlatform = parts[0];
  const layout = parts[1] || "default";

  if (layout === "video") {
    const url = (link.url || "").trim();
    if (!url) return null;
    const platform = inferSocialPlatform(url, basePlatform);
    const youtubeId = getYouTubeId(url);
    return {
      id: link.id, title: link.title, url,
      platform, platformLabel: basePlatform,
      kind: "video",
      thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
    };
  }
  if (layout === "article") {
    const url = (link.url || "").trim();
    if (!url) return null;
    const platform = inferSocialPlatform(url, basePlatform);
    const youtubeId = getYouTubeId(url);
    return {
      id: link.id, title: link.title, url,
      platform, platformLabel: basePlatform,
      kind: "news",
      thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined,
    };
  }

  const url = (link.url || "").trim();
  if (!url) return null;
  const combinedText = `${link.title} ${url}`.toLowerCase();
  const platform = inferSocialPlatform(url, basePlatform);
  const youtubeId = getYouTubeId(url);
  const isVideoLike = platform === "video-embed" || platform === "youtube" || platform === "instagram" || platform === "tiktok" || platform === "facebook" || platform === "twitter" || url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com") || url.includes("instagram.com") || url.includes("tiktok.com") || url.includes("facebook.com");
  const isNewsLike = /(news|report|article|press|blog|update|newsletter)/i.test(combinedText);
  if (!isVideoLike && !isNewsLike) return null;
  const platformLabelMap: Record<string, string> = {
    youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok",
    facebook: "Facebook", twitter: "X/Twitter", "video-embed": "Video",
    "website-embed": "Website", website: "Website", other: "Link",
  };
  return {
    id: link.id, title: link.title, url,
    platform, platformLabel: platformLabelMap[platform] || "Link",
    kind: isNewsLike && !isVideoLike ? "news" : "video",
    thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
  };
};

const resolveTabLabel = (primary: string | undefined, fallback: string | undefined, defaultValue: string) => {
  const primaryText = (primary || "").trim();
  const fallbackText = (fallback || "").trim();
  if (!primaryText) return fallbackText || defaultValue;
  if (primaryText === defaultValue && fallbackText && fallbackText !== defaultValue) return fallbackText;
  return primaryText;
};

const getSafeHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return "link";
  }
};

// ─── Glass Card Component ──────────────────────────────────────────────────
const GlassCard = ({ children, className, style, onClick, href }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  href?: string;
}) => {
  const baseClass = cn(
    "relative rounded-[18px] border transition-all duration-300",
    "hover:-translate-y-1 hover:shadow-2xl",
    className
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClass} style={style}>
        {children}
      </a>
    );
  }
  return (
    <div className={baseClass} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const PublicProfile = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: queryData, isLoading: queryLoading, error: queryError } = usePublicProfileQuery(username);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [appearance, setAppearance] = useState<AppearanceData>(defaultAppearance);
  const [catalogItems, setCatalogItems] = useState<CatalogItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "shop">("shop");
  const [isShareOpen, setIsShareOpen] = useState(false); /* PREMIUM REDESIGN */
  const [isContactOpen, setIsContactOpen] = useState(false); /* PORTFOLIO REDESIGN */
  const contactFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (profile) {
      document.title = `${profile.name || profile.username} | BIOTRA`;
    }
  }, [profile]);

  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
      return;
    }
    if (queryError || (!queryLoading && !queryData)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    if (queryData) {
      const { profileData, linksData, appearanceData, catalogData } = queryData;
      setProfile({
        name: profileData.name, username: profileData.username, bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "", user_id: profileData.user_id,
        social_links: ((profileData as Record<string, unknown>).social_links as SocialLinkConfig[]) || [],
        upi_id: (profileData as Record<string, unknown>).upi_id as string || "",
        stats: (profileData.social_stats as ProfileData["stats"] | null) || {},
        creator_metrics: (profileData.creator_metrics as ProfileData["creator_metrics"] | null) || {},
      });
      setLinks(linksData.map((link: LinkRow) => ({ id: link.id, title: link.title, url: link.url, platform: link.platform || "website" })));
      setCatalogItems(catalogData.map((item: CatalogRow) => ({
        id: item.id, title: item.title, description: item.description || "",
        price: item.price, price_label: item.price_label || "", image_url: item.image_url || "",
        category: item.category || "", item_type: item.item_type || "physical",
        tags: item.tags || [], external_url: item.external_url || "",
        allow_order_form: item.allow_order_form,
        variants: (item.variants as CatalogItemData["variants"]) || [],
        track_inventory: item.track_inventory, stock_quantity: item.stock_quantity,
        media: ((item as any).media as CatalogItemData["media"]) || [],
      })));
      if (appearanceData) {
        const a = appearanceData as AppearanceRow;
        setAppearance({
          background_color: a.background_color || defaultAppearance.background_color,
          card_color: a.card_color || defaultAppearance.card_color,
          text_color: a.text_color || defaultAppearance.text_color,
          button_style: (a.button_style as AppearanceData["button_style"]) || defaultAppearance.button_style,
          button_bg: a.button_bg || defaultAppearance.button_bg,
          button_text: a.button_text || defaultAppearance.button_text,
          gradient_from: a.gradient_from, gradient_to: a.gradient_to,
          font_family: a.font_family || defaultAppearance.font_family,
          show_avatar: a.show_avatar !== undefined ? a.show_avatar : true,
          background_image: a.background_image || undefined,
          background_overlay: a.background_overlay || undefined,
          animated_gradient: a.animated_gradient || undefined,
          animation_class: a.animation_class || undefined,
          shop_tab_label: a.shop_tab_label || defaultAppearance.shop_tab_label,
          links_tab_label: a.links_tab_label || defaultAppearance.links_tab_label,
          layout_type: (a.layout_type as AppearanceData["layout_type"]) || defaultAppearance.layout_type,
          card_style: (a.card_style as AppearanceData["card_style"]) || defaultAppearance.card_style,
        });
      }
      setLoading(false);
      setNotFound(false);
    }
  }, [queryData, queryLoading, queryError, username, navigate]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    const subscribeToChanges = async () => {
      if (!isSupabaseConfigured || !username || !queryData?.profileData?.user_id) return;
      channel = supabase.channel(`public_appearance_${queryData.profileData.user_id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appearance_settings', filter: `user_id=eq.${queryData.profileData.user_id}` },
          () => { window.location.reload(); }
        ).subscribe();
    };
    subscribeToChanges();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [username, queryData]);

  const sharedAppearance: ProfileAppearance = useMemo(() => ({
    background_color: appearance.background_color, card_color: appearance.card_color,
    text_color: appearance.text_color, button_style: appearance.button_style,
    button_bg: appearance.button_bg, button_text: appearance.button_text,
    gradient_from: appearance.gradient_from, gradient_to: appearance.gradient_to,
    font_family: appearance.font_family, show_avatar: appearance.show_avatar,
    background_image: appearance.background_image, background_overlay: appearance.background_overlay,
    animated_gradient: appearance.animated_gradient, animation_class: appearance.animation_class,
  }), [appearance]);

  const palette = useMemo(() => computePalette(sharedAppearance), [sharedAppearance]);
  const bgStyle = useMemo(() => computeBgStyle(sharedAppearance), [sharedAppearance]);
  
  const showLinksTab = links.length > 0;
  const showCatalog = catalogItems.length > 0;

  const shopTabLabel = resolveTabLabel(appearance.shop_tab_label, (profile?.creator_metrics as any)?.tab_labels?.shop, "Shop");
  const linksTabLabel = resolveTabLabel(appearance.links_tab_label, (profile?.creator_metrics as any)?.tab_labels?.links, "Links");

  const mediaFallbackItems = useMemo(() => links.map((link) => toMediaCardItem(link)).filter((item): item is MediaCardItem => Boolean(item)), [links]);
  const studioProfileState = useMemo(() => parseStudioProfileState(profile?.creator_metrics), [profile?.creator_metrics]);
  const studioCards = useMemo(() => (studioProfileState?.items || []).filter((item) => item && item.title && item.url), [studioProfileState]);
  const mediaFallbackCards = useMemo<StudioCardItem[]>(() =>
    mediaFallbackItems.map((item) => ({
      id: item.id, type: item.kind === "news" ? "news" : "video",
      title: item.title, subtitle: item.platformLabel,
      url: item.url, thumbnail: item.thumbnailUrl, layoutStyle: "classic",
    })), [mediaFallbackItems]);

  const showStudioContent = (studioProfileState?.pageMode || "hybrid") !== "links-only" && studioProfileState?.showSection !== false && studioCards.length > 0;
  const shopSectionTitle = studioProfileState?.sectionTitle?.trim() || shopTabLabel;
  const showMediaFallback = !showCatalog && !showStudioContent && mediaFallbackItems.length > 0;
  const hasTabs = showCatalog || showLinksTab || showMediaFallback || showStudioContent;

  useEffect(() => {
    if (!showCatalog && !showMediaFallback && showLinksTab) setActiveTab("links");
    if ((showCatalog || showMediaFallback || showStudioContent) && !showLinksTab) setActiveTab("shop");
  }, [showCatalog, showLinksTab, showMediaFallback, showStudioContent]);

  const defaultLinks = useMemo(() => links.filter(l => {
    const layout = (l.platform || "").split("|")[1];
    return !layout || layout === "default";
  }), [links]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
  if (notFound || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-center p-8">
      <div className="space-y-4">
        <h1 className="text-6xl font-black opacity-10">404</h1>
        <h2 className="text-2xl font-bold">Profile not found</h2>
      </div>
    </div>
  );

  const handleShareProfile = () => setIsShareOpen(true);
  const trackLocalStaticClick = (linkId: string) => {
    try {
      const clicks = JSON.parse(localStorage.getItem('biotra_link_clicks') || '{}');
      clicks[linkId] = (clicks[linkId] || 0) + 1;
      localStorage.setItem('biotra_link_clicks', JSON.stringify(clicks));
    } catch(e) {}
  };

  const handleMessageAction = () => {
    setIsContactOpen(true); /* PORTFOLIO REDESIGN: Popup instead of scroll */
  };

  const postsCount = (catalogItems?.length || 0) + (links?.length || 0);

  return (
    <div
      id="public-profile-root"
      className="min-h-screen w-full relative overflow-x-hidden flex flex-col items-center bg-[#f0f2f5]" /* PORTFOLIO REDESIGN */
      style={{ ...bgStyle, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
        .tap-scale { transition: transform 0.2s ease; }
        .tap-scale:active { transform: scale(0.96); }
        .squircle { border-radius: clamp(32px, 10vw, 42px); }

        /* PROPER 2-COL FIX: Absolute 2-column Grid for Mobile */
        .product-grid, .shop-grid, .items-grid, .cards-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px 10px !important;
          padding: 12px 14px 40px !important;
          align-items: stretch !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        @media (min-width: 992px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
            padding: 24px !important;
          }
        }

        /* PROPER 2-COL FIX: Card Geometry */
        .product-card, [class*="product-card"], [class*="shop-card"], [class*="item-card"] {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          height: 100% !important;
          min-height: unset !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 18px !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04) !important;
        }

        /* PROPER 2-COL FIX: Image Aspect Ratio */
        .product-card .image-wrapper {
          width: 100% !important;
          aspect-ratio: 1 / 1 !important;
          overflow: hidden !important;
          position: relative !important;
          flex-shrink: 0 !important;
          display: block !important;
          padding: 0 !important;
          height: 0 !important;
          padding-top: 100% !important;
        }

        .product-card img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center top !important;
          position: absolute !important;
          top: 0 !important; left: 0 !important;
        }

        /* PROPER 2-COL FIX: Content Hierarchy */
        [class*="card-body"], [class*="card-content"], [class*="item-info"] {
          padding: 10px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          flex: 1 !important;
          overflow: hidden !important;
        }

        [class*="product-name"], [class*="item-name"], [class*="card-title"], [class*="title"] {
          font-size: clamp(0.85rem, 3.2vw, 0.95rem) !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          opacity: 1 !important;
          color: inherit !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
          display: block !important;
          margin: 0 !important;
        }

        [class*="price"] {
          font-size: clamp(0.9rem, 3.8vw, 1.05rem) !important;
          font-weight: 800 !important;
          opacity: 1 !important;
          color: inherit !important;
          white-space: nowrap !important;
          display: block !important;
          margin: 3px 0 6px !important;
        }

        [class*="add-to-cart"], [class*="btn-cart"], [class*="cart-btn"], [class*="buy-btn"] {
          display: flex !important;
          width: 100% !important;
          padding: 9px 8px !important;
          border-radius: 999px !important;
          font-size: clamp(0.62rem, 2.5vw, 0.72rem) !important;
          font-weight: 700 !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          border: none !important;
          cursor: pointer !important;
          justify-content: center !important;
          align-items: center !important;
        }

        [class*="category"], [class*="badge"], [class*="label"], [class*="tag"] {
          font-size: 0.55rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          opacity: 0.5 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: calc(100% - 10px) !important;
          display: block !important;
        }

        /* Correct Badge Positioning Override */
        .category-badge, [class*="image-wrapper"] [class*="badge"] {
          opacity: 1 !important;
          position: absolute !important;
          z-index: 5 !important;
        }

        /* MOBILE FIX: Force Filter Row Scrolling */
        .filter-row, .type-filter-row {
          display: flex !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          white-space: nowrap !important;
        }

        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-script { font-family: 'Dancing Script', cursive; }
        .gradient-blur-1 { background: radial-gradient(circle, #D1FAE5 0%, transparent 70%); }
        .gradient-blur-2 { background: radial-gradient(circle, #DBEAFE 0%, transparent 70%); }
      `}} />
      <ThemeEffects appearance={sharedAppearance} variant="public" />
      
      {/* Background Immersive Blows - LUTHER AESTHETIC */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] gradient-blur-1 opacity-20 -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] gradient-blur-2 opacity-15 translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Main Content Container - PORTFOLIO REDESIGN: Max Width 1100px */}
      <div className="w-full max-w-[1100px] mx-auto px-6 py-8 md:py-16 flex flex-col items-stretch flex-1">
        
        {/* ── SECTION 1: HERO HEADER - LUTHER AESTHETIC WRAP ── */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 mb-12 relative p-8 md:p-12 rounded-[40px] bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl">
          <button 
            onClick={handleShareProfile} 
            className="absolute top-0 right-0 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all z-20 hover:scale-110 active:scale-95 shadow-xl"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.15)", 
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "#ffffff"
            }}
          >
             <Share2 className="w-5 h-5 drop-shadow-md" />
          </button>
          
          {/* Subtle Background Mesh/Blur Area */}
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
          <div className="absolute top-20 -right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

          {/* Large Squircle Avatar */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="shrink-0 relative"
          >
            <div className="squircle overflow-hidden shadow-2xl relative z-10" style={{ width: "clamp(160px, 35vw, 240px)", height: "clamp(160px, 35vw, 240px)", border: `8px solid white` }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-muted"><User className="w-1/3 h-1/3 opacity-10" /></div>
              }
            </div>
          </motion.div>

          {/* Profile Content Column */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
            <div className="flex flex-col items-center md:items-start mb-4">
               <span className="font-script text-primary text-3xl lowercase mb-1 block">Hi, I'm</span>
               <div className="flex items-center gap-3">
                  <h1 className="font-[900] tracking-tight text-4xl md:text-6xl uppercase leading-[0.9]" style={{ color: palette.cardText }}>
                    {profile.name || profile.username}
                  </h1>
                  {profile.role === "pro" && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Pro</span>
                  )}
               </div>
            </div>
            
            <p className="text-base font-bold opacity-50 tracking-tight mb-4" style={{ color: palette.cardText }}>
              {profile.bio || "Interface and Brand Designer focused on premium aesthetics."}
            </p>

            <div className="flex items-center gap-3 mb-6">
               <button onClick={handleMessageAction} className="px-8 py-3.5 rounded-[14px] font-black text-[13px] uppercase tracking-wider shadow-lg tap-scale" style={{ backgroundColor: "#111111", color: "#ffffff" }}>
                Connect
              </button>
              <button 
                onClick={handleShareProfile}
                className="px-8 py-3.5 rounded-[14px] font-black text-[13px] uppercase tracking-wider border shadow-sm tap-scale group transition-all hover:bg-black/5" 
                style={{ borderColor: `${palette.cardText}30`, color: palette.cardText }}
              >
                Share
              </button>
            </div>

            {/* Social Icons Row - PORTFOLIO REDESIGN */}
            {profile.social_links && profile.social_links.length > 0 && (
              <div className="flex items-center gap-2">
                {profile.social_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full border bg-black/5 hover:bg-black/10 transition-all tap-scale"
                    style={{ borderColor: `${palette.cardText}10` }}
                  >
                    <SocialIcon platform={link.platform as SocialPlatform} className="w-4.5 h-4.5 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── SECTION 2: CONTENT NAV & TABS ── */}
        <div className="w-full border-b mb-6" style={{ borderColor: `${palette.cardText}15` }}>
          <div className="flex gap-10">
            <button 
              onClick={() => setActiveTab("shop")} 
              className={cn(
                "pb-5 text-[14px] font-[800] uppercase tracking-[0.05em] relative transition-all",
                activeTab === "shop" ? "opacity-100" : "opacity-30 hover:opacity-60"
              )} 
              style={{ color: palette.cardText }}
            >
              {shopTabLabel} <span className="ml-1 opacity-50 tabular-nums">{catalogItems.length}</span>
              {activeTab === "shop" && <motion.div layoutId="portfolio-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px]" style={{ backgroundColor: palette.cardText }} />}
            </button>
            <button 
              onClick={() => setActiveTab("links")} 
              className={cn(
                "pb-5 text-[14px] font-[800] uppercase tracking-[0.05em] relative transition-all",
                activeTab === "links" ? "opacity-100" : "opacity-30 hover:opacity-60"
              )} 
              style={{ color: palette.cardText }}
            >
              {linksTabLabel}
              {activeTab === "links" && <motion.div layoutId="portfolio-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px]" style={{ backgroundColor: palette.cardText }} />}
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="w-full flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "shop" ? (
              <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
                {showStudioContent && (
                  <div className="mb-12">
                     <StudioContentGrid 
                        items={studioCards} title="Featured Collections"
                        surfaceColor="transparent" borderColor={`${palette.cardText}10`}
                        textColor={palette.cardText} subTextColor={palette.cardText}
                        accentColor={palette.btnBg} sectionClassName="border-none p-0 !bg-transparent"
                     />
                  </div>
                )}
                {showCatalog && (
                  <PublicCatalog
                    items={catalogItems} profileUserId={profile.user_id}
                    textColor={palette.cardText} buttonBg={palette.btnBg} buttonText={getContrastColor(palette.btnBg)}
                    buttonStyle="rounded" catalogCardBg="#fff" cardBorder="#eee"
                    hasPhoto={true} upiId={profile.upi_id}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 links-grid">
                  {defaultLinks.map((link) => (
                    <GlassCard 
                      key={link.id} href={link.url} onClick={() => trackLocalStaticClick(link.id)} 
                      className="flex items-center p-5 gap-5 tap-scale group border transition-all duration-300"
                      style={{ 
                        borderRadius: "20px", 
                        color: palette.cardText, 
                        backgroundColor: "rgba(255,255,255,0.035)",
                        borderColor: `${palette.cardText}10`,
                        boxShadow: "0 8px 32px -12px rgba(0,0,0,0.15)"
                      }}
                    >
                      <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${palette.cardText}08` }}>
                        <SocialIcon platform={inferSocialPlatform(link.url, link.platform)} className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-[16px] font-black tracking-tight truncate uppercase leading-tight">{link.title}</h3>
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-0.5 truncate">{getSafeHostname(link.url)}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </GlassCard>
                  ))}
                 <div className="md:col-span-2 pt-16" ref={contactFormRef}>
                   <ContactForm 
                     profileUserId={profile.user_id} textColor={palette.cardText} buttonBg={palette.btnBg}
                     buttonText={palette.btnText} buttonStyle="rounded" hasPhoto={true}
                     cardBg={"rgba(255,255,255,0.025)"} cardBorder={`${palette.cardText}08`}
                   />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <footer className="mt-32 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6 opacity-40" style={{ borderColor: `${palette.cardText}10` }}>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                <Zap className="w-4 h-4 fill-primary text-primary" /> Made with BIOTRA.com
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
               <span>Terms</span> <span>Privacy</span> <span>Feedback</span> <span>Support</span>
            </div>
        </footer>
      </div>

      {profile && <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} url={window.location.href} name={profile.name || profile.username} />}

      {/* ── INQUIRY MODAL (Connect) ── */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContactOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.9, opacity: 0, y: 20 }} 
               className="relative w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border"
               style={{ backgroundColor: palette.cardBg || "#fff", borderColor: `${palette.cardText}10`, color: palette.cardText }}
            >
               <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-[900] tracking-tight">Send Inquiry</h2>
                     <button onClick={() => setIsContactOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
                        <Zap className="w-5 h-5 opacity-40" />
                     </button>
                  </div>
                  <ContactForm 
                     profileUserId={profile.user_id} 
                     textColor={palette.cardText} 
                     buttonBg={palette.btnBg}
                     buttonText={palette.btnText} 
                     buttonStyle="rounded" 
                     hasPhoto={true}
                     cardBg="transparent" 
                     cardBorder="transparent"
                  />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicProfile;
