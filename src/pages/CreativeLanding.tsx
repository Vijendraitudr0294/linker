import { useEffect, useState } from "react";
import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import ImmersiveHero from "@/components/landing/redesign/ImmersiveHero";
import TrustSection from "@/components/landing/redesign/TrustSection";
import HowItWorks from "@/components/landing/redesign/HowItWorks";
import MarketplacePreview from "@/components/landing/redesign/MarketplacePreview";
import HorizontalExperience from "@/components/landing/redesign/HorizontalExperience";
import ModernFeatures from "@/components/landing/redesign/ModernFeatures";
import FinalCTA from "@/components/landing/redesign/FinalCTA";
import LivePreview from "@/components/landing/redesign/LivePreview";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";

const CreativeLanding = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial load to show premium transition
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-background min-h-screen selection:bg-primary selection:text-white overflow-x-hidden relative transition-colors duration-700">
      {/* Global Background Layer - Smooth Dotted Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(hsla(var(--primary)/0.15)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsla(var(--primary)/0.08)_0%,transparent_100%)] opacity-40" />
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background flex items-center justify-center font-body"
          >
             <div className="flex flex-col items-center gap-10">
                <div className="relative w-24 h-24">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-[3px] border-surface-border border-t-primary rounded-full shadow-2xl" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 m-auto w-2 h-2 bg-primary rounded-full blur-[2px] shadow-[0_0_15px_rgba(var(--primary),0.8)]" 
                    />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/20 animate-pulse">Initializing Atmosphere</span>
                    <div className="h-[2px] w-32 bg-surface-border rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-primary"
                        />
                    </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RedesignedNavbar />
      
      <main className="relative z-10">
        <ImmersiveHero />
        
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
         >
           <TrustSection />
        </motion.div>

        <MarketplacePreview />

        <HowItWorks />

        <LivePreview />

        <HorizontalExperience />
        
        <ModernFeatures />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default CreativeLanding;
