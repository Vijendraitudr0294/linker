import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CatalogItemData, TYPE_ICONS } from "./CatalogUtils";
import { resolveItemCtaLabel } from "@/lib/commerceConfig";

interface CatalogCardProps {
  item: CatalogItemData;
  index: number;
  textColor: string;
  catalogCardBg?: string;
  cardBorder?: string;
  hasPhoto: boolean;
  chipGradientB: string;
  buttonBg: string;
  buttonText: string;
  settings: any;
  formatPrice: (price: number) => string;
  onView?: (id: string) => void;
  onClick: () => void;
  compact?: boolean;
}

export const CatalogCard = ({
  item,
  index,
  textColor,
  catalogCardBg,
  cardBorder,
  hasPhoto,
  buttonBg,
  buttonText,
  settings,
  formatPrice,
  onView,
  onClick,
  compact = false
}: CatalogCardProps) => {
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
  const Icon = TYPE_ICONS[item.item_type] || ShoppingBag;
  const isOutOfStock = item.track_inventory && item.stock_quantity !== null && item.stock_quantity !== undefined && item.stock_quantity <= 0;
  const ctaLabel = resolveItemCtaLabel(item.item_type, settings, item.external_url ? "Buy" : "Buy"); 

  return (
    <motion.button
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onClick={onClick}
      className={cn(
        "text-left rounded-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border group relative flex flex-col h-auto product-card w-full", /* PROPER 2-COL FIX */
        compact && "rounded-[14px]"
      )}
      style={{
        backgroundColor: "rgba(255,255,255,0.035)",
        borderColor: cardBorder || `${textColor}12`,
      }}
    >
      {/* 1:1 Aspect Ratio Image Wrapper - PROPER 2-COL FIX */}
      <div 
        className="w-full aspect-square relative overflow-hidden shrink-0 image-wrapper" 
      >
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title as string} 
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" /* PROPER 2-COL FIX: Cover top */
            loading="lazy" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <Icon className="w-10 h-10" style={{ color: textColor }} />
          </div>
        )}
        
        {/* Wishlist Button - PROPER 2-COL FIX */}
        <button 
          className="wishlist-btn absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md z-10 transition-transform hover:scale-115 active:scale-90"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Heart className="w-3.5 h-3.5 text-black/40 hover:text-red-500 transition-colors" />
        </button>

        {/* Clean Glassmorphism Category Badge - PROPER 2-COL FIX */}
        {item.category && (
          <div className="absolute top-[8px] left-[8px] px-[8px] py-[3px] rounded-full bg-black/50 backdrop-blur-[6px] border border-white/10 text-[0.55rem] font-[800] uppercase tracking-[0.05em] text-white shadow-sm z-10 whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-16px)] category-badge">
            {item.category}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-4 py-1.5 rounded-full bg-black/80 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">Sold Out</span>
          </div>
        )}
      </div>

      {/* Card Body - PROPER 2-COL FIX */}
      <div 
        className="w-full flex-1 flex flex-col text-left card-body min-w-0" 
        style={{ padding: "10px", gap: "1px" }} 
      >
        <div className="flex flex-col gap-0">
          <h3 
            className="font-black tracking-tight m-0 product-name" 
            style={{ 
              color: "inherit", 
              opacity: 1,
              fontSize: "11px",
              lineHeight: "1.1",
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              marginBottom: "3px"
            }}
          >
            {item.title as string}
          </h3>
          {item.category && (
            <span className="text-[7px] font-black uppercase tracking-[0.15em] opacity-40 whitespace-nowrap overflow-hidden text-ellipsis category-label" style={{ color: textColor }}>
              {item.category}
            </span>
          )}
        </div>

        <div className="flex flex-col mt-auto pt-2">
          {item.price != null && (
            <span 
              className="font-black tabular-nums tracking-tighter product-price" 
              style={{ 
                color: "inherit", 
                opacity: 1,
                fontSize: "12px",
                fontFamily: "'Inter', sans-serif",
                marginBottom: "6px"
              }}
            >
              {formatPrice(item.price)}
            </span>
          )}
          
          {/* Action Button - PROPER 2-COL FIX */}
          <div
            className={cn(
              "w-full h-auto px-2 py-2 rounded-xl flex items-center justify-center font-black uppercase tracking-[0.1em] transition-all tap-scale mb-1 whitespace-nowrap overflow-hidden text-ellipsis btn-cart", 
              isOutOfStock ? "opacity-30 pointer-events-none" : "hover:brightness-95 active:scale-95 shadow-sm"
            )}
            style={{
              backgroundColor: buttonBg,
              color: buttonText,
              fontSize: "8px",
            }}
          >
            {isOutOfStock ? "Sold" : ctaLabel}
          </div>
        </div>
      </div>
    </motion.button>
  );
};
