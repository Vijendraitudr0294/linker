import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const featureGroups = [
  ["Unlimited links", "Built-in marketplace", "Real-time analytics", "AI bio writer"],
  ["60+ premium themes", "Order management", "Contact form", "Custom backgrounds"],
  ["Social media icons", "Embed videos and maps", "Inventory tracking", "Low stock alerts"],
  ["Variant support", "Custom fonts", "SEO optimized", "Mobile responsive"],
];

const valuePoints = [
  { label: "Monthly fee", value: "$0" },
  { label: "Locked features", value: "None" },
  { label: "Setup friction", value: "Low" },
];

const PricingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -120]);

  return (
    <section ref={sectionRef} id="pricing" className="relative overflow-hidden bg-background py-24 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,132,34,0.12),transparent_35%),linear-gradient(180deg,transparent,rgba(255,255,255,0.02)_45%,transparent)]" />
      <div className="absolute inset-0 bg-mesh opacity-15" />
      <motion.div
        style={{ y: orbY }}
        className="glow-orb glow-orb-primary left-1/2 top-20 h-[28rem] w-[28rem] -translate-x-1/2 opacity-40"
      />

      <div className="container relative z-10 mx-auto px-5 sm:px-6">
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Zero cost forever
          </span>
          <h2 className="mt-6 text-balance text-[2.9rem] font-black leading-[0.94] tracking-[-0.06em] sm:text-[4.3rem] lg:text-[5.6rem]">
            Everything unlocked.
            <span className="block text-gradient">Nothing held back.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl sm:leading-8">
            No pro gate. No trial countdown. No hidden upgrade path. You get the full
            LinkVertex stack from day one.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mx-auto max-w-6xl"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_40px_140px_-55px_rgba(255,132,34,0.65)] backdrop-blur-md sm:rounded-[2.8rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,153,51,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_26%)]" />

            <div className="relative grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary-foreground shadow-lg shadow-primary/25">
                  Unlocked for everyone
                </div>

                <div className="mt-8 flex items-end gap-3">
                  <span className="text-[5rem] font-black leading-none tracking-[-0.08em] text-foreground sm:text-[6.5rem]">
                    $0
                  </span>
                  <span className="pb-3 text-lg font-black uppercase tracking-[0.28em] text-muted-foreground sm:text-xl">
                    for life
                  </span>
                </div>

                <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                  Launch your page, your store, your lead capture, and your analytics without
                  paying monthly just to look professional.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {valuePoints.map((point) => (
                    <div
                      key={point.label}
                      className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-foreground/50">
                        {point.label}
                      </div>
                      <div className="mt-2 text-2xl font-black tracking-tight text-foreground">
                        {point.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-emerald-400/15 bg-emerald-400/8 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
                        No feature paywall
                      </div>
                      <p className="mt-1 text-sm leading-6 text-emerald-100/80">
                        The same tools that help you publish also help you sell and track what is working.
                      </p>
                    </div>
                  </div>
                </div>

                <Link to="/register" className="mt-8 block">
                  <Button
                    size="lg"
                    className="h-14 w-full rounded-[1.2rem] text-base font-black tracking-tight sm:h-16 sm:text-lg"
                  >
                    Start building now
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-foreground/45">
                      What you get
                    </div>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                      The full product, not a teaser.
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-foreground/80">
                    <Zap className="h-4 w-4 text-primary" />
                    Ready from signup
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  {featureGroups.map((group, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * index, duration: 0.45 }}
                      className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5"
                    >
                      <div className="mb-4 text-[11px] font-black uppercase tracking-[0.22em] text-foreground/40">
                        Set {index + 1}
                      </div>
                      <div className="space-y-3">
                        {group.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-semibold leading-6 text-foreground/90 sm:text-[15px]">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
