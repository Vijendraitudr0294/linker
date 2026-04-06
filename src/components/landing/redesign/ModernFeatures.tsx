import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Palette, ShoppingBag, BarChart3, Globe, Sparkles, Heart } from "lucide-react";

const BentoCard = ({ children, className = "", delay = 0, title, description, icon: Icon, image }: { 
  children?: React.ReactNode, 
  className?: string, 
  delay?: number,
  title: string,
  description: string,
  icon: any,
  image?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl bg-card border border-surface-border overflow-hidden group hover:shadow-2xl transition-all duration-700 ${className}`}
    >
      {/* Background Image Layer */}
      {image && (
        <div className="absolute inset-0 z-0">
          <img src={image} alt={title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}
      
      {/* Content Layer */}
      <div className="relative z-20 h-full p-8 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-primary group-hover:border-primary transition-all duration-500">
            <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-all">
            <div className="px-3 py-1 rounded-full bg-white/90 text-black text-[10px] font-bold shadow-xl">
              Explore →
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-foreground [font-family:'Outfit',sans-serif]">
            {title}
          </h3>
          <p className="text-[15px] text-muted-foreground/70 font-medium leading-relaxed tracking-tight max-w-[360px]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ModernFeatures = () => {
  return (
    <section id="features" className="py-24 lg:py-40 bg-background relative selection:bg-primary selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
        .features-title { font-family: 'Outfit', sans-serif; }
      `}</style>

      <div className="container max-w-[1400px] mx-auto px-6">
        
        <div className="max-w-[800px] mb-20 lg:mb-28">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
             </div>
             <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">The Hosting Experience</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-8 features-title"
          >
            Host your Brand. <br />
            <span className="text-primary italic font-medium">Everywhere.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-muted-foreground/60 font-medium max-w-[650px] tracking-tight leading-relaxed"
          >
            Sophisticated design meets effortless commerce. We've simplified the complexities of digital presence into a breathtaking experience.
          </motion.p>
        </div>

        {/* Feature Discovery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           <BentoCard 
              className="lg:col-span-8 h-[520px]"
              title="Design Workshop"
              description="Craft a visual identity that belongs anywhere. Responsive, elegant, and uniquely yours."
              icon={Palette}
              image="/feature-design.png"
           />

           <BentoCard 
              className="lg:col-span-4 h-[520px]"
              title="Global Shop"
              description="Sell your vision with zero platform fees. Instantly. Simply. Sustainably."
              icon={ShoppingBag}
              image="/feature-commerce.png"
              delay={0.1}
           />

           <BentoCard 
              className="lg:col-span-12 h-[460px]"
              title="Insights that Matter"
              description="Listen to your audience. Understand your impact with premium, human-centric analytics."
              icon={BarChart3}
              image="/creator-lifestyle.png" // Reusing the high-end hero visual for consistency
              delay={0.2}
           />
        </div>

        {/* Brand Promise Band */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="mt-24 flex flex-wrap items-center justify-center gap-12 lg:gap-24 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
        >
           {[Globe, Heart, Sparkles, ShoppingBag, Palette, BarChart3].map((Brand, i) => (
             <Brand key={i} className="w-12 h-12" />
           ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ModernFeatures;
