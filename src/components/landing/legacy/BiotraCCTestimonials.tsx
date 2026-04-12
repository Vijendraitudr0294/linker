import { MessageSquareQuote } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_TESTIMONIALS = [
  {
    text: "THE ONLY SITE THAT LETS ME OWN MY STUFF. NO FEES. NO LIMITS.",
    author: "@ALEX_TECH",
    color: "bg-white"
  },
  {
    text: "DESIGN STUDIO LET ME BUILD MY BRAND EXACTLY HOW I WANTED. TOTAL FREEDOM.",
    author: "@SARAH_ART",
    color: "bg-[#4ADE80]"
  },
  {
    text: "QR CODES ARE AMAZING FOR MY SHOP. THEY WORK PERFECTLY EVERY TIME.",
    author: "@CODE_RUNNER",
    color: "bg-[#FBCFE8]"
  },
  {
    text: "DIRECT SALES WITH NO MIDDLEMEN. THIS IS HOW THE INTERNET SHOULD BE.",
    author: "@CRYPTO_KING",
    color: "bg-[#FDE047]"
  },
  {
    text: "OWNING MY DATA IS EVERYTHING. BIOTRA IS THE BEST. I AM SECURE.",
    author: "@MINY_SOUL",
    color: "bg-white"
  }
];

const BiotraCCTestimonials = () => {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        if (data && data.length > 0) {
          // Map to match the expected format
          const formatted = data.map(t => ({
            text: t.content || t.text,
            author: t.author_handle || t.author || "@USER",
            color: t.card_color || "bg-white"
          }));
          setTestimonials(formatted);
        }
      } catch (e) {
        console.log("No testimonials table found, using fallbacks");
      }
    };
    fetchTestimonials();
  }, []);
  return (
    <section id="users" className="py-40 bg-[#FDE047] border-b-8 border-black font-sans hidden md:block">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="flex flex-col items-center justify-center mb-24 text-center"
        >
           <div className="inline-block bg-[#4ADE80] border-8 border-black px-8 py-2 shadow-[12px_12px_0_0_rgba(0,0,0,1)] z-10 -mb-4 hover:-translate-y-1 hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-transform">
              <h2 className="text-7xl font-[1000] tracking-tighter uppercase text-black">VOICES</h2>
           </div>
           <h2 className="text-7xl font-[1000] tracking-tighter uppercase text-black">FROM THE VOID.</h2>
           
           <p className="mt-8 text-[11px] font-[1000] tracking-[0.3em] uppercase text-black/40">
             REAL PAGES ONLINE NOW.
           </p>
        </motion.div>

        {/* Cards */}
        <div className="flex justify-center gap-6 overflow-x-auto pb-12 pt-4 px-4 snap-x">
          {testimonials.map((t, index) => (
            <motion.div 
               key={index} 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
               className={`shrink-0 w-[280px] h-[360px] ${t.color} border-[6px] border-black rounded-[32px] p-8 flex flex-col shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[20px_20px_0_0_rgba(0,0,0,1)] transition-transform snap-center cursor-pointer`}
            >
               {/* 5 Stars using asterisks to match UI exactly */}
               <div className="flex gap-2 text-xl font-black mb-6">
                 * * * * *
               </div>

               {/* Quote icon (empty outline box shape used in screenshot, fallback to Lucide) */}
               <MessageSquareQuote className="w-6 h-6 text-black/10 mb-4 shrink-0" />

               {/* Testimonial Text */}
               <p className="font-[1000] text-[11px] uppercase tracking-widest text-black/80 leading-[1.8] flex-1">
                 "{t.text}"
               </p>

               {/* Author */}
               <div className="flex items-center gap-4 mt-auto">
                 <div className="w-8 h-8 bg-black rounded-full shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]" />
                 <span className="font-[1000] text-[9px] tracking-[0.2em] uppercase text-black">
                    {t.author}
                 </span>
               </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BiotraCCTestimonials;
