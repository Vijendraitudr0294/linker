import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Cpu, Zap, Globe, Activity, BarChart3, Heart } from "lucide-react";

interface FinalCTAProps {
  title?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

const FinalCTA = ({
  title = "Join the Sovereign Network.",
  buttonLabel = "Create Free Account",
  buttonHref = "/register"
}: FinalCTAProps) => {
  return (
    <section className="pt-24 lg:pt-40 pb-0 bg-background relative overflow-hidden font-body border-t border-surface-border transition-colors duration-700">
      {/* Structural Zen-G Background Grid */}
      <div className="absolute inset-x-0 bottom-0 h-[600px] bg-[radial-gradient(circle_at_50%_100%,hsl(var(--vibrant-yellow)/0.05)_0%,transparent_60%)] opacity-30 pointer-events-none" />
      
      <div className="boutique-container relative z-10 flex flex-col items-center text-center">
        
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col items-center gap-12"
        >
           <div className="flex flex-col gap-6 items-center">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 px-6 py-2 rounded-full border border-surface-border bg-surface-glass backdrop-blur-3xl shadow-xl"
               >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="label text-primary font-black uppercase tracking-widest text-[10px]">Ready to Launch</span>
               </motion.div>

               <h2 className="text-[44px] md:text-[72px] font-display font-black leading-[1] max-w-[800px] tracking-tighter text-foreground">
                  {(title || "").split('Sovereign').map((p, i, a) => (
                    <span key={i}>
                      {p}{i < a.length - 1 && <span className="italic text-muted-foreground/20 uppercase">Sovereign</span>}
                    </span>
                  ))}
               </h2>

               <p className="max-w-[540px] text-muted-foreground font-light leading-relaxed tracking-tight text-lg">
                  Empowering thousands of independent creators with professional tools and total ownership. Your digital future starts here.
               </p>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-12 group">
               <Button 
                onClick={() => window.location.href = buttonHref}
                className="h-16 px-12 rounded-full bg-primary text-white font-display font-black uppercase tracking-[0.2em] text-[12px] hover:brightness-110 transition-all shadow-4xl hover:scale-[1.05] active:scale-95 group"
               >
                  {buttonLabel} <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-3 transition-transform" />
               </Button>
              <div className="flex items-center gap-6">
                 <div className="w-12 h-[1px] bg-surface-border group-hover:bg-primary transition-all group-hover:w-20" />
                 <span className="label text-muted-foreground/30 text-[10px] tracking-[0.3em] font-black uppercase whitespace-nowrap">No Credit Card Required</span>
              </div>
           </div>
        </motion.div>

        {/* Global Node Map - High Impact Visual */}
        <div className="mt-28 w-full max-w-[1100px] relative aspect-[21/9] rounded-[3rem] border border-surface-border bg-surface-glass overflow-hidden shadow-4xl group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="absolute inset-0 flex items-center justify-center p-20">
                <div className="grid grid-cols-4 gap-8 md:gap-12 w-full max-w-[700px]">
                     {[Zap, Shield, Globe, Cpu, Sparkles, Activity, BarChart3, Heart].map((Icon, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1, backgroundColor: "hsla(var(--primary)/0.08)" }}
                        className="aspect-square rounded-2xl border border-surface-border flex flex-col items-center justify-center gap-4 bg-surface-glass hover:border-primary/40 transition-all cursor-crosshair group/box shadow-lg"
                      >
                         <Icon className="w-6 h-6 text-muted-foreground/40 group-hover/box:text-primary transition-all" />
                         <span className="text-[8px] font-mono text-muted-foreground/20 uppercase tracking-[0.2em] group-hover/box:text-primary font-black">Node_0{i+1}</span>
                      </motion.div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
               <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-mono text-primary font-black tracking-widest leading-none">NETWORK ENCRYPTED</span>
               </div>
               <span className="text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase font-bold">Global Capacity: 99.9%</span>
            </div>
        </div>

      </div>
    </section>
  );
};

export default FinalCTA;
