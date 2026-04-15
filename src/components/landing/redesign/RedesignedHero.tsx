import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Zap, ShieldCheck, Heart } from "lucide-react";
import heroCreator from "@/assets/landing_page_hero.png";

const RedesignedHero = () => {
  const [username, setUsername] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt effect for the visual card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const { scrollY } = useScroll();
  // Parallax effects
  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-[#060608]"
    >
      {/* Stripe-style Animated Mesh Background */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-full blur-[140px] opacity-40 animate-pulse-slow" />
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent rounded-full blur-[140px] opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </motion.div>

      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography & CTAs (6 cols) */}
          <motion.div 
            style={{ opacity: opacityHero }}
            className="lg:col-span-6 text-center lg:text-left space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-xl"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                Premium Creator Sovereignty
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[52px] md:text-[76px] lg:text-[96px] font-black leading-[0.92] tracking-tighter text-white mb-2"
            >
              Orchestrate <br className="hidden md:block" />
              your <span className="bg-gradient-to-r from-primary via-[#FFA15C] to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-slow italic">Influence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[17px] md:text-xl text-white/50 font-semibold leading-relaxed max-w-[520px] mx-auto lg:mx-0"
            >
              The mission-control for elite creators. Unify your digital commerce, content nodes, and audience intelligence into a single, high-fidelity workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
            >
              <form className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <div className="relative group w-full sm:w-[320px]">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-black uppercase tracking-widest text-[10px] pointer-events-none">biotra.ai/</span>
                   <input 
                    type="text" 
                    placeholder="architect"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-15 pl-32 pr-4 bg-white/[0.04] border border-white/10 rounded-2xl text-[14px] font-bold text-white focus:outline-none focus:border-primary/60 focus:bg-white/[0.06] transition-all placeholder-white/10 shadow-3xl"
                   />
                   <Button type="button" className="absolute right-2 top-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/30 hidden sm:flex">
                     Secure Alias
                   </Button>
                </div>
              </form>
              
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-4 border-r border-white/10 pr-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#060608] overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                         <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                      </div>
                    ))}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[13px] font-black text-white/80 leading-none">12.4k+</span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Nodes</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Mouse Parallax Visual (6 cols) */}
          <div className="lg:col-span-6 relative perspective-1000">
             <motion.div
               initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
               animate={{ opacity: 1, scale: 1, rotateY: 0 }}
               transition={{ duration: 1, delay: 0.4 }}
               style={{ rotateX, rotateY }}
               className="relative z-10 w-full max-w-[500px] aspect-[4/5] mx-auto"
             >
                {/* Main Card with inner depth */}
                <div className="relative w-full h-full rounded-[40px] border border-white/10 bg-white/[0.01] backdrop-blur-2xl p-4 shadow-3xl overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-40" />
                   <div className="w-full h-full rounded-[32px] overflow-hidden relative border border-white/5">
                      <img 
                        src={heroCreator} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                        alt="creator"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                         <div className="flex items-center justify-between">
                            <div>
                               <h4 className="text-xl font-black text-white">Alex Volkov</h4>
                               <p className="text-xs text-white/50 font-medium">Digital Architect</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                               <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Floating Widgets following Tilt */}
                <motion.div
                  animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-8 top-12 z-20 w-[160px] bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-3xl p-4 shadow-2xl hidden md:block"
                >
                   <div className="flex items-center gap-3 mb-2">
                       <Zap className="w-4 h-4 text-primary" />
                       <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Revenue</span>
                   </div>
                   <div className="text-xl font-black text-white">$12.4k</div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 12, 0], x: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-8 bottom-12 z-20 w-[180px] bg-background/90 border border-white/5 backdrop-blur-3xl rounded-3xl p-4 shadow-2xl hidden md:block"
                >
                   <div className="flex items-center gap-3 mb-2">
                       <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                       <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Growth</span>
                   </div>
                   <div className="text-lg font-black text-white">+18.2% <sup className="text-emerald-400 text-xs">↑</sup></div>
                </motion.div>

             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RedesignedHero;
