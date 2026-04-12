import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Palette, ShoppingBag, BarChart3, MessageCircle, Shield, Mail } from "lucide-react";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const helpTopics = [
  {
    icon: Link2, color: "bg-[#22C55E]",
    title: "GETTING STARTED",
    articles: [
      { q: "HOW DO I CREATE AN ACCOUNT?", a: "CLICK 'GET STARTED FREE' ON THE HOMEPAGE. ENTER YOUR EMAIL, PASSWORD, AND CHOOSE A USERNAME. YOUR PAGE GOES LIVE INSTANTLY." },
      { q: "HOW DO I ADD LINKS?", a: "GO TO DASHBOARD → LINKS. CLICK 'ADD LINK', ENTER THE TITLE AND URL, THEN DRAG TO REORDER." },
      { q: "CAN I CHANGE MY USERNAME?", a: "YES! GO TO DASHBOARD → SETTINGS AND UPDATE YOUR USERNAME. YOUR PUBLIC URL UPDATES IMMEDIATELY." },
    ],
  },
  {
    icon: Palette, color: "bg-[#FBCFE8]",
    title: "THEMES & APPEARANCE",
    articles: [
      { q: "HOW MANY THEMES ARE AVAILABLE?", a: "WE OFFER 60+ THEMES ACROSS CATEGORIES: MINIMAL, DARK, NEON, PASTEL, BUSINESS, NATURE, GRADIENT, RETRO, AND ANIMATED." },
      { q: "CAN I CUSTOMIZE COLORS?", a: "ABSOLUTELY. GO TO DASHBOARD → APPEARANCE TO CUSTOMIZE BACKGROUND, TEXT, AND BUTTON COLORS." },
    ],
  },
  {
    icon: ShoppingBag, color: "bg-[#FDE047]",
    title: "CATALOG & ORDERS",
    articles: [
      { q: "HOW DO I ADD PRODUCTS?", a: "GO TO DASHBOARD → CATALOG AND CLICK 'ADD ITEM'. FILL IN THE DETAILS, SET A PRICE, AND PUBLISH." },
      { q: "HOW DO ORDERS WORK?", a: "WHEN A VISITOR PLACES AN ORDER, YOU SEE IT IN DASHBOARD → ORDERS AND GET AN EMAIL NOTIFICATION." },
    ],
  },
  {
    icon: BarChart3, color: "bg-[#CCFBF1]",
    title: "ANALYTICS",
    articles: [
      { q: "WHAT ANALYTICS DO I GET?", a: "TRACK PAGE VIEWS, LINK CLICKS, TOP REFERRERS, VISITOR LOCATIONS, AND CATALOG ITEM VIEWS IN REAL-TIME." },
      { q: "CAN I FILTER BY DATE?", a: "YES. USE THE DATE RANGE PICKER AT THE TOP OF THE ANALYTICS PAGE TO FILTER DATA BY ANY TIME PERIOD." },
    ],
  },
  {
    icon: Shield, color: "bg-[#E9D5FF]",
    title: "ACCOUNT & SECURITY",
    articles: [
      { q: "HOW DO I RESET MY PASSWORD?", a: "CLICK 'FORGOT PASSWORD?' ON THE LOGIN PAGE. WE'LL SEND A RESET LINK TO YOUR EMAIL." },
      { q: "IS MY DATA SECURE?", a: "YES. WE USE ENTERPRISE-GRADE ENCRYPTION AND GDPR-COMPLIANT PRACTICES." },
    ],
  },
];

const HelpCenter = () => {
  const [openTopic, setOpenTopic] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <span className="inline-block px-4 py-2 bg-[#22C55E] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
              SUPPORT DOCS
            </span>
            <h1 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85]">
              HELP CENTER.
            </h1>
          </div>

          <div className="space-y-4">
            {helpTopics.map((topic, i) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all ${openTopic === i ? "shadow-none translate-x-1 translate-y-1" : ""}`}
              >
                <button
                  onClick={() => setOpenTopic(openTopic === i ? null : i)}
                  className="w-full flex items-center gap-5 p-6 bg-white text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 ${topic.color} border-2 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0_0_rgba(0,0,0,1)]`}>
                    <topic.icon className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-base uppercase tracking-widest text-black">{topic.title}</h3>
                    <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">{topic.articles.length} ARTICLES</p>
                  </div>
                  <span className="text-2xl font-black text-black/40">{openTopic === i ? "−" : "+"}</span>
                </button>
                {openTopic === i && (
                  <div className="border-t-4 border-black divide-y-2 divide-black/10 bg-[#F3F4F6] px-6 py-4 space-y-4">
                    {topic.articles.map((article) => (
                      <div key={article.q} className="pt-4 first:pt-0">
                        <h4 className="font-black text-sm uppercase tracking-wide text-black mb-2">{article.q}</h4>
                        <p className="font-bold text-black/50 text-sm uppercase tracking-widest leading-relaxed">{article.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Still need help */}
          <div className="mt-16 bg-black border-4 border-black rounded-[40px] p-12 text-center shadow-[12px_12px_0_0_rgba(34,197,94,1)]">
            <Mail className="w-12 h-12 text-[#22C55E] mx-auto mb-6" />
            <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-4">STILL NEED HELP?</h3>
            <p className="text-sm font-black uppercase tracking-widest text-white/40 mb-8">EMAIL US — WE TYPICALLY RESPOND WITHIN 24 HOURS.</p>
            <a
              href="mailto:support@biotra.ai"
              className="inline-flex items-center gap-3 h-16 px-12 bg-[#22C55E] text-black font-black uppercase tracking-widest border-4 border-white/20 rounded-2xl shadow-[6px_6px_0_0_rgba(255,255,255,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              SUPPORT@BIOTRA.AI
            </a>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default HelpCenter;
