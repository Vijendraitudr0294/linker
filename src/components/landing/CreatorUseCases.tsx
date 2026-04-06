import { motion } from "framer-motion";
import { Music, Zap, Users, ArrowRight, BookOpen } from "lucide-react";
import musicianProfile from "@/assets/creator_use_case_musician.png";
import businessProfile from "@/assets/creator_use_case_business.png";
import { Button } from "@/components/ui/button";

const cases = [
  {
    category: "Musicians",
    title: "The Ultimate EPK.",
    description: "Launch your tour dates, share your latest single, and sell merch—all from one link. Zero commission on your sales.",
    icon: Music,
    image: musicianProfile,
    tags: ["Spotify Embed", "Ticket Links", "Merch Shop"],
  },
  {
    category: "Entrepreneurs",
    title: "Your Digital Storefront.",
    description: "Accept bookings, sell digital downloads, and build your email list. Professionalism that scales with your growth.",
    icon: BookOpen,
    image: businessProfile,
    tags: ["Lead Gen", "Custom Themes", "Analytics"],
  }
];

const CreatorUseCases = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-background">
      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        
        <motion.div
          className="max-w-[800px] mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase mb-6">
            Tailored Experiences
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-foreground mb-6 tracking-tight leading-tight">
            Built for <span className="text-secondary italic">Every Creator.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-[540px]">
             BIOTRA isn't just a list of links. It's a powerful tool designed to fit the specific needs of your craft.
          </p>
        </motion.div>

        <div className="space-y-32">
          {cases.map((useCase, idx) => (
            <motion.div
              key={useCase.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
            >
              {/* Text Side */}
              <div className="w-full lg:w-1/2">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                       <useCase.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-primary/80">{useCase.category}</span>
                 </div>
                 <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
                    {useCase.title}
                 </h3>
                 <p className="text-[15px] sm:text-[16px] text-muted-foreground font-normal mb-8 leading-relaxed">
                    {useCase.description}
                 </p>
                 
                 <div className="flex flex-wrap gap-3 mb-10">
                    {useCase.tags.map(tag => (
                       <div key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] font-medium text-muted-foreground">
                          {tag}
                       </div>
                    ))}
                 </div>

                 <Button variant="link" className="p-0 h-auto text-primary text-[13px] font-semibold gap-2 hover:gap-3 transition-all">
                    Get Started as {useCase.category} <ArrowRight className="w-4 h-4" />
                 </Button>
              </div>

              {/* Visual Side */}
              <div className="w-full lg:w-1/2 relative group">
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-primary/10 blur-[100px] opacity-20" />
                 <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                    <img 
                       src={useCase.image} 
                       alt={useCase.category} 
                       className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreatorUseCases;
