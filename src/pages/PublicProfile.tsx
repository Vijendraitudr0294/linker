import { useState, useEffect, useMemo, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { SocialIcon, isEmbedPlatform } from "@/components/SocialIcon";
import type { SocialLinkConfig } from "@/stores/authStore";
import { Zap, ExternalLink, User, ShoppingBag, Loader2, Share2, MessageCircle, PlayCircle, Newspaper } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/stores/linksStore";
import EmbedRenderer from "@/components/public/EmbedRenderer";
import ContactForm from "@/components/public/ContactForm";
import PublicCatalog from "@/components/public/PublicCatalog";
import StarryBackground from "@/components/animations/StarryBackground";
import { computePalette, computeBgStyle, getLinkButtonClasses, getLinkButtonStyle, getLinkIconBgStyle, getFooterColor, type ProfileAppearance } from "@/lib/profileRenderer";

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
    tab_labels?: {
      shop?: string;
      links?: string;
    };
  };
  creator_metrics?: {
    engagement_rate?: string;
    avg_views?: string;
    reach?: string;
    tab_labels?: {
      shop?: string;
      links?: string;
    };
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
}

const defaultAppearance: AppearanceData = {
  background_color: "#ffffff",
  card_color: "#ffffff",
  text_color: "#1a1a1a",
  button_style: "rounded",
  button_bg: "#6366f1",
  button_text: "#ffffff",
  gradient_from: null,
  gradient_to: null,
  font_family: "Inter",
  show_avatar: true,
  shop_tab_label: "Shop",
  links_tab_label: "Links",
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
  return current;
};

const toMediaCardItem = (link: LinkData): MediaCardItem | null => {
  const url = (link.url || "").trim();
  if (!url) return null;

  const combinedText = `${link.title} ${url}`.toLowerCase();
  const platform = inferSocialPlatform(url, link.platform);
  const youtubeId = getYouTubeId(url);

  const isVideoLike =
    platform === "video-embed" ||
    platform === "youtube" ||
    platform === "instagram" ||
    platform === "tiktok" ||
    platform === "facebook" ||
    platform === "twitter" ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("instagram.com") ||
    url.includes("tiktok.com") ||
    url.includes("facebook.com");

  const isNewsLike = /(news|report|article|press|blog|update|newsletter)/i.test(combinedText);

  if (!isVideoLike && !isNewsLike) return null;

  const platformLabelMap: Record<string, string> = {
    youtube: "YouTube",
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    twitter: "X/Twitter",
    "video-embed": "Video",
    "website-embed": "Website",
    website: "Website",
    other: "Link",
  };

  return {
    id: link.id,
    title: link.title,
    url,
    platform,
    platformLabel: platformLabelMap[platform] || "Link",
    kind: isNewsLike && !isVideoLike ? "news" : "video",
    thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
  };
};

