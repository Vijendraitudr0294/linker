import RedesignedNavbar from "@/components/landing/redesign/RedesignedNavbar";
import RedesignedHero from "@/components/landing/redesign/RedesignedHero";
import TrustSection from "@/components/landing/redesign/TrustSection";
import ModernFeatures from "@/components/landing/redesign/ModernFeatures";
import ProductPreview from "@/components/landing/redesign/ProductPreview";
import CreatorEconomy from "@/components/landing/redesign/CreatorEconomy";
import HowItWorks from "@/components/landing/redesign/HowItWorks";
import MarketplacePreview from "@/components/landing/redesign/MarketplacePreview";
import FinalCTA from "@/components/landing/redesign/FinalCTA";
import Footer from "@/components/landing/Footer"; // Reusing old footer or simple redesign

const RedesignedPage = () => {
  return (
    <div className="min-h-screen bg-background relative noise-overlay">
      <RedesignedNavbar />
      <RedesignedHero />
      <TrustSection />
      <ModernFeatures />
      <ProductPreview />
      <CreatorEconomy />
      <HowItWorks />
      <MarketplacePreview />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default RedesignedPage;
