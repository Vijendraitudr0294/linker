import { cn } from "@/lib/utils";
import { resolveCategoryLabel, resolveItemTypeLabel } from "@/lib/commerceConfig";

interface CatalogFiltersProps {
  categories: string[];
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  subcategories: string[];
  activeSubcategory: string | null;
  setActiveSubcategory: (sub: string | null) => void;
  itemTypes: string[];
  activeItemType: string | null;
  setActiveItemType: (type: string | null) => void;
  chipGradientA: string;
  chipGradientB: string;
  chipTextColor: string;
  textColor: string;
  buttonBg: string;
  getBtnRadius: () => string;
  settings: any;
  compact?: boolean;
}

export const CatalogFilters = ({
  categories,
  activeCategory,
  setActiveCategory,
  subcategories,
  activeSubcategory,
  setActiveSubcategory,
  itemTypes,
  activeItemType,
  setActiveItemType,
  chipGradientA,
  chipGradientB,
  chipTextColor,
  textColor,
  buttonBg,
  getBtnRadius,
  settings,
  compact = false
}: CatalogFiltersProps) => {
  const chipBaseClasses = cn(
    "font-black tracking-[0.1em] whitespace-nowrap transition-all duration-300 flex-shrink-0 touch-manipulation min-h-[34px] px-4 py-1.5 rounded-xl border tap-scale uppercase",
    compact ? "text-[8px]" : "text-[9px] min-[480px]:text-[10px]"
  );

  const rowClasses = cn(
    "flex gap-2 mb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 flex-nowrap filter-row",
  );

  return (
    <div className="pt-2"> 
      {/* Category Row - MOBILE FIX */}
      {categories.length > 1 && (
        <div className={rowClasses} style={{ WebkitOverflowScrolling: "touch" }}>
          <button
            onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}
            className={chipBaseClasses}
            style={{
              background: !activeCategory ? buttonBg : "rgba(255,255,255,0.06)",
              color: !activeCategory ? chipTextColor : textColor,
              borderColor: !activeCategory ? "transparent" : `${textColor}15`,
              backdropFilter: "blur(8px)"
            }}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { setActiveCategory(category); setActiveSubcategory(null); }}
              className={chipBaseClasses}
              style={{
                background: activeCategory === category ? buttonBg : "rgba(255,255,255,0.06)",
                color: activeCategory === category ? chipTextColor : textColor,
                borderColor: activeCategory === category ? "transparent" : `${textColor}15`,
                backdropFilter: "blur(8px)"
              }}
            >
              {resolveCategoryLabel(category, settings)}
            </button>
          ))}
        </div>
      )}

      {/* Item Type Row - MOBILE FIX */}
      {itemTypes.length > 1 && (
        <div className={cn(rowClasses, "type-filter-row")} style={{ WebkitOverflowScrolling: "touch" }}>
          <button
            onClick={() => setActiveItemType(null)}
            className={chipBaseClasses}
            style={{
              background: !activeItemType ? buttonBg : "rgba(255,255,255,0.06)",
              color: !activeItemType ? chipTextColor : textColor,
              borderColor: !activeItemType ? "transparent" : `${textColor}15`,
              backdropFilter: "blur(8px)"
            }}
          >
            All Types
          </button>
          {itemTypes.map((itemType) => (
            <button
              key={itemType}
              onClick={() => setActiveItemType(itemType)}
              className={chipBaseClasses}
              style={{
                background: activeItemType === itemType ? buttonBg : "rgba(255,255,255,0.06)",
                color: activeItemType === itemType ? chipTextColor : textColor,
                borderColor: activeItemType === itemType ? "transparent" : `${textColor}15`,
                backdropFilter: "blur(8px)"
              }}
            >
              {resolveItemTypeLabel(itemType, settings)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
