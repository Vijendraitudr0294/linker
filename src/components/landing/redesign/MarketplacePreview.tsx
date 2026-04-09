import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Eye, Heart, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const creators = [
  {
    name: "Alex Volkov",
    role: "Digital Architect",
    image: "/redesign/profile_vibrant.png",
    tags: ["Design", "3D"],
    price: "$49",
    sales: "1.2k",
    accent: "hsl(var(--primary))"
  },
  {
    name: "Elena Rostova",
    role: "Brand Strategist",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
    tags: ["Strategy", "Courses"],
    price: "$129",
    sales: "840",
    accent: "hsl(var(--vibrant-pink))"
  },
  {
    name: "Marcus Kane",
    role: "Motion Producer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    tags: ["Video", "Assets"],
    price: "$29",
    sales: "2.4k",
    accent: "hsl(var(--vibrant-cyan))"
  },
  {
    name: "Sarah Chen",
    role: "UX Researcher",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800",
    tags: ["Research", "Guides"],
    price: "$79",
    sales: "640",
    accent: "hsl(var(--vibrant-lime))"
  }
];

const MarketplacePreview = () => {
  return (
    <section id="marketplace" className="py-24 lg:py-48 bg-background relative overflow-hidden font-body transition-colors duration-700">
      {/* Background Aura Soft Blow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 blur-[150px] pointer-events-none" 
           style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.3) 0%, transparent 70%)' }} />
      
      <div className="boutique-container relative z-10">
        
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-24 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[700px]"
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-[1px] bg-primary" />
               <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase font-bold">Creator Showcase</span>
            </div>
            <h2 className="text-[44px] md:text-[64px] font-display font-black leading-[1.05] mb-8 text-foreground tracking-tighter">
               Direct <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-vibrant-pink to-vibrant-yellow bg-[length:200%_auto] animate-gradient-slow italic">Marketplace.</span>
            </h2>
            <p className="max-w-[540px] text-lg text-muted-foreground font-light leading-relaxed tracking-tight">
               Sell your digital products directly from your profile. No middlemen, no split fees, just your craft and your audience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
             <Button className="h-16 px-10 rounded-full border border-surface-border bg-surface-glass text-foreground hover:bg-primary hover:text-white font-display font-black uppercase tracking-[0.2em] text-[11px] gap-4 transition-all group backdrop-blur-3xl shadow-xl">
                Explore Universe <ArrowUpRight className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
             </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {creators.map((creator, i) => (
             <motion.div
                key={creator.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col items-start p-5 rounded-[32px] md:rounded-[40px] vibe-glass border-surface-border hover:border-primary/20 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl"
             >
                {/* Luminous Glow Backdrop */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                     style={{ background: `radial-gradient(circle at 50% 0%, ${creator.accent}20 0%, transparent 70%)` }} />

                <div className="aspect-[1/1] relative w-full overflow-hidden rounded-[24px] md:rounded-[32px] mb-6">
                   <img src={creator.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="creator" />
                   <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-surface-border">
                      <span className="text-[10px] font-mono font-black text-foreground tracking-wider">{creator.price}</span>
                   </div>
                   
                   {/* Gradient Accent Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-br transition-opacity duration-500 opacity-0 group-hover:opacity-20 pointer-events-none" 
                        style={{ background: `linear-gradient(to bottom right, ${creator.accent}, transparent)` }} />
                </div>

                <div className="w-full relative z-10">
                   <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-[22px] font-black text-foreground leading-none tracking-tighter">{creator.name}</h4>
                      <div className="w-9 h-9 rounded-full border border-surface-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                         <ShoppingBag className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{creator.role}</p>
                      <div className="flex gap-2">
                         {creator.tags.map(tag => (
                           <span key={tag} className="text-[8px] font-mono font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                             {tag}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>

             </motion.div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default MarketplacePreview;
