import { Link } from "react-router-dom";
import { Check, Zap, Sparkles } from "lucide-react";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const plans = [
  {
    name: "FREE",
    price: "$0",
    period: "FOREVER",
    tagline: "PERFECT FOR BASELINE DIGITAL IDENTITY.",
    features: [
      "Basic profile builder",
      "60+ visual layouts",
      "Contact forms",
      "Standard analytics",
      "QR code generation",
    ],
    buttonText: "GET STARTED FREE",
    theme: "light",
    badge: { text: "STABLE v1.2", color: "bg-black text-white" },
  },
  {
    name: "STAGE",
    price: "$12",
    period: "PER MONTH",
    tagline: "ADVANCED TOOLS FOR ELITE DIGITAL INFLUENCE.",
    features: [
      "Everything in Free",
      "Advanced graph metrics",
      "Custom domain setup",
      "White-label profiles",
      "Priority support",
    ],
    buttonText: "UPGRADE TO STAGE →",
    theme: "dark",
    badge: { text: "MOST POPULAR", color: "bg-[#FDE047] text-black" },
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FDE047] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <Zap className="w-3 h-3 fill-black" /> COMMISSION-FREE ALWAYS
            </span>
            <h1 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85]">
              UPGRADE YOUR<br />DIGITAL OS.
            </h1>
            <p className="text-black/60 font-black tracking-[0.25em] uppercase text-sm max-w-xl mx-auto flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              NO LIMITS. NO RESTRICTIONS. JUST PURE OWNERSHIP.
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-10 border-8 border-black rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-all space-y-8 ${
                  plan.theme === "dark" ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter uppercase">{plan.name}</h2>
                    <p className={`text-[9px] font-black tracking-[0.4em] uppercase mt-1 ${plan.theme === "dark" ? "text-white/30" : "text-black/30"}`}>{plan.tagline}</p>
                  </div>
                  <span className={`px-3 py-1 border-2 border-black rounded-full text-[9px] font-black uppercase tracking-widest ${plan.badge.color} shadow-[3px_3px_0_0_rgba(0,0,0,0.3)]`}>
                    {plan.badge.text}
                  </span>
                </div>

                <div>
                  <p className="text-7xl font-black tracking-tighter">{plan.price}</p>
                  <p className={`text-[9px] font-black tracking-widest uppercase mt-1 ${plan.theme === "dark" ? "text-white/30" : "text-black/30"}`}>{plan.period}</p>
                </div>

                <div className={`h-0.5 w-full ${plan.theme === "dark" ? "bg-white/10" : "bg-black/10"}`} />

                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4">
                      <div className={`w-8 h-8 border-2 border-black rounded-lg flex items-center justify-center shrink-0 ${plan.theme === "dark" ? "bg-[#22C55E]" : "bg-[#FBCFE8]"}`}>
                        <Check className="w-4 h-4 text-black stroke-[3px]" />
                      </div>
                      <span className="font-black text-sm uppercase tracking-wide">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full h-16 border-4 border-black rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center ${
                    plan.theme === "dark"
                      ? "bg-[#22C55E] text-black hover:bg-[#16A34A]"
                      : "bg-black text-white"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center bg-black text-white p-6 rounded-3xl mx-6 md:mx-12 lg:mx-0 lg:w-80 lg:shrink-0 transform lg:translate-x-10 shadow-[8px_8px_0_0_#22C55E] border-4 border-black relative z-20 hover:scale-105 transition-transform duration-300">
            <Zap className="w-10 h-10 mx-auto text-[#FDE047] mb-3 animate-pulse" />
            <p className="font-black text-lg tracking-widest leading-relaxed">
              ALL PLANS INCLUDE UNLIMITED LINK PLACEMENTS AND TRAFFIC.
            </p>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default PricingPage;
