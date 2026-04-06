import { lazy, Suspense, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProfileAppearance } from "@/lib/profileRenderer";

const StarryBackground = lazy(() => import("@/components/animations/StarryBackground"));
const DepthField = lazy(() => import("@/components/animations/DepthField"));

type ThemeEffectsVariant = "card" | "preview" | "public";

interface ThemeEffectsProps {
  appearance: ProfileAppearance;
  variant?: ThemeEffectsVariant;
}

interface StarStreakSeed {
  left: string;
  top: string;
  delay: string;
  duration: string;
}

const STAR_STREAKS: StarStreakSeed[] = [
  { left: "10%", top: "12%", delay: "0.2s", duration: "2.6s" },
  { left: "24%", top: "30%", delay: "1.4s", duration: "3.1s" },
  { left: "37%", top: "18%", delay: "0.9s", duration: "2.8s" },
  { left: "52%", top: "38%", delay: "2.1s", duration: "3.4s" },
  { left: "66%", top: "24%", delay: "0.5s", duration: "2.7s" },
  { left: "82%", top: "32%", delay: "1.9s", duration: "3.2s" },
  { left: "90%", top: "16%", delay: "2.6s", duration: "3.8s" },
];

export const ThemeEffects = ({ appearance, variant = "public" }: ThemeEffectsProps) => {
  const prefersReducedMotion = useReducedMotion();
  const animationClass = appearance.animation_class || "";
  const hasImage = Boolean(appearance.background_image);
  const bgColor = appearance.background_color;
  const isCard = variant === "card";
  const isPreview = variant === "preview";

  const streaks = useMemo(
    () => (isCard ? STAR_STREAKS.slice(0, 4) : STAR_STREAKS),
    [isCard]
  );

  const depthDensity = isCard ? 22 : isPreview ? 36 : 54;

  return (
    <>
      {(animationClass === "animate-stars" || animationClass === "animate-nordic-stars") && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: !hasImage ? bgColor : "transparent" }}>
          <Suspense fallback={null}>
            <StarryBackground
              starCount={animationClass === "animate-nordic-stars" ? (isCard ? 30 : 84) : isCard ? 40 : 110}
              starColor="rgba(255,255,255,0.58)"
              shootingStarInterval={animationClass === "animate-nordic-stars" ? 5500 : 4200}
            />
          </Suspense>
        </div>
      )}

      {animationClass === "animate-mesh" && <div className="absolute inset-0 z-0 animate-mesh opacity-80" />}
      {animationClass === "animate-holo" && <div className="absolute inset-0 z-0 animate-holo opacity-60" />}

      {animationClass === "animate-blob-slow" && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 shadow-inner" style={{ backgroundColor: bgColor }}>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/40 blur-[50px] animate-blob-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/40 blur-[60px] animate-blob-slow [animation-delay:-5s]" />
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/30 blur-[55px] animate-blob-slow [animation-delay:-10s]" />
          <div className="absolute bottom-[20%] right-[30%] w-[45%] h-[45%] rounded-full bg-pink-500/35 blur-[55px] animate-blob-slow [animation-delay:-15s]" />
        </div>
      )}

      {animationClass === "animate-aurora" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !hasImage && "opacity-100")} style={{ backgroundColor: !hasImage ? bgColor : "transparent" }}>
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0,transparent_50%)] animate-[aurora-1_20s_linear_infinite]" />
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.3)_0,transparent_50%)] animate-[aurora-2_25s_linear_infinite]" />
          <div className="absolute bottom-[-50%] left-[-50%] w-[200%] h-[200%] aurora-blur bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.3)_0,transparent_50%)] animate-[aurora-3_30s_linear_infinite]" />
        </div>
      )}

      {animationClass === "animate-particles" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !hasImage && "opacity-100")} style={{ backgroundColor: !hasImage ? bgColor : "transparent" }}>
          <div className="absolute inset-0 animate-particles opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.8)_95%)]" />
        </div>
      )}

      {animationClass === "animate-galaxy" && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 animate-galaxy opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.2)_100%)]" />
        </div>
      )}

      {animationClass === "animate-star-shower" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {streaks.map((streak, idx) => (
            <div
              key={`${streak.left}-${idx}`}
              className="star-streak"
              style={{
                left: streak.left,
                top: streak.top,
                animationDelay: streak.delay,
                animationDuration: streak.duration,
              }}
            />
          ))}
        </div>
      )}

      {animationClass === "animate-energy" && <div className="absolute inset-0 z-0 animate-energy opacity-80 pointer-events-none" />}

      {animationClass === "animate-cyber-grid" && (
        <div className={cn("absolute inset-0 z-0 overflow-hidden flex items-center justify-center", !hasImage && "opacity-100")} style={{ backgroundColor: !hasImage ? bgColor : "transparent" }}>
          <div className="absolute bottom-[-10%] w-[200%] h-[100%] animate-cyber-grid opacity-40" />
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to top, ${bgColor}, transparent, ${bgColor})` }} />
        </div>
      )}

      {animationClass === "animate-liquid" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full animate-liquid opacity-35" />
          <div className="absolute right-0 bottom-0 w-72 h-72 rounded-full animate-liquid opacity-25 [animation-delay:-3s]" />
        </div>
      )}

      {!prefersReducedMotion && animationClass === "fm-fade" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12), transparent 60%)" }}
        />
      )}

      {!prefersReducedMotion && animationClass === "fm-slide-up" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-0 w-full h-24 opacity-20"
              style={{ top: `${20 + i * 26}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              animate={{ y: [30, -30, 30] }}
              transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            />
          ))}
        </div>
      )}

      {!prefersReducedMotion && animationClass === "fm-pulse-glow" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 30%, rgba(56,189,248,0.28), transparent 55%)" }}
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.04, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {!prefersReducedMotion && animationClass === "fm-float" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -left-8 top-10 w-40 h-40 rounded-full bg-cyan-400/25 blur-3xl"
            animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-0 bottom-0 w-44 h-44 rounded-full bg-purple-400/20 blur-3xl"
            animate={{ y: [0, 16, 0], x: [0, -8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {!prefersReducedMotion && animationClass === "fm-parallax" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(120deg, rgba(59,130,246,0.45), transparent 45%, rgba(168,85,247,0.35))" }}
            animate={{ x: [-12, 12, -12], y: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 opacity-15"
            style={{ background: "radial-gradient(circle at 75% 20%, rgba(34,211,238,0.45), transparent 40%)" }}
            animate={{ x: [10, -10, 10], y: [6, -6, 6] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {animationClass === "fx-liquid-gradient" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 fx-liquid-gradient-bg" />
          <div className="fx-liquid-blob fx-liquid-blob-a" />
          <div className="fx-liquid-blob fx-liquid-blob-b" />
          <div className="fx-liquid-blob fx-liquid-blob-c" />
          <div className="absolute inset-0 fx-grain-overlay opacity-20" />
        </div>
      )}

      {animationClass === "fx-pop-grain" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(218,255,32,0.8),transparent_32%),radial-gradient(circle_at_86%_14%,rgba(218,255,32,0.8),transparent_30%),radial-gradient(circle_at_18%_86%,rgba(218,255,32,0.7),transparent_36%)]" />
          <div className="absolute inset-0 fx-grain-overlay opacity-30" />
        </div>
      )}

      {animationClass === "fx-midnight-grid" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
        </div>
      )}

      {(animationClass === "fx-constellation-3d" || animationClass === "fx-neon-grid-3d") && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Suspense fallback={null}>
            <DepthField density={depthDensity} interactive={!isCard} />
          </Suspense>
          {animationClass === "fx-neon-grid-3d" && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(119,218,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(119,218,255,0.14)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />
          )}
        </div>
      )}

      {/* ─── Heavy 40+ Pro Batch ─── */}
      {!prefersReducedMotion && animationClass === "fm-snow-glow" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(isCard ? 15 : 40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              initial={{ x: `${Math.random() * 100}%`, y: -10 }}
              animate={{ y: ["0%", "100%"], x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
              transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      {!prefersReducedMotion && animationClass === "fm-fireflies" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(isCard ? 12 : 30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full blur-[2px]"
              style={{ backgroundColor: "rgb(250, 204, 21)" }}
              initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0.1 }}
              animate={{ y: [`${Math.random() * 10}%`, `${Math.random() * 90}%`], opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      {!prefersReducedMotion && animationClass === "fm-nebula-pulse" && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.1), transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {!prefersReducedMotion && animationClass === "fm-neon-lines" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-primary"
              style={{ top: `${20 + i * 20}%`, left: 0, right: 0 }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
            />
          ))}
        </div>
      )}

      {!prefersReducedMotion && animationClass === "fm-liquid-blob" && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute left-1/4 top-1/4 w-80 h-80 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] bg-blue-400/20 blur-2xl"
            animate={{ borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 40% 30% 70%", "40% 60% 70% 30% / 40% 50% 60% 50%"], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* ─── NEW BATCH PRO ─── */}
      {animationClass === "fx-bubbles" && (
        <div className="fx-bubbles-container">
          {[...Array(isCard ? 8 : 20)].map((_, i) => (
            <div
              key={i}
              className="fx-bubble"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 60}px`,
                height: `${20 + Math.random() * 60}px`,
                animationDuration: `${10 + Math.random() * 15}s`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {animationClass === "fx-shooting-stars" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(isCard ? 3 : 6)].map((_, i) => (
            <div
              key={i}
              className="fx-shooting-star"
              style={{
                top: `${Math.random() * 50}%`,
                left: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}

      {animationClass === "fx-morphing-blobs" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="fx-morph-blob bg-primary/30 w-[400px] h-[400px] top-[-100px] left-[-100px]" />
          <div className="fx-morph-blob bg-purple-500/30 w-[500px] h-[500px] bottom-[-150px] right-[-150px] [animation-delay:-7s]" />
          <div className="fx-morph-blob bg-blue-500/25 w-[350px] h-[350px] top-[20%] right-[10%] [animation-delay:-15s]" />
        </div>
      )}

      {animationClass === "fx-luxury-mesh" && (
        <div className="absolute inset-0 z-0 fx-luxury-mesh opacity-80" />
      )}
    </>
  );
};

export default ThemeEffects;
