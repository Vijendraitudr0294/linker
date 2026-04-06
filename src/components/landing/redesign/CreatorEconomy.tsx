import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreatorEconomy = () => {
  return (
    <section id="economy" className="py-32 lg:py-48 bg-[#080808] relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -mr-64 -mt-64 pointer-events-none" />
      
      <div className="boutique-container relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
           
           {/* Dashboard Visual Representation */}
           <div className="flex-1 order-2 lg:order-1 relative w-full aspect-square max-w-[600px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full rounded-[4rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl p-10 shadow-2xl overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-pink/10 opacity-30" />
                 
                 <div className="relative h-full flex flex-col justify-between">
                    {/* Top Stats Fragment */}
                    <div className="grid grid-cols-1 gap-6">
                       <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.03] backdrop-blur-md">
                           <div className="flex items-center gap-4 mb-3">
                             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                             </div>
                             <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-[0.2em]">Net Protocol Yield</span>
                          </div>
                          <div className="text-4xl font-display font-bold text-foreground">$124,580.00</div>
                       </div>
                       <div className="p-8 rounded-[2rem] border border-surface-border bg-surface-glass backdrop-blur-md">
                          <div className="flex items-center gap-4 mb-3">
                             <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-400" />
                             </div>
                             <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-[0.2em]">Global Audience Node</span>
                          </div>
                          <div className="text-4xl font-display font-bold text-foreground">842,500 <span className="text-sm font-medium text-emerald-400">+12%</span></div>
                       </div>
                    </div>

                    {/* Floating Accent Card */}
                    <motion.div
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="mt-6 p-6 rounded-[2rem] bg-gradient-to-r from-primary/20 to-surface-glass border border-surface-border flex items-center justify-between"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                             <TrendingUp className="w-5 h-5 text-black" />
                          </div>
                          <div>
                             <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Protocol Velocity</div>
                             <div className="text-lg font-display font-bold text-foreground uppercase tracking-tighter">Accelerated</div>
                          </div>
                       </div>
                       <Sparkles className="w-6 h-6 text-primary" />
                    </motion.div>
                 </div>
              </motion.div>
           </div>

           {/* Context: Value Proposition */}
           <div className="flex-1 order-1 lg:order-2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-surface-border bg-surface-glass backdrop-blur-xl mb-10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Sovereign Monetization</span>
                 </div>
                 <h3 className="text-[52px] md:text-[72px] font-display font-black leading-[0.95] tracking-tighter text-foreground mb-10 uppercase">
                    OWN YOUR <span className="text-primary italic">ECONOMY.</span>
                 </h3>
                 <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-[500px]">
                    Eliminate middleman friction. Build multiple high-integrity revenue streams with direct platform access.
                 </p>
              </motion.div>

              <div className="space-y-6">
                 {[
                    { title: "Direct Sales", desc: "Monetize digital assets without platform tax." },
                    { title: "Smart Subscriptions", desc: "Recursive value loops with verified members." },
                    { title: "Zero Data Leak", desc: "High-integrity architecture for your IP." }
                 ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-6 p-6 rounded-full border border-surface-border bg-surface-glass hover:bg-surface-glass/40 transition-all group"
                    >
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-all group-hover:scale-110">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                       </div>
                       <div>
                          <h5 className="text-[14px] font-display font-bold text-foreground uppercase tracking-widest mb-0.5">{item.title}</h5>
                          <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                       </div>
                    </motion.div>
                 ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                 <Button className="h-20 px-14 rounded-full bg-white text-black font-display font-black uppercase tracking-[0.2em] text-[14px] hover:bg-primary transition-all shadow-2xl active:scale-95">
                   Explore Protocol
                 </Button>
              </motion.div>
           </div>

        </div>

      </div>
    </section>
  );
};

export default CreatorEconomy;
