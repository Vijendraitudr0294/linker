import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Palette, BarChart3, Zap, MessageCircle, Image, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const FALLBACK_UPDATES = [
  {
    version: "2.4.0",
    date: "Mar 5, 2026",
    icon: Sparkles,
    color: "bg-[#FBCFE8]",
    title: "AI CHATBOT & QUICK REPLIES",
    changes: [
      "ADDED AI-POWERED CHATBOT ON LANDING PAGE WITH STREAMING RESPONSES",
      "QUICK REPLY SUGGESTION BUTTONS FOR COMMON QUESTIONS",
      "IMPROVED TYPING INDICATOR ANIMATION",
    ],
  },
  {
    version: "2.3.0",
    date: "Mar 1, 2026",
    icon: Palette,
    color: "bg-[#FDE047]",
    title: "NEON BRUTALISM REDESIGN",
    changes: [
      "COMPLETE PLATFORM REDESIGN WITH BRUTALIST EFFECTS AND THICK BORDERS",
      "PHYSICAL HOVER ANIMATIONS FOR ALL INTERACTIVE ELEMENTS",
      "HIGH-CONTRAST NEON COLOR PALETTE",
    ],
  },
  {
    version: "2.2.0",
    date: "Feb 20, 2026",
    icon: ShoppingBag,
    color: "bg-[#22C55E]",
    title: "CATALOG & INVENTORY",
    changes: [
      "PRODUCT VARIANT SUPPORT (SIZE, COLOR, ETC.)",
      "AUTOMATIC INVENTORY TRACKING WITH STOCK DECREMENT",
      "LOW-STOCK EMAIL ALERTS AT THRESHOLD OF 5 ITEMS",
    ],
  },
  {
    version: "2.1.0",
    date: "Feb 10, 2026",
    icon: BarChart3,
    color: "bg-[#CCFBF1]",
    title: "ADVANCED ANALYTICS",
    changes: [
      "REAL-TIME ANALYTICS CHARTS WITH RECHARTS",
      "DATE RANGE FILTERING FOR ALL ANALYTICS",
      "CATALOG ITEM VIEW AND CLICK TRACKING",
    ],
  },
  {
    version: "2.0.0",
    date: "Jan 28, 2026",
    icon: Image,
    color: "bg-[#E9D5FF]",
    title: "THEME ENGINE",
    changes: [
      "GENERATE CUSTOM BACKGROUNDS OR USE FALLBACK PRESETS",
      "ANIMATED GRADIENT PRESETS AND SOLID COLORS",
      "HIGH-FIDELITY BORDER AND SHAPE CONTROLS FOR USER PROFILES",
    ],
  }
];

const Changelog = () => {
  const [updates, setUpdates] = useState(FALLBACK_UPDATES);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const { data, error } = await supabase
          .from("changelog_entries")
          .select("*")
          .eq("published", true)
          .order("release_date", { ascending: false });
          
        if (error) throw error;
        if (data && data.length > 0) {
          const formatted = data.map(entry => ({
            version: entry.version || "1.0.0",
            date: new Date(entry.release_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
            icon: Star, // Fallback icon
            color: entry.color_code || "bg-[#FBCFE8]",
            title: entry.title,
            changes: Array.isArray(entry.changes) ? entry.changes : []
          }));
          setUpdates(formatted);
        }
      } catch (e) {
        console.log("No changelog table found, using fallbacks");
      }
    };
    fetchChangelog();
  }, []);

  return (
  <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
    <BiotraCCNavbar />

    <main className="pt-36 pb-24 px-6 box-border">
      <div className="max-w-4xl mx-auto">
        <div className="mb-20">
          <span className="inline-block px-4 py-2 bg-[#22C55E] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6">
            PLATFORM UPDATES
          </span>
          <h1 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85]">
            CHANGELOG.
          </h1>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-2 before:bg-black before:rounded-full">
          {updates.map((update, i) => (
            <motion.div
              key={update.version}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Icon Marker */}
              <div className={`flex items-center justify-center w-20 h-20 rounded-full border-8 border-black ${update.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-10 mx-auto absolute left-0 md:left-1/2 -ml-10 md:ml-0 group-hover:scale-110 transition-transform`}>
                <update.icon className="w-8 h-8 text-black" />
              </div>

              {/* Card */}
              <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] p-8 rounded-[32px] border-8 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all ml-auto md:ml-0">
                 <div className="flex flex-wrap gap-3 mb-6 items-center">
                    <span className="px-4 py-1 border-4 border-black rounded-xl text-xs font-black uppercase tracking-widest bg-black text-white">
                      v{update.version}
                    </span>
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">{update.date}</span>
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-6">{update.title}</h3>
                 <ul className="space-y-3">
                    {update.changes.map((change, idx) => (
                      <li key={idx} className="flex gap-4 items-start">
                         <span className="w-2 h-2 rounded-full bg-[#22C55E] mt-2 shrink-0 border border-black" />
                         <span className="text-xs font-bold text-black/60 uppercase tracking-widest leading-relaxed">{change}</span>
                      </li>
                    ))}
                 </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>

    <BiotraCCFooter />
  </div>
  );
};

export default Changelog;
