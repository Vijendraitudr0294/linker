import { motion } from "framer-motion";
import { UserPlus, Layers, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Claim your vibe.",
    description:
      "Secure your unique link in 10 seconds. No credit card, no gatekeeping - just your brand, your name.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Stack your links.",
    description:
      "Drag and drop links, videos, music, and products. Customize the layout to fit your creative flow perfectly.",
    icon: Layers,
  },
  {
    number: "03",
    title: "Go global.",
    description:
      "Launch your page everywhere. Track real-time views and start converting your fans into customers.",
    icon: Share2,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,26,0.08),transparent_60%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">
            The Speed Run
          </span>
          <h2 className="text-[2.75rem] leading-[1] sm:text-6xl lg:text-7xl font-heading font-black mb-6 px-4 tracking-tighter">
            Zero to <span className="text-gradient">Live</span>
            <br />
            in 60 seconds.
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto px-6 font-medium leading-relaxed">
            Seriously. We timed it. No complex dashboards, no headache.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto relative">
          <div className="absolute left-1/2 top-6 bottom-6 w-[4px] rounded-full hidden sm:block -translate-x-1/2 bg-gradient-to-b from-primary via-primary/60 to-primary/20 overflow-hidden">
            <motion.div
              className="w-full h-1/3 bg-white/40"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="space-y-14 sm:space-y-24">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className={`flex flex-col ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} items-center gap-8 sm:gap-20`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <div className="w-full sm:w-1/2 flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-4 rounded-[2rem] bg-primary/15 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-[2rem] border border-[#f1dcc6] bg-gradient-to-br from-[#f2e6d8] to-[#ebdfd2] dark:from-[#2a211b] dark:to-[#201915] flex items-center justify-center shadow-[0_18px_40px_-22px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform duration-500">
                      <step.icon className="w-10 h-10 sm:w-14 sm:h-14 text-primary drop-shadow-lg" />
                      <span className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-background border-2 border-primary/35 flex items-center justify-center text-xl font-black text-primary shadow-xl">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`w-full sm:w-1/2 text-center ${i % 2 === 0 ? "sm:text-left" : "sm:text-right"}`}>
                  <h3 className="text-2xl sm:text-5xl font-heading font-black mb-4 text-foreground tracking-tight leading-[1.04]">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-[1.05rem] text-muted-foreground font-medium leading-relaxed max-w-[26ch] mx-auto sm:mx-0">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/register">
            <Button size="lg" className="h-14 px-10 text-base font-black tracking-tight btn-glow rounded-full gap-3 group">
              BUILD YOUR PAGE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
