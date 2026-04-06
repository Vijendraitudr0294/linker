import { motion } from "framer-motion";
import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import Footer from "@/components/landing/Footer";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[#08080a] text-white relative noise-overlay dark">
      <RedesignedNavbar />

      <section className="pt-32 lg:pt-48 pb-20 relative overflow-hidden text-center">
        <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[44px] md:text-[64px] font-black leading-[1.05] tracking-tight text-foreground text-center mb-6"
          >
             Plans for every <span className="text-secondary">Stage.</span>
          </motion.h1>
          <p className="text-xl text-muted-foreground font-medium text-center max-w-[480px] mx-auto mb-16">
             Start building for free, and scale features as your audience grows.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
             {/* Free Plan */}
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="p-8 pb-10 rounded-[32px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl text-left flex flex-col items-start gap-4 transition-all duration-300"
             >
                <div className="text-lg font-black uppercase tracking-widest text-muted-foreground/60">Free</div>
                <div className="text-[44px] font-black text-white">$0</div>
                <p className="text-sm text-muted-foreground font-medium mb-4">Perfect for getting started with your personal profile.</p>
                <div className="w-full h-px bg-white/5 my-2" />
                <ul className="space-y-4 w-full mb-8">
                   {["Basic profile builder", "60+ visual layouts", "Contact forms", "Standard analytics"].map((t) => (
                     <li key={t} className="flex items-center gap-2 text-sm text-white/80 font-medium">
                        <Check className="w-4 h-4 text-emerald-400" /> {t}
                     </li>
                   ))}
                </ul>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs mt-auto">Get Started</Button>
             </motion.div>

             {/* Pro Plan */}
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="p-8 pb-10 rounded-[32px] border border-primary/20 bg-primary/5 backdrop-blur-3xl text-left flex flex-col items-start gap-4 relative overflow-hidden transition-all duration-300 shadow-xl shadow-primary/5"
             >
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/10">
                   <Sparkles className="w-3.5 h-3.5 text-primary" />
                   <span className="text-[9px] font-black uppercase text-primary tracking-widest">Popular</span>
                 </div>
                <div className="text-lg font-black uppercase tracking-widest text-primary">Pro</div>
                <div className="text-[44px] font-black text-white">$12<span className="text-sm text-primary/80 lowercase">/mo</span></div>
                <p className="text-sm text-muted-foreground font-medium mb-4">Advanced tools for elite creators scaling their influence.</p>
                <div className="w-full h-px bg-white/5 my-2" />
                <ul className="space-y-4 w-full mb-8">
                   {["Everything in Free", "Advanced graph metrics", "Custom domain setup", "White-label profiles"].map((t) => (
                     <li key={t} className="flex items-center gap-2 text-sm text-white/80 font-medium">
                        <Check className="w-4 h-4 text-primary" /> {t}
                     </li>
                   ))}
                </ul>
                <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs mt-auto shadow-xl shadow-primary/20">Upgrade to Pro</Button>
             </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
