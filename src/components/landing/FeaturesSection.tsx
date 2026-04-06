import { motion } from "framer-motion";
import { 
  Palette, 
  BarChart3, 
  Sparkles, 
  Link2, 
  Zap, 
  ShieldCheck, 
  ShoppingBag, 
  MessageCircle,
  ArrowRight,
  Layout,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import analyticsPreview from "@/assets/analytics_dashboard_preview.png";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-32 relative overflow-hidden bg-background">
      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        
        <motion.div
          className="max-w-[800px] mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase mb-6">
            Everything Unlocked
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-foreground mb-6 tracking-tight leading-tight">
            The full stack. <span className="text-secondary italic">Zero paywalls.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-[540px]">
            Stop paying monthly for basic features. We provide every tool you need to scale, 
            <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-4"> entirely free.</span>
          </p>
        </motion.div>

        {/* Premium Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
          
          {/* Shop Feature - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-6 lg:col-span-8 rounded-3xl bg-white/[0.02] border border-white/5 p-8 lg:p-12 relative overflow-hidden group min-h-[400px] flex flex-col justify-end"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">Built-in Storefront</h3>
              <p className="text-[15px] text-muted-foreground font-normal leading-relaxed max-w-[340px]">
                Sell physical goods or digital downloads without ever leaving your bio link. Zero transaction fees from our end.
              </p>
            </div>
          </motion.div>

          {/* Analytics - Medium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-6 lg:col-span-4 rounded-3xl bg-white/[0.02] border border-white/5 p-8 relative overflow-hidden group min-h-[400px] flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
              <BarChart3 className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4 tracking-tight">Real-time Analytics</h3>
            <p className="text-[14px] text-muted-foreground font-normal leading-relaxed mb-8">
              Know exactly where your audience is coming from and what content converts.
            </p>
            <div className="mt-auto relative rounded-2xl overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700">
               <img src={analyticsPreview} alt="analytics" className="w-full h-auto" />
            </div>
          </motion.div>

          {/* Small Features Row */}
          {[
            { icon: Palette, title: "Pro Themes", desc: "60+ designer styles ready to go.", color: "text-orange-400", bg: "bg-orange-400/10" },
            { icon: Sparkles, title: "AI Writer", desc: "Instant high-converting bios.", color: "text-purple-400", bg: "bg-purple-400/10" },
            { icon: Globe, title: "Custom Domains", desc: "Connect your own .com easily.", color: "text-emerald-400", bg: "bg-emerald-400/10" }
          ].map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="md:col-span-2 lg:col-span-4 rounded-3xl bg-white/[0.02] border border-white/5 p-8 group hover:border-white/10 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center mb-6`}>
                <feat.icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{feat.title}</h3>
              <p className="text-[14px] text-muted-foreground font-normal leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}

          {/* Final Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="md:col-span-6 lg:col-span-12 rounded-3xl bg-[linear-gradient(135deg,rgba(250,168,25,0.05),rgba(0,121,255,0.02))] border border-white/5 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="max-w-[440px]">
              <h3 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">Unlimited Everything</h3>
              <p className="text-[15px] text-muted-foreground font-normal leading-relaxed mb-6">
                Links, themes, analytics, inventory. We don't believe in limits—your growth shouldn't have a price tag.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary text-[13px] font-semibold gap-2 hover:gap-3 transition-all">
                Claim your free link <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              {[Link2, Zap, ShieldCheck, Lock].map((Icon, i) => (
                <div key={i} className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-xl">
                  <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-primary/40" />
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
