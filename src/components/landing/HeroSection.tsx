import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  MousePointerClick,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import heroCreator from "@/assets/landing_page_hero.png";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [username, setUsername] = useState("");
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroScrollY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    window.location.href = `/register?username=${username}`;
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-20 lg:py-32"
    >
      {/* Refined Background System */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(250,168,25,0.05),transparent_50%)]" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="container relative z-10 max-w-[1200px]">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center">
          {/* Value Proposition Column */}
          <div className="flex w-full flex-1 flex-col text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center lg:justify-start"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase">
                <Zap className="h-3 w-3 fill-primary" />
                Version 2.0 is now live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mx-auto max-w-[14ch] text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[48px] lg:mx-0 lg:text-[56px] xl:text-[64px] text-foreground"
            >
              The last link you'll ever <span className="text-secondary italic">need.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-6 max-w-[540px] text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 font-normal"
            >
              Build a premium, conversion-optimized home base for your personal brand. 
              Beautiful profiles, integrated marketplace, and deep analytics. <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-4">100% Free. Forever.</span>
            </motion.p>

            <motion.form
              onSubmit={handleClaim}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex w-full max-w-[480px] flex-col gap-3 sm:flex-row mx-auto lg:mx-0"
            >
              <div className="relative flex flex-1 items-center rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <span className="pl-4 text-sm font-medium text-muted-foreground hidden sm:block">biotra.com/</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-foreground placeholder-muted-foreground/40 focus:outline-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="hidden rounded-lg bg-primary font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-primary/20 sm:flex"
                >
                  Get started
                </Button>
              </div>
              <Button
                type="submit"
                className="flex rounded-xl bg-primary py-6 text-sm font-bold text-white shadow-xl sm:hidden"
              >
                Claim Free Account
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-muted-foreground/60 lg:justify-start"
            >
              {[
                { icon: ShieldCheck, text: "No credit card" },
                { icon: Zap, text: "Instant setup" },
                { icon: MousePointerClick, text: "Unlimited links" }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary/40" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-12 flex flex-col items-center lg:items-start gap-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/60?img=${i+10}`} 
                    className="w-8 h-8 rounded-full border-2 border-background ring-2 ring-primary/5"
                    alt="avatar"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-white">
                  +50k
                </div>
              </div>
              <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-secondary" />
                Join <span className="text-foreground font-semibold">50,000+ creators</span> worldwide.
              </p>
            </motion.div>
          </div>

          {/* Visual Column - Minimal Mac-style mockup */}
          <motion.div
            style={{ y: heroScrollY }}
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full max-w-[520px] lg:w-[500px] xl:w-[600px] flex-none"
          >
            {/* Subtle Gradient Glow behind mockup */}
            <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full opacity-50" />
            
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
              <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#0D0D0E]">
                {/* Header Mockup */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="text-[10px] font-bold text-white/20 tracking-widest uppercase">biotra.com/alex</div>
                  <div className="w-4 h-4 rounded-full bg-white/10" />
                </div>

                <div className="relative aspect-[16/10] overflow-hidden grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-700">
                  <img
                    src={heroCreator}
                    alt="Premium creator interface"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              </div>

              {/* Float Cards - Stripe style */}
              <div className="absolute -right-6 top-1/4 rounded-xl border border-white/10 bg-background/90 p-4 shadow-2xl backdrop-blur-3xl hidden xl:block animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary fill-primary/20" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Viral Reach</div>
                    <div className="text-[10px] text-emerald-400 font-bold">+24% this week</div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-10 bottom-1/4 rounded-xl border border-white/10 bg-background/90 p-4 shadow-2xl backdrop-blur-3xl hidden xl:block animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-secondary fill-secondary/20" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Conversions</div>
                    <div className="text-[10px] text-muted-foreground font-medium">1,204 sales</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
