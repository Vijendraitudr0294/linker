
import { Button } from "@/components/ui/button";
import { Plus, Link2, Play, Newspaper, ShoppingBag, Music, Image as ImageIcon, MessageSquare, Zap, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BlockOption {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
  { id: 'link', label: 'Link', icon: Link2, color: 'bg-blue-500', description: 'Social profiles or external sites' },
  { id: 'video', label: 'Video', icon: Play, color: 'bg-red-500', description: 'Showcase YouTube, Vimeo or Reels' },
  { id: 'product', label: 'Product', icon: ShoppingBag, color: 'bg-emerald-500', description: 'Sell items, services or digital goods' },
  { id: 'article', label: 'Article', icon: Newspaper, color: 'bg-amber-500', description: 'Publish blog posts, news or stories' },
  { id: 'music', label: 'Music', icon: Music, color: 'bg-purple-500', description: 'Embed Spotify, SoundCloud or Apple Music' },
  { id: 'tip-jar', label: 'Tip Jar', icon: Zap, color: 'bg-yellow-500', description: 'Accept tips via PayPal, Venmo, or CashApp' },
  { id: 'app', label: 'Mobile App', icon: Smartphone, color: 'bg-zinc-800', description: 'Link to App Store or Play Store' },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'bg-pink-500', description: 'Visual portfolios and image collections' },
];

export default function AddBlockButton({ onSelect }: { onSelect: (type: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-14 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-3 font-black text-lg group",
          isOpen && "bg-primary/10 border-primary/50"
        )}
      >
        <div className={cn("w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white transition-transform duration-300", isOpen && "rotate-45")}>
          <Plus className="w-5 h-5" />
        </div>
        <span>{isOpen ? "Close Menu" : "Add Content Block"}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 left-0 right-0 z-50 p-4 rounded-3xl border border-border/80 bg-background/90 backdrop-blur-xl shadow-2xl grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {BLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onSelect(opt.id);
                  setIsOpen(false);
                }}
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg mb-2 group-hover:scale-110 transition-transform", opt.color)}>
                  <opt.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">{opt.label}</span>
                <span className="text-[10px] opacity-40 text-center leading-tight mt-1">{opt.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
