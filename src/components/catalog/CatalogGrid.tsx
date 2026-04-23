import { useMemo } from "react";
import { type CatalogItem, type ItemType } from "@/stores/catalogStore";
import { parseCatalogCategory } from "@/lib/catalogCategory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, ExternalLink, ShoppingBag, UtensilsCrossed, Dumbbell, Download, Ship, Car, Users, FileText as FileTextIcon, Video, Newspaper, Music, MessageSquare, Clapperboard, QrCode, MapPin } from "lucide-react";

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
  qr: QrCode,
  map: MapPin,
};

interface CatalogGridProps {
  items: CatalogItem[];
  viewMode?: "list" | "card";
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

export function CatalogGrid({ items, viewMode = "list", onEdit, onDelete, onToggle }: CatalogGridProps) {
  const categories = useMemo(() => [...new Set(items.map((entry) => entry.category))], [items]);

  return (
    <div className="space-y-12">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        const parsedCategory = parseCatalogCategory(cat);
        const heading = parsedCategory.subcategory ? `${parsedCategory.primary} / ${parsedCategory.subcategory}` : parsedCategory.primary;
        return (
          <div key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 whitespace-nowrap">{heading}</h2>
              <div className="h-0.5 w-full bg-black/10" />
            </div>
            <div className={cn(
              "grid gap-6",
              viewMode === "card" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 lg:grid-cols-2"
            )}>
              {catItems.map((item) => {
                const Icon = TYPE_ICONS[item.item_type] || ShoppingBag;
                
                if (viewMode === "card") {
                   return (
                     <Card
                        key={item.id}
                        className={cn(
                          "bruddle-card bg-white flex flex-col transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden border-4 border-black hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)]",
                          !item.enabled && "opacity-60 grayscale"
                        )}
                      >
                        <div className="relative aspect-square overflow-hidden border-b-4 border-black bg-gray-50">
                           {item.image_url ? (
                             <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                <Icon size={64} strokeWidth={1} className="text-black/10" />
                             </div>
                           )}
                           <div className="absolute top-4 right-4 flex flex-col gap-2">
                              <button
                                onClick={() => onToggle(item.id, !item.enabled)}
                                className={cn(
                                  "w-10 h-6 border-2 border-black rounded-full transition-all duration-300 relative bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]",
                                  item.enabled ? "bg-emerald-400" : "bg-gray-100"
                                )}
                              >
                                <span className={cn(
                                  "absolute top-[2px] w-4 h-4 rounded-full transition-all duration-300 border-2 border-black",
                                  item.enabled ? "left-[18px] bg-white" : "left-[2px] bg-black/20"
                                )} />
                              </button>
                           </div>
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                              <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-all">
                                 <Button 
                                   onClick={() => onEdit(item)}
                                   className="bg-white text-black border-2 border-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none"
                                 >
                                    Edit Item
                                 </Button>
                                 <Button 
                                   onClick={() => onDelete(item.id)}
                                   variant="destructive"
                                   className="border-2 border-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none"
                                 >
                                    Delete
                                 </Button>
                              </div>
                           </div>
                        </div>
                        <div className="p-5 space-y-3 flex-1 flex flex-col">
                           <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                 <Badge className="bg-primary/20 border-2 border-black text-[9px] font-black uppercase tracking-tighter text-black shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]">
                                    {item.item_type}
                                 </Badge>
                                 {item.price !== null && (
                                    <span className="text-[14px] font-black text-black">${item.price.toFixed(2)}</span>
                                 )}
                              </div>
                              <h3 className="text-lg font-black text-black leading-tight truncate">{item.title}</h3>
                           </div>
                           <p className="text-[11px] font-bold text-black/40 line-clamp-2 leading-relaxed flex-1">
                              {item.description || "Every collection starts with a story. This item is ready for the world."}
                           </p>
                        </div>
                     </Card>
                   );
                }

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "bruddle-card bg-white p-4 flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden",
                      !item.enabled && "opacity-60 grayscale"
                    )}
                  >
                    
                    {item.image_url ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 z-10 border-2 border-black">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border-2 border-black flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-black group-hover:text-black transition-colors" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-black text-[14px] uppercase tracking-wide truncate">{item.title}</p>
                        <div className="flex gap-1">
                          {item.tags.slice(0, 1).map((t) => (
                             <Badge key={t} className="text-[8px] px-1.5 py-0 h-4 bg-[#FDE68A] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-black uppercase tracking-widest">{t}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-black/60 font-bold tracking-tight mb-2 truncate max-w-[90%]">{item.description || "No description provided."}</p>
                      
                      <div className="flex items-center gap-3">
                        {item.price !== null && (
                          <span className="text-[12px] font-black text-black">
                            {item.price_label && <span className="text-[9px] text-black/40 mr-1 uppercase tracking-widest">{item.price_label}</span>}
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {item.price === null && item.price_label && (
                          <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">{item.price_label}</span>
                        )}
                        <Badge className="bg-gray-100 border-2 border-black/10 text-[9px] h-5 text-black font-black uppercase tracking-widest shadow-none gap-1.5">
                          <Icon className="w-3 h-3 text-black/50" />
                          {item.item_type}
                        </Badge>
                        {item.display_mode === "full" && (
                          <Badge className="bg-primary/20 border-2 border-primary text-[9px] h-5 text-primary font-black uppercase tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
                            Full Mode
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0 z-10 ml-2">
                       <button
                        onClick={() => onToggle(item.id, !item.enabled)}
                        className={`w-10 h-6 border-2 border-black rounded-full transition-all duration-300 ${item.enabled ? "bg-[#10B981]" : "bg-gray-100"} relative group/toggle cursor-pointer`}
                      >
                        <span className={`absolute top-[2px] w-4 h-4 rounded-full transition-all duration-300 ${item.enabled ? "left-[18px] bg-white border-2 border-black" : "left-[2px] bg-black/20"}`} />
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white hover:bg-[#FDE68A] text-black border-2 border-transparent hover:border-black transition-all" onClick={() => onEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white hover:bg-[#FECACA] text-black border-2 border-transparent hover:border-black transition-all" onClick={() => onDelete(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
