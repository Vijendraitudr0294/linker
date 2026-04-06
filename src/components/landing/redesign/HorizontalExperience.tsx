import { motion } from "framer-motion";
import { Shield, Zap, Globe, Sparkles, BarChart3, ShoppingBag } from "lucide-react";

const modules = [
  {
    title: "Sovereign Identity",
    label: "Identity Core",
    desc: "The professional standard for digital presence. Establish your identity with sovereign-grade ownership and total privacy.",
    icon: Shield,
    color: "from-blue-500/20 to-indigo-500/0",
    features: ["Zero-Knowledge Auth", "Privacy-First Layer"]
  },
  {
    title: "Direct Commerce",
    label: "Economic Ecosystem",
    desc: "Scale your revenue without middlemen. A high-fidelity commerce suite built for elite creators.",
    icon: ShoppingBag,
    color: "from-primary/20 to-primary/0",
    features: ["Global Payments", "Instant Delivery"]
  },
  {
    title: "Growth Analytics",
    label: "Intelligence Hub",
    desc: "Real-time audience insights. Track where your traffic comes from and how your content converts with precision.",
    icon: BarChart3,
    color: "from-emerald-500/20 to-emerald-500/0",
    features: ["Traffic Tracking", "Conversion Insight"]
  },
  {
    title: "Network Expansion",
    label: "Global Reach Protocol",
    desc: "Synchronize your digital footprint across the web with industrial-grade precision and speed.",
    icon: Globe,
    color: "from-purple-500/20 to-purple-500/0",
    features: ["Distributed Scaling", "Adaptive Rendering"]
  }
];

const HorizontalExperience = () => {
  return (
    <section id="experience" className="bg-background font-body py-24 lg:py-40 border-t border-surface-border transition-colors duration-700">
      <div className="boutique-container">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-40">
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="px-5 py-2 rounded-full border border-surface-border bg-surface-glass mb-8 shadow-sm backdrop-blur-3xl"
            >
               <span className="text-[10px] font-mono tracking-widest text-primary font-black uppercase">The Sovereign Framework</span>
            </motion.div>
            <h2 className="text-[44px] md:text-[88px] font-display font-black text-foreground leading-[0.9] tracking-tighter max-w-[900px]">
               EVERYTHING <span className="italic text-foreground/5 dark:text-muted-foreground/10 uppercase">CONNECTED.</span>
            </h2>
        </div>

        {/* Vertical Modules */}
        <div className="space-y-40">
            {modules.map((mod, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center"
               >
                  <div className={`lg:col-span-6 flex flex-col gap-10 ${i % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                      <div className="flex items-center gap-4">
                         <div className="px-4 py-1.5 rounded-full bg-surface-glass border border-surface-border shadow-sm">
                            <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground font-bold uppercase">{mod.label}</span>
                         </div>
                         <div className="w-12 h-[1px] bg-surface-border" />
                         <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground/30 uppercase font-black">0{i+1}</span>
                      </div>
                      
                      <h3 className="text-[48px] md:text-[64px] font-display font-black leading-none text-foreground tracking-tighter">{mod.title}</h3>
                      <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-[480px]">{mod.desc}</p>
                      
                      <div className="flex flex-wrap gap-4">
                          {mod.features.map((feat, j) => (
                            <div key={j} className="px-4 py-2 rounded-xl bg-surface-glass border border-surface-border flex items-center gap-3 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none font-black">{feat}</span>
                            </div>
                          ))}
                      </div>
                  </div>

                  <div className={`lg:col-span-6 relative flex items-center justify-center ${i % 2 !== 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} blur-[120px] rounded-full opacity-40`} />
                      <motion.div 
                        whileHover={{ scale: 1.02, rotate: i % 2 === 0 ? 1 : -1 }}
                        className="w-full max-w-[540px] aspect-video bg-card backdrop-blur-3xl rounded-[3rem] p-12 lg:p-16 relative overflow-hidden flex flex-col items-center justify-center border border-surface-border shadow-4xl transition-all duration-700"
                      >
                          <div className="absolute top-10 right-10">
                             <mod.icon className="w-12 h-12 text-muted-foreground/5 transition-colors" />
                          </div>
                          
                          <div className="flex flex-col items-center text-center gap-8">
                              <div className="w-20 h-20 rounded-full bg-surface-glass border border-surface-border flex items-center justify-center shadow-xl">
                                  <Sparkles className="w-8 h-8 text-primary" />
                              </div>
                              <div className="space-y-4">
                                  <div className="h-2 w-32 bg-muted/40 rounded-full overflow-hidden mx-auto shadow-inner">
                                      <motion.div 
                                          initial={{ width: 0 }}
                                          whileInView={{ width: "70%" }}
                                          className="h-full bg-primary shadow-lg" 
                                      />
                                  </div>
                                  <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em] font-black">Protocol Sync Active</p>
                              </div>
                          </div>
                      </motion.div>
                  </div>
               </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalExperience;
