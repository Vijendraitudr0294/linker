import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Search, Globe, Users, 
  Sparkles, Heart, CreditCard, Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ImmersiveHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [claimLink, setClaimLink] = useState("yourname");
  
  // Subtle parallax for the main image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 50, stiffness: 100 };
  const floatX = useSpring(useTransform(mouseX, [-600, 600], [-15, 15]), springConfig);
  const floatY = useSpring(useTransform(mouseY, [-600, 600], [-15, 15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100vh] w-full flex items-center overflow-hidden bg-background pt-24 pb-32"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        .airbnb-shadow { box-shadow: 0 16px 32px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.05); }
        .hero-title { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* Soft Ambient Backgrounds - Hospitality Vibes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[70%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-pink-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Content: The Message */}
          <div className="lg:col-span-6 space-y-12">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="space-y-5"
             >
               <Badge className="bg-white/5 hover:bg-white/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-sm backdrop-blur-md">
                 <Sparkles className="w-3 h-3 mr-2" />
                 Trusted by 20,000+ top creators
               </Badge>
               
               <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight font-extrabold hero-title text-foreground selection:bg-primary selection:text-white">
                 Create <br />
                 <span className="text-primary italic font-medium">Everywhere.</span>
               </h1>
               
               <p className="text-lg md:text-xl text-muted-foreground/70 font-medium max-w-[480px] leading-relaxed tracking-tight">
                 Build your portfolio, sell your crafts, and connect with your audience on one beautiful, high-performance profile.
               </p>
             </motion.div>
 
             {/* Refined Claim Pill */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.8 }}
               className="max-w-[440px]"
             >
               <div className="airbnb-shadow p-1.5 rounded-2xl bg-surface-glass border border-surface-border flex items-center group transition-all hover:ring-4 hover:ring-primary/5 focus-within:ring-4 focus-within:ring-primary/5">
                 <div className="flex-1 flex items-center gap-3 pl-4 border-r border-white/5 py-2">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                     <Globe className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] font-bold uppercase text-muted-foreground/40 tracking-widest">Your Identity</span>
                     <div className="flex items-center text-[14px] font-bold group-hover:text-primary transition-colors">
                       biotra.xyz/<input 
                         value={claimLink}
                         onChange={(e) => setClaimLink(e.target.value)}
                         className="bg-transparent border-none outline-none w-28 ml-0.5 text-foreground placeholder:text-muted-foreground/20 focus:text-primary"
                         spellCheck="false"
                       />
                     </div>
                   </div>
                 </div>
                 <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-foreground text-white font-bold text-[13px] ml-2 transition-all shadow-lg shadow-primary/10">
                   Join creators <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               </div>
               <p className="mt-3 px-4 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest flex items-center gap-2">
                 <CreditCard className="w-3 h-3" /> No credit card required. Free forever.
               </p>
             </motion.div>
 
             {/* Social Proof Nodes */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="flex items-center gap-8 pt-2"
             >
               {[
                 { label: "High Growth", icon: Users },
                 { label: "Global Reach", icon: Globe },
                 { label: "Premium Care", icon: Heart }
               ].map(item => (
                 <div key={item.label} className="flex items-center gap-2.5 group cursor-pointer">
                   <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                     <item.icon className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-white" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30 group-hover:text-foreground transition-all">{item.label}</span>
                 </div>
               ))}
             </motion.div>
           </div>
 
           {/* Right Visual: The Airbnb Masterpiece Photography */}
           <div className="lg:col-span-6 relative">
             <motion.div
               style={{ x: floatX, y: floatY }}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
               className="relative aspect-square rounded-[2.5rem] overflow-hidden airbnb-shadow border-[4px] border-white/5"
             >
                <img 
                  src="/creator-lifestyle.png" 
                  alt="Premium Creator Studio" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Floating Overlay Modules */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute top-6 right-[-10px] bg-white/10 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3 group cursor-help"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                     <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-xs">2k+ Sales</h4>
                     <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">This Month</p>
                  </div>
                </motion.div>
 
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-xl border border-white/5 p-4 rounded-[1.5rem] shadow-xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full border border-primary/50 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-xs">Nomad Studio</h4>
                        <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-none">Status: Live • Global</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-white transition-all">
                     <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
             </motion.div>
 
             {/* Decorative Background Elements */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-primary/5 rounded-full pointer-events-none -z-10" />
           </div>
         </div>
       </div>
 
       {/* Sticky Bottom Bar - Hospitality Analytics */}
       <div className="absolute bottom-10 left-0 w-full px-6 flex justify-center pointer-events-none">
         <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="px-8 py-4 rounded-3xl bg-white/[0.01] border border-white/5 backdrop-blur-2xl airbnb-shadow flex items-center gap-12 pointer-events-auto"
         >
           {[
             { label: "Active Nomads", val: "22,481", color: "text-foreground" },
             { label: "Insights", val: "4.9/5", color: "text-primary" },
             { label: "Global Sync", val: "Active", icon: Globe, color: "text-vibrant-cyan" }
           ].map(stat => (
             <div key={stat.label} className="flex flex-col gap-0.5">
               <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">{stat.label}</span>
               <div className="flex items-center gap-1.5">
                 {stat.icon && <stat.icon className={`w-3 h-3 ${stat.color}`} />}
                 <span className={`text-[15px] font-extrabold ${stat.color}`}>{stat.val}</span>
               </div>
             </div>
           ))}
         </motion.div>
       </div>
    </section>
  );
};

export default ImmersiveHero;
