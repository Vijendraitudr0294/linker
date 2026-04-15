import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const DEFAULT_FAQS = [
  {
    question: "WHAT DOES OWNING MY PAGE MEAN?",
    answer: "YOU HAVE TOTAL CONTROL OVER YOUR ONLINE PRESENCE. NO ONE CAN TAKE YOUR LINKS, FANS, OR MONEY. WE PROVIDE THE INFRASTRUCTURE, YOU PROVIDE THE VISION."
  },
  {
    question: "IS THIS REALLY FREE?",
    answer: "YES. YOU CAN BUILD A PREMIUM BRUTALIST PROFILE, CONNECT ALL YOUR LINKS, AND USE OUR ANALYTICS WITHOUT PAYING ANY MONTHLY SUBSCRIPTION."
  }
];

const BiotraCCFAQ = () => {
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data, error } = await supabase
          .from("faq_items" as any)
          .select("question, answer")
          .eq("published", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs(DEFAULT_FAQS);
        }
      } catch {
        setFaqs(DEFAULT_FAQS);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);
  return (
    <div id="faq" className="py-32 bg-white border-b-8 border-black">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase mb-16 text-center">
          QUESTIONS & <br /> ANSWERS.
        </h2>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-black" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 text-center">Deciphering Protocols...</p>
             </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-4 border-black rounded-3xl px-8 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] data-[state=open]:shadow-none data-[state=open]:translate-x-1 data-[state=open]:translate-y-1 transition-all"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <span className="text-xl font-black text-left uppercase tracking-tight">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                  <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BiotraCCFAQ;
