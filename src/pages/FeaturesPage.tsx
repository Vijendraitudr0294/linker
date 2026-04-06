import { motion } from "framer-motion";
import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import Footer from "@/components/landing/Footer";
import { 
  Palette, 
  ShoppingBag, 
  BarChart3, 
  Zap, 
  Sparkles, 
  Play, 
  ShieldCheck, 
  Globe 
} from "lucide-react";

const FeatureItem = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex flex-col items-start gap-4 backdrop-blur-3xl hover:border-white/10 hover:-translate-y-1 transition-all group duration-500"
    >
       <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}>
          <Icon className="w-5 h-5 text-white" />
       </div>
       <h4 className="text-xl font-black uppercase tracking-tight text-white leading-none mt-2">{title}</h4>
       <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-[#08080a] text-white relative noise-overlay dark">
      <RedesignedNavbar />

      <section className="pt-32 lg:pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] mb-6"
          >
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Capabilities</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[44px] md:text-[64px] font-black leading-[1.05] tracking-tight mb-6"
          >
             Tools built for <span className="bg-gradient-to-r from-secondary to-blue-400 bg-clip-text text-transparent">Scale.</span>
          </motion.h1>

          <p className="text-xl text-muted-foreground font-medium max-w-[540px] mx-auto">
             No technical debt, zero paywalls. Create high-fidelty nodes that load instantly upon absolute viewport mounts.
          </p>
        </div>
      </section>

      <section className="py-20 relative">
         <div className="container max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureItem icon={Palette} title="Profile Customization" desc="Over 100+ designer themes with full glassmorphic sandbox weights and layout meshes." color="from-orange-400 to-pink-500" />
            <FeatureItem icon={Play} title="Video Integration" desc="Stream video nodes backends into the frontend frame with sub-100ms timings perfectly." color="from-blue-400 to-violet-500" />
            <FeatureItem icon={ShoppingBag} title="Marketplace Tools" desc="Direct catalog uploads for physical/digital outputs with absolute checkout logic gates." color="from-emerald-400 to-cyan-500" />
            <FeatureItem icon={BarChart3} title="Deep Analytics" desc="Formulate viewer paths and traffic thresholds using direct nodes dashboard frames." color="from-pink-400 to-red-500" />
            <FeatureItem icon={Globe} title="Custom Domain Support" desc="Route absolute domain paths safely into your link profile logic namespace setup." color="from-indigo-400 to-blue-500" />
            <FeatureItem icon={ShieldCheck} title="Data Privacy Rigor" desc="End-to-end checksum buffers ensuring your list of viewers takes data lock thresholds." color="from-emerald-300 to-emerald-600" />
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
