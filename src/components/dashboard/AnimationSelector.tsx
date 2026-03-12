import { cn } from "@/lib/utils";
import { Sparkles, Stars, Waves, Box, Zap, Cloud, Grid3X3 } from "lucide-react";

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
    { id: "animate-leaves", label: "Autumn Fall", icon: Box, class: "animate-leaves" },
    { id: "animate-rain", label: "Raindrops", icon: Cloud, class: "animate-rain" },
    { id: "animate-water", label: "Water Ripple", icon: Waves, class: "animate-water" },
    { id: "animate-geometric", label: "Geometric", icon: Grid3X3, class: "animate-geometric" },
    { id: "animate-blinking", label: "Blinking Lights", icon: Sparkles, class: "animate-blinking" },
    { id: "animate-liquid", label: "Liquid Morph", icon: Waves, class: "animate-liquid" },
    { id: "animate-particles", label: "Interstellar", icon: Box, class: "animate-particles" },
    { id: "animate-energy", label: "Energy Flow", icon: Zap, class: "animate-energy" },
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
