import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { User, ShoppingBag, Music, Zap, Store, ExternalLink, Smartphone, Copy, Layout, ShoppingCart, Link2, UtensilsCrossed, Dumbbell, Download, Users } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { useCurrency } from "@/hooks/useCurrency";
import type { AppearanceSettings } from "@/stores/appearanceStore";
import type { SocialPlatform } from "@/stores/linksStore";
import StarryBackground from "@/components/animations/StarryBackground";
import { motion, useReducedMotion } from "framer-motion";
import { computePalette, computeBgStyle, getLinkButtonClasses, getLinkButtonStyle, getLinkIconBgStyle, getFooterColor, type ProfileAppearance } from "@/lib/profileRenderer";

interface SocialLinkConfig {
  platform: string;
  url: string;
}

interface CatalogPreviewItem {
  id: string;
  title: string;
  price?: number | null;
  price_label?: string;
  item_type?: string;
  image_url?: string;
  category?: string;
  description?: string;
}

interface ProfilePreviewProps {
  settings: AppearanceSettings;
  user?: { name?: string; username?: string; avatar_url?: string; bio?: string; social_links?: SocialLinkConfig[] } | null;
  links: { id: string; title: string; platform?: string }[];
  catalogItems?: CatalogPreviewItem[];
  showSocialIcons?: boolean;
  creatorMetrics?: {
    engagement_rate?: string;
    avg_views?: string;
    reach?: string;
  };
  compact?: boolean;
  noFrame?: boolean;
}

const TYPE_ICONS: Record<string, typeof ShoppingBag> = {
  physical: ShoppingBag,
  food: UtensilsCrossed,
  service: Dumbbell,
  digital: Download,
};

const platformColors: Record<string, string> = {
  youtube: "#FF0000", instagram: "#E4405F", tiktok: "#000000", twitter: "#1DA1F2",
  facebook: "#1877F2", linkedin: "#0A66C2", github: "#181717", spotify: "#1DB954",
  whatsapp: "#25D366", telegram: "#26A5E4", pinterest: "#BD081C", snapchat: "#FFFC00",
  discord: "#5865F2", twitch: "#9146FF", reddit: "#FF4500", dribbble: "#EA4C89",
  behance: "#1769FF", medium: "#000000", website: "#6366f1",
};

