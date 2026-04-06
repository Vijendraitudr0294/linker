import { Play, Verified, User, ShoppingBag, Music2, Newspaper, Radio, ImageIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { type DragEvent } from "react";

interface ContentItem {
  id: string;
  type: "video" | "news" | "music" | "portfolio" | "broadcast";
  title: string;
  subtitle: string;
  url: string;
  layoutStyle: "classic" | "featured";
  thumbnail?: string;
}

interface PhonePreviewProps {
  studio: any;
  selectedBlock: string;
  setSelectedBlock: (id: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onCardDrop: (draggedId: string, targetId: string) => void;
  renderCardList: () => React.ReactNode;
}

export const PhonePreview = ({
  studio,
  selectedBlock,
  setSelectedBlock,
  onDrop,
  onCardDrop,
  renderCardList,
}: PhonePreviewProps) => {
  const { profile, gradient, template } = studio;
  const blueHue = 198 + Math.round(gradient.blue * 0.25);
  const pinkHue = 320 + Math.round(gradient.pink * 0.28);
  const blendHue = 220 + Math.round(gradient.blend * 0.22);

  const bgStyle = {
    background: `radial-gradient(circle at 15% 20%, hsla(${blueHue},95%,62%,0.34) 0%, transparent 42%), 
                 radial-gradient(circle at 82% 12%, hsla(${pinkHue},95%,64%,0.36) 0%, transparent 44%), 
                 linear-gradient(145deg, hsl(${blueHue},92%,54%), hsl(${blendHue},86%,62%), hsl(${pinkHue},84%,58%))`
  };

  const previewCardClass = "rounded-[2.2rem] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-3xl transition-all duration-300";
  
  const frameClass = (id: string) => 
    cn(
      "relative transition-all duration-300 cursor-pointer overflow-hidden",
      selectedBlock === id 
        ? "ring-2 ring-primary ring-offset-4 ring-offset-[#0d1120] scale-[1.02] shadow-2xl z-20" 
        : "hover:scale-[1.01] hover:shadow-xl"
    );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 bg-white/[0.02] rounded-[3rem] border border-white/10 shadow-inner">
      <div className="relative group">
        {/* Phone Shine */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 to-transparent rounded-[3.8rem] blur-[2px] opacity-50 pointer-events-none" />
        
        <div className="relative w-[380px] h-[780px] rounded-[3.5rem] bg-[#05070d] p-3 shadow-[0_45px_120px_rgba(0,0,0,0.6)] border border-white/[0.08]">
          <div className="h-full w-full rounded-[2.8rem] border border-white/10 bg-[#0d1120] p-1.5 overflow-hidden relative">
            
            {/* Dynamic Island Area */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-[100]" />

            <div 
              className="h-full w-full rounded-[2.2rem] overflow-y-auto scrollbar-hide px-4 pt-16 pb-8 relative"
              style={bgStyle}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              {/* Header Status */}
              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
                  <Play className="h-3 w-3 fill-white" /> Live: {profile.name}
                </span>
              </div>

              {/* Profile Card */}
              <motion.div 
                layoutId="profile"
                onClick={() => setSelectedBlock("profile")}
                className={cn(previewCardClass, frameClass("profile"), "mb-4 p-5")}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-white/80 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 shadow-2xl overflow-hidden">
                      {profile.avatarImage ? (
                        <img src={profile.avatarImage} alt={profile.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full">
                          <User className="h-10 w-10 text-white/50" />
                        </div>
                      )}
                    </div>
                    {profile.verified && (
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg">
                        <Verified className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-black text-white leading-none tracking-tight">{profile.name}</h2>
                    <p className="text-[13px] font-black uppercase tracking-[0.1em] text-white/60">{profile.headline}</p>
                    <p className="text-[13px] leading-relaxed text-white/80 font-medium line-clamp-2 mt-2">{profile.bio}</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Block */}
              {profile.showStats && (
                <motion.div 
                  layoutId="stats"
                  onClick={() => setSelectedBlock("stats")}
                  className={cn(previewCardClass, frameClass("stats"), "mb-4 grid grid-cols-2 gap-3 p-4")}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Followers</span>
                    <span className="text-xl font-black text-white tracking-tight">{profile.followers || "0"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-l border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Likes</span>
                    <span className="text-xl font-black text-white tracking-tight">{profile.likes || "0"}</span>
                  </div>
                </motion.div>
              )}

              {/* Links/Socials - Built into the Profile if mode allows */}
              {profile.pageMode !== "content-only" && (
                <motion.div 
                  layoutId="contacts"
                  onClick={() => setSelectedBlock("contacts")}
                  className={cn(previewCardClass, frameClass("contacts"), "mb-4 p-4")}
                >
                   <div className="flex flex-wrap justify-center gap-3">
                     {/* Simplified icon row */}
                     <Link2 className="h-5 w-5 text-white/40 absolute top-3 right-3" />
                     <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                        <ImageIcon className="h-5 w-5 text-white/80" />
                     </div>
                     <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                        <User className="h-5 w-5 text-white/80" />
                     </div>
                     <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                        <Radio className="h-5 w-5 text-white/80" />
                     </div>
                   </div>
                </motion.div>
              )}

              {/* Content Section */}
              {profile.showSection && (
                <motion.div 
                  layoutId="section"
                  onClick={() => setSelectedBlock("section")}
                  className={cn(previewCardClass, frameClass("section"), "p-5")}
                >
                   <div className="mb-4">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">{profile.sectionTitle}</h4>
                   </div>
                   {renderCardList()}
                </motion.div>
              )}

              {/* Footer Indicator */}
              <div className="mt-12 mb-8 flex flex-col items-center gap-4 opacity-40">
                <div className="w-12 h-1.5 rounded-full bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Powered by BIOTRA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
