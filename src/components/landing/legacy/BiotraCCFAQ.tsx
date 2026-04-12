import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "WHAT DOES OWNING MY PAGE MEAN?",
    answer: "YOU HAVE TOTAL CONTROL OVER YOUR ONLINE PRESENCE. NO ONE CAN TAKE YOUR LINKS, FANS, OR MONEY. WE PROVIDE THE INFRASTRUCTURE, YOU PROVIDE THE VISION."
  },
  {
    question: "IS THIS REALLY FREE?",
    answer: "YES. YOU CAN BUILD A PREMIUM BRUTALIST PROFILE, CONNECT ALL YOUR LINKS, AND USE OUR ANALYTICS WITHOUT PAYING ANY MONTHLY SUBSCRIPTION."
  },
  {
    question: "CAN I MAKE IT LOOK PROFESSIONAL?",
    answer: "YES. IT'S HIGHLY CUSTOMIZABLE WITH NO CODING REQUIRED. YOU CAN ADJUST COLORS, BORDERS, FONTS, AND CARD STYLES TO MATCH YOUR BRAND IDENTITY."
  },
  {
    question: "HOW DOES AI HELP ME?",
    answer: "THE PLATFORM IS OPTIMIZED FOR DISCOVERY BY MODERN AI AGENTS AND LARGE LANGUAGE MODELS, INCREASING YOUR ORGANIC REACH BEYOND TRADITIONAL SEARCH."
  }
];

const BiotraCCFAQ = () => {
  return (
    <div id="faq" className="py-32 bg-white border-b-8 border-black">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase mb-16 text-center">
          QUESTIONS & <br /> ANSWERS.
        </h2>

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
      </div>
    </div>
  );
};

export default BiotraCCFAQ;
