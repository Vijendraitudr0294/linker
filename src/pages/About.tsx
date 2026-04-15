import { motion } from "framer-motion";
import { Heart, Zap, Shield, Sparkles } from "lucide-react";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

const pillars = [
  { icon: Shield, title: "DATA AUTONOMY", desc: "YOU OWN EVERY CLICK, VIEWER THRESHOLD, AND CATALOG ITEM DIRECTLY.", color: "bg-[#FBCFE8]" },
  { icon: Sparkles, title: "VISUAL RIGOR", desc: "NO GENERIC TEMPLATES. CHOOSE HIGH-FIDELITY DESIGNS TO ELEVATE YOUR BRAND.", color: "bg-[#FDE047]" },
  { icon: Zap, title: "INFINITE SPEED", desc: "BUILT WITH FRAME LAYERS THAT GUARANTEE SUB-100MS CONTENT SERVING.", color: "bg-[#22C55E]" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <LandingNav />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="border-b-8 border-black pb-20 mb-20">
            <span className="inline-block px-4 py-2 bg-[#22C55E] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-8">
              OUR STORY
            </span>
            <h1 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85] mb-8">
              WE BUILD FOR<br />THE INDEPENDENT.
            </h1>
            <p className="text-sm font-black uppercase tracking-widest text-black/40 max-w-lg leading-relaxed">
              BIOTRA WAS CREATED TO GIVE CREATORS ABSOLUTE OWNERSHIP OVER THEIR IDENTITY, CONTENT, AND REVENUE STREAMS WITH ZERO FRICTION.
            </p>
          </div>

          {/* Mission / Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {[
              { icon: Heart, title: "OUR MISSION", desc: "TO DEMOCRATIZE CREATOR MONETIZATION BY UNIFYING TOOLS DIRECTLY. WE REMOVE MIDDLEMAN ALGORITHMS SO CREATORS CAN CONNECT TRANSPARENTLY.", color: "bg-[#FBCFE8]" },
              { icon: Zap, title: "OUR VISION", desc: "A DIGITAL ECOSYSTEM WITHOUT PAYWALLS OR RESTRICTIVE BORDERS. YOUR PROFILE REPRESENTS YOUR BASE OF OPERATIONS, BUILT FOR ABSOLUTE GLOBAL REACH.", color: "bg-[#CCFBF1]" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${card.color} border-8 border-black rounded-[40px] p-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all`}
              >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-4">{card.title}</h2>
                <p className="font-bold text-black/60 uppercase tracking-widest text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Pillars */}
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-black mb-12 text-center">WHY WE'RE HERE.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${pillar.color} border-4 border-black rounded-3xl p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-black mb-3">{pillar.title}</h3>
                <p className="font-bold text-black/60 uppercase tracking-widest text-xs leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default About;
