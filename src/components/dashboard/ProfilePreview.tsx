import { useState, useMemo } from "react";
import { User, Zap, Link2, Share2, Star, Sparkles, Smile, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialIcon } from "@/components/SocialIcon";
import PublicCatalog from "@/components/public/PublicCatalog";
import { computeBgStyle, getLinkButtonStyle, getLinkButtonClasses, computePalette } from "@/lib/profileRenderer";
import { motion } from "framer-motion";

interface ProfilePreviewProps {
  user: any;
  settings: any;
  links?: any[];
  catalogItems?: any[];
  compact?: boolean;
  noFrame?: boolean;
  onShare?: () => void;
}

const RetroStickers = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
    <div className="absolute top-10 left-[5%] text-pink-400/40 rotate-[15deg]"><Star className="w-8 h-8 fill-current" /></div>
    <div className="absolute bottom-40 right-[10%] text-blue-400/40 rotate-[-10deg]"><Sparkles className="w-10 h-10" /></div>
    <div className="absolute top-[20%] right-[15%] text-yellow-400/30"><Smile className="w-6 h-6 fill-current" /></div>
    <div className="absolute top-[60%] left-[8%] text-red-400/40 rotate-[10deg]"><Heart className="w-5 h-5 fill-current" /></div>
  </div>
);

