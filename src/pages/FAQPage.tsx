import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DEFAULT_FAQS = [
  { q: "IS BIOTRA REALLY FREE?", a: "YES. THE FREE PLAN IS PERMANENTLY FREE WITH NO CREDIT CARD REQUIRED. ALL CORE FEATURES ARE AVAILABLE WITHOUT PAYING A SINGLE DOLLAR." },
  { q: "IS THIS REALLY FREE?", a: "YES. YOU CAN BUILD YOUR PROFILE AND USE OUR TOOLS WITHOUT ANY MONTHLY SUBSCRIPTIONS OR HIDDEN UPCHARGES." },
  { q: "CAN I USE MY OWN DOMAIN?", a: "YES — ON THE STAGE PLAN. CONNECT ANY CUSTOM DOMAIN TO YOUR BIOTRA PROFILE FOR FULL WHITE-LABEL BRANDING." },
];

const FAQPage = () => {
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);
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
          setFaqs(data.map((f: any) => ({ q: f.question, a: f.answer })));
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
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <main className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 space-y-4">
            <span className="inline-block px-4 py-2 bg-[#CCFBF1] border-4 border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              QUESTIONS & ANSWERS
            </span>
            <h1 className="text-[72px] md:text-[120px] font-black tracking-tighter text-black uppercase leading-[0.85]">
              FAQ.
            </h1>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Fetching Knowledge Matrix...</p>
             </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-4 border-black rounded-3xl px-8 py-2 bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] data-[state=open]:shadow-none data-[state=open]:translate-x-1 data-[state=open]:translate-y-1 transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-6">
                    <span className="text-base font-black uppercase tracking-tight text-left">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="font-bold text-black/50 uppercase tracking-widest leading-relaxed text-sm">{faq.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default FAQPage;
