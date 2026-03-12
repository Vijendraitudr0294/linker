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
  { q: "Is LinkVertex really 100% free?", a: "Yes! Every feature is free — unlimited links, 60+ themes, analytics, built-in shop, contact forms, AI tools. No credit card required, no hidden fees, no premium paywalls." },
  { q: "What's the catch? How do you make money?", a: "We plan to offer optional premium features in the future (custom domains, white-label, etc.) but the core product will always be free. We believe everyone deserves great tools." },
  { q: "Who is LinkVertex for?", a: "Everyone! Creators, musicians, photographers, restaurants, fitness coaches, small businesses, freelancers, agencies, gamers, educators, real estate agents, event planners — if you have links, LinkVertex is for you." },
  { q: "Can I sell products on my page?", a: "Absolutely. Add products with images, variants (size, color), pricing, and inventory tracking. Customers can order directly from your page with a built-in order form." },
  { q: "How is LinkVertex different from Linktree?", a: "More themes (60+ vs ~10), built-in marketplace, real analytics, AI tools, contact forms, embed support, inventory management — and it's actually free. Not a limited free tier." },
  { q: "Can I use my own domain?", a: "Custom domain support is coming soon as a premium add-on. For now, you get a clean linkvertex.com/yourname URL." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="glow-orb glow-orb-gold w-[300px] h-[300px] bottom-20 -left-60 opacity-20" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">
            FAQ 🤔
          </span>
          <h2 className="text-[2.75rem] leading-[1] sm:text-5xl lg:text-7xl font-heading font-black mb-6 px-4 tracking-tighter">
            Real talk. <span className="text-gradient">No secrets.</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-6 font-medium">
            Everything you wanted to know but were too shy to ask.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass rounded-2xl px-8 border border-white/5 data-[state=open]:border-primary/40 data-[state=open]:glass-glow transition-all duration-500 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-heading font-black text-lg sm:text-xl text-foreground hover:no-underline py-6 group">
                  <span className="group-data-[state=open]:text-primary transition-colors">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-6 font-medium">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground font-medium mb-6">Still got questions?</p>
          <Link to="/register">
            <Button variant="outline" className="rounded-full px-8 py-6 font-black tracking-tight hover:bg-primary hover:text-white transition-all">
              CHAT WITH US LATER
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
