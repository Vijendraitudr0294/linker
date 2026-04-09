import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Newspaper, UtensilsCrossed, Video, Music, MessageSquare, Play, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentCardItem, contrastText } from "./CatalogUtils";

interface ContentCardProps {
  item: ContentCardItem;
  index: number;
  textColor: string;
  catalogCardBg?: string;
  cardBorder?: string;
  hasPhoto: boolean;
  buttonBg: string;
  onView?: (id: string) => void;
  onClick: () => void;
  compact?: boolean;
}

export const ContentCard = ({
  item,
  index,
  textColor,
  catalogCardBg,
  cardBorder,
  hasPhoto,
  buttonBg,
  onView,
  onClick,
  compact = false
}: ContentCardProps) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!onView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onView(item.id);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [item.id, onView]);
  const kindMeta =
    item.kind === "news"
      ? { label: "Article", icon: Newspaper }
      : item.kind === "recipe"
      ? { label: "Recipe", icon: UtensilsCrossed }
      : item.kind === "video"
      ? { label: "Video", icon: Video }
      : item.kind === "music"
      ? { label: "Audio", icon: Music }
      : { label: "Post", icon: MessageSquare };
  
  const KindIcon = kindMeta.icon;
  const isHorizontal = !compact && (item.kind === "news" || item.kind === "recipe");
  const contentTextColor = catalogCardBg && catalogCardBg.startsWith("#") && catalogCardBg !== "transparent" ? contrastText(catalogCardBg, textColor) : "#ffffff";

  return (
    <motion.button
      ref={cardRef}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      className={cn(
        "text-left rounded-2xl transition-all duration-500 hover:-translate-y-2 group relative flex flex-col h-full",
        isHorizontal ? "md:flex-row md:items-stretch md:h-40 md:gap-0 overflow-visible bg-transparent border-0 shadow-none hover:translate-y-0 md:col-span-2 lg:col-span-3" : "border shadow-md overflow-hidden",
        compact && "hover:translate-y-0 shadow-sm"
      )}
      style={!isHorizontal ? {
        backgroundColor: catalogCardBg && catalogCardBg !== "transparent" ? catalogCardBg : (hasPhoto ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"),
        backdropFilter: catalogCardBg && catalogCardBg !== "transparent" ? "none" : "blur(12px)",
        borderColor: cardBorder || `${textColor}15`,
      } : undefined}
    >
      <div className={cn(
        "relative overflow-hidden bg-muted/20 shrink-0",
        isHorizontal ? "w-full aspect-video md:w-40 md:h-full md:aspect-square md:rounded-3xl md:translate-x-4 md:z-10 shadow-2xl md:border md:border-white/10" : "w-full aspect-video"
      )}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30 bg-muted/40">
            <KindIcon className={cn("w-12 h-12", compact && "w-8 h-8")} style={{ color: contentTextColor }} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className={cn(
            "rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl scale-75 group-hover:scale-100 transition-transform",
            compact ? "w-10 h-10" : "w-12 h-12"
          )}>
            {item.kind === "video" ? <Play className="fill-white w-4 h-4 ml-0.5" /> : <ExternalLink className="w-4 h-4 text-white" />}
          </div>
        </div>
        {!isHorizontal && (
          <div className={cn(
            "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20",
            compact && "top-2 left-2 px-1.5 py-0.5 text-[7px]"
          )} style={{ backgroundColor: `${buttonBg}EE`, color: "white" }}>
            <div className="flex items-center gap-1.5">
              <KindIcon className={cn("w-3 h-3", compact && "w-2 h-2")} />
              {kindMeta.label}
            </div>
          </div>
        )}
      </div>
      <div 
        className={cn(
          "p-4 md:p-6 space-y-2 flex-1 flex flex-col justify-center",
          isHorizontal && "md:pl-8 md:pr-5 md:h-full md:rounded-3xl md:transition-all md:duration-500 md:group-hover:-translate-y-1 md:shadow-xl md:border",
          compact && "p-3 space-y-1"
        )}
        style={isHorizontal ? {
          backgroundColor: catalogCardBg && catalogCardBg !== "transparent" ? catalogCardBg : (hasPhoto ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"),
          backdropFilter: catalogCardBg && catalogCardBg !== "transparent" ? "none" : "blur(12px)",
          borderColor: cardBorder || `${textColor}15`,
        } : undefined}
      >
        <div className="flex items-center gap-2 mb-1 opacity-50">
           <span className={cn("text-[10px] font-black uppercase tracking-widest", compact && "text-[8px]")} style={{ color: contentTextColor }}>{item.platformLabel}</span>
           <span className="w-1 h-1 rounded-full bg-current opacity-30" style={{ backgroundColor: contentTextColor }} />
           <span className={cn("text-[10px] font-bold", compact && "text-[8px]")} style={{ color: contentTextColor }}>New Post</span>
        </div>
        <h3 className={cn("text-[15px] md:text-lg font-bold line-clamp-2 tracking-tight leading-tight group-hover:text-primary transition-colors", compact && "text-[12px]")} style={{ color: contentTextColor }}>{item.title}</h3>
        {item.description && !compact && (
          <p className="text-xs opacity-60 line-clamp-2 leading-relaxed" style={{ color: contentTextColor }}>{item.description}</p>
        )}
        <div className={cn("flex items-center justify-between mt-4 pt-2 border-t border-white/5", compact && "mt-2 pt-1.5")}>
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40", compact && "text-[8px]")} style={{ color: contentTextColor }}>Live</span>
           </div>
           <motion.div whileHover={{ x: 4 }} className={cn("flex items-center gap-1 text-[11px] font-black uppercase tracking-widest", compact && "text-[9px]")} style={{ color: buttonBg }}>
              {item.kind === "video" ? "Watch" : "Read"} <ArrowRight className={cn("w-3 h-3", compact && "w-2.5 h-2.5")} />
           </motion.div>
        </div>
      </div>
    </motion.button>
  );
};;
