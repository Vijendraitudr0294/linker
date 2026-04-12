import { Link2, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfileCardStyle, type ProfileAppearance, type ProfilePalette } from "@/lib/profileRenderer";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ProfileLinkBlockProps {
  link: any;
  appearance: ProfileAppearance;
  palette: ProfilePalette;
  isMusicStyle?: boolean;
  isBrutalism?: boolean;
  layoutType?: string;
  index: number;
}

export const ProfileLinkBlock = ({
  link,
  appearance,
  palette,
  isMusicStyle,
  isBrutalism,
  layoutType,
  index
}: ProfileLinkBlockProps) => {
  const isBento = layoutType === "bento";
  const isFirst = index === 0;

  return (
    <motion.a 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        // Designer Fix: Click Logic Synchronization for Analytics
        if (link.id) {
          supabase.rpc('increment_link_clicks', { link_id: link.id })
            .then(({ error }) => {
               if (error) {
                 // Fallback if RPC doesn't exist
                 supabase.from('links').update({ clicks: (link.clicks || 0) + 1 }).eq('id', link.id).then();
               }
            });
        }
      }}
      href={link.url} 
      target="_blank" 
      rel="noreferrer"
      className={cn(
        "block w-full p-4 group no-underline",
        isBento 
          ? (isFirst ? "col-span-2 flex flex-row items-center gap-4 min-h-[100px]" : "text-center flex flex-col justify-center min-h-[140px]") 
          : "flex flex-row items-center gap-4",
        !isBrutalism && "rounded-2xl"
      )}
      style={getProfileCardStyle(appearance, palette)}
    >
      <div className={cn("flex items-center gap-4 transition-all", (isBento && !isFirst) ? "flex-col" : "flex-row")}>
        <div className={cn(
          "flex items-center justify-center shrink-0 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110",
          isBento ? (isFirst ? "w-14 h-14" : "w-12 h-12 mb-1") : "w-12 h-12",
          isBrutalism
            ? "bg-black text-white rounded-none border-2 border-black"
            : "rounded-full"
        )} style={{ backgroundColor: isBrutalism ? "#000" : `${palette.btnBg}20` }}>
          {isMusicStyle ? (
            <Play className="w-5 h-5 text-white ml-0.5" />
          ) : (
            <Link2 className="w-5 h-5" style={{ color: isBrutalism ? "#fff" : palette.btnBg }} />
          )}
        </div>
        <div className="min-w-0 flex-1 w-full flex flex-col items-start justify-center">
          <span className={cn(
            "font-black uppercase tracking-tight block w-full truncate",
            isBento 
              ? (isFirst ? "text-base text-left" : "text-[10px] sm:text-[11px] line-clamp-2 leading-tight text-center") 
              : "text-sm text-left",
            isBrutalism ? "text-black" : ""
          )} style={{ color: isBrutalism ? "#000" : palette.cardText }}>
            {link.title}
          </span>
          {isMusicStyle && !isBrutalism && (
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block truncate text-left" style={{ color: palette.cardText }}>
              Tap to open
            </span>
          )}
        </div>
        {(!isBento || isFirst) && <ExternalLink className="ml-auto w-4 h-4 opacity-20" style={{ color: palette.cardText }} />}
      </div>
    </motion.a>
  );
};