const resolveTabLabel = (
  primary: string | undefined,
  fallback: string | undefined,
  defaultValue: string
) => {
  const primaryText = (primary || "").trim();
  const fallbackText = (fallback || "").trim();
  if (!primaryText) return fallbackText || defaultValue;
  if (primaryText === defaultValue && fallbackText && fallbackText !== defaultValue) return fallbackText;
  return primaryText;
};
const PublicProfile = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [appearance, setAppearance] = useState<AppearanceData>(defaultAppearance);
  const [catalogItems, setCatalogItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "shop">("shop");
  const contactFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!username) { setNotFound(true); setLoading(false); return; }
      const lowerUsername = username.toLowerCase();
      if (!isSupabaseConfigured) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      let profileData: any = null;
      let profileError: any = null;

      if (lowerUsername === "user") {
        const { data: sessionData } = await supabase.auth.getSession();
        let authUserId = sessionData.session?.user?.id;

        if (!authUserId) {
          const { data: authUserData } = await supabase.auth.getUser();
          authUserId = authUserData.user?.id;
        }

        if (authUserId) {
          const fallback = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", authUserId)
            .maybeSingle();
          profileData = fallback.data;
          profileError = fallback.error;

          const canonicalUsername = fallback.data?.username?.toLowerCase();
          if (canonicalUsername && canonicalUsername !== "user") {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("lv:lastProfileUsername", fallback.data.username);
            }
            navigate(`/p/${fallback.data.username}`, { replace: true });
          }
        }

        if (!profileData && typeof window !== "undefined") {
          const storedUsername = window.localStorage.getItem("lv:lastProfileUsername")?.trim().toLowerCase();
          if (storedUsername && storedUsername !== "user") {
            const byStoredUsername = await supabase
              .from("profiles")
              .select("*")
              .eq("username", storedUsername)
              .maybeSingle();
            profileData = byStoredUsername.data;
            profileError = byStoredUsername.error;

            if (byStoredUsername.data?.username) {
              navigate(`/p/${byStoredUsername.data.username}`, { replace: true });
            }
          }
        }

        if (!profileData) {
          const byUsername = await supabase
            .from("profiles")
            .select("*")
            .eq("username", lowerUsername)
            .maybeSingle();
          profileData = byUsername.data;
          profileError = byUsername.error;
        }
      } else {
        const byUsername = await supabase
          .from("profiles")
          .select("*")
          .eq("username", lowerUsername)
          .maybeSingle();
        profileData = byUsername.data;
        profileError = byUsername.error;
      }

      if (profileError || !profileData) { setNotFound(true); setLoading(false); return; }
      const profileStatus = (profileData as Record<string, unknown>).status as string | null | undefined;
      if (profileStatus && profileStatus !== "active") { setNotFound(true); setLoading(false); return; }

      if (typeof window !== "undefined" && profileData?.username) {
        window.localStorage.setItem("lv:lastProfileUsername", profileData.username);
      }

      setProfile({
        name: profileData.name, username: profileData.username, bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "", user_id: profileData.user_id,
        social_links: ((profileData as Record<string, unknown>).social_links as SocialLinkConfig[]) || [],
        upi_id: (profileData as Record<string, unknown>).upi_id as string || "",
        stats: (profileData as Record<string, unknown>).social_stats as any || {},
        creator_metrics: (profileData as Record<string, unknown>).creator_metrics as any || {}
      });

      const [linksRes, appearanceRes, catalogRes] = await Promise.all([
        supabase.from("links").select("id, title, url, platform").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
        supabase.from("appearance_settings").select("*").eq("user_id", profileData.user_id).maybeSingle(),
        supabase.from("catalog_items").select("*").eq("user_id", profileData.user_id).eq("enabled", true).order("sort_order", { ascending: true }),
      ]);

      if (linksRes.data) setLinks(linksRes.data);
      if (catalogRes.data) setCatalogItems(catalogRes.data as Record<string, unknown>[]);

      if (appearanceRes.data) {
        const a = appearanceRes.data as Record<string, unknown>;
        setAppearance({
          background_color: (a.background_color as string) || defaultAppearance.background_color,
          card_color: (a.card_color as string) || defaultAppearance.card_color,
          text_color: (a.text_color as string) || defaultAppearance.text_color,
          button_style: (a.button_style as any) || defaultAppearance.button_style,
          button_bg: (a.button_bg as string) || defaultAppearance.button_bg,
          button_text: (a.button_text as string) || defaultAppearance.button_text,
          gradient_from: a.gradient_from as string | null,
          gradient_to: a.gradient_to as string | null,
          font_family: (a.font_family as string) || defaultAppearance.font_family,
          show_avatar: a.show_avatar !== undefined ? (a.show_avatar as boolean) : true,
          background_image: (a.background_image as string) || undefined,
          background_overlay: (a.background_overlay as string) || undefined,
          animated_gradient: (a.animated_gradient as string) || undefined,
          animation_class: (a.animation_class as string) || undefined,
          shop_tab_label: (a.shop_tab_label as string) || defaultAppearance.shop_tab_label,
          links_tab_label: (a.links_tab_label as string) || defaultAppearance.links_tab_label,
        });
      }
      setLoading(false);
    };
    fetchData();

    // Subscribe to real-time appearance changes
    let channel: any;
    const subscribeToChanges = async () => {
      if (!isSupabaseConfigured || !username) return;
      const lowerUsername = username.toLowerCase();
      let profileData: { user_id: string } | null = null;

      if (lowerUsername === "user") {
        const { data: sessionData } = await supabase.auth.getSession();
        let authUserId = sessionData.session?.user?.id;

        if (!authUserId) {
          const { data: authUserData } = await supabase.auth.getUser();
          authUserId = authUserData.user?.id;
        }

        if (authUserId) {
          const fallback = await supabase
            .from("profiles")
            .select("user_id")
            .eq("user_id", authUserId)
            .maybeSingle();
          profileData = fallback.data;
        }

        if (!profileData && typeof window !== "undefined") {
          const storedUsername = window.localStorage.getItem("lv:lastProfileUsername")?.trim().toLowerCase();
          if (storedUsername && storedUsername !== "user") {
            const byStoredUsername = await supabase
              .from("profiles")
              .select("user_id")
              .eq("username", storedUsername)
              .maybeSingle();
            profileData = byStoredUsername.data;
          }
        }
      }

      if (!profileData) {
        const byUsername = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", lowerUsername)
          .maybeSingle();
        profileData = byUsername.data;
      }

      if (!profileData) return;

      channel = supabase
        .channel(`public_appearance_${profileData.user_id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appearance_settings', filter: `user_id=eq.${profileData.user_id}` },
          (payload) => {
            const a = payload.new as any;
            if (a) {
              setAppearance({
                background_color: a.background_color || defaultAppearance.background_color,
                card_color: a.card_color || defaultAppearance.card_color,
                text_color: a.text_color || defaultAppearance.text_color,
                button_style: a.button_style || defaultAppearance.button_style,
                button_bg: a.button_bg || defaultAppearance.button_bg,
                button_text: a.button_text || defaultAppearance.button_text,
                gradient_from: a.gradient_from,
                gradient_to: a.gradient_to,
                font_family: a.font_family || defaultAppearance.font_family,
                show_avatar: a.show_avatar !== undefined ? a.show_avatar : true,
                background_image: a.background_image || undefined,
                background_overlay: a.background_overlay || undefined,
                animated_gradient: a.animated_gradient || undefined,
                animation_class: a.animation_class || undefined,
                shop_tab_label: a.shop_tab_label || defaultAppearance.shop_tab_label,
                links_tab_label: a.links_tab_label || defaultAppearance.links_tab_label,
              });
            }
          }
        )
        .subscribe();
    };

    subscribeToChanges();


    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate, username]);

  // Use SHARED rendering utilities — single source of truth
  const sharedAppearance: ProfileAppearance = useMemo(() => ({
    background_color: appearance.background_color,
    card_color: appearance.card_color,
    text_color: appearance.text_color,
    button_style: appearance.button_style,
    button_bg: appearance.button_bg,
    button_text: appearance.button_text,
    gradient_from: appearance.gradient_from,
    gradient_to: appearance.gradient_to,
    font_family: appearance.font_family,
    show_avatar: appearance.show_avatar,
    background_image: appearance.background_image,
    background_overlay: appearance.background_overlay,
    animated_gradient: appearance.animated_gradient,
    animation_class: appearance.animation_class,
  }), [appearance]);

  const palette = useMemo(() => computePalette(sharedAppearance), [sharedAppearance]);
  const bgStyle = useMemo(() => computeBgStyle(sharedAppearance), [sharedAppearance]);

  const showSocial = (profile?.social_links?.length ?? 0) > 0;
  const showLinksTab = links.length > 0;
  const showCatalog = catalogItems.length > 0;
  const creatorMetricTabLabels = useMemo(() => {
    const tabLabels = profile?.creator_metrics?.tab_labels;
    return {
      shop: typeof tabLabels?.shop === "string" ? tabLabels.shop.trim() : "",
      links: typeof tabLabels?.links === "string" ? tabLabels.links.trim() : "",
    };
  }, [profile?.creator_metrics]);

  const socialMetricTabLabels = useMemo(() => {
    const socialStats = profile?.stats as Record<string, unknown> | undefined;
    const tabLabels = socialStats?.tab_labels as Record<string, unknown> | undefined;
    return {
      shop: typeof tabLabels?.shop === "string" ? tabLabels.shop.trim() : "",
      links: typeof tabLabels?.links === "string" ? tabLabels.links.trim() : "",
    };
  }, [profile?.stats]);

  const shopTabLabel = resolveTabLabel(
    appearance.shop_tab_label,
    creatorMetricTabLabels.shop || socialMetricTabLabels.shop,
    "Shop"
  );
  const linksTabLabel = resolveTabLabel(
    appearance.links_tab_label,
    creatorMetricTabLabels.links || socialMetricTabLabels.links,
    "Links"
  );
  const hasCreatorMetrics = Boolean(
    profile?.creator_metrics?.engagement_rate ||
      profile?.creator_metrics?.avg_views ||
      profile?.creator_metrics?.reach
  );

  const mediaFallbackItems = useMemo(
    () => links.map((link) => toMediaCardItem(link)).filter((item): item is MediaCardItem => Boolean(item)),
    [links]
  );

  const showMediaFallback = !showCatalog && mediaFallbackItems.length > 0;
  const hasTabs = showCatalog || showLinksTab || showMediaFallback;

  useEffect(() => {
    if (!showCatalog && !showMediaFallback && showLinksTab) setActiveTab("links");
    if ((showCatalog || showMediaFallback) && !showLinksTab) setActiveTab("shop");
  }, [showCatalog, showLinksTab, showMediaFallback]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (notFound || !profile) return <div className="min-h-screen flex items-center justify-center bg-background text-center p-8"><div className="space-y-4"><h1 className="text-3xl font-black">404</h1><p className="text-muted-foreground">Profile not found</p></div></div>;

  const bgColor = appearance.background_color;

  const handleShareProfile = async () => {
    if (!profile?.username) return;
    const shareUrl = `${window.location.origin}/p/${profile.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.name || profile.username,
          text: profile.bio || `Check out @${profile.username} on LinkVertex`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to clipboard when native share is dismissed or unavailable.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Profile link copied");
    } catch {
      toast.error("Could not share profile link");
    }
  };

  const handleMessageAction = () => {
    if (!showLinksTab) {
      toast.error("Message form is not available for this profile");
      return;
    }

    if (activeTab !== "links") {
      setActiveTab("links");
    }

    window.setTimeout(() => {
      contactFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, activeTab === "links" ? 0 : 180);
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center"
      style={bgStyle}
    >
      {appearance.background_image && (
        <>
          <img src={appearance.background_image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          {appearance.background_overlay && (
            <div className="absolute inset-0" style={{ backgroundColor: appearance.background_overlay }} />
          )}
        </>
      )}

      {/* Special Animation Overlays — Each is a self-contained, isolated module */}
      {(appearance.animation_class === "animate-stars" || appearance.animation_class === "animate-nordic-stars") && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: !appearance.background_image ? bgColor : 'transparent' }}>
          <StarryBackground
            starCount={appearance.animation_class === "animate-nordic-stars" ? 90 : 120}
            starColor="rgba(255,255,255,0.6)"
            shootingStarInterval={appearance.animation_class === "animate-nordic-stars" ? 5000 : 4000}
          />
        </div>
      )}
      {appearance.animation_class === "animate-mesh" && <div className="absolute inset-0 z-0 animate-mesh opacity-80" />}
      {appearance.animation_class === "animate-holo" && <div className="absolute inset-0 z-0 animate-holo opacity-60" />}
      {appearance.animation_class === "animate-blob-slow" && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 shadow-inner" style={{ backgroundColor: bgColor }}>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/40 blur-[50px] animate-blob-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/40 blur-[60px] animate-blob-slow [animation-delay:-5s]" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/30 blur-[55px] animate-blob-slow [animation-delay:-10s]" />
          <div className="absolute bottom-[20%] right-[30%] w-[45%] h-[45%] rounded-full bg-pink-500/35 blur-[55px] animate-blob-slow [animation-delay:-15s]" />
        </div>
      )}
      {appearance.animation_class === "animate-aurora" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !appearance.background_image && "opacity-100")} style={{ backgroundColor: !appearance.background_image ? bgColor : 'transparent' }}>
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0,transparent_50%)] animate-[aurora-1_20s_linear_infinite]" />
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3)_0,transparent_50%)] animate-[aurora-2_25s_linear_infinite]" />
          <div className="absolute bottom-[-50%] left-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.3)_0,transparent_50%)] animate-[aurora-3_30s_linear_infinite]" />
        </div>
      )}
      {appearance.animation_class === "animate-particles" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !appearance.background_image && "opacity-100")} style={{ backgroundColor: !appearance.background_image ? bgColor : 'transparent' }}>
          <div className="absolute inset-0 animate-particles opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.8)_95%)]" />
        </div>
      )}
      {appearance.animation_class === "animate-galaxy" && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 animate-galaxy opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.2)_100%)]" />
        </div>
      )}
      {appearance.animation_class === "animate-star-shower" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="star-streak" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`, 
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }} 
            />
          ))}
        </div>
      )}
      {appearance.animation_class === "animate-energy" && (
        <div className="absolute inset-0 z-0 animate-energy opacity-80 pointer-events-none" />
      )}
      {appearance.animation_class === "animate-cyber-grid" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden flex items-center justify-center", !appearance.background_image && "opacity-100")} style={{ backgroundColor: !appearance.background_image ? bgColor : 'transparent' }}>
          <div className="absolute bottom-[-10%] w-[200%] h-[100%] animate-cyber-grid opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to top, ${bgColor}, transparent, ${bgColor})` }} />
        </div>
      )}
      {appearance.animation_class === "animate-liquid" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full animate-liquid opacity-35" />
          <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full animate-liquid opacity-25 [animation-delay:-3s]" />
        </div>
      )}

      {!prefersReducedMotion && appearance.animation_class === "fm-fade" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 60%)" }}
        />
      )}

      {!prefersReducedMotion && appearance.animation_class === "fm-slide-up" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-0 w-full h-24 opacity-20"
              style={{ top: `${20 + i * 26}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              animate={{ y: [30, -30, 30] }}
              transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            />
          ))}
        </div>
      )}

      {!prefersReducedMotion && appearance.animation_class === "fm-pulse-glow" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 30%, rgba(56,189,248,0.28), transparent 55%)" }}
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.04, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {!prefersReducedMotion && appearance.animation_class === "fm-float" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -left-8 top-10 w-40 h-40 rounded-full bg-cyan-400/25 blur-3xl"
            animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-0 bottom-0 w-44 h-44 rounded-full bg-purple-400/20 blur-3xl"
            animate={{ y: [0, 16, 0], x: [0, -8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {!prefersReducedMotion && appearance.animation_class === "fm-parallax" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(120deg, rgba(59,130,246,0.45), transparent 45%, rgba(168,85,247,0.35))" }}
            animate={{ x: [-12, 12, -12], y: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 opacity-15"
            style={{ background: "radial-gradient(circle at 75% 20%, rgba(34,211,238,0.45), transparent 40%)" }}
            animate={{ x: [10, -10, 10], y: [6, -6, 6] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="w-full max-w-[1120px] mx-auto relative z-10 flex flex-col items-center min-h-screen pb-28 px-3 md:px-6">
        {/* Main Card */}
        <div
          className="w-full max-w-3xl rounded-t-none rounded-b-[1.4rem] md:rounded-[1.7rem] p-4 md:p-6 shadow-2xl relative overflow-hidden mb-6 transition-all duration-500 md:mt-6"
          style={{
            backgroundColor: palette.cardBg,
            borderBottom: `1px solid ${palette.cardBorder}`,
            color: palette.cardText
          }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start md:gap-5 relative z-10">
            {/* Avatar Section */}
            {appearance.show_avatar && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative shrink-0 mb-3 md:mb-0"
              >
                <div
                  className="w-[4.5rem] h-[4.5rem] md:w-24 md:h-24 rounded-full overflow-hidden relative bg-muted shadow-xl ring-2"
                  style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.5)", borderColor: `${palette.btnBg}40` }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <User className="w-12 h-12 md:w-20 md:h-20 text-muted-foreground opacity-20" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Info Section */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
              <div className="w-full max-w-[560px] flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 text-left">
                  <h1 className="text-xl md:text-[2rem] font-extrabold tracking-[0.4px] uppercase truncate">{profile.name || profile.username}</h1>
                  {profile.username && (
                    <p className="text-xs md:text-sm font-bold opacity-60 flex items-center gap-1.5">
                      @{profile.username}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={handleMessageAction}
                    aria-label="Message"
                    title="Message"
                    className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95"
                    style={{
                      color: palette.cardText,
                      borderColor: palette.cardBorder,
                      backgroundColor: `${palette.cardText}08`,
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    aria-label="Share profile"
                    title="Share profile"
                    className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95"
                    style={{
                      color: palette.cardText,
                      borderColor: palette.cardBorder,
                      backgroundColor: `${palette.cardText}08`,
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Social Stats Chips */}
              {profile.stats && Object.values(profile.stats).some(v => v) && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                  {profile.stats.ig_followers && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9fa] border border-border/40 shadow-sm">
                      <SocialIcon platform="instagram" className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: palette.cardText }}>{profile.stats.ig_followers}</span>
                    </div>
                  )}
                  {profile.stats.tiktok_followers && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9fa] border border-border/40 shadow-sm">
                      <SocialIcon platform="tiktok" className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: palette.cardText }}>{profile.stats.tiktok_followers}</span>
                    </div>
                  )}
                  {profile.stats.fb_likes && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9fa] border border-border/40 shadow-sm">
                      <SocialIcon platform="facebook" className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: palette.cardText }}>{profile.stats.fb_likes}</span>
                    </div>
                  )}
                  {profile.stats.youtube_subs && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9fa] border border-border/40 shadow-sm">
                      <SocialIcon platform="youtube" className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: palette.cardText }}>{profile.stats.youtube_subs}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Creator Metrics - Engagement */}
              {hasCreatorMetrics && (
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 w-full">
                  {profile.creator_metrics.engagement_rate && (
                    <div className="flex flex-col border-l-2 border-primary/20 pl-3 py-1">
                      <span className="text-[9px] uppercase font-bold opacity-50 tracking-tighter" style={{ color: palette.cardSub }}>Engage</span>
                      <span className="text-sm font-black" style={{ color: palette.cardText }}>{profile.creator_metrics.engagement_rate}</span>
                    </div>
                  )}
                  {profile.creator_metrics.avg_views && (
                    <div className="flex flex-col border-l-2 border-primary/20 pl-3 py-1">
                      <span className="text-[9px] uppercase font-bold opacity-50 tracking-tighter" style={{ color: palette.cardSub }}>Avg Views</span>
                      <span className="text-sm font-black" style={{ color: palette.cardText }}>{profile.creator_metrics.avg_views}</span>
                    </div>
                  )}
                  {profile.creator_metrics.reach && (
                    <div className="flex flex-col border-l-2 border-primary/20 pl-3 py-1">
                      <span className="text-[9px] uppercase font-bold opacity-50 tracking-tighter" style={{ color: palette.cardSub }}>Monthly Reach</span>
                      <span className="text-sm font-black" style={{ color: palette.cardText }}>{profile.creator_metrics.reach}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Social Icons - Desktop Position */}
              {showSocial && (
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1">
                  {profile.social_links.map(link => (
                    <a 
                      key={link.platform} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110 hover:brightness-110 active:scale-95 shadow-md bg-white/5 group" 
                      style={{ borderColor: palette.cardBorder, color: palette.cardText }}
                    >
                      <SocialIcon platform={link.platform as SocialPlatform} className="w-5 h-5 md:w-5.5 md:h-5.5 group-hover:drop-shadow-lg" />
                    </a>
                  ))}
                </div>
              )}

              {/* Tabs Section - Integrated into Info Block for Desktop */}
              {hasTabs && (
                <div className="flex gap-1.5 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 shadow-inner mt-2 w-fit">
                  {(showCatalog || showMediaFallback) && (
                    <button
                      onClick={() => setActiveTab("shop")}
                      className={cn(
                        "px-3.5 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.12em] transition-all flex items-center gap-1.5", 
                        activeTab === "shop" ? "shadow-lg scale-[1.02]" : "text-muted-foreground hover:bg-white/5"
                      )}
                      style={{
                        backgroundColor: activeTab === "shop" ? palette.btnBg : "transparent",
                        color: activeTab === "shop" ? palette.btnText : palette.cardSub
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 md:w-4.5 md:h-4.5" /> {shopTabLabel}
                    </button>
                  )}
                  {showLinksTab && (
                    <button
                      onClick={() => setActiveTab("links")}
                      className={cn(
                        "px-3.5 md:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.12em] transition-all", 
                        activeTab === "links" ? "shadow-lg scale-[1.02]" : "text-muted-foreground hover:bg-white/5"
                      )}
                      style={{
                        backgroundColor: activeTab === "links" ? palette.btnBg : "transparent",
                        color: activeTab === "links" ? palette.btnText : palette.cardSub
                      }}
                    >{linksTabLabel}</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "shop" && (showCatalog || showMediaFallback) ? (
            showCatalog ? (
              <motion.div key="shop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <PublicCatalog items={catalogItems as any} profileUserId={profile.user_id} upiId={profile.upi_id} textColor={palette.cardText} buttonBg={palette.btnBg} buttonText={palette.btnText} buttonStyle={appearance.button_style} catalogCardBg={palette.cardBg} hasPhoto={!!appearance.background_image} />
              </motion.div>
            ) : (
              <motion.div key="shop-media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl space-y-4 mt-2">
                <div className="w-full rounded-[1.8rem] p-5 md:p-6 border shadow-2xl" style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm md:text-base font-black uppercase tracking-[0.14em]" style={{ color: palette.cardText }}>{shopTabLabel}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${palette.btnBg}20`, color: palette.cardText }}>
                      {mediaFallbackItems.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaFallbackItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl overflow-hidden border transition-all hover:translate-y-[-2px] hover:shadow-xl group"
                        style={{ borderColor: palette.cardBorder, backgroundColor: `${palette.cardText}05` }}
                      >
                        <div className="aspect-video overflow-hidden" style={{ backgroundColor: `${palette.btnBg}1A` }}>
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: `${palette.cardText}A0` }}>
                              {item.kind === "news" ? <Newspaper className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                                <SocialIcon platform={item.platform} className="w-3.5 h-3.5" />
                                {item.platformLabel}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-2">
                          <p className="text-sm font-bold leading-snug line-clamp-2" style={{ color: palette.cardText }}>{item.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${palette.cardText}B0` }}>
                              {item.platformLabel}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: `${palette.btnBg}20`, color: palette.cardText }}>
                              {item.kind === "news" ? "Read" : "Watch"}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          ) : showLinksTab ? (
            <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl space-y-4 mt-2">
              <div className="grid grid-cols-1 gap-4 w-full">
                {links.map((link) => {
                  const platform = (link.platform as SocialPlatform) || "website";
                  const isEmbedLink = isEmbedPlatform(platform);

                  if (isEmbedLink) {
                    return (
                      <motion.div 
                        whileHover={{ scale: 1.01, translateY: -2 }}
                        key={link.id}
                        className={cn(
                          "p-5 w-full transition-all duration-300 group relative overflow-hidden outline-none ring-primary/20",
                          getLinkButtonClasses(appearance.button_style)
                        )}
                        style={getLinkButtonStyle(appearance.button_style, palette.btnBg, palette.btnText)}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={getLinkIconBgStyle(appearance.button_style, palette.btnBg)}>
                            <SocialIcon platform={platform} className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <span className="text-[17px] font-bold tracking-tight block truncate uppercase">{link.title}</span>
                          </div>
                        </div>
                        <EmbedRenderer url={link.url} platform={platform} title={link.title} />
                      </motion.div>
                    );
                  }

                  return (
                    <motion.a 
                      whileHover={{ scale: 1.01, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={cn(
                        "flex items-center p-5 w-full transition-all duration-300 group relative overflow-hidden outline-none ring-primary/20",
                        getLinkButtonClasses(appearance.button_style)
                      )}
                      style={getLinkButtonStyle(appearance.button_style, palette.btnBg, palette.btnText)}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-inner" style={getLinkIconBgStyle(appearance.button_style, palette.btnBg)}>
                        <SocialIcon platform={platform} className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-[17px] font-bold tracking-tight block truncate uppercase">{link.title}</span>
                      </div>
                      <div className="ml-4 opacity-40 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Contact Form Integration */}
              <div
                ref={contactFormRef}
                className="w-full rounded-[2.5rem] p-8 shadow-2xl"
                style={{
                  backgroundColor: palette.cardBg,
                  border: `1px solid ${palette.cardBorder}`,
                  scrollMarginTop: "24px",
                }}
              >
                <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-center" style={{ color: palette.cardText }}>Send a message</h4>
                <ContactForm profileUserId={profile.user_id} textColor={palette.cardText} buttonBg={palette.btnBg} buttonText={palette.btnText} buttonStyle={appearance.button_style} hasPhoto={false} inputBg="rgba(0,0,0,0.03)" inputBorder="rgba(0,0,0,0.08)" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl mt-3 rounded-[1.8rem] p-8 text-center border"
              style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder, color: palette.cardText }}
            >
              <h3 className="text-lg font-black tracking-tight mb-2">Nothing published yet</h3>
              <p className="text-sm opacity-70">This creator has not added links or catalog items yet.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-auto py-12 text-center opacity-40 hover:opacity-100 transition-opacity">
          <Link to="/" className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: getFooterColor(sharedAppearance) }}>
            <Zap className="w-3.5 h-3.5 fill-primary text-primary" /> Made with LinkVertex
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

