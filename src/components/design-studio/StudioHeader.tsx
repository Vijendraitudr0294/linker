import { Undo2, Redo2, Eye, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface StudioHeaderProps {
  status: string;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  saveStudio: () => void;
}

export const StudioHeader = ({
  status,
  undo,
  redo,
  canUndo,
  canRedo,
  previewMode,
  setPreviewMode,
  saveStudio,
}: StudioHeaderProps) => {
  return (
    <header className="rounded-[2.5rem] border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute top-0 right-0 w-64 h-full bg-primary/10 blur-[80px] pointer-events-none" />
      
      <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/15 border border-primary/20">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white uppercase">Design Studio</h1>
              <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase py-0 px-2 border-primary/30 text-primary">Pro</Badge>
            </div>
            <p className="text-xs font-medium text-white/50 mt-0.5">{status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-4 bg-white/10 p-1 rounded-2xl border border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              className="h-9 w-9 rounded-xl hover:bg-white/15 disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              className="h-9 w-9 rounded-xl hover:bg-white/15 disabled:opacity-30"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className={`rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 h-11 px-5 transition-all active:scale-95 ${
              previewMode ? "bg-primary/20 border-primary/30 text-primary" : ""
            }`}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Exit Preview" : "Live Preview"}
          </Button>

          <Button
            onClick={saveStudio}
            className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest px-6 h-11 shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </header>
  );
};
