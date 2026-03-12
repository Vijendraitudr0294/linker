import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Check,
  Instagram,
  Music2,
  Sparkles,
  TrendingUp,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroCreator from "@/assets/hero-global-creative.png";

const floatingIcons = [
  {
    icon: Instagram,
    className:
      "absolute left-2 top-16 rounded-[1.2rem] border border-white/10 bg-black/40 p-3 text-pink-400 shadow-2xl backdrop-blur-md md:-left-6 md:top-20",
    animate: { y: [0, -10, 0], rotate: [0, 4, 0] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
  },
  {
    icon: Youtube,
    className:
      "absolute -right-1 top-28 rounded-[1.2rem] border border-white/10 bg-black/40 p-3 text-red-400 shadow-2xl backdrop-blur-md md:-right-6 md:top-36",
    animate: { y: [0, 14, 0], rotate: [0, -5, 0] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
  },
  {
    icon: Music2,
    className:
      "absolute left-10 top-2 rounded-[1rem] border border-white/10 bg-black/40 p-2.5 text-cyan-300 shadow-2xl backdrop-blur-md md:left-16",
    animate: { x: [0, 8, 0], scale: [1, 1.06, 1] },
    transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" as const },
  },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -260]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background pb-8 pt-20 sm:pb-10 sm:pt-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,132,34,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%)]" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <motion.div
        style={{ y: orbY1 }}
        className="glow-orb glow-orb-primary -left-24 top-0 h-[24rem] w-[24rem] sm:h-[34rem] sm:w-[34rem]"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="glow-orb glow-orb-accent -right-16 top-1/4 h-[20rem] w-[20rem] sm:h-[30rem] sm:w-[30rem]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1760px] px-5 sm:px-6">
        <div className="rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_40%,rgba(255,132,34,0.12)_100%)] p-5 shadow-[0_40px_120px_-70px_rgba(255,132,34,0.55)] backdrop-blur-xl sm:rounded-[2.4rem] sm:p-6 lg:p-7 xl:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center xl:gap-12">
            <div className="mx-auto flex w-full max-w-[44rem] min-w-0 flex-1 flex-col justify-center text-center lg:mx-0 lg:min-h-[30rem] lg:max-w-none lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary sm:px-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free forever for creators
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="text-balance text-[3.2rem] font-black leading-[0.9] tracking-[-0.07em] sm:text-[4.6rem] lg:max-w-[10ch] lg:text-[5.3rem] xl:text-[6rem]"
              >
                One page for
                <span className="block text-gradient">every link, offer, and update.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="mx-auto mt-6 max-w-[34rem] text-base leading-8 text-muted-foreground sm:text-[1.35rem] lg:mx-0"
              >
                Build a link-in-bio page that looks branded from the first click. Share your
                content, bookings, products, and socials in one polished home base.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.28 }}
                className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center lg:justify-start"
              >
                <div className="flex w-full max-w-[33rem] items-center rounded-[1.7rem] border border-border/70 bg-background/95 p-1.5 shadow-[0_24px_80px_-30px_rgba(255,138,61,0.45)]">
                  <input
                    type="text"
                    placeholder="linkvertex.com/yourname"
                    className="h-12 min-w-0 flex-1 bg-transparent px-5 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none sm:h-14 sm:text-base"
                  />
                  <Link to="/register" className="shrink-0">
                    <Button
                      size="lg"
                      className="h-11 rounded-[1.2rem] px-5 text-sm font-black sm:h-12 sm:px-8 sm:text-base"
                    >
                      Claim yours
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <a href="#pricing" className="sm:self-stretch">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-[1.2rem] border-border/70 bg-background/45 px-6 text-sm font-bold text-foreground hover:bg-background/70 sm:h-14 sm:w-auto"
                  >
                    See what is included
                  </Button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.36 }}
                className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start"
              >
                {["No credit card", "Instant setup", "Custom themes"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>

            </div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-[34rem] sm:max-w-[38rem] lg:ml-auto lg:mr-0 lg:w-[34rem] lg:flex-none xl:w-[38rem]"
            >
              <div className="absolute inset-x-12 top-8 h-40 rounded-full bg-primary/20 blur-3xl" />

              {floatingIcons.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    className={item.className}
                    animate={item.animate}
                    transition={item.transition}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                );
              })}

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-3 shadow-[0_40px_120px_-50px_rgba(255,136,61,0.55)] backdrop-blur-md sm:rounded-[2.75rem] sm:p-4"
              >
                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/8 bg-[#120d0b] sm:rounded-[2.2rem]">
                  <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white/75">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Live creator page
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                      Online
                    </span>
                  </div>

                  <img
                    src={heroCreator}
                    alt="LinkVertex creator page preview"
                    className="h-auto w-full"
                    loading="eager"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 sm:p-6">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-[0.95rem] border border-white/10 bg-white/10 p-2.5 sm:p-3 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Weekly clicks
                        </div>
                        <div className="mt-1 text-[1.8rem] sm:text-[1.9rem] font-black tracking-tight text-white">18.4K</div>
                        <div className="mt-0.5 text-[11px] sm:text-xs text-emerald-300">Up 24 percent this week</div>
                      </div>

                      <div className="rounded-[1.2rem] border border-white/10 bg-white/10 p-2.5 sm:p-3 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                          <Sparkles className="h-4 w-4 text-amber-300" />
                          Active blocks
                        </div>
                        <div className="mt-1.5 space-y-1 text-[11px] sm:text-xs font-semibold text-white/90">
                          <div className="flex items-center justify-between">
                            <span>Shop</span>
                            <span>Live</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Bookings</span>
                            <span>Live</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Media kit</span>
                            <span>Live</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
