import { useMemo } from "react";
import { type CatalogItem, type ItemType } from "@/stores/catalogStore";
import { parseCatalogCategory } from "@/lib/catalogCategory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ExternalLink, FileText, ShoppingBag, UtensilsCrossed, Dumbbell, Download, Ship, Car, Users, FileText as FileTextIcon, Video, Newspaper, Music, MessageSquare, Clapperboard } from "lucide-react";

export const TYPE_ICONS: Record<ItemType, typeof ShoppingBag> = {
  physical: ShoppingBag,
  food: UtensilsCrossed,
  service: Dumbbell,
  digital: Download,
  boat: Ship,
  car: Car,
  social: Users,
  blog: FileTextIcon,
  video: Video,
  article: Newspaper,
  music: Music,
  post: MessageSquare,
  reel: Clapperboard,
};

interface CatalogGridProps {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

export function CatalogGrid({ items, onEdit, onDelete, onToggle }: CatalogGridProps) {
  const categories = useMemo(() => [...new Set(items.map((entry) => entry.category))], [items]);

  return (
    <div className="space-y-12">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        const parsedCategory = parseCatalogCategory(cat);
        const heading = parsedCategory.subcategory ? `${parsedCategory.primary} / ${parsedCategory.subcategory}` : parsedCategory.primary;
        return (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 whitespace-nowrap">{heading}</h2>
              <div className="h-px w-full bg-white/5" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {catItems.map((item) => {
                const Icon = TYPE_ICONS[item.item_type] || ShoppingBag;
                return (
                  <Card
                    key={item.id}
                    className={`p-3 flex items-center gap-4 bg-[#0A0A0C] border border-white/5 hover:border-primary/20 hover:bg-white/[0.02] transition-all duration-500 rounded-xl group relative overflow-hidden ${!item.enabled ? "opacity-40" : ""}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {item.image_url ? (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 z-10 border border-white/5">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 z-10 group-hover:scale-105 transition-transform duration-500">
                        <Icon className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-white text-[13px] tracking-tight truncate [font-family:'Inter',sans-serif]">{item.title}</p>
                        <div className="flex gap-1">
                          {item.tags.slice(0, 1).map((t) => (
                             <Badge key={t} variant="secondary" className="text-[8px] px-1.5 h-4 bg-white/5 text-white/40 border border-white/10 font-black uppercase tracking-widest">{t}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-white/40 truncate font-medium tracking-tight mb-2">{item.description || "No description provided."}</p>
                      
                      <div className="flex items-center gap-3">
                        {item.price !== null && (
                          <span className="text-[12px] font-black text-primary [font-family:'Space Mono',monospace]">
                            {item.price_label && <span className="text-[10px] text-primary/40 mr-1 uppercase">{item.price_label}</span>}
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {item.price === null && item.price_label && (
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.price_label}</span>
                        )}
                        <Badge className="bg-white/5 text-[9px] h-4.5 border-white/5 text-white/40 font-black uppercase tracking-widest gap-1.5">
                          <Icon className="w-2.5 h-2.5 opacity-50" />
                          {item.item_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0 z-10 ml-2">
                       <button
                        onClick={() => onToggle(item.id, !item.enabled)}
                        className={`w-9 h-5 rounded-full transition-all duration-500 ${item.enabled ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "bg-white/5 border border-white/10"} relative group/toggle`}
                      >
                        <span className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-500 ${item.enabled ? "left-[20px] bg-black" : "left-1 bg-white/20"}`} />
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white" onClick={() => onEdit(item)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500" onClick={() => onDelete(item.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
