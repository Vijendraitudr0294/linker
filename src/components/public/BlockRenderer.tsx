
import { ProfileBlock } from "@/types/blocks";
import { SocialIcon } from "@/components/SocialIcon";
import { Play, Newspaper, ExternalLink, ShoppingBag, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { type SocialPlatform } from "@/types/links";

interface BlockRendererProps {
  block: ProfileBlock;
  palette: any;
  buttonStyle: string;
}

export const BlockRenderer = ({ block, palette, buttonStyle }: BlockRendererProps) => {
  if (!block.enabled) return null;

  switch (block.type) {
    case 'header':
      return (
        <div className="text-center space-y-4 mb-8">
          {block.config.media_url && (
            <div className="w-24 h-24 rounded-full mx-auto border-4 shadow-xl overflow-hidden" style={{ borderColor: palette.btnBg }}>
              <img src={block.config.media_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: palette.cardText }}>{block.config.title}</h1>
            <p className="text-sm opacity-70 mt-1 max-w-[280px] mx-auto" style={{ color: palette.cardText }}>{block.config.subtitle}</p>
          </div>
        </div>
      );

    case 'link':
      return (
        <a 
          href={block.config.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "flex items-center p-4 w-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm group",
            buttonStyle === 'rounded' ? "rounded-2xl" : "rounded-lg"
          )}
          style={{ backgroundColor: palette.btnBg, color: palette.btnText }}
        >
          {block.config.platform && (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mr-4 shrink-0">
              <SocialIcon platform={block.config.platform as SocialPlatform} className="w-5 h-5" />
            </div>
          )}
          <span className="flex-1 font-bold text-lg">{block.config.title}</span>
          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      );

    case 'video':
      return (
        <div className="w-full rounded-[24px] border overflow-hidden p-4" style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
             <Play className="w-4 h-4" style={{ color: palette.btnBg }} />
             <span className="text-xs font-black uppercase tracking-widest opacity-60" style={{ color: palette.cardText }}>Video</span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden group">
            <img src={block.config.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                <div className="w-0 h-0 border-[8px] border-y-transparent border-l-white border-r-0 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-bold">{block.config.title}</h3>
            </div>
          </div>
        </div>
      );

    case 'article':
      return (
        <a 
          href={block.config.url}
          target="_blank"
          className="flex items-center p-3 rounded-2xl border transition-all hover:-translate-y-1"
          style={{ backgroundColor: palette.cardBg, borderColor: palette.cardBorder }}
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden mr-4 shrink-0 bg-secondary">
             <img src={block.config.media_url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate" style={{ color: palette.cardText }}>{block.config.title}</h4>
            <div className="flex items-center gap-1.5 opacity-50 mt-1">
              <Newspaper className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Read Article</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 opacity-30" />
        </a>
      );

    default:
      return null;
  }
};
