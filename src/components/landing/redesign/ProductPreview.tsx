import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShoppingBag, Sparkles, User, Play, ArrowRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCreator from "@/assets/landing_page_hero.png";

const ProductPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const yTranslate = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={sectionRef} className="py-20 lg:py-52 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          {/* Main Visual: Profile Showcase */}
          <div className="flex-1 relative order-2 lg:order-1 perspective-1000">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
               whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="relative z-10 w-full aspect-[9/13] max-w-[420px] rounded-[48px] border-[12px] border-white/5 bg-black p-1 shadow-2xl shadow-primary/20 transition-transform duration-700 hover:scale-[1.02] mx-auto"
             >
                <div className="w-full h-full rounded-[36px] overflow-hidden relative">
                   <img src={heroCreator} className="w-full h-full object-cover" alt="product preview" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                      <div className="space-y-4">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                            <Sparkles className="w-3 h-3 text-primary shadow-[0_0_5px_rgba(250,168,25,0.4)]" />
                            <span className="text-[9px] font-black uppercase text-white/50 tracking-widest">Premium Designer</span>
                         </div>
                         <h4 className="text-3xl font-black text-white">Alex Volkov</h4>
                         <div className="flex flex-col gap-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-xs font-bold text-white/80 transition-all hover:bg-white/10 decoration-none">
                                 {i === 1 ? "Latest Projects ⚡" : i === 2 ? "Motion Course 🚀" : "Book a Workshop 📩"}
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Overlying Dashboard Fragment */}
                <motion.div
                  style={{ y: yTranslate }}
                  className="absolute -right-20 top-1/4 z-20 w-[240px] bg-white/[0.05] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl hidden xl:block"
                >
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                         <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[12px] font-black uppercase text-white tracking-[0.2em] leading-none">Catalog</span>
                   </div>
                   <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-white/5 flex-none" />
                           <div className="flex-1 space-y-1">
                              <div className={`h-2 bg-white/10 rounded-full ${i === 1 ? 'w-2/3' : i === 2 ? 'w-full' : 'w-1/2'}`} />
                              <div className="h-2 bg-white/5 rounded-full w-1/3" />
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
             </motion.div>
          </div>

          {/* Context: Value Proposition */}
          <div className="flex-1 order-1 lg:order-2 space-y-12">
             <motion.div
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
                   <Target className="w-4 h-4 text-secondary" />
                   <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product Preview</span>
                </div>
                <h3 className="text-[44px] md:text-[56px] font-black leading-[1.05] tracking-tight text-foreground mb-8">
                   Designed for <span className="text-secondary">Impact.</span>
                </h3>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-[480px]">
                   A seamless blend of aesthetics and utility. Your profile is more than just links—it's your command center.
                </p>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-10"
             >
                <div className="space-y-4">
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                   </div>
                   <h5 className="text-[17px] font-black text-foreground uppercase tracking-widest">Fluid Glass Design</h5>
                   <p className="text-sm text-muted-foreground font-medium">Native-app feel built for every mobile device and desktop screen.</p>
                </div>
                <div className="space-y-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-400" />
                   </div>
                   <h5 className="text-[17px] font-black text-foreground uppercase tracking-widest">Instant Interactions</h5>
                   <p className="text-sm text-muted-foreground font-medium">Zero friction, sub-100ms transitions, and high-conversion layouts.</p>
                </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4 }}
             >
                <Button className="h-16 px-10 rounded-2xl bg-secondary text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.05] active:scale-95 transition-all">
                  Try the visual builder
                </Button>
             </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ProductPreview;
