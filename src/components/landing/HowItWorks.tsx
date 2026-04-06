import { motion } from "framer-motion";
import { UserPlus, Layers, Share2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Claim your name",
    description:
      "Secure your unique link in seconds. No credit card, no gatekeeping—just your brand.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Stack your links",
    description:
      "Drag and drop content, shop items, and videos. Customize the layout to fit your aesthetic.",
    icon: Layers,
  },
  {
    number: "03",
    title: "Share and scale",
    description:
      "Launch your page everywhere. Track real-time views and convert fans into customers.",
    icon: Share2,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 relative overflow-hidden bg-background">
      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        
        <motion.div
          className="max-w-[800px] mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase mb-6">
            Simplified Workflow
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-foreground mb-6 tracking-tight leading-tight">
            Zero to <span className="text-secondary italic">Live</span> in 60 seconds.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-[540px]">
            Seriously. We timed it. No complex dashboards, no headache—just your brand, your way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="mb-8 relative inline-flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="absolute -top-3 -right-3 text-[12px] font-bold text-muted-foreground opacity-30 select-none">
                  {step.number}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4 tracking-tight group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-[15px] text-muted-foreground font-normal leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 lg:mt-24 pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
              ))}
            </div>
            <p className="text-[13px] font-medium text-muted-foreground">
              Loved by <span className="text-foreground">50k+ creators</span> worldwide.
            </p>
          </div>
          
          <Link to="/register">
            <Button className="h-12 px-8 text-sm font-semibold rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2 group">
              Get started now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
