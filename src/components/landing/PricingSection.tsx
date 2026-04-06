import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const featureGroups = [
  ["Unlimited links", "Built-in marketplace", "Real-time analytics", "AI bio writer"],
  ["60+ premium themes", "Order management", "Contact form", "Custom backgrounds"],
];

const PricingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={sectionRef} id="pricing" className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        
        <motion.div
          className="max-w-[800px] mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase mb-6">
            Transparent Pricing
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-foreground mb-6 tracking-tight leading-tight">
            Everything unlocked. <span className="text-secondary italic">No pro gate.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-[540px]">
            We don't believe in limits. You get the full BIOTRA stack from day one, without a single trial countdown or locked feature.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left Side: Pricing */}
            <div className="lg:col-span-12 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 bg-white/[0.01]">
                <div className="max-w-[400px]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[64px] font-bold text-foreground tracking-tighter leading-none">$0</span>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-primary uppercase tracking-widest">Free</span>
                      <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest">Forever</span>
                    </div>
                  </div>
                  <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                    Launch your brand, your store, your analytics, and your leads without ever worrying about a monthly subscription.
                  </p>
                  <Link to="/register">
                    <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2 group">
                      Get started free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full md:w-auto">
                   {featureGroups.map((group, i) => (
                     <div key={i} className="space-y-4">
                        {group.map(feat => (
                          <div key={feat} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-[14px] font-medium text-foreground/80">{feat}</span>
                          </div>
                        ))}
                     </div>
                   ))}
                </div>
            </div>

            {/* Bottom Bar: Security */}
            <div className="lg:col-span-12 p-8 bg-black/20 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-[13px] text-muted-foreground/80 max-w-[440px]">
                    <span className="text-emerald-400 font-semibold mr-1">Secure & Private.</span>
                    Your data is yours. We never sell your personal information or track your visitors beyond essential analytics.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                     {[1,2,3,4].map(i => <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-muted" />)}
                   </div>
                   <span className="text-[12px] font-medium text-muted-foreground">Trusted by developers</span>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
