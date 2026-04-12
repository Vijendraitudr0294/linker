import { motion } from "framer-motion";

interface BrandItem {
  name: string;
  logo: string;
}

interface TrustSectionProps {
  title?: string;
  brands?: BrandItem[];
}

const TrustSection = ({ 
  title = "Integrated with the world's leading platforms.",
  brands = [
    { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" },
    { name: "Supabase", logo: "https://www.vectorlogo.zone/logos/supabase/supabase-ar21.svg" },
    { name: "Vercel", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg" },
    { name: "YouTube", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" },
    { name: "Shopify", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" },
    { name: "Twitch", logo: "https://www.vectorlogo.zone/logos/twitch/twitch-ar21.svg" },
    { name: "Discord", logo: "https://www.vectorlogo.zone/logos/discordapp/discordapp-ar21.svg" },
    { name: "TikTok", logo: "https://www.vectorlogo.zone/logos/tiktok/tiktok-ar21.svg" }
  ]
}: TrustSectionProps) => {
  return (
    <section className="py-24 bg-background overflow-hidden font-body relative transition-colors duration-700">
      {/* Background Glow - Smoothed */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[150px] pointer-events-none" />
      
      <div className="flex flex-col items-center gap-16">
        
        <div className="flex flex-col items-center gap-6 px-6">
           <div className="px-5 py-2 rounded-full bg-surface-glass border border-surface-border flex items-center gap-3 backdrop-blur-3xl shadow-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground/40 uppercase font-black">Trusted Ecosystem</p>
           </div>
           <h4 className="text-lg md:text-xl font-display font-black text-muted-foreground/20 text-center max-w-[600px] tracking-tight uppercase">
              {title}
           </h4>
        </div>

        {/* Infinite Marquee */}
        <div className="relative w-full overflow-hidden">
           {/* Fade Masks */}
           <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
           <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
           
           <motion.div 
             className="flex gap-24 items-center whitespace-nowrap"
             animate={{ x: ["0%", "-50%"] }}
             transition={{ duration: 30, ease: "linear", repeat: Infinity }}
           >
             {/* Double the array for seamless loop */}
             {[...(brands || []), ...(brands || [])].map((brand, i) => (
               <div
                 key={`${brand.name}-${i}`}
                 className="relative group h-8 opacity-20 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0 flex-shrink-0"
               >
                 <img 
                   src={brand.logo} 
                   className="h-full object-contain dark:invert" 
                   alt={brand.name} 
                 />
               </div>
             ))}
           </motion.div>
        </div>

        <div className="w-full max-w-[600px] h-[1px] bg-gradient-to-r from-transparent via-surface-border to-transparent" />
      </div>
    </section>
  );
};

export default TrustSection;
