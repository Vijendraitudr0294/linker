import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { User, ShoppingBag, Music, Zap, Store, ExternalLink, Smartphone, Copy, Layout, ShoppingCart, Link2, UtensilsCrossed, Dumbbell, Download, Users } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { useCurrency } from "@/hooks/useCurrency";
import type { AppearanceSettings } from "@/stores/appearanceStore";
import { type SocialPlatform } from "@/types/links";
import ThemeEffects from "@/components/theme/ThemeEffects";
import { computePalette, computeBgStyle, getLinkButtonClasses, getLinkButtonStyle, getLinkIconBgStyle, getFooterColor, getCardClasses, getContrastColor, type ProfileAppearance } from "@/lib/profileRenderer";
import PublicCatalog from "../public/PublicCatalog";
import StudioContentGrid from "../public/StudioContentGrid";
import ContactForm from "../public/ContactForm";
import TipJar from "../public/TipJar";
import { type StudioCardItem } from "@/lib/publicStudio";

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
  user?: { user_id?: string; name?: string; username?: string; avatar_url?: string; bio?: string; social_links?: SocialLinkConfig[] } | null;
  links: { id: string; title: string; platform?: string; url?: string }[];
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

const getVideoThumbnail = (url?: string) => {
  if (!url) return `https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80`;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const v = u.searchParams.get("v") || u.pathname.split("/").pop();
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
    }
  } catch {}
  return `https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80`;
};

const getDomainIcon = (url?: string) => {
  if (!url) return ``;
  try {
    const u = new URL(url);
    return `https://unavatar.io/${u.hostname}?fallback=false`;
  } catch {}
  return ``;
};

