import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Re-using Nav and Footer logic for consistency
const Nav = () => (
  <nav className="fixed top-4 left-6 right-6 z-[100] px-6 py-4 flex items-center justify-between rounded-[20px] bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
    <Link to="/" className="flex items-center gap-2">
      <div className="w-10 h-10 bg-emerald-400 border-2 border-black rounded-[8px] flex items-center justify-center">
          <Zap className="text-black w-6 h-6 fill-black" />
      </div>
      <span className="font-black text-xl tracking-tighter uppercase">BIOTRA</span>
    </Link>
    <div className="flex items-center gap-4">
      <Link to="/register" className="px-6 py-3 bg-black text-white border-2 border-black rounded-[12px] text-[10px] font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgba(250,204,21,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
        Get Started
      </Link>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="py-20 bg-black text-white text-center flex flex-col items-center gap-8">
     <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white border-2 border-emerald-400 rounded-[10px] flex items-center justify-center">
            <Zap className="text-black w-5 h-5 fill-black" />
        </div>
        <span className="font-black text-lg tracking-tighter uppercase">BIOTRA</span>
     </div>
     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
       © 2024 BIOTRA TECHNOLOGIES. ALL RIGHTS RESERVED.
     </p>
  </footer>
);

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black selection:bg-yellow-400 selection:text-black overflow-x-hidden font-sans antialiased">
      <Nav />

      <section className="pt-48 pb-32 relative overflow-hidden text-center">
        {/* Brutalist Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="container max-w-[1240px] mx-auto px-6 relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ rotate: -2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black rounded-[8px] text-[10px] font-black uppercase tracking-widest mb-10 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <Sparkles className="w-3 h-3" /> Simple & Transparent Pricing
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[52px] md:text-[110px] font-[1000] leading-[0.8] tracking-tighter uppercase mb-16 italic"
          >
             PLANS FOR <br /> EVERY <span className="bg-emerald-400 px-6 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] inline-block my-4">STAGE.</span>
          </motion.h1>
          
          <p className="text-xl md:text-2xl font-black text-black/40 max-w-[550px] mb-24 leading-tight uppercase tracking-tight">
             Start building for free, and scale features as your audience grows.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full">
             {/* Free Plan */}
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="p-16 rounded-[24px] bg-white text-left flex flex-col items-start border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
             >
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mb-10">ENTRY LEVEL</div>
                <div className="text-[64px] font-[1000] leading-none mb-10">$0</div>
                <p className="text-sm font-black uppercase text-black/50 leading-tight mb-16">Perfect for baseline digital identity.</p>
                
                <div className="space-y-6 mb-20 w-full">
                   {["Basic profile builder", "60+ visual layouts", "Contact forms", "Standard analytics"].map((t) => (
                     <div key={t} className="flex items-center gap-4 text-xs font-black uppercase tracking-tight text-black">
                        <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center shrink-0">
                           <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[4]" />
                        </div>
                        {t}
                     </div>
                   ))}
                </div>
                <Button className="w-full h-16 rounded-[12px] bg-white border-2 border-black text-black hover:bg-gray-50 font-black uppercase tracking-widest text-xs mt-auto shadow-[4px_4px_0_0_rgba(0,0,0,1)]">Initialize Free</Button>
             </motion.div>

             {/* Pro Plan */}
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="p-16 rounded-[24px] bg-black text-white text-left flex flex-col items-start border-4 border-black shadow-[16px_16px_0_0_rgba(16,185,129,1)] relative overflow-hidden"
             >
                <div className="absolute top-8 right-8 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-400 border-2 border-black text-black">
                   <Sparkles className="w-3.5 h-3.5 fill-black" />
                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">POPULAR</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 font-sans">PROFESSIONAL</div>
                <div className="flex items-baseline gap-2 mb-10">
                   <span className="text-[64px] font-[1000] leading-none text-white">$12</span>
                   <span className="text-sm font-black uppercase text-emerald-400 tracking-widest">/MO</span>
                </div>
                <p className="text-sm font-black uppercase text-white/40 leading-tight mb-16">Advanced tools for elite digital influence.</p>
                
                <div className="space-y-6 mb-20 w-full">
                   {["Everything in Free", "Advanced graph metrics", "Custom domain setup", "White-label profiles"].map((t) => (
                     <div key={t} className="flex items-center gap-4 text-xs font-black uppercase tracking-tight text-white/80">
                        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center shrink-0">
                           <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[4]" />
                        </div>
                        {t}
                     </div>
                   ))}
                </div>
                <Button className="w-full h-16 rounded-[12px] bg-emerald-400 border-2 border-black text-black hover:bg-emerald-300 font-black uppercase tracking-widest text-xs mt-auto flex items-center gap-3 justify-center shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
                   Upgrade Stage <ArrowRight className="w-5 h-5 stroke-[4]" />
                </Button>
             </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
