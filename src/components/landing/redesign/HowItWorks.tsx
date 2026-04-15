import { motion } from "framer-motion";
import { Zap, Shield, Globe, Cpu, ArrowRight } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Create Profile",
    desc: "Design your unique layout and link your social accounts in just a few minutes.",
    icon: Shield,
    accent: "White #FFFFFF"
  },
  {
    id: "02",
    title: "Add Products",
    desc: "Launch your digital store and start selling products directly to your audience today.",
    icon: Zap,
    accent: "White #FFFFFF"
  },
  {
    id: "03",
    title: "Grow Brand",
    desc: "Share your professional profile across all platforms and grow your independent brand.",
    icon: Globe,
    accent: "White #FFFFFF"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-48 bg-background relative overflow-hidden font-body transition-colors duration-700">
      <div className="boutique-container">
        
        <div className="flex flex-col items-center text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 mb-8"
          >
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             <span className="label text-primary uppercase font-black tracking-[0.4em] text-[10px]">A Simplified Workflow</span>
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </motion.div>
          <h2 className="text-[40px] md:text-[64px] font-display font-black mb-8 text-foreground tracking-tighter">
             Three Steps to <br className="sm:hidden" /> <span className="italic text-foreground/10 dark:text-muted-foreground/40 uppercase">Independence.</span>
          </h2>
          <p className="max-w-[540px] text-muted-foreground font-light leading-relaxed tracking-tight text-lg">
             A professional-grade system designed for the next generation of creative entrepreneurs who demand control over their digital presence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-surface-border border border-surface-border rounded-3xl overflow-hidden shadow-4xl group">
           {steps.map((step, i) => (
             <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 1 }}
                className="group relative bg-background p-16 flex flex-col items-start gap-12 group transition-colors duration-700"
             >
                {/* ID Segment */}
                <div className="flex items-center gap-6">
                   <span className="label text-primary text-[14px] leading-none mb-1 font-black">{step.id}</span>
                   <div className="w-8 h-[1px] bg-surface-border group-hover:bg-primary transition-all group-hover:w-16" />
                </div>

                <div className="flex flex-col gap-6">
                   <h3 className="text-[28px] font-display font-black leading-[1.1] text-foreground group-hover:translate-x-4 transition-transform duration-700 tracking-tighter">{step.title}</h3>
                   <p className="text-muted-foreground font-light leading-relaxed max-w-[280px]">
                      {step.desc}
                   </p>
                </div>

                <div className="mt-auto pt-12 flex items-center gap-6 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                   <div className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center bg-surface-glass shadow-lg">
                      <step.icon className="w-3.5 h-3.5 text-foreground" />
                   </div>
                   <span className="label text-[9px] tracking-[0.3em] font-black uppercase text-muted-foreground/60">Module Synchronized</span>
                </div>

                {/* Desktop Connection Arrows */}
                {i < steps.length - 1 && (
                   <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-8 h-8 rounded-full border border-surface-border bg-background flex items-center justify-center group-hover:border-primary transition-all shadow-xl">
                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                      </div>
                   </div>
                )}

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-primary/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             </motion.div>
           ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
