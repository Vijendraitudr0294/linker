import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "Is BIOTRA really 100% free?", a: "Yes! Every feature is free — unlimited links, 60+ themes, analytics, built-in shop, contact forms, AI tools. No credit card required, no hidden fees, no premium paywalls." },
  { q: "What's the catch? How do you make money?", a: "We plan to offer optional premium features in the future (custom domains, white-label, etc.) but the core product will always be free. We believe everyone deserves great tools." },
  { q: "Who is BIOTRA for?", a: "Everyone! Creators, musicians, photographers, restaurants, fitness coaches, small businesses, freelancers, agencies, gamers, educators, real estate agents, event planners — if you have links, BIOTRA is for you." },
  { q: "Can I sell products on my page?", a: "Absolutely. Add products with images, variants (size, color), pricing, and inventory tracking. Customers can order directly from your page with a built-in order form." },
  { q: "How is BIOTRA different from Linktree?", a: "More themes (60+ vs ~10), built-in marketplace, real analytics, AI tools, contact forms, embed support, inventory management — and it's actually free. Not a limited free tier." },
  { q: "Can I use my own domain?", a: "Custom domain support is coming soon as a premium add-on. For now, you get a clean BIOTRA.com/yourname URL." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 mesh-gradient-premium opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="glow-orb glow-orb-gold w-[300px] h-[300px] bottom-20 -left-60 opacity-20 blur-[100px]" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div
          className="text-center mb-16 sm:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-black text-primary uppercase tracking-[0.35em] mb-8 shadow-sm">
            Knowledge Base 🤔
          </span>
          <h2 className="text-[3.2rem] leading-[0.95] sm:text-[5rem] lg:text-[6.5rem] font-black mb-8 tracking-tighter text-foreground text-balance">
            Real talk. <span className="text-holographic">No secrets.</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-6 font-medium leading-relaxed">
            Everything you wanted to know about BIOTRA but were too shy to ask.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-premium rounded-[2.5rem] px-8 sm:px-12 border border-white/5 data-[state=open]:border-primary/40 data-[state=open]:glass-glow-accent transition-all duration-500 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-black text-xl sm:text-2xl text-foreground hover:no-underline py-8 group transition-all">
                  <span className="group-data-[state=open]:text-primary transition-colors tracking-tight leading-tight">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base sm:text-lg leading-relaxed pb-10 font-medium max-w-3xl">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs mb-8">Still got questions?</p>
          <Link to="/register">
            <Button variant="outline" className="rounded-2xl px-12 py-8 text-lg font-black tracking-tight border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-2xl">
              CHAT WITH OUR TEAM
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
