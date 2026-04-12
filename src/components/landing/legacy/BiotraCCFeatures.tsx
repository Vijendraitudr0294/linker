import { Zap, Shield, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "CONNECT EVERYTHING",
    description: "Link your social media, storefront, media kits and music in one highly optimized profile.",
    color: "#4ADE80"
  },
  {
    icon: Shield,
    title: "SHARE EVERYWHERE",
    description: "One link. Millions of clicks. Securely host your brand on a platform that never goes down.",
    color: "#FBCFE8"
  },
  {
    icon: Rocket,
    title: "GROW FAST",
    description: "Advanced analytics and AI tools to help you scale your audience with data-driven insights.",
    color: "#FDE047"
  }
];

const BiotraCCFeatures = () => {
  return (
    <div className="py-32 bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black mb-16 uppercase text-center">
          HOW IT HELPS YOU
        </h2>

      <div className="w-full relative py-12 overflow-hidden">
        {/* Shadow overlays for smooth scroll illusion at edges optionally */}
        
        <div className="flex animate-marquee whitespace-nowrap gap-8 px-4 w-max">
          {[...features, ...features, ...features, ...features].map((feature, i) => (
            <div 
              key={`${feature.title}-${i}`}
              className="p-10 border-4 border-black rounded-[32px] space-y-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shrink-0 w-[400px] whitespace-normal flex flex-col"
              style={{ backgroundColor: feature.color }}
            >
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-black uppercase leading-tight">
                {feature.title}
              </h3>
              <p className="font-bold text-black/60 text-base leading-relaxed uppercase tracking-wider flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default BiotraCCFeatures;
