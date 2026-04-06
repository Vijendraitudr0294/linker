import { cn } from "@/lib/utils";
import { Sparkles, Stars, Waves, Box, Zap, Cloud, Grid3X3, Disc as Curves } from "lucide-react";

interface AnimationSelectorProps {
    currentAnimation?: string;
    onSelect: (animation: string) => void;
}

const animations = [
    { id: "none", label: "Static", icon: Sparkles, class: "" },
    { id: "animate-stars", label: "Cosmic Stars", icon: Stars, class: "animate-stars" },
    { id: "animate-nordic-stars", label: "Nordic Stars", icon: Stars, class: "animate-nordic-stars" },
    { id: "animate-galaxy", label: "Nebula Galaxy", icon: Sparkles, class: "animate-galaxy" },
    { id: "animate-star-shower", label: "Star Shower", icon: Stars, class: "animate-star-shower" },
    { id: "animate-mesh", label: "Liquid Mesh", icon: Waves, class: "animate-mesh" },
    { id: "animate-aurora", label: "Northern Lights", icon: Cloud, class: "animate-aurora" },
    { id: "animate-cyber-grid", label: "Neon Cyber", icon: Grid3X3, class: "animate-cyber-grid" },
    { id: "fx-liquid-gradient", label: "Liquid Glow", icon: Waves, class: "fx-liquid-gradient" },
    { id: "fx-pop-grain", label: "Retro Grain", icon: Sparkles, class: "fx-pop-grain" },
    { id: "fx-midnight-grid", label: "Midnight Grid", icon: Grid3X3, class: "fx-midnight-grid" },
    { id: "fx-constellation-3d", label: "3D Nodes", icon: Stars, class: "fx-constellation-3d" },
    { id: "fx-neon-grid-3d", label: "3D Grid", icon: Grid3X3, class: "fx-neon-grid-3d" },
    { id: "fm-fade", label: "Soft Fade", icon: Sparkles, class: "fm-fade" },
    { id: "fm-pulse-glow", label: "Pulse Glow", icon: Zap, class: "fm-pulse-glow" },
    { id: "fm-float", label: "Floating Orbs", icon: Box, class: "fm-float" },
    { id: "fm-parallax", label: "Parallax Multi", icon: Cloud, class: "fm-parallax" },
    { id: "animate-liquid", label: "Liquid Morph", icon: Waves, class: "animate-liquid" },
    { id: "animate-particles", label: "Interstellar", icon: Box, class: "animate-particles" },
    { id: "animate-energy", label: "Energy Flow", icon: Zap, class: "animate-energy" },
    // ─── Pro Batch Additions ───
    { id: "fm-snow-glow", label: "Snow Crystals", icon: Sparkles, class: "fm-snow-glow" },
    { id: "fm-fireflies", label: "Fireflies", icon: Stars, class: "fm-fireflies" },
    { id: "fm-nebula-pulse", label: "Nebula Pulse", icon: Cloud, class: "fm-nebula-pulse" },
    { id: "fm-neon-lines", label: "Data Streams", icon: Zap, class: "fm-neon-lines" },
    { id: "fm-liquid-blob", label: "Morph Blob", icon: Curves, class: "fm-liquid-blob" },
    { id: "fm-slide-up", label: "Rising Fog", icon: Cloud, class: "fm-slide-up" }
];

const AnimationSelector = ({ currentAnimation, onSelect }: AnimationSelectorProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {animations.map((ani) => {
                    const Icon = ani.icon;
                    const isSelected = (currentAnimation === ani.id) || (ani.id === "none" && !currentAnimation);
                    return (
                        <button
                            key={ani.id}
                            onClick={() => onSelect(ani.id === "none" ? "" : ani.id)}
                            className={cn(
                                "group relative p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 overflow-hidden",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                                    : "border-border/40 bg-card/40 hover:border-primary/40 hover:bg-card/60"
                            )}
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", isSelected ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground")}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[12px] font-bold uppercase tracking-wider">{ani.label}</span>

                            {/* Mini Preview Overlay */}
                            {ani.id !== "none" && (
                                <div className={cn("absolute inset-0 -z-10 opacity-20 pointer-events-none", ani.class)} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AnimationSelector;
