import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import ImmersiveHero from "@/components/landing/redesign/ImmersiveHero";
import HorizontalExperience from "@/components/landing/redesign/HorizontalExperience";
import TrustSection from "@/components/landing/redesign/TrustSection";
import CreatorEconomy from "@/components/landing/redesign/CreatorEconomy";
import MarketplacePreview from "@/components/landing/redesign/MarketplacePreview";
import FinalCTA from "@/components/landing/redesign/FinalCTA";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";
import ChatWidget from "@/components/landing/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative noise-overlay selection:bg-primary selection:text-black">
      <header>
        <title>Biotra - Sovereign Identity Protocol</title>
        <meta name="description" content="The definitive substrate for world-class creators. Architect your digital studio with high-integrity tools and vibrant precision." />
      </header>
      
      <RedesignedNavbar />
      
      <main>
        <div id="hero">
           <ImmersiveHero />
        </div>

        <ScrollReveal>
           <TrustSection />
        </ScrollReveal>

        <HorizontalExperience />

        <ScrollReveal>
           <CreatorEconomy />
        </ScrollReveal>

        <ScrollReveal>
           <MarketplacePreview />
        </ScrollReveal>

        <ScrollReveal>
           <PricingSection />
        </ScrollReveal>

        <ScrollReveal>
           <TestimonialsSection />
        </ScrollReveal>

        <ScrollReveal>
           <FAQSection />
        </ScrollReveal>

        <ScrollReveal>
           <FinalCTA />
        </ScrollReveal>
      </main>

      <ScrollReveal>
         <Footer />
      </ScrollReveal>
      
      <ChatWidget />
    </div>
  );
};

export default Index;
