import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  computeBgStyle,
  computePalette,
  getLinkButtonClasses,
  getLinkButtonStyle,
  getProfileCardStyle,
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

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(theme);
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "relative rounded-[28px] border-4 overflow-hidden cursor-pointer transition-all group",
          selected
            ? "border-black shadow-sm"
            : "border-black/10 shadow-sm hover:border-black hover:shadow-sm"
        )}
        onClick={() => onSelect(theme)}
      >
        {/* Selected indicator overlay */}
        {selected ? (
          <div className="absolute inset-0 bg-emerald-500/10 z-20 pointer-events-none border-[6px] border-emerald-500/50 rounded-[28px]" />
        ) : (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 z-20 transition-all duration-500 pointer-events-none" />
        )}

        {/* Delete button (admin only) */}
        {onDelete && (
          <button
            className="absolute top-3 right-3 z-50 w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-500 hover:border-red-500 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(theme.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
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
              className="w-full max-w-[160px] p-3 space-y-2.5"
              style={getProfileCardStyle(sharedAppearance, palette)}
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
                className={cn("h-7 w-full flex items-center justify-center text-[9px] font-medium text-sm border", buttonClasses)}
                style={{ ...buttonStyle, borderColor: theme.buttonStyle === "outline" ? palette.btnBg : "transparent" }}
              >
                Follow
              </div>
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div
          className="p-4 border-t-4 relative z-30"
          style={{ borderColor: selected ? "black" : "#00000010", backgroundColor: theme.backgroundColor, color: theme.textColor }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wide truncate" style={{ color: theme.textColor }}>
                {theme.name}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-50">{theme.category}</p>
            </div>
            
            {selected ? (
              <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-lg shadow-lg shadow-emerald-500/20">
                <Check className="w-3 h-3" strokeWidth={3} />
                <span className="text-[8px] font-semibold text-lger">Applied</span>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="h-8 rounded-lg bg-primary text-primary-foreground hover:bg-black/80 text-[9px] font-medium text-sm px-3 invisible group-hover:visible animate-in fade-in slide-in-from-right-2"
                onClick={handleApply}
              >
                Apply <Zap className="w-2.5 h-2.5 ml-1 fill-yellow-400 text-yellow-400" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemePreviewCard;

