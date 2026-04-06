import { motion } from "framer-motion";
import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import Footer from "@/components/landing/Footer";
import { Sparkles, Heart, Zap, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#08080a] text-white relative noise-overlay dark">
      <RedesignedNavbar />

      {/* Sub-Hero Section */}
      <section className="pt-32 lg:pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-10" />
        </div>

        <div className="container max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6"
          >
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Our Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[44px] md:text-[64px] font-black leading-[1.05] tracking-tight mb-6"
          >
             We build for the <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Independent.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-muted-foreground font-medium max-w-[600px] mx-auto leading-relaxed"
          >
             BIOTRA was created to give creators absolute ownership over their identity, content, and revenue streams with zero friction.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision grid */}
      <section className="py-20 bg-white/[0.01] border-y border-white/5 relative">
         <div className="container max-w-[1200px] mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 lg:p-12 rounded-[32px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl space-y-4"
            >
               <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-secondary" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Our Mission</h3>
               <p className="text-muted-foreground font-medium text-md leading-relaxed">
                  To democratize creator monetization by unifying tools directly. We remove middleman algorithms so writers, designers, and performers can connect transparently.
               </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 lg:p-12 rounded-[32px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl space-y-4"
            >
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Our Vision</h3>
               <p className="text-muted-foreground font-medium text-md leading-relaxed">
                  A digital ecosystem without paywalls or restrictive borders. Your profile represents your base of operations, built to match absolute global reach.
               </p>
            </motion.div>

         </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 relative overflow-hidden">
         <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
            <div className="text-center max-w-[600px] mx-auto mb-16">
               <h2 className="text-[32px] md:text-[48px] font-black tracking-tight leading-none mb-4">Why we are here</h2>
               <p className="text-muted-foreground font-medium">Core pillars upholding our creator-first mandate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { icon: Shield, title: "Data Autonomy", desc: "You own every click, viewer threshold, and catalog item directly." },
                  { icon: Sparkles, title: "Visual Rigor", desc: "No generic templates. Choose flawless high-fidelity meshes to elevate your vibe." },
                  { icon: Zap, title: "Infinite Speeds", desc: "Built with frame layers that guarantee sub-100ms content serving." }
               ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center text-center p-6 space-y-4"
                  >
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center shadow-xl">
                        <item.icon className="w-5 h-5 text-white/80" />
                     </div>
                     <h4 className="text-base font-black uppercase tracking-widest text-white">{item.title}</h4>
                     <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