const ProfilePreview = ({ settings, user, links, catalogItems = [], showSocialIcons = true, creatorMetrics, compact = false, noFrame = false }: ProfilePreviewProps) => {
  const { formatPrice } = useCurrency();
  const socialLinks = user?.social_links || [];
  const hasLinks = links.length > 0;
  
  // Dynamic content checks
  const mediaFallbackCards = links
    .filter(l => (l.platform || "website").includes("|article") || (l.platform || "website").includes("|video"))
    .map(l => ({
      id: l.id,
      title: l.title,
      url: l.url || "",
      type: (l.platform || "website").includes("|article") ? "news" : "video",
      thumbnail: getVideoThumbnail(l.url)
    })) as StudioCardItem[];

  const showMediaFallback = catalogItems.length === 0 && mediaFallbackCards.length > 0;
  const hasShopContent = catalogItems.length > 0 || showMediaFallback;
  const hasTabs = hasShopContent || hasLinks;

  const shopTabLabel = settings.shopTabLabel?.trim() || "Shop";
  const linksTabLabel = settings.linksTabLabel?.trim() || "Links";
  const [activeTab, setActiveTab] = useState<"links" | "shop">("shop");

  useEffect(() => {
    if (!hasShopContent && hasLinks) setActiveTab("links");
    if (hasShopContent) setActiveTab((prev) => (prev === "links" || prev === "shop" ? prev : "shop"));
  }, [hasShopContent, hasLinks]);

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



  const groupedLinks = links.reduce((acc, link) => {
    const parts = (link.platform || "website").split("|");
    const basePlatform = parts[0];
    const layout = parts[1] || "default";
    const parsedLink = { ...link, basePlatform, layout };

    if (acc.length > 0 && acc[acc.length - 1].layout === "video" && layout === "video") {
      acc[acc.length - 1].items.push(parsedLink);
    } else {
      acc.push({ layout, items: [parsedLink] });
    }
    return acc;
  }, [] as { layout: string; items: any[] }[]);


  const screenContent = (() => {
    return (
    <div
      className="flex-1 w-full relative overflow-hidden flex flex-col"
      style={bgStyle}
    >
      {/* Special Animation Overlays — Isolated modules */}
      <ThemeEffects appearance={sharedAppearance} variant={compact ? "preview" : "public"} />

      <style dangerouslySetInnerHTML={{ __html: `
        /* PREVIEW FIX: Force 2-column Grid inside phone mock-up */
        .product-grid, .shop-grid, .items-grid, .cards-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          grid-auto-rows: auto !important;
          gap: 10px 8px !important;
          padding: 12px 10px 30px !important;
          align-items: stretch !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Card Geometry within preview */
        .product-card, [class*="product-card"], [class*="shop-card"], [class*="item-card"] {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .product-card .image-wrapper {
          width: 100% !important;
          aspect-ratio: 1 / 1 !important;
          overflow: hidden !important;
          position: relative !important;
          flex-shrink: 0 !important;
          height: 0 !important;
          padding-top: 100% !important;
        }

        .product-card img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: absolute !important;
          top: 0 !important; left: 0 !important;
        }

        /* Typography sizing for small preview */
        [class*="product-name"], [class*="item-name"], [class*="card-title"] {
          font-family: 'Outfit', sans-serif !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          line-height: 1.1 !important;
          letter-spacing: -0.02em !important;
          margin-bottom: 2px !important;
          display: block !important;
        }

        [class*="price"] {
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          letter-spacing: -0.03em !important;
          margin: 2px 0 4px !important;
          display: block !important;
        }

        [class*="add-to-cart"], [class*="btn-cart"], [class*="cart-btn"], [class*="buy-btn"] {
          padding: 8px 6px !important;
          font-size: 9px !important;
          font-weight: 800 !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          border-radius: 12px !important;
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }

        .category-badge, [class*="image-wrapper"] [class*="badge"] {
          opacity: 1 !important;
          position: absolute !important;
          z-index: 5 !important;
          background: rgba(0,0,0,0.6) !important;
          backdrop-filter: blur(8px) !important;
          color: white !important;
          padding: 3px 8px !important;
          font-size: 7px !important;
          font-weight: 800 !important;
          border-radius: 99px !important;
          top: 8px !important; left: 8px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        /* Profile Text Overrides */
        .profile-name {
          font-family: 'Outfit', sans-serif !important;
          letter-spacing: -0.04em !important;
          font-weight: 900 !important;
        }
        .profile-username {
          font-family: 'Space Mono', monospace !important;
          letter-spacing: 0.2em !important;
          opacity: 0.4 !important;
        }
      `}} />

      {isAiMusicTheme && (
        <div className="absolute top-4 right-4 z-20 bg-black/60 shadow-lg p-1.5 rounded-full flex items-center justify-center animate-pulse">
          <Music className="w-3.5 h-3.5 text-white animate-bounce" />
          {/* Simulated Lo-Fi Background Music */}
          <audio src="https://assets.mixkit.co/music/preview/mixkit-chill-bro-89.mp3" autoPlay loop className="hidden" />
        </div>
      )}

      <div className="flex flex-col items-center relative z-10 w-full flex-1 pb-10 px-3 pt-4 space-y-3">
        {/* Profile card — Synchronized with PublicProfile.tsx */}
        <div
          className="w-full rounded-[20px] border shadow-xl relative overflow-hidden"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
            fontFamily: settings.fontFamily,
            padding: compact ? "16px 16px 12px" : "20px 20px 16px"
          }}
        >
          <div className="flex items-start gap-4">
            {settings.showAvatar && (
              <div
                className={cn(
                  "rounded-full flex items-center justify-center overflow-hidden ring-2 shadow-xl z-10 shrink-0",
                  compact ? "w-14 h-14" : "w-[72px] h-[72px]"
                )}
                style={{ boxShadow: `0 0 0 2px ${btnBg}50` }}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: btnBg }}>
                    <User className={compact ? "w-6 h-6" : "w-9 h-9"} style={{ color: btnText }} />
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-1">
                  <h3 
                    className={cn(
                      "font-black tracking-tight truncate leading-tight profile-name",
                      compact ? "text-[18px]" : "text-[22px] md:text-[24px]"
                    )} 
                    style={{ color: cardText }}
                  >
                    {user?.name || user?.username || ""}
                  </h3>
                  {user?.username && (
                    <p className="profile-username text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: cardText }}>
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>
              
               {user?.bio && (
                  <p 
                    className={cn(
                      "mt-2 mb-1.5 leading-[1.6] opacity-70 line-clamp-3",
                      compact ? "text-[10px]" : "text-[11px]"
                    )} 
                    style={{ color: cardText }}
                  >
                    {user.bio}
                  </p>
                )}

              {showSocialIcons && socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3.5 relative z-10">
                  {socialLinks.map((link) => (
                    <div
                      key={link.platform}
                      className={cn(
                        "rounded-full flex items-center justify-center border transition-all hover:scale-110",
                        compact ? "w-7 h-7" : "w-8 h-8"
                      )}
                      style={{ 
                        borderColor: `${cardText}15`, 
                        color: cardText, 
                        backgroundColor: `${cardText}08`
                      }}
                    >
                      <SocialIcon platform={link.platform as SocialPlatform} className={compact ? "w-3 h-3" : "w-4 h-4"} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Creator Metrics Chips */}
          {creatorMetrics && (creatorMetrics.engagement_rate || creatorMetrics.avg_views || creatorMetrics.reach) && (
            <div className={cn("flex flex-wrap mt-4 pt-4 whitespace-nowrap", compact ? "gap-2" : "gap-3")} style={{ borderTop: `1px solid ${cardBorder}` }}>
              {creatorMetrics.engagement_rate && (
                <div className={cn("flex flex-col pl-3", compact && "pl-2")} style={{ borderLeft: `2px solid ${btnBg}40` }}>
                  <span className={cn("font-bold uppercase opacity-40 leading-none", compact ? "text-[6px]" : "text-[8px]")} style={{ color: cardText }}>Engage</span>
                  <span className={cn("font-black mt-0.5", compact ? "text-[8px]" : "text-[10px]")} style={{ color: cardText }}>{creatorMetrics.engagement_rate}</span>
                </div>
              )}
              {creatorMetrics.avg_views && (
                <div className={cn("flex flex-col pl-3", compact && "pl-2")} style={{ borderLeft: `2px solid ${btnBg}40` }}>
                  <span className={cn("font-bold uppercase opacity-40 leading-none", compact ? "text-[6px]" : "text-[8px]")} style={{ color: cardText }}>Views</span>
                  <span className={cn("font-black mt-0.5", compact ? "text-[8px]" : "text-[10px]")} style={{ color: cardText }}>{creatorMetrics.avg_views}</span>
                </div>
              )}
              {creatorMetrics.reach && (
                <div className={cn("flex flex-col pl-3", compact && "pl-2")} style={{ borderLeft: `2px solid ${btnBg}40` }}>
                  <span className={cn("font-bold uppercase opacity-40 leading-none", compact ? "text-[6px]" : "text-[8px]")} style={{ color: cardText }}>Reach</span>
                  <span className={cn("font-black mt-0.5", compact ? "text-[8px]" : "text-[10px]")} style={{ color: cardText }}>{creatorMetrics.reach}</span>
                </div>
              )}
            </div>
          )}

          {hasTabs && (
            <div className={cn("flex p-1 bg-black/5 rounded-[14px] mt-4 border border-black/5", compact && "mt-3")} style={{ backgroundColor: `${cardText}05` }}>
              {hasShopContent && (
                <button
                  onClick={() => setActiveTab("shop")}
                  className={cn(
                    "flex-1 rounded-[10px] font-black uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all duration-300",
                    compact ? "px-2 py-1.5 text-[8px]" : "px-3 py-2 text-[9px]",
                    activeTab === "shop" ? "shadow-lg scale-[1.02]" : "opacity-40 hover:opacity-100"
                  )}
                  style={{
                    backgroundColor: activeTab === "shop" ? btnBg : "transparent",
                    color: activeTab === "shop" ? getContrastColor(btnBg) : cardText,
                  }}
                >
                  <ShoppingBag className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3")} /> 
                  <span className="truncate">{shopTabLabel}</span>
                </button>
              )}
              {hasLinks && (
                <button
                  onClick={() => setActiveTab("links")}
                  className={cn(
                    "flex-1 rounded-[10px] font-black uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all duration-300",
                    compact ? "px-2 py-1.5 text-[8px]" : "px-3 py-2 text-[9px]",
                    activeTab === "links" ? "shadow-lg scale-[1.02]" : "opacity-40 hover:opacity-100"
                  )}
                  style={{
                    backgroundColor: activeTab === "links" ? btnBg : "transparent",
                    color: activeTab === "links" ? getContrastColor(btnBg) : cardText,
                  }}
                >
                  <Link2 className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3")} /> 
                  <span className="truncate">{linksTabLabel}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Shop tab — Synchronized with PublicCatalog.tsx */}
        {activeTab === "shop" && hasShopContent && (
          <div className="w-full space-y-3">
            {catalogItems.length > 0 && (
              <PublicCatalog 
                items={catalogItems.map(item => ({
                  ...item,
                  description: item.description || "",
                  price: item.price ?? null,
                  price_label: item.price_label || "",
                  image_url: item.image_url || "",
                  category: item.category || "",
                  item_type: item.item_type || "physical",
                  tags: [],
                  external_url: "",
                  allow_order_form: false
                }))} 
                profileUserId={user?.user_id || "preview"} 
                textColor={cardText} 
                buttonBg={btnBg} 
                buttonText={btnText} 
                buttonStyle={settings.buttonStyle} 
                catalogCardBg={cardBg} 
                hasPhoto={!!settings.backgroundImage} 
                compact={compact}
              />
            )}
            {showMediaFallback && (
              <StudioContentGrid
                items={mediaFallbackCards}
                title={shopTabLabel}
                surfaceColor={cardBg}
                borderColor={cardBorder}
                textColor={cardText}
                subTextColor={cardText}
                accentColor={btnBg}
                compact={compact}
              />
            )}
          </div>
        )}

        {/* Links tab */}
        {activeTab === "links" && hasLinks && (
          <div className="w-full px-3 py-2 space-y-2 relative z-10">
            {groupedLinks.length > 0 && (
              <div className={cn(
                "w-full", 
                (settings.layoutType === "grid" || settings.layoutType === "bento") 
                  ? (compact ? "grid grid-cols-2 gap-2.5" : "bento-grid") 
                  : settings.layoutType === "timeline"
                  ? "relative border-l-2 border-current/20 pl-6 space-y-6 ml-2"
                  : "grid grid-cols-1 gap-2"
              )}>
                {groupedLinks.map((group, groupIdx) => {
                  if (group.layout === "video") {
                    return (
                      <div key={groupIdx} className={cn("flex overflow-x-auto gap-3 pb-2 w-[calc(100%+24px)] -mx-3 px-3 scrollbar-hide snap-x", compact && "gap-2 pb-1")}>
                        {group.items.map(l => (
                          <div 
                            key={l.id} 
                            className={cn(
                              "shrink-0 rounded-2xl overflow-hidden shadow-md relative group snap-center",
                              compact ? "w-28" : "w-36"
                            )} 
                            style={{ aspectRatio: '9/16', border: `1px solid ${cardBorder}` }}
                          >
                            <img src={getVideoThumbnail(l.url)} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className={cn(
                              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center",
                              compact ? "w-6 h-6" : "w-8 h-8"
                            )}>
                              <div className={cn(
                                "w-0 h-0 border-y-transparent border-l-white border-r-0 ml-1",
                                compact ? "border-[4px]" : "border-[6px]"
                              )} />
                            </div>
                            <div className={cn(
                              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10",
                              compact ? "p-2" : "p-3"
                            )}>
                              <SocialIcon platform={l.basePlatform as SocialPlatform} className={cn("text-white mb-1", compact ? "w-3 h-3" : "w-4 h-4")} />
                              <p className={cn("font-bold text-white leading-tight line-clamp-2", compact ? "text-[8px]" : "text-[10px]")}>{l.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (group.layout === "article") {
                    return group.items.map(l => (
                      <div 
                        key={l.id} 
                        className={cn(
                          "flex items-center w-full rounded-2xl shadow-sm border transition-transform hover:-translate-y-0.5",
                          compact ? "p-2" : "p-2.5"
                        )} 
                        style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                      >
                        <div 
                          className={cn(
                            "shrink-0 rounded-[10px] overflow-hidden bg-black/5 flex items-center justify-center",
                            compact ? "w-10 h-10 p-1.5 mr-2" : "w-14 h-14 p-2 mr-3"
                          )} 
                          style={{ backgroundColor: `${btnBg}15` }}
                        >
                          <img src={getDomainIcon(l.url)} alt="" className="w-full h-full object-contain drop-shadow-sm rounded" loading="lazy" />
                        </div>
                        <div className="flex-[1] min-w-0 pr-1 space-y-0.5">
                          <p className={cn("font-bold tracking-tight line-clamp-2 leading-tight", compact ? "text-[10px]" : "text-[11px]")} style={{ color: cardText }}>{l.title}</p>
                            <div className="flex items-center gap-1.5 opacity-60">
                            <div style={{ color: cardText }}>
                              <SocialIcon platform={l.basePlatform as SocialPlatform} className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                            </div>
                            <span className={cn("uppercase font-bold tracking-wider", compact ? "text-[7px]" : "text-[9px]")} style={{ color: cardText }}>Read Article</span>
                          </div>
                        </div>
                        <ExternalLink className={cn("opacity-30 mr-1 shrink-0", compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} style={{ color: cardText }} />
                      </div>
                    ));
                  }

                  return group.items.map((link) => {
                  if (link.url?.includes("paypal.me") || link.url?.includes("venmo.com") || link.url?.includes("cash.app") || link.url?.includes("buymeacoffee.com") || link.url?.includes("ko-fi.com")) {
                    return (
                      <TipJar
                        key={link.id}
                        platform={link.basePlatform || "Support"}
                        username={link.url}
                        title={link.title}
                        buttonBg={btnBg}
                        buttonText={btnText}
                        textColor={cardText}
                        cardBg={`${cardText}05`}
                        compact={compact}
                      />
                    );
                  }

                  return (
                    <div 
                      key={link.id} 
                      className={getCardClasses(settings.cardStyle, cn(
                        "flex items-center w-full shadow-sm relative overflow-hidden",
                        compact ? "p-2" : "p-3",
                        getLinkButtonClasses(settings.buttonStyle)
                      ))}
                      style={getLinkButtonStyle(settings.buttonStyle, btnBg, btnText)}
                    >
                      {settings.layoutType === "timeline" && (
                        <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-current border-2 border-background z-20" />
                      )}
                      <div className={cn(
                        "rounded-lg flex items-center justify-center shrink-0",
                        compact ? "w-6 h-6 mr-2" : "w-8 h-8 mr-3"
                      )} style={getLinkIconBgStyle(settings.buttonStyle, btnBg)}>
                        <SocialIcon platform={(link.basePlatform || "website") as SocialPlatform} className={compact ? "w-3 h-3" : "w-4 h-4"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("font-bold tracking-tight block truncate uppercase", compact ? "text-[10px]" : "text-[12px]")}>{link.title}</span>
                      </div>
                    </div>
                  );
                })
              })}
              </div>
            )}

            {/* Contact Form Section */}
            <ContactForm
              profileUserId={user?.user_id || ""}
              textColor={cardText}
              buttonBg={btnBg}
              buttonText={btnText}
              buttonStyle={settings.buttonStyle}
              hasPhoto={!!user?.avatar_url}
              cardBg={cardBg}
              cardBorder={cardBorder}
              compact={compact}
            />
          </div>
        )}

        {/* Empty state */}
        {!hasTabs && (
          <div className="w-full px-4 pt-6 text-center">
             <div 
               className={cn("w-full rounded-[24px] border p-8 flex flex-col items-center", compact && "p-6 rounded-[18px]")}
               style={{ backgroundColor: cardBg, borderColor: cardBorder }}
             >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", compact && "w-10 h-10 mb-3")} style={{ backgroundColor: `${btnBg}15` }}>
                  <Zap className={cn("w-6 h-6", compact && "w-5 h-5")} style={{ color: btnBg }} />
                </div>
                <h3 className={cn("font-black tracking-tight mb-1", compact ? "text-sm" : "text-base")} style={{ color: cardText }}>Nothing published yet</h3>
                <p className={cn("opacity-50 leading-relaxed", compact ? "text-[10px]" : "text-xs")} style={{ color: cardText }}>This creator hasn't added links or catalog items yet.</p>
             </div>
          </div>
        )}

        <div className="pt-3 pb-5 text-[8px] px-3" style={{ color: getFooterColor(sharedAppearance) }}>
          <span className="flex items-center justify-center gap-1">
            <Zap className="w-2 h-2" /> Made with BIOTRA
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
      <div className="relative" style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.18))" }}>
        {/* Phone bezel */}
        <div
          className="relative overflow-hidden"
          style={{
            width: phoneWidth,
            height: phoneHeight,
            borderRadius,
            border: `${bezelWidth}px solid #1a1a1c`,
            background: "#000",
            boxShadow: "inset 0 0 0 1.5px #2a2a2c",
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
            <div className="w-full min-h-full flex flex-col relative">
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



