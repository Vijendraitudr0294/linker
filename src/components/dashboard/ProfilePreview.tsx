import { useState, useMemo } from "react";
import { User, Zap, Link2, Share2, Star, Sparkles, Smile, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialIcon } from "@/components/SocialIcon";
import PublicCatalog from "@/components/public/PublicCatalog";
import { computeBgStyle, getLinkButtonStyle, getLinkButtonClasses, computePalette, getProfileCardStyle, type ProfileAppearance } from "@/lib/profileRenderer";
import { motion, AnimatePresence } from "framer-motion";
import ThemeEffects from "@/components/theme/ThemeEffects";
import { Grid, List as ListIcon } from "lucide-react";

interface ProfilePreviewProps {
  user: any;
  settings: any;
  links?: any[];
  catalogItems?: any[];
  compact?: boolean;
  noFrame?: boolean;
  onShare?: () => void;
}

import { UnifiedProfileHeader } from "@/components/public/UnifiedProfileHeader";
import { ProfileLinkBlock } from "@/components/public/ProfileLinkBlock";
import { RetroStickers } from "@/components/public/RetroStickers";

const ProfilePreview = ({ user, settings, links = [], catalogItems = [], compact = false, noFrame = false, onShare }: ProfilePreviewProps) => {
  const [activeTab, setActiveTab] = useState<"links" | "shop">("links");

  const appearance: ProfileAppearance = useMemo(() => ({
    background_color: settings.backgroundColor || settings.background_color || "#0f172a",
    card_color: settings.cardColor || settings.card_color || "rgba(255,255,255,0.1)",
    text_color: settings.textColor || settings.text_color || "#ffffff",
    button_style: settings.buttonStyle || settings.button_style || "rounded",
    button_bg: settings.buttonBg || settings.button_bg || "#3b82f6",
    button_text: settings.buttonText || settings.button_text || "#ffffff",
    font_family: settings.fontFamily || settings.font_family || "Inter",
    show_avatar: settings.showAvatar ?? settings.show_avatar ?? true,
    background_image: settings.backgroundImage || settings.background_image || undefined,
    background_overlay: settings.backgroundOverlay || settings.background_overlay || undefined,
    animated_gradient: settings.animatedGradient || settings.animated_gradient || undefined,
    animation_class: settings.animationClass || settings.animation_class || undefined,
    layout_type: settings.layoutType || settings.layout_type,
    card_style: settings.cardStyle || settings.card_style,
    theme_id: settings.theme_id || settings.theme_id
  }), [settings]);

  const bgStyle = useMemo(() => computeBgStyle(appearance), [appearance]);
  const palette = useMemo(() => computePalette(appearance), [appearance]);

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
  const hasTabs = hasLinks && hasShopContent;
  const isBrutalism = appearance.layout_type === "brutalism";
  const isRetroPop = appearance.theme_id?.includes("retro-pop");

  const screenContent = (
    <div
      className={cn("w-full h-full relative transition-all duration-700 overflow-y-auto scrollbar-hide flex flex-col")}
      style={{ ...bgStyle, fontFamily: appearance.font_family }}
    >
      <ThemeEffects appearance={appearance} />
      {isRetroPop && <RetroStickers />}
      
      {/* Designer Fix: Radial Glow Overlay for Depth */}
      {!isBrutalism && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
      )}

      <div className={cn("relative w-full z-10", compact ? "pt-4 px-3 pb-2" : "pt-8 px-5 pb-4")}>
        <UnifiedProfileHeader 
          user={user}
          appearance={appearance}
          palette={palette}
          isBrutalism={isBrutalism}
          socialLinks={socialLinks}
          onShare={onShare}
          onConnect={() => {}}
          compact={compact}
        />

        {hasTabs && (
          <div className="w-full flex items-center justify-center mb-6 mt-2 px-2">
            <div className={cn(
              "p-1 flex items-center gap-1 w-full max-w-[320px]",
              isBrutalism ? "border-4 border-black bg-white" : "bg-black/30 backdrop-blur-2xl border border-white/5 shadow-inner rounded-full"
            )}>
              {["shop", "links"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "flex-1 relative z-10 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500",
                    activeTab === tab
                      ? (isBrutalism ? "bg-black text-white rounded-none" : "text-black drop-shadow-sm")
                      : (isBrutalism ? "text-black" : "text-white/40 hover:text-white/70")
                  )}
                >
                  {activeTab === tab && !isBrutalism && (
                    <motion.div 
                      layoutId="previewTabPill"
                      className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_4px_15px_rgba(255,255,255,0.2)]"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                    />
                  )}
                  {tab === "shop" ? "Shop" : "Links"}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "links" ? (
            <motion.div
              key="links-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "grid gap-4 w-full",
                (appearance.layout_type === "grid" || appearance.layout_type === "bento") ? "grid-cols-2" : "grid-cols-1"
              )}
            >
              {links.map((link, i) => (
                <ProfileLinkBlock 
                  key={link.id}
                  index={i}
                  link={link}
                  appearance={appearance}
                  palette={palette}
                  isBrutalism={isBrutalism}
                  layoutType={appearance.layout_type}
                />
              ))}
              {!hasLinks && (
                <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-black/10 rounded-3xl">
                   <Link2 className="w-8 h-8 mx-auto mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Awaiting digital nodes...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="shop-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <PublicCatalog 
                items={catalogItems} 
                profileUserId={user?.user_id}
                textColor={isBrutalism ? "#000000" : palette.cardText}
                buttonBg={isBrutalism ? "#000000" : palette.btnBg}
                buttonText={isBrutalism ? "#ffffff" : palette.btnText}
                buttonStyle={isBrutalism ? "square" : appearance.button_style}
                catalogCardBg={isBrutalism ? "#ffffff" : palette.cardBg}
                cardBorder={isBrutalism ? "#000000" : palette.cardBorder}
                hasPhoto={Boolean(user?.avatar_url)}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
