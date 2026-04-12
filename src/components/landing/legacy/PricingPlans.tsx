import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "FREE",
    price: "$0",
    tagline: "PERFECT FOR BASELINE DIGITAL IDENTITY.",
    features: [
      "Basic profile builder",
      "60+ visual layouts",
      "Contact forms",
      "Standard analytics"
    ],
    buttonText: "INITIALIZE FREE",
    theme: "light"
  },
  {
    name: "STAGE",
    price: "$12/MO",
    tagline: "ADVANCED TOOLS FOR ELITE DIGITAL INFLUENCE.",
    features: [
      "Everything in Free",
      "Advanced graph metrics",
      "Custom domain setup",
      "White-label profiles"
    ],
    buttonText: "UPGRADE STAGE ->",
    theme: "dark"
  }
];

const PricingPlans = () => {
  return (
    <div id="pricing" className="py-32 bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase mb-20 text-center">
          UPGRADE YOUR <br /> DIGITAL OS.
        </h2>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className={`p-12 border-8 border-black rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 ${
                plan.theme === "dark" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black tracking-tighter uppercase">{plan.name}</h3>
                  <span className={`px-4 py-1 border-4 border-black font-black text-xs rounded-full ${
                    plan.theme === "dark" ? "bg-[#FDE047] text-black" : "bg-black text-white"
                  }`}>
                    STABLE v1.2
                  </span>
                </div>
                
                <div className="space-y-1">
                   <p className="text-6xl font-black tracking-tighter">{plan.price}</p>
                   <p className={`text-[10px] font-black tracking-widest uppercase ${
                     plan.theme === "dark" ? "text-white/40" : "text-black/40"
                   }`}>
                     {plan.tagline}
                   </p>
                </div>

                <div className="h-0.5 w-full bg-current opacity-10" />

                <ul className="space-y-4 pt-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4">
                      <div className={`w-8 h-8 border-4 border-black rounded-lg flex items-center justify-center shrink-0 ${
                        plan.theme === "dark" ? "bg-[#22C55E]" : "bg-[#FBCFE8]"
                      }`}>
                        <Check className="w-5 h-5 text-black stroke-[4px]" />
                      </div>
                      <span className="font-black text-sm uppercase tracking-wide">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full h-20 border-4 border-black rounded-2xl font-black text-lg tracking-widest uppercase transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none mt-10 ${
                    plan.theme === "dark" 
                      ? "bg-[#22C55E] text-black hover:bg-[#16A34A]" 
                      : "bg-black text-white hover:bg-black/90"
                  }`}
                >
                  <Link to="/auth">{plan.buttonText}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
