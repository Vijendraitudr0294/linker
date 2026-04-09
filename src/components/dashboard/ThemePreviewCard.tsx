import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  computeBgStyle,
  computePalette,
  getLinkButtonClasses,
  getLinkButtonStyle,
  type ProfileAppearance,
} from "@/lib/profileRenderer";
import type { ThemePreset } from "@/data/themes";
import ThemeEffects from "@/components/theme/ThemeEffects";
import { Check, Trash2, Zap, Sparkles, Image as ImgIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ThemePreviewCardProps {
  theme: ThemePreset;
  selected: boolean;
  onSelect: (theme: ThemePreset) => void | Promise<void>;
  compact?: boolean;
  showStudioLink?: boolean;
  onOpenStudio?: () => void;
  onDelete?: (themeId: string) => void;
}

const ThemePreviewCard = ({
  theme,
  selected,
  onSelect,
  compact = false,
  onDelete,
}: ThemePreviewCardProps) => {
  const sharedAppearance: ProfileAppearance = {
    background_color: theme.backgroundColor,
    card_color: theme.cardColor,
    text_color: theme.textColor,
    button_style: theme.buttonStyle,
    button_bg: theme.buttonBg,
    button_text: theme.buttonText,
    gradient_from: theme.gradientFrom,
    gradient_to: theme.gradientTo,
    font_family: theme.fontFamily || "Inter",
    show_avatar: true,
    background_image: theme.backgroundImage,
    background_overlay: theme.backgroundOverlay,
    animated_gradient: theme.animatedGradient,
    animation_class: theme.animationClass,
  };

  const bgStyle = computeBgStyle(sharedAppearance);
  const palette = computePalette(sharedAppearance);
  const buttonClasses = getLinkButtonClasses(theme.buttonStyle);
  const buttonStyle = getLinkButtonStyle(theme.buttonStyle, palette.btnBg, palette.btnText);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "relative rounded-[28px] border-4 overflow-hidden cursor-pointer transition-all group",
        selected
          ? "border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
          : "border-black/10 shadow-[4px_4px_0_0_rgba(0,0,0,0.08)] hover:border-black hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      )}
      onClick={() => void onSelect(theme)}
    >
      {/* Delete button (admin only) */}
      {onDelete && (
        <button
          className="absolute top-3 right-3 z-50 w-7 h-7 rounded-xl bg-white border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-red-500 hover:border-red-500 hover:text-white"
          onClick={(e) => { e.stopPropagation(); onDelete(theme.id); }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Selected tick */}
      {selected && (
        <div className="absolute top-3 left-3 z-50 w-7 h-7 rounded-xl bg-black flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Background canvas */}
      <div
        className="relative w-full overflow-hidden"
        style={{ ...bgStyle, height: compact ? "140px" : "240px" }}
      >
        {theme.backgroundImage && (
          <>
            <img src={theme.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            {theme.backgroundOverlay && (
              <div className="absolute inset-0" style={{ backgroundColor: theme.backgroundOverlay }} />
            )}
          </>
        )}
        <ThemeEffects appearance={sharedAppearance} variant="card" />

        {/* Mini profile mockup */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className="w-full max-w-[160px] rounded-2xl p-3 space-y-2.5 backdrop-blur-sm border"
            style={{
              backgroundColor: palette.cardBg,
              borderColor: `${palette.cardBorder}40`,
              color: palette.cardText,
              fontFamily: sharedAppearance.font_family,
            }}
          >
            {/* Avatar row */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: palette.btnBg, borderColor: `${palette.btnBg}80` }}
              />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-14 rounded-full" style={{ backgroundColor: `${palette.cardText}CC` }} />
                <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: `${palette.cardText}55` }} />
              </div>
            </div>
            {/* Bio lines */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: `${palette.cardText}30` }} />
              <div className="h-1.5 w-4/5 rounded-full" style={{ backgroundColor: `${palette.cardText}20` }} />
            </div>
            {/* CTA button */}
            <div
              className={cn("h-7 w-full flex items-center justify-center text-[9px] font-black uppercase tracking-widest border", buttonClasses)}
              style={{ ...buttonStyle, borderColor: theme.buttonStyle === "outline" ? palette.btnBg : "transparent" }}
            >
              Follow
            </div>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div
        className="p-4 border-t-4"
        style={{ borderColor: selected ? "black" : "#00000010", backgroundColor: theme.backgroundColor, color: theme.textColor }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide truncate" style={{ color: theme.textColor }}>
              {theme.name}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-50">{theme.category}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {selected && (
              <Badge className="bg-emerald-500 text-white border-0 text-[8px] px-2 h-4.5 font-black uppercase tracking-tighter rounded-lg">
                Active
              </Badge>
            )}
            {theme.animationClass && (
              <Sparkles className="w-3 h-3 opacity-40" style={{ color: theme.textColor }} />
            )}
            {theme.backgroundImage && (
              <ImgIcon className="w-3 h-3 opacity-40" style={{ color: theme.textColor }} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThemePreviewCard;
