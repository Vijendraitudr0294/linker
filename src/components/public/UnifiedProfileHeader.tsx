import { motion } from "framer-motion";
import { User, Sparkles, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialIcon } from "@/components/SocialIcon";
import { getProfileCardStyle, getContrastColor, type ProfileAppearance, type ProfilePalette } from "@/lib/profileRenderer";

interface UnifiedProfileHeaderProps {
  user: any;
  appearance: ProfileAppearance;
  palette: ProfilePalette;
  isBrutalism: boolean;
  socialLinks: any[];
  onShare?: () => void;
  onConnect?: () => void;
  compact?: boolean;
}

export const UnifiedProfileHeader = ({
  user,
  appearance,
  palette,
  isBrutalism,
  socialLinks,
  onShare,
  onConnect,
  compact = false
}: UnifiedProfileHeaderProps) => {
  const contrastText = palette.cardText;

  return (
    <div className={cn(
      "w-full max-w-xl mx-auto mb-4",
      !isBrutalism && (compact ? "rounded-none" : "rounded-none") // Removed background card wrapping for social profile feel
    )}>
      <div className={cn(
        "flex flex-col items-center relative z-10 text-center",
        compact ? "gap-3 px-4 pt-8 pb-4" : "gap-4 px-4 pt-10 pb-6"
      )}>
        {/* Avatar Area */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={cn(
             "relative shrink-0 rounded-full p-1 transition-all",
             compact ? "w-20 h-20" : "w-28 h-28",
             isBrutalism ? "border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none" : "shadow-xl border border-white/20"
          )}
          style={!isBrutalism ? { backgroundColor: `${palette.cardBg}15` } : {}}
        >
          <div className={cn(
              "w-full h-full overflow-hidden",
              isBrutalism ? "" : "rounded-full"
          )}>
            {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${palette.cardBg}20` }}>
                  <User className="w-10 h-10 opacity-30" style={{ color: contrastText }} />
                </div>
            )}
          </div>
          {user?.role === 'admin' && (
             <div className="absolute bottom-0 right-0 bg-black border-2 border-white rounded-full p-1.5 shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
             </div>
          )}
        </motion.div>

        {/* Text Area */}
        <div className="flex flex-col items-center w-full px-2">
          <h1 className={cn(
             "font-black tracking-tight leading-tight mb-1 break-words",
             compact ? "text-lg" : "text-2xl sm:text-3xl"
          )} style={{ color: contrastText }}>
            {user?.name || user?.username || "Your Name"}
          </h1>
          
          <p className={cn(
             "leading-relaxed font-medium break-words text-center max-w-sm",
             compact ? "text-[11px] mb-3" : "text-sm sm:text-base mb-4 line-clamp-3"
          )} style={{ color: contrastText, opacity: 0.8 }}>
            {user?.bio || "Building modern digital experiences."}
          </p>

          {/* Actions Row */}
          <div className="flex items-center justify-center gap-2 flex-wrap w-full max-w-sm mt-1">
            {onConnect && (
              <motion.button 
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={onConnect}
                className={cn(
                   "font-bold uppercase tracking-[0.08em] transition-all flex items-center justify-center flex-1 min-w-[120px]",
                   compact ? "py-2.5 px-4 text-[10px]" : "py-3 px-6 text-[11px]",
                   isBrutalism 
                      ? "bg-black text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none" 
                      : "bg-white text-black rounded-xl shadow-lg border border-black/5"
                )}
                style={{ backgroundColor: palette.btnBg, color: palette.btnText, borderColor: isBrutalism ? "#000" : undefined }}
              >
                Connect
              </motion.button>
            )}

            {onShare && (
              <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={onShare}
                 className={cn(
                    "flex flex-shrink-0 items-center justify-center transition-all",
                    compact ? "h-[34px] w-[34px]" : "h-[40px] w-[40px]",
                    isBrutalism ? "bg-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none" : "backdrop-blur-md rounded-xl shadow-lg border border-white/20 bg-white/10"
                 )}
                 style={!isBrutalism ? { backgroundColor: `${palette.cardBg}20`, borderColor: `${palette.cardBorder}50`, color: contrastText } : { color: "#000" }}
              >
                 <Share2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
              </motion.button>
            )}
            
            {/* Minimal Socials Row below if they exist */}
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3 w-full">
                {socialLinks.slice(0, compact ? 4 : 5).map((l, i) => (
                   <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      key={`top-${i}`}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                         "flex flex-shrink-0 items-center justify-center transition-all",
                         compact ? "w-8 h-8" : "w-9 h-9",
                         isBrutalism
                            ? "bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            : "backdrop-blur-md rounded-full shadow-sm hover:shadow-md bg-transparent"
                      )}
                      style={!isBrutalism ? { color: contrastText } : { color: "#000" }}
                   >
                      <SocialIcon platform={l.platform} className={compact ? "w-4 h-4" : "w-5 h-5"} />
                   </motion.a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
