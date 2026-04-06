import React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { DollarSign, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface TipJarProps {
  platform: string;
  username: string;
  title?: string;
  buttonBg: string;
  buttonText: string;
  textColor: string;
  cardBg: string;
  className?: string;
  compact?: boolean;
}

const TipJar = ({ 
  platform, 
  username, 
  title = "Support my work", 
  buttonBg, 
  buttonText, 
  textColor,
  cardBg,
  className,
  compact = false
}: TipJarProps) => {
  const getUrl = () => {
    if (username.startsWith("http")) return username;
    const p = platform.toLowerCase();
    if (p.includes("paypal")) return `https://paypal.me/${username}`;
    if (p.includes("cashapp") || p.includes("cash.app")) return `https://cash.app/$${username}`;
    if (p.includes("venmo")) return `https://venmo.com/${username}`;
    if (p.includes("buymeacoffee")) return `https://buymeacoffee.com/${username}`;
    if (p.includes("ko-fi")) return `https://ko-fi.com/${username}`;
    if (p.includes("patreon")) return `https://patreon.com/${username}`;
    return username; // Fallback
  };

  return (
    <motion.a
      href={getUrl()}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("flex items-center justify-between p-5 w-full rounded-[1.8rem] border transition-all duration-500 shadow-xl group relative overflow-hidden", className)}
      style={{
        backgroundColor: cardBg,
        borderColor: `${buttonBg}25`,
      }}
    >
      {/* Floating Animated Border Shimmer */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.15),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

      <div className={cn("flex items-center gap-4 z-10", compact && "gap-2")}>
        <div 
          className={cn(
            "rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative group-hover:scale-110 transition-transform duration-500",
            compact ? "w-10 h-10" : "w-14 h-14"
          )}
          style={{ background: `${buttonBg}15`, color: buttonBg }}
        >
          <div className="absolute inset-0 rounded-2xl bg-current opacity-10 blur-[6px] animate-pulse" />
          <DollarSign className={cn("animate-bounce [animation-iteration-count:3] [animation-duration:1s]", compact ? "w-5 h-5" : "w-7 h-7")} />
          <div className="absolute -inset-1 rounded-2xl border-2 border-current opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-95 group-hover:scale-100" />
        </div>
        <div>
          <h3 className={cn("font-black tracking-tight uppercase leading-tight", compact ? "text-[11px]" : "text-base")} style={{ color: textColor }}>
            {title}
          </h3>
          <p className={cn("opacity-50 font-bold uppercase tracking-wider", compact ? "text-[8px]" : "text-xs")} style={{ color: textColor }}>
            Via {platform}
          </p>
        </div>
      </div>
      
      <div 
        className={cn(
          "rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-active:scale-95 z-10",
          compact ? "px-3 py-1.5 text-[9px]" : "px-5 py-2.5 text-xs"
        )}
        style={{ backgroundColor: buttonBg, color: buttonText }}
      >
        <span>Tip Now</span>
        <ExternalLink className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </div>

      {/* Extreme Deep Aurora Glow support */}
      <div 
        className="absolute -right-6 -bottom-6 w-28 h-28 blur-3xl opacity-20 rounded-full group-hover:scale-125 transition-transform duration-700 pointer-events-none"
        style={{ backgroundColor: buttonBg }}
      />
    </motion.a>
  );
};

export default TipJar;