const ProfilePreview = ({ settings, user, links, catalogItems = [], showSocialIcons = true, creatorMetrics, compact = false, noFrame = false }: ProfilePreviewProps) => {
  const hasAnimated = !!settings.animatedGradient || !!settings.animationClass;
  const prefersReducedMotion = useReducedMotion();
  const { formatPrice } = useCurrency();
  const socialLinks = user?.social_links || [];
  const hasPhoto = !!settings.backgroundImage;
  const hasLinks = links.length > 0;
  const hasTabs = catalogItems.length > 0 || hasLinks;
  const shopTabLabel = settings.shopTabLabel?.trim() || "Shop";
  const linksTabLabel = settings.linksTabLabel?.trim() || "Links";
  const [activeTab, setActiveTab] = useState<"links" | "shop">("shop");

  useEffect(() => {
    if (catalogItems.length === 0 && hasLinks) setActiveTab("links");
    if (catalogItems.length > 0) setActiveTab((prev) => (prev === "links" || prev === "shop" ? prev : "shop"));
  }, [catalogItems.length, hasLinks]);

  // Use SHARED rendering utilities — single source of truth (locked logic)
  const sharedAppearance: ProfileAppearance = {
    background_color: settings.backgroundColor,
    card_color: settings.cardColor || "#ffffff",
    text_color: settings.textColor || "#1a1a1a",
    button_style: settings.buttonStyle,
    button_bg: settings.buttonBg,
    button_text: settings.buttonText,
    gradient_from: settings.gradientFrom,
    gradient_to: settings.gradientTo,
    font_family: settings.fontFamily,
    show_avatar: settings.showAvatar,
    background_image: settings.backgroundImage,
    background_overlay: settings.backgroundOverlay,
    animated_gradient: settings.animatedGradient,
    animation_class: settings.animationClass,
  };

  const { cardBg, cardText, cardSub, cardBorder, btnBg, btnText } = computePalette(sharedAppearance);
  const bgStyle = computeBgStyle(sharedAppearance);

  const categories = [...new Set(catalogItems.map((i) => i.category || "General"))];
  const isAiMusicTheme = settings.themeId?.startsWith("ai-image-");

  const screenContent = (() => {
    const bgColor = settings.backgroundColor;

    return (
    <div
      className="h-full w-full relative overflow-hidden flex flex-col"
      style={bgStyle}
    >
      {settings.backgroundImage && (
        <>
          <img src={settings.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          {settings.backgroundOverlay && (
            <div className="absolute inset-0" style={{ backgroundColor: settings.backgroundOverlay }} />
          )}
        </>
      )}

      {/* Special Animation Overlays — Isolated modules */}
      {(settings.animationClass === "animate-stars" || settings.animationClass === "animate-nordic-stars") && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: !settings.backgroundImage ? bgColor : 'transparent' }}>
          <StarryBackground
            starCount={settings.animationClass === "animate-nordic-stars" ? 60 : 80}
            starColor="rgba(255,255,255,0.6)"
            shootingStarInterval={settings.animationClass === "animate-nordic-stars" ? 6000 : 4000}
          />
        </div>
      )}

      {settings.animationClass === "animate-mesh" && (
        <div className="absolute inset-0 z-0 animate-mesh opacity-80" />
      )}

      {settings.animationClass === "animate-holo" && (
        <div className="absolute inset-0 z-0 animate-holo opacity-60" />
      )}

      {settings.animationClass === "animate-blob-slow" && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 shadow-inner" style={{ backgroundColor: bgColor }}>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/40 blur-[50px] animate-blob-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/40 blur-[60px] animate-blob-slow [animation-delay:-5s]" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/30 blur-[55px] animate-blob-slow [animation-delay:-10s]" />
          <div className="absolute bottom-[20%] right-[30%] w-[45%] h-[45%] rounded-full bg-pink-500/35 blur-[55px] animate-blob-slow [animation-delay:-15s]" />
        </div>
      )}
      {settings.animationClass === "animate-aurora" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !settings.backgroundImage && "opacity-100")} style={{ backgroundColor: !settings.backgroundImage ? bgColor : 'transparent' }}>
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0,transparent_50%)] animate-[aurora-1_20s_linear_infinite]" />
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3)_0,transparent_50%)] animate-[aurora-2_25s_linear_infinite]" />
          <div className="absolute bottom-[-50%] left-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.3)_0,transparent_50%)] animate-[aurora-3_30s_linear_infinite]" />
        </div>
      )}
      {settings.animationClass === "animate-particles" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !settings.backgroundImage && "opacity-100")} style={{ backgroundColor: !settings.backgroundImage ? bgColor : 'transparent' }}>
          <div className="absolute inset-0 animate-particles opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.8)_95%)]" />
        </div>
      )}
      {settings.animationClass === "animate-galaxy" && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 animate-galaxy opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.2)_100%)]" />
        </div>
      )}
      {settings.animationClass === "animate-star-shower" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
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
      {settings.animationClass === "animate-cyber-grid" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden flex items-center justify-center", !settings.backgroundImage && "opacity-100")} style={{ backgroundColor: !settings.backgroundImage ? bgColor : 'transparent' }}>
          <div className="absolute bottom-[-10%] w-[200%] h-[100%] animate-cyber-grid opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to top, ${bgColor}, transparent, ${bgColor})` }} />
        </div>
      )}

      {settings.animationClass === "animate-energy" && (
        <div className="absolute inset-0 z-0 animate-energy opacity-80 pointer-events-none" />
      )}

      {settings.animationClass === "animate-liquid" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full animate-liquid opacity-35" />
          <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full animate-liquid opacity-25 [animation-delay:-3s]" />
        </div>
      )}

      {!prefersReducedMotion && settings.animationClass === "fm-fade" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 60%)" }}
        />
      )}

      {!prefersReducedMotion && settings.animationClass === "fm-slide-up" && (
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

      {!prefersReducedMotion && settings.animationClass === "fm-pulse-glow" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 30%, rgba(56,189,248,0.28), transparent 55%)" }}
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.04, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {!prefersReducedMotion && settings.animationClass === "fm-float" && (
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

      {!prefersReducedMotion && settings.animationClass === "fm-parallax" && (
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

      {isAiMusicTheme && (
        <div className="absolute top-4 right-4 z-20 bg-black/60 shadow-lg p-1.5 rounded-full flex items-center justify-center animate-pulse">
          <Music className="w-3.5 h-3.5 text-white animate-bounce" />
          {/* Simulated Lo-Fi Background Music */}
          <audio src="https://assets.mixkit.co/music/preview/mixkit-chill-bro-89.mp3" autoPlay loop className="hidden" />
        </div>
      )}

      <div className="flex flex-col items-center relative z-10 w-full mb-6">
        {/* Profile card */}
        <div
          className="w-full rounded-b-[2rem] p-5 pt-8 flex flex-col items-center gap-3 shadow-xl relative overflow-hidden"
          style={{
            backgroundColor: cardBg,
            borderBottom: `1px solid ${cardBorder}`,
            fontFamily: settings.fontFamily
          }}
        >
          {settings.showAvatar && (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl z-10"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: btnBg }}>
                  <User className="w-9 h-9" style={{ color: btnText }} />
                </div>
              )}
            </div>
          )}
          <div className="text-center space-y-1 relative z-10">
            <h3 className="text-xl font-black tracking-tight" style={{ color: cardText }}>
              {user?.name || user?.username || ""}
            </h3>
            {user?.username && (
              <p className="text-[10px] font-bold opacity-60 flex items-center justify-center gap-1" style={{ color: cardSub }}>
                 <Link2 className="w-3 h-3" />
                 @{user.username}
              </p>
            )}
            {user?.bio && (
              <p className="text-[11px] mt-2 max-w-[220px] mx-auto leading-relaxed font-semibold opacity-80" style={{ color: cardSub }}>
                {user.bio}
              </p>
            )}
          </div>

          {/* Creator Metrics Chips - CLEAN DESIGN */}
          {creatorMetrics && (creatorMetrics.engagement_rate || creatorMetrics.avg_views || creatorMetrics.reach) && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-1 relative z-10 w-full px-2">
              {creatorMetrics.engagement_rate && (
                <div className="flex flex-col items-center px-3 py-1.5 rounded-xl border" style={{ backgroundColor: `${cardText}03`, borderColor: `${cardText}10` }}>
                  <span className="text-[8px] font-bold uppercase opacity-40" style={{ color: cardText }}>Engage</span>
                  <span className="text-[10px] font-black" style={{ color: btnBg }}>{creatorMetrics.engagement_rate}</span>
                </div>
              )}
              {creatorMetrics.avg_views && (
                <div className="flex flex-col items-center px-3 py-1.5 rounded-xl border" style={{ backgroundColor: `${cardText}03`, borderColor: `${cardText}10` }}>
                  <span className="text-[8px] font-bold uppercase opacity-40" style={{ color: cardText }}>Views</span>
                  <span className="text-[10px] font-black" style={{ color: btnBg }}>{creatorMetrics.avg_views}</span>
                </div>
              )}
              {creatorMetrics.reach && (
                <div className="flex flex-col items-center px-3 py-1.5 rounded-xl border" style={{ backgroundColor: `${cardText}03`, borderColor: `${cardText}10` }}>
                  <span className="text-[8px] font-bold uppercase opacity-40" style={{ color: cardText }}>Reach</span>
                  <span className="text-[10px] font-black" style={{ color: btnBg }}>{creatorMetrics.reach}</span>
                </div>
              )}
            </div>
          )}

          {showSocialIcons && socialLinks.length > 0 && (
            <div className="flex items-center gap-2 relative z-10">
              {socialLinks.map((link) => (
                <div
                  key={link.platform}
                  className="w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-transform hover:scale-110"
                  style={{ borderColor: `${cardText}15`, color: cardText, backgroundColor: `${cardText}05` }}
                >
                  <SocialIcon platform={link.platform as SocialPlatform} className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>
          )}

          {hasTabs && (
            <div
              className="flex items-center rounded-full p-1 gap-1 relative z-10 mt-2 shadow-inner bg-black/5 dark:bg-white/5 border border-white/10"
            >
              {catalogItems.length > 0 && (
                <button
                  onClick={() => setActiveTab("shop")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === "shop" ? "shadow-lg scale-[1.02]" : "hover:opacity-70"
                  )}
                  style={{
                    backgroundColor: activeTab === "shop" ? btnBg : "transparent",
                    color: activeTab === "shop" ? btnText : cardSub
                  }}
                >
                  <ShoppingBag className="w-3 h-3" /> {shopTabLabel}
                </button>
              )}
              {hasLinks && (
                <button
                  onClick={() => setActiveTab("links")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                    activeTab === "links" ? "shadow-lg scale-[1.02]" : "hover:opacity-70"
                  )}
                  style={{
                    backgroundColor: activeTab === "links" ? btnBg : "transparent",
                    color: activeTab === "links" ? btnText : cardSub
                  }}
                >{linksTabLabel}</button>
              )}
            </div>
          )}
        </div>

        {/* Shop tab — shown first */}
        {activeTab === "shop" && catalogItems.length > 0 && (
          <div className="w-full px-3 py-3 space-y-2">
            <div className="flex items-center gap-1.5">
              {catalogItems[0]?.item_type === "food" ? (
                <UtensilsCrossed className="w-3 h-3" style={{ color: cardText, opacity: 0.6 }} />
              ) : catalogItems[0]?.item_type === "service" ? (
                <Dumbbell className="w-3 h-3" style={{ color: cardText, opacity: 0.6 }} />
              ) : (
                <Store className="w-3 h-3" style={{ color: cardText, opacity: 0.6 }} />
              )}
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cardText, opacity: 0.6 }}>
                {categories.length === 1 && catalogItems[0]?.item_type === "food" ? "Menu" :
                 categories.length === 1 && catalogItems[0]?.item_type === "service" ? "Services" : "Shop"}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${btnBg}20`, color: cardText }}>
                {catalogItems.length} items
              </span>
            </div>

            {categories.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide pt-1 px-1">
                {categories.map((cat) => (
                  <span key={cat} className="px-2 py-0.5 text-[8px] font-medium rounded-full shrink-0" style={{ backgroundColor: `${btnBg}15`, color: cardText }}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-1">
              {catalogItems.map((item) => {
                const Icon = TYPE_ICONS[item.item_type || "physical"] || ShoppingBag;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg overflow-hidden border"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                  >
                    {item.image_url ? (
                      <div className="w-full aspect-square overflow-hidden bg-card/50 flex items-center justify-center">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[8px] font-bold">No Image</span></div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center" style={{ backgroundColor: `${btnBg}12` }}>
                        <Icon className="w-6 h-6" style={{ color: cardText, opacity: 0.2 }} />
                      </div>
                    )}
                    <div className="p-1.5 space-y-0.5">
                      <p className="text-[9px] font-bold leading-tight line-clamp-2" style={{ color: cardText }}>{item.title}</p>
                      {item.price != null && (
                        <p className="text-[10px] font-black" style={{ color: btnBg }}>{formatPrice(item.price)}</p>
                      )}
                      {item.price_label && !item.price && (
                        <p className="text-[8px] font-medium" style={{ color: cardText, opacity: 0.6 }}>{item.price_label}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Links tab */}
        {activeTab === "links" && hasLinks && (
          <div className="w-full px-3 py-2 space-y-2 relative z-10">
            {links.length > 0 && (
              <div className="grid grid-cols-1 gap-1.5 w-full">
              {links.map((link) => (
                    <div 
                      key={link.id} 
                      className={cn(
                        "flex items-center p-2.5 w-full shadow-sm relative overflow-hidden",
                        getLinkButtonClasses(settings.buttonStyle)
                      )}
                      style={getLinkButtonStyle(settings.buttonStyle, btnBg, btnText)}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 shrink-0" style={getLinkIconBgStyle(settings.buttonStyle, btnBg)}>
                        <SocialIcon platform={(link.platform || "website") as SocialPlatform} className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold tracking-tight block truncate uppercase">{link.title}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div
              className="w-full rounded-2xl p-3 shadow-md bg-white dark:bg-zinc-900"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: `0 4px 20px -5px ${cardText}10`
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: cardText }}>Contact Form</p>
              </div>
              <p className="text-[9px] font-medium opacity-60" style={{ color: cardSub }}>Visitors can send you messages directly</p>
            </div>
          </div>
        )}

        <div className="pt-3 pb-5 text-[8px] px-3" style={{ color: getFooterColor(sharedAppearance) }}>
          <span className="flex items-center justify-center gap-1">
            <Zap className="w-2 h-2" /> Made with LinkVertex
          </span>
        </div>
      </div>
    </div>
  );
  })();

  const phoneWidth = compact ? 240 : 320;
  const phoneHeight = compact ? 500 : 700;
  const borderRadius = compact ? 36 : 46;
  const bezelWidth = compact ? 5 : 6;
  const islandW = compact ? 80 : 100;
  const islandH = compact ? 22 : 28;

  if (noFrame) {
    return (
      <div className="w-full h-full overflow-hidden flex flex-col relative rounded-none">
        {screenContent}
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))" }}>
        {/* Phone bezel */}
        <div
          className="relative overflow-hidden"
          style={{
            width: phoneWidth,
            height: phoneHeight,
            borderRadius,
            border: `${bezelWidth}px solid #2a2a2c`,
            background: "#000",
            boxShadow: "inset 0 0 0 1.5px #3a3a3c",
          }}
        >
          {/* Side buttons */}
          <div className="absolute -left-[7px] top-[80px] w-[2.5px] h-6 rounded-l bg-[#2a2a2c]" />
          <div className="absolute -left-[7px] top-[116px] w-[2.5px] h-11 rounded-l bg-[#2a2a2c]" />
          <div className="absolute -left-[7px] top-[165px] w-[2.5px] h-11 rounded-l bg-[#2a2a2c]" />
          <div className="absolute -right-[7px] top-[132px] w-[2.5px] h-12 rounded-r bg-[#2a2a2c]" />

          {/* Dynamic Island */}
          <div className="absolute top-[9px] left-1/2 -translate-x-1/2 bg-black rounded-[16px] z-30" style={{ width: islandW, height: islandH }} />

          {/* Screen */}
          <div
            className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
            style={{
              borderRadius: borderRadius - bezelWidth,
              paddingRight: '0px',
              width: '100%'
            }}
          >
            <div className="w-full min-h-full flex flex-col">
              {screenContent}
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-white/30 rounded-full z-30" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;



