import { ExternalLink, Newspaper, Play, Ticket, Download, ShoppingBag, Calendar, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StudioCardItem } from "@/lib/publicStudio";

interface StudioContentGridProps {
  items: StudioCardItem[];
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  sectionClassName?: string;
  gridClassName?: string;
  surfaceColor: string;
  borderColor: string;
  sectionBorderColor?: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  cardBackgroundColor?: string;
  mediaBackgroundColor?: string;
  compact?: boolean;
}

const alpha = (hexOrColor: string, suffix: string) => `${hexOrColor}${suffix}`;

const StudioContentGrid = ({
  items, title, subtitle, titleClassName, subtitleClassName,
  sectionClassName, gridClassName, surfaceColor, borderColor,
  sectionBorderColor, textColor, subTextColor, accentColor,
  cardBackgroundColor, mediaBackgroundColor,
  compact = false,
}: StudioContentGridProps) => {
  return (
    <div
      className={cn("w-full rounded-[18px] border overflow-hidden", sectionClassName)}
      style={{
        backgroundColor: surfaceColor,
        borderColor: sectionBorderColor || borderColor,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Section Header */}
      <div className={cn("flex items-center justify-between gap-3 px-5 pt-4 pb-3", compact && "px-4 pt-3 pb-2")}>
        <div>
          <h3 className={cn("text-[11px] font-black uppercase tracking-[0.15em]", compact && "text-[9px]", titleClassName)} style={{ color: textColor }}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn("mt-0.5 text-xs opacity-60", compact && "text-[10px]", subtitleClassName)} style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </div>
        {!compact && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ backgroundColor: alpha(accentColor, "18"), color: textColor }}
          >
            {items.length} items
          </span>
        )}
      </div>

      {/* Card Grid */}
      <div className={cn(
        "grid gap-2.5 px-4 pb-4", 
        (compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"),
        gridClassName
      )}>
        {items.map((item, i) => {
          const isFeatured = item.layoutStyle === "featured";
          const isNews = item.type === "news";
          const isVideoLike = item.type === "video" || item.type === "broadcast" || item.type === "music";
          const isTicket = item.type === "ticket";
          const isDownload = item.type === "download";
          const isProduct = item.type === "product";

          // ── TICKET ROW RENDERER ──
          if (isTicket && !compact) {
            return (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="col-span-1 md:col-span-2 flex items-center gap-4 bg-white/5 border border-white/10 rounded-[20px] p-3 transition-all group"
              >
                {/* Date Box */}
                <div className="w-16 h-16 shrink-0 bg-white rounded-[14px] flex flex-col items-center justify-center p-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2D6AFA] leading-none mb-1">
                    {item.date?.split(' ')[0] || "JUN"}
                  </span>
                  <span className="text-xl font-black text-black leading-none">
                    {item.date?.split(' ')[1] || "23"}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                  <div className="flex items-center gap-3 mt-1 opacity-50 text-[10px]">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location || "Venue"}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date || "Date"}</span>
                  </div>
                </div>
                {/* Action */}
                <div className="px-4 py-2 bg-white/10 group-hover:bg-white group-hover:text-black rounded-full transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest">Tickets</span>
                </div>
              </motion.a>
            );
          }

          // ── DOWNLOAD CARD RENDERER ──
          if (isDownload) {
            return (
              <motion.a
                key={item.id}
                href={item.url}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="flex items-center gap-4 bg-white rounded-[20px] p-4 group shadow-xl"
              >
                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-black rounded-full">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-black/40 leading-none mb-0.5">Download on</p>
                  <p className="text-base font-black text-black leading-tight tracking-tight">{item.title || "App Store"}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-black/10 group-hover:text-black transition-all" />
              </motion.a>
            );
          }

          return (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={compact ? undefined : { y: -4, scale: 1.02 }}
              className={cn(
                "group overflow-hidden rounded-[16px] border backdrop-blur-md transition-all duration-500 cursor-pointer relative",
                (isFeatured || isProduct) && !compact && "md:col-span-2"
              )}
              style={{
                borderColor: alpha(borderColor, "15"),
                backgroundColor: cardBackgroundColor || alpha(textColor, "03"),
              }}
            >
              {isProduct && item.price && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-[#2D6AFA] text-white px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg">
                    {item.price}
                  </div>
                </div>
              )}
              {/* Thumbnail */}
              <div
                className={cn("overflow-hidden relative", (isFeatured && !compact) ? "aspect-[2.1/1]" : "aspect-video")}
                style={{ backgroundColor: mediaBackgroundColor || alpha(accentColor, "08") }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08] group-hover:rotate-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center gap-2" style={{ color: alpha(textColor, "40") }}>
                    {isNews ? <Newspaper className={cn("h-9 w-9 opacity-30", compact && "h-6 w-6")} /> : <Play className={cn("h-9 w-9 opacity-30", compact && "h-6 w-6")} />}
                    <span className={cn("text-[11px] font-black uppercase tracking-wider opacity-30", compact && "text-[9px]")}>{item.type}</span>
                  </div>
                )}

                {/* Shimmer Border Overlay on card node */}
                {!compact && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}

                {/* Always-Visible / Pulsing Play overlay for video */}
                {isVideoLike && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "rounded-full backdrop-blur-md bg-black/40 border border-white/30 flex items-center justify-center shadow-2xl transition-all duration-500",
                      compact ? "w-10 h-10" : "w-14 h-14 group-hover:scale-110 group-hover:bg-black/60"
                    )}>
                      <Play className={cn("text-white fill-white ml-0.5", compact ? "w-3 h-3" : "w-5 h-5 animate-pulse group-hover:animate-none")} />
                    </div>
                  </div>
                )}

                {/* Type badge */}
                <div className={cn("absolute top-3 left-3", compact && "top-2 left-2")}>
                  <span
                    className={cn("rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/10", compact && "px-1.5 py-0.5 text-[7px]")}
                    style={{ backgroundColor: alpha(accentColor, "99"), color: "#ffffff" }}
                  >
                    {isNews ? "Read" : isVideoLike ? "Watch" : "Open"}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className={cn("p-4", (isFeatured && !compact) && "p-5", compact && "p-2.5")}>
                <p
                  className={cn("font-black leading-tight tracking-tight line-clamp-2", (isFeatured && !compact) ? "text-sm md:text-base" : "text-[12px]", compact && "text-[11px]")}
                  style={{ color: textColor }}
                >
                  {item.title}
                </p>
                {item.subtitle && !compact && (
                  <p className="mt-1 text-[10px] opacity-40 font-bold line-clamp-1" style={{ color: textColor }}>
                    {item.subtitle}
                  </p>
                )}
                <div className={cn("flex items-center justify-between mt-3 pt-2 border-t border-current/5", compact && "mt-2 pt-1.5")}>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30", compact && "text-[7px]")} style={{ color: textColor }}>
                    {isFeatured && !compact ? "Featured" : "Classic"}
                  </span>
                  <ExternalLink className={cn("opacity-20 transition-all duration-300 transform", compact ? "h-3 w-3" : "h-3.5 w-3.5 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5")} style={{ color: textColor }} />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

export default StudioContentGrid;
