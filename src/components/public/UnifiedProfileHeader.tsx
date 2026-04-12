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
      "w-full max-w-xl mx-auto mb-6",
      !isBrutalism && (compact ? "rounded-[22px]" : "rounded-[28px]")
    )} style={getProfileCardStyle(appearance, palette)}>
      <div className={cn(
        "flex items-start sm:items-center relative z-10 text-left",
        compact ? "gap-4 px-4 py-6" : "gap-6 px-4 py-8"
      )}>
        {/* Avatar Area - Column 1 */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={cn(
             "relative shrink-0 rounded-full p-1 transition-all",
             compact ? "w-20 h-20 sm:w-24 sm:h-24" : "w-28 h-28 sm:w-36 sm:h-36",
             isBrutalism ? "border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none" : "shadow-xl"
          )}
          style={!isBrutalism ? { backgroundColor: `${palette.cardBg}10`, boxShadow: `0 0 0 1px ${palette.cardBorder}40` } : {}}
        >
          <div className={cn(
              "w-full h-full overflow-hidden",
              isBrutalism ? "" : "rounded-full"
          )}>
            {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <User className="w-12 h-12 opacity-30" style={{ color: contrastText }} />
                </div>
            )}
          </div>
          {user?.role === 'admin' && (
             <div className="absolute -bottom-2 -right-2 bg-black border-2 border-white rounded-full p-1.5 shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
             </div>
          )}
        </motion.div>

        {/* Text & Actions Area - Column 2 */}
        <div className="flex flex-col flex-1 min-w-0">
          <h1 className={cn(
             "font-black tracking-tight leading-tight mb-2 truncate",
             compact ? "text-xl" : "text-2xl sm:text-3xl"
          )} style={{ color: contrastText }}>
            {user?.name || user?.username || "Your Name"}
          </h1>
          
          <p className={cn(
             "leading-relaxed mb-4 font-medium",
             compact ? "text-xs line-clamp-2" : "text-sm sm:text-base line-clamp-3"
          )} style={{ color: contrastText, opacity: 0.8 }}>
            {user?.bio || "Building modern digital experiences."}
          </p>

          {/* Social Icons & Utilities (Share/Connect) ROW */}
          <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 mb-2 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.slice(0, compact ? 3 : 5).map((l, i) => (
                 <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    key={`top-${i}`}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                       "flex flex-shrink-0 items-center justify-center transition-all",
                       compact ? "w-8 h-8" : "w-9 h-9 sm:w-10 sm:h-10",
                       isBrutalism
                          ? "bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none"
                          : "backdrop-blur-md rounded-full shadow-sm hover:shadow-md border border-white/20 bg-white/10"
                    )}
                    style={!isBrutalism ? { backgroundColor: `${palette.cardBg}20`, borderColor: `${palette.cardBorder}50`, color: contrastText } : { color: "#000" }}
                 >
                    <SocialIcon platform={l.platform} className={compact ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5"} />
                 </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              {onConnect && (
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={onConnect}
                  className={cn(
                     "font-bold uppercase tracking-[0.1em] transition-all relative overflow-hidden flex items-center justify-center shrink-0 group",
                     compact ? "px-4 h-8 text-[9px]" : "px-6 sm:px-8 h-9 sm:h-10 text-[10px] sm:text-[11px]",
                     isBrutalism 
                        ? "bg-black text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none" 
                        : "bg-white text-black rounded-full shadow-sm"
                  )}
                  style={{ backgroundColor: palette.btnBg, color: palette.btnText, borderColor: isBrutalism ? "#000" : undefined }}
                >
                  Connect
                </motion.button>
              )}

              {onShare && (
                <motion.button 
                   whileHover={{ scale: 1.1, y: -2 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={onShare}
                   className={cn(
                      "flex flex-shrink-0 items-center justify-center transition-all",
                      compact ? "w-8 h-8" : "w-9 h-9 sm:w-10 sm:h-10",
                      isBrutalism ? "bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none" : "backdrop-blur-md rounded-full shadow-sm hover:shadow-md border border-white/20 bg-white/10"
                   )}
                   style={!isBrutalism ? { backgroundColor: `${palette.cardBg}20`, borderColor: `${palette.cardBorder}50`, color: contrastText } : { color: "#000" }}
                >
                   <Share2 className={compact ? "w-3 h-3" : "w-3.5 h-3.5 sm:w-4 sm:h-4"} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
