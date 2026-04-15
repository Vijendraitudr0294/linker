import { Button } from "@/components/ui/button";
import { Plus, Link2, Play, Newspaper, ShoppingBag, Music, Image as ImageIcon, MessageSquare, Zap, Smartphone, Layout, Folders } from "lucide-react";
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
  { id: 'link', label: 'Link', icon: Link2, color: 'bg-[#8B5CF6]', description: 'Custom URLs & socials' },
  { id: 'video', label: 'Video', icon: Play, color: 'bg-[#EF4444]', description: 'YouTube, Vimeo, Reels' },
  { id: 'product', label: 'Shop', icon: ShoppingBag, color: 'bg-[#10B981]', description: 'Items & Digital Goods' },
  { id: 'article', label: 'Blog / Article', icon: Newspaper, color: 'bg-[#F59E0B]', description: 'Long-form content' },
  { id: 'music', label: 'Music', icon: Music, color: 'bg-[#EC4899]', description: 'Spotify & SoundCloud' },
  { id: 'section', label: 'Heading', icon: Folders, color: 'bg-[#3B82F6]', description: 'Group your links' },
  { id: 'tip-jar', label: 'Tip Jar', icon: Zap, color: 'bg-[#EAB308]', description: 'Accept global payments' },
  { id: 'app', label: 'App Center', icon: Smartphone, color: 'bg-[#6366F1]', description: 'App Store / Play Store' },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'bg-[#14B8A6]', description: 'Visual portfolios' },
];

export default function AddBlockButton({ onSelect, onOpen }: { onSelect: (type: string) => void; onOpen?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (!isOpen) {
      // Notify parent so it can close mobile sidebar before the menu appears
      onOpen?.();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleToggle}
          className={cn(
            "w-full h-14 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all flex items-center justify-center gap-3 font-black text-lg shadow-[0_8px_30px_rgb(139,92,246,0.3)] hover:shadow-[0_8px_30px_rgb(139,92,246,0.5)] active:scale-95",
            isOpen && "bg-zinc-900"
          )}
        >
          <div className={cn("w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform duration-500", isOpen && "rotate-45 bg-white/10")}>
            <Plus className="w-4 h-4" />
          </div>
          <span className="tracking-tight">{isOpen ? "Close Menu" : "Add"}</span>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-16 left-0 right-0 z-50 p-6 rounded-[2rem] border-2 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {BLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onSelect(opt.id);
                  setIsOpen(false);
                }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-black hover:text-white transition-all group border-2 border-transparent hover:border-black"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform", opt.color)}>
                  <opt.icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">{opt.label}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
