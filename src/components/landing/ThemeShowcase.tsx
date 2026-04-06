import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Palette, Layers, Sparkles } from "lucide-react";
import themeShowcaseImg from "@/assets/theme-showcase.jpg";

const themes = [
  { name: "Neon Cyber", gradient: "from-fuchsia-500 via-violet-600 to-indigo-700", type: "Vibrant" },
  { name: "Liquid Glass", gradient: "from-white/10 via-white/5 to-transparent", type: "Minimal" },
  { name: "Luxury Black", gradient: "from-neutral-900 via-neutral-800 to-amber-600/20", type: "Premium" },
  { name: "Pastel Dreams", gradient: "from-pink-200 via-purple-200 to-indigo-100", type: "Soft" },
  { name: "Lime Fresh", gradient: "from-lime-400 to-emerald-500", type: "Modern" },
];

const ThemeShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Mouse tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-5, 5]), springConfig);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="themes" className="py-20 lg:py-32 relative overflow-hidden bg-background">
      <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
        
        <motion.div
          className="max-w-[800px] mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase mb-6">
            Visual Identity
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-foreground mb-6 tracking-tight leading-tight">
            Elevate your <span className="text-secondary italic">vibe.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-[540px]">
             Your link in bio is your digital storefront. Choose from 60+ neon, glass, and minimal themes designed to convert fans into customers.
          </p>
        </motion.div>

        {/* Main Showcase Container */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mb-20 lg:mb-32">
          
          <motion.div
            className="w-full lg:w-1/2 perspective-1000"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
          >
            <div className="relative group rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <img src={themeShowcaseImg} alt="Themes" className="w-full h-auto scale-100 group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>

          <div className="w-full lg:w-1/2 space-y-8 lg:space-y-12">
            {[
              { icon: Layers, title: "Layered Design", desc: "Build depth with cards, lists, and grids." },
              { icon: Sparkles, title: "AI Generation", desc: "Let AI draft your perfect theme in seconds." },
              { icon: Palette, title: "Full Sandbox", desc: "Change every color, font, and animation." }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                  <item.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div className="relative group/carousel">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-2 pb-12 snap-x snap-mandatory"
          >
            {themes.map((theme, i) => (
              <motion.div
                key={theme.name}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 group cursor-pointer hover:border-white/10 transition-colors">
                  <div className={`h-[240px] rounded-2xl bg-gradient-to-br ${theme.gradient} mb-6 relative overflow-hidden`}>
                     <div className="absolute inset-x-8 top-12 bottom-0 bg-white/10 backdrop-blur-md rounded-t-xl border-x border-t border-white/20" />
                  </div>
                  <span className="text-[11px] font-semibold text-primary/60 uppercase tracking-widest block mb-2">{theme.type}</span>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{theme.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="absolute -bottom-4 right-2 flex gap-3 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <button onClick={() => scroll("left")} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => scroll("right")} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ThemeShowcase;