const ProfilePreview = ({ user, settings, links = [], catalogItems = [], compact = false, noFrame = false, onShare }: ProfilePreviewProps) => {
  const [activeTab, setActiveTab] = useState<"links" | "shop">("links");

  const layoutType = settings.layoutType || settings.layout_type;
  const themeId = settings.themeId || settings.theme_id;
  const isBrutalism = layoutType === "brutalism" || themeId?.startsWith("retro-pop-");
  const isRetroPop = themeId?.startsWith("retro-pop-");

  // Normalize settings to profileRenderer's ProfileAppearance shape
  const appearance = useMemo(() => ({
    background_color: settings.backgroundColor || settings.background_color || "#0f172a",
    card_color: settings.cardColor || settings.card_color || "rgba(255,255,255,0.1)",
    text_color: settings.textColor || settings.text_color || "#ffffff",
    button_style: settings.buttonStyle || settings.button_style || "rounded",
    button_bg: settings.buttonBg || settings.button_bg || "#3b82f6",
    button_text: settings.buttonText || settings.button_text || "#ffffff",
    gradient_from: settings.gradientFrom || settings.gradient_from || null,
    gradient_to: settings.gradientTo || settings.gradient_to || null,
    font_family: settings.fontFamily || settings.font_family || "Inter",
    show_avatar: settings.showAvatar ?? settings.show_avatar ?? true,
    // ── The key fix: always read backgroundImage from settings ──
    background_image: settings.backgroundImage || settings.background_image || undefined,
    background_overlay: settings.backgroundOverlay || settings.background_overlay || undefined,
    animated_gradient: settings.animatedGradient || settings.animated_gradient || undefined,
    animation_class: settings.animationClass || settings.animation_class || undefined,
  }), [settings]);

  // Use the SHARED renderer — same as the public profile page
  const bgStyle = useMemo(() => computeBgStyle(appearance), [appearance]);
  const palette = useMemo(() => computePalette(appearance), [appearance]);

  const buttonClasses = getLinkButtonClasses(appearance.button_style);
  const buttonStyle = getLinkButtonStyle(appearance.button_style, palette.btnBg, palette.btnText);

  const socialLinks = useMemo(() => {
    if (!user?.social_links) return [];
    try {
      return typeof user.social_links === "string" ? JSON.parse(user.social_links) : user.social_links;
    } catch {
      return [];
    }
  }, [user?.social_links]);

  const hasLinks = links.length > 0;
  const hasShopContent = catalogItems.length > 0;
  const hasTabs = (hasLinks || hasShopContent) && !compact;

  // ── Card wrapper style based on whether there's a background image ──
  const cardWrapperStyle = useMemo((): React.CSSProperties => {
    const hasImg = !!appearance.background_image;
    if (isBrutalism || isRetroPop) {
      return { backgroundColor: isRetroPop ? "#fff" : palette.cardBg, borderColor: "#000" };
    }
    if (hasImg) {
      // Glass card over image
      return { backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.18)" };
    }
    return { backgroundColor: palette.cardBg, borderColor: palette.cardBorder };
  }, [appearance.background_image, isBrutalism, isRetroPop, palette]);

  const screenContent = (
    // ── Use computeBgStyle — this applies image/gradient/solid correctly ──
    <div
      className={cn("w-full h-full relative transition-all duration-700 overflow-y-auto scrollbar-hide flex flex-col")}
      style={{ ...bgStyle, fontFamily: appearance.font_family }}
    >
      {isRetroPop && <RetroStickers />}

      {/* Hero Header */}
      <div className={cn("relative w-full z-10", compact ? "pt-8 px-3 pb-4" : "pt-16 px-5 pb-6")}>
        {onShare && (
          <button
            onClick={onShare}
            className={cn(
              "absolute top-5 right-5 z-30 w-9 h-9 flex items-center justify-center transition-all",
              isBrutalism ? "border-2 border-black bg-white shadow-[4px_4px] rounded-none" : "rounded-full backdrop-blur-xl border border-white/20 bg-white/10"
            )}
            style={{ color: isBrutalism ? "#000" : "#fff" }}
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Profile Card */}
        <div
          className={cn(
            "w-full relative overflow-hidden transition-all",
            isBrutalism ? "border-4 border-black" : "border",
            compact ? "p-4 rounded-[20px]" : "p-5 rounded-[28px]",
            isRetroPop && "!shadow-[12px_12px_0_0_rgba(0,0,0,1)] !border-black"
          )}
          style={cardWrapperStyle}
        >
          <div className="flex flex-col items-center text-center gap-3">
            {/* Avatar */}
            <div
              className={cn(
                "shrink-0 overflow-hidden relative",
                isBrutalism ? "border-2 border-black rounded-none shadow-[3px_3px]" : "rounded-2xl shadow-xl ring-2 ring-white/20",
                compact ? "w-12 h-12" : "w-14 h-14",
              )}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 opacity-30" style={{ color: palette.cardText }} />
                </div>
              )}
            </div>

            {/* Name + Bio */}
            <div className="min-w-0 w-full">
              <h2
                className={cn("font-black uppercase tracking-tight truncate leading-tight", compact ? "text-base" : "text-lg")}
                style={{ color: isBrutalism ? "#000" : palette.cardText }}
              >
                {user?.name || "Your Name"}
              </h2>
              {user?.bio && (
                <p
                  className={cn("mt-0.5 leading-relaxed line-clamp-2 opacity-70", compact ? "text-[8px]" : "text-[10px]")}
                  style={{ color: isBrutalism ? "#000" : palette.cardText }}
                >
                  {user.bio}
                </p>
              )}

              {/* Social Icons */}
              {socialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  {socialLinks.slice(0, 5).map((l: any, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-center w-6 h-6",
                        isBrutalism ? "bg-white border-2 border-black rounded-none shadow-[2px_2px]" : "bg-white/10 rounded-lg border border-white/10"
                      )}
                    >
                      <SocialIcon platform={l.platform} className={cn("w-3 h-3", isBrutalism ? "text-black" : "opacity-70")} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        {hasTabs && (
          <div className={cn("flex gap-1 p-1 mt-3", isBrutalism ? "bg-black rounded-none border-2 border-black" : "bg-white/10 backdrop-blur-md rounded-2xl")}>
            {["links", "shop"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "flex-1 py-1.5 font-bold text-[10px] uppercase tracking-wider transition-all rounded-xl",
                  activeTab === tab ? (isBrutalism ? "bg-white text-black rounded-none" : "bg-white text-black shadow") : "opacity-40"
                )}
                style={{ color: activeTab === tab ? "#000" : palette.cardText }}
              >
                {tab === "links" ? (settings.linksTabLabel || settings.links_tab_label || "Links") : (settings.shopTabLabel || settings.shop_tab_label || "Shop")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Link Buttons — styled with the theme's actual button style */}
      <div className={cn("px-4 pb-10 space-y-3 flex-1", compact && "px-3")}>
        {activeTab === "links" && (
          <div className="space-y-2.5">
            {links.length > 0 ? links.map((link, i) => (
              <div
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 transition-all cursor-pointer",
                  isBrutalism
                    ? "border-4 border-black bg-white shadow-[4px_4px] rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    : buttonClasses + " border"
                )}
                style={isBrutalism ? { backgroundColor: "#fff", color: "#000", borderColor: "#000" } : { ...buttonStyle }}
              >
                <div
                  className={cn("w-7 h-7 flex items-center justify-center shrink-0", isBrutalism ? "rounded-none" : "rounded-lg")}
                  style={{ backgroundColor: isBrutalism ? "#000" : `${palette.btnBg}30` }}
                >
                  <Link2 className="w-3.5 h-3.5" style={{ color: isBrutalism ? "#fff" : palette.btnText }} />
                </div>
                <span
                  className={cn("font-black uppercase tracking-tight text-xs flex-1 text-left truncate")}
                  style={{ color: isBrutalism ? "#000" : palette.btnText }}
                >
                  {link.title}
                </span>
              </div>
            )) : (
              <div className="py-8 text-center flex flex-col items-center gap-2" style={{ opacity: 0.2, color: palette.cardText }}>
                <Link2 className="w-6 h-6" />
                <span className="text-[9px] font-black uppercase tracking-widest">No links added yet</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "shop" && hasShopContent && (
          <PublicCatalog items={catalogItems} settings={settings} profileUserId={user?.user_id} />
        )}

        {/* Watermark */}
        <div className="pt-6 flex flex-col items-center mt-auto" style={{ opacity: 0.2, color: palette.cardText }}>
          <Zap className="w-3 h-3 mb-1" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">Built with Biotra</span>
        </div>
      </div>
    </div>
  );

  if (noFrame) return <div className="w-full h-full overflow-hidden flex flex-col">{screenContent}</div>;

  return (
    <div className="w-full h-full relative" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}>
      {/* Phone frame */}
      <div className="absolute inset-0 bg-black rounded-[2.5rem]" />
      <div className="absolute inset-[5px] overflow-hidden bg-white" style={{ borderRadius: "2.2rem" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-black rounded-b-[14px] z-50" />
        <div className="w-full h-full">{screenContent}</div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/20 rounded-full z-50" />
    </div>
  );
};

export default ProfilePreview;
