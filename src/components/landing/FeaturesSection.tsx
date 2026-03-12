import { motion, useScroll, useTransform } from "framer-motion";
import { Palette, BarChart3, Sparkles, Link2, Zap, ShieldCheck, ShoppingBag, MessageCircle } from "lucide-react";
import analyticsPreview from "@/assets/analytics-preview.jpg";
import categoriesImg from "@/assets/categories-illustration.jpg";

const features = [
  { icon: Link2, title: "Unlimited Links", description: "Add as many links as you want. Social media, websites, portfolios — all in one place." },
  { icon: Palette, title: "60+ Themes", description: "Modern, neon, gradient, minimal — find your vibe and make it yours." },
  { icon: ShoppingBag, title: "Built-in Shop", description: "Sell products, take orders, manage inventory. Your mini-store, zero setup fees." },
  { icon: BarChart3, title: "Real Analytics", description: "Track views, clicks, and conversions. Know what's working with beautiful charts." },
  { icon: Sparkles, title: "AI-Powered", description: "AI generates your bio, picks your theme, and orders your links for max engagement." },
  { icon: MessageCircle, title: "Contact Form", description: "Let visitors message you directly. Get notified instantly. No third-party tools." },
  { icon: Zap, title: "Lightning Fast", description: "Sub-second load times globally. Speed = more conversions. Period." },
  { icon: ShieldCheck, title: "Private & Secure", description: "Your data stays yours. GDPR compliant. Enterprise-grade security." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="glow-orb glow-orb-primary w-[400px] h-[400px] top-40 -right-40 sm:-right-80 opacity-20" />
      <div className="glow-orb glow-orb-gold w-[300px] h-[300px] bottom-60 -left-60 sm:-left-60 opacity-15" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">
            Everything Unlimited 🔥
          </span>
          <h2 className="text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-8xl font-heading font-black mb-6 px-4 tracking-tighter">
            The full toolkit.<br />
            <span className="text-gradient">Zero paywalls.</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-6 font-medium leading-relaxed">
            Stop paying $15/mo for basic features. We give you
            everything Linktree Pro does, but <span className="text-foreground font-bold">actually free.</span>
          </p>
        </motion.div>

        {/* Dynamic Bento-Lite Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative p-8 rounded-[2rem] glass card-hover overflow-hidden border border-white/5 hover:border-primary/40 flex flex-col items-center text-center sm:items-start sm:text-left"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              {/* Inner Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="relative text-xl sm:text-2xl font-heading font-black mb-3 text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="relative text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Analytics Showcase - High Impact */}
        <motion.div
          className="mt-20 sm:mt-24 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden glass border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] group">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="p-8 sm:p-16 flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <span className="text-xs sm:text-sm font-black text-accent uppercase tracking-[0.3em] mb-4 block">Big Brain Mode 🧠</span>
                <h3 className="text-[2rem] sm:text-5xl lg:text-6xl font-heading font-black text-foreground mb-6 leading-[1.05] tracking-tight">
                  Analytics that <span className="text-gradient">hit different.</span>
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground font-medium mb-8 leading-relaxed px-4 lg:px-0">
                  See where your traffic hits, which links are 🔥, and where you're losing views. Real-time data, not delayed reports.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {["Live Tracking", "Referral Source", "Click Maps"].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-xl glass-strong text-xs sm:text-sm font-bold border border-white/10">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 relative group-hover:scale-[1.03] transition-transform duration-1000 ease-out">
                <div className="absolute -inset-10 bg-primary/20 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity" />
                <img
                  src={analyticsPreview}
                  alt="Analytics dashboard"
                  className="relative rounded-2xl sm:rounded-3xl shadow-2xl border border-white/5"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
