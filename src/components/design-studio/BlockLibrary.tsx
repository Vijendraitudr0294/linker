import { LucideIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface LibraryBlock {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  category: string;
}

interface BlockLibraryProps {
  libraryBlocks: LibraryBlock[];
  categories: string[];
  categoryDescriptions: Record<string, string>;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onInsert: (block: LibraryBlock) => void;
}

export const BlockLibrary = ({
  libraryBlocks,
  categories,
  categoryDescriptions,
  collapsed,
  setCollapsed,
  onInsert,
}: BlockLibraryProps) => {
  return (
    <aside
      className={`flex flex-col rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-500 overflow-hidden ${
        collapsed ? "w-20" : "w-[300px]"
      }`}
    >
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Components</h3>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-9 w-9 rounded-xl hover:bg-white/5"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {categories.map((category) => {
            const blocks = libraryBlocks.filter((b) => b.category === category);
            if (blocks.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                {!collapsed && (
                  <div className="px-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">{category}</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <p className="text-[10px] font-medium text-white/40">{categoryDescriptions[category]}</p>
                  </div>
                )}
                
                <div className={`grid gap-3 ${collapsed ? "grid-cols-1" : "grid-cols-1"}`}>
                  {blocks.map((block) => (
                    <motion.button
                      key={block.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onInsert(block)}
                      className={`group relative flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-primary/50 ${
                        collapsed ? "justify-center px-0" : ""
                      }`}
                    >
                      <div className={`p-3 rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-colors shadow-inner ${collapsed ? "mx-auto" : ""}`}>
                        <block.icon className="h-5 w-5 text-white group-hover:text-primary transition-colors" />
                      </div>
                      
                      {!collapsed && (
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white/90 tracking-tight">{block.label}</p>
                          <p className="mt-0.5 text-[10px] font-medium text-white/40 leading-tight line-clamp-1">{block.hint}</p>
                        </div>
                      )}

                      {!collapsed && (
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant="outline" className="text-[8px] h-5 px-1.5 font-black uppercase border-primary/20 text-primary">Add</Badge>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
};
