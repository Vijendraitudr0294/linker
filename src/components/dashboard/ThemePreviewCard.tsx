import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeBgStyle, computePalette, getLinkButtonClasses, getLinkButtonStyle, type ProfileAppearance } from "@/lib/profileRenderer";
import type { ThemePreset } from "@/data/themes";
import ThemeEffects from "@/components/theme/ThemeEffects";
import { Check, ExternalLink, Trash2 } from "lucide-react";
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
  showStudioLink = false,
  onOpenStudio,
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
    <div className="space-y-2">
      <motion.button
        whileHover={{ y: compact ? -1 : -2, scale: compact ? 1.005 : 1.01 }}
        whileTap={{ scale: 0.995 }}
        type="button"
        onClick={() => void onSelect(theme)}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border text-left transition-all",
          compact ? "p-2" : "p-2.5",
          selected
            ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/5"
            : "border-border/40 bg-card/60 hover:border-primary/35 hover:bg-card/80 shadow-sm"
        )}
      >
        {onDelete && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-1.5 right-1.5 z-50 h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(theme.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-lg border border-border/10",
            compact ? "h-[120px]" : "aspect-[4/4.5] min-h-[260px]"
          )}
          style={bgStyle}
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

        <div className={cn("relative z-10 flex h-full items-center justify-center p-3", compact ? "p-2" : "p-4")}>
          <div
            className={cn(
              "w-full max-w-[200px] overflow-hidden rounded-[22px] border shadow-xl backdrop-blur-sm",
              compact ? "p-2.5" : "p-3.5"
            )}
            style={{
              backgroundColor: palette.cardBg,
              borderColor: palette.cardBorder,
              color: palette.cardText,
              fontFamily: sharedAppearance.font_family,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn("shrink-0 rounded-full border border-white/20", compact ? "h-8 w-8" : "h-10 w-10")}
                style={{ backgroundColor: palette.btnBg }}
              />
              <div className="min-w-0 flex-1">
                <div className="h-2 w-16 rounded-full" style={{ backgroundColor: `${palette.cardText}CC` }} />
                <div className="mt-1.5 h-1.5 w-12 rounded-full" style={{ backgroundColor: `${palette.cardText}66` }} />
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: `${palette.cardText}30` }} />
              <div className="h-1.5 w-4/5 rounded-full" style={{ backgroundColor: `${palette.cardText}20` }} />
            </div>

            <div className="mt-3 flex gap-1.5">
              <div className="h-5 w-8 rounded-full" style={{ backgroundColor: `${palette.btnBg}20` }} />
              <div className="h-5 w-8 rounded-full" style={{ backgroundColor: `${palette.cardText}12` }} />
            </div>

            <div
              className={cn(
                "mt-3 flex items-center justify-center border text-[9px] font-bold uppercase tracking-widest",
                compact ? "h-8 rounded-lg" : `h-9 ${buttonClasses}`
              )}
              style={{
                ...buttonStyle,
                borderColor: theme.buttonStyle === "outline" ? palette.btnBg : "transparent",
              }}
            >
              {compact ? "Preview" : "Sample"}
            </div>
          </div>
        </div>
        </div>

        <div className={cn("flex flex-col", compact ? "gap-1 px-0.5 pt-2" : "gap-1.5 px-0.5 py-0.5 mt-2")}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("truncate font-bold text-foreground", compact ? "text-xs" : "text-[11px] uppercase tracking-wider")}>
                {theme.name}
              </p>
              <p className="text-[10px] text-muted-foreground">{theme.category}</p>
            </div>
            {selected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                <Check className="h-2.5 w-2.5" />
                Live
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex min-h-[20px] flex-wrap gap-1.5 items-center">
              {theme.backgroundImage && <Badge variant="secondary" className="h-4 border-none bg-primary/10 px-1.5 text-[8px] font-bold uppercase tracking-tight text-primary">Photo</Badge>}
              {theme.animationClass && <Badge variant="secondary" className="h-4 border-none bg-purple-500/10 px-1.5 text-[8px] font-bold uppercase tracking-tight text-purple-500">Motion</Badge>}
              {theme.gradientFrom && <Badge variant="secondary" className="h-4 border-none bg-blue-500/10 px-1.5 text-[8px] font-bold uppercase tracking-tight text-blue-500">Gradient</Badge>}
            </div>
          )}
        </div>
      </motion.button>

      {compact && showStudioLink && onOpenStudio && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full"
          onClick={onOpenStudio}
        >
          Full Design Studio
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default ThemePreviewCard;
