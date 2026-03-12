import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import themeShowcaseImg from "@/assets/theme-showcase.jpg";

const themes = [
  { name: "Lime Fresh", gradient: "from-lime-400 to-emerald-500", accent: "bg-lime-400" },
  { name: "Purple Haze", gradient: "from-violet-500 to-indigo-500", accent: "bg-violet-500" },
  { name: "Ocean Wave", gradient: "from-sky-400 to-emerald-500", accent: "bg-sky-400" },
  { name: "Sunset Gold", gradient: "from-amber-400 to-orange-500", accent: "bg-amber-400" },
  { name: "Forest Deep", gradient: "from-green-700 to-emerald-500", accent: "bg-green-700" },
  { name: "Warm Ember", gradient: "from-orange-400 to-amber-500", accent: "bg-orange-400" },
  { name: "Neon Night", gradient: "from-violet-500 via-indigo-500 to-amber-400", accent: "bg-violet-500" },
  { name: "Clean White", gradient: "from-gray-100 to-gray-200", accent: "bg-gray-200" },
];

const ThemeShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orbY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  // Mouse tilt effect for the main showcase image
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const rotateX = useTransform(cardY, [-300, 300], [10, -10]);
  const rotateY = useTransform(cardX, [-300, 300], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    cardX.set(x);
    cardY.set(y);
  };

  const handleMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
    setIsPaused(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && scrollRef.current) {
        const el = scrollRef.current;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="themes" className="py-20 sm:py-24 relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent_70%)]" />
      <motion.div style={{ y: orbY }} className="glow-orb glow-orb-accent w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] top-40 -left-40 sm:-left-60 opacity-30 mix-blend-screen" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-bold text-primary uppercase tracking-[0.3em] mb-6">
            Visual Identity 🎨
          </span>
          <h2 className="text-[2.75rem] leading-[1.1] sm:text-6xl lg:text-8xl font-heading font-black mb-6 px-4 tracking-tighter">
            Elevate your <span className="text-gradient">vibe.</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-6 font-medium leading-relaxed">
            Your link in bio is your digital storefront. Choose from 60+ neon, glass, and minimal themes designed to convert.
          </p>
        </motion.div>

        {/* Interactive 3D Showcase Image */}
        <motion.div
          className="mb-14 sm:mb-20 max-w-5xl mx-auto perspective-1000 px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY }}
        >
          <div className="relative group overflow-hidden rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <img
              src={themeShowcaseImg}
              alt="Ultimate Theme Showcase"
              className="w-full h-auto scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              loading="lazy"
            />
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </motion.div>

        {/* Modern Horizontal Carousel */}
        <div className="relative px-2">
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-10 overflow-x-auto scrollbar-hide px-4 sm:px-12 pb-12 snap-x snap-mandatory"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {themes.map((theme, i) => (
              <motion.div
                key={theme.name}
                className="flex-shrink-0 w-[240px] sm:w-[320px] snap-center group"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden glass border border-white/10 group-hover:border-primary/50 transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(var(--primary),0.3)] group-hover:-translate-y-2">
                  <div className={`h-[200px] sm:h-[280px] bg-gradient-to-br ${theme.gradient} p-6 sm:p-8 flex flex-col justify-center items-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-mesh opacity-20 opacity-0 group-hover:opacity-30 transition-opacity duration-700" />

                    {/* Mockup Elements - Linktree Style */}
                    <div className="relative w-full space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full glass border border-white/20 mx-auto shadow-2xl overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} brightness-125 opacity-30`} />
                      </div>
                      <div className="h-4 w-2/3 bg-white/30 rounded-full mx-auto backdrop-blur-md" />
                      <div className="space-y-2">
                        <div className="h-10 w-full bg-white/20 rounded-2xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform duration-500" />
                        <div className="h-10 w-full bg-white/15 rounded-2xl backdrop-blur-xl" />
                      </div>
                    </div>

                    {/* Accent glow orb */}
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${theme.accent} blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity`} />
                  </div>
                  <div className="p-6 text-center bg-background/60 backdrop-blur-2xl border-t border-white/10 relative z-10">
                    <p className="text-xs font-black text-primary/60 uppercase tracking-widest mb-1 font-heading">
                      Themed Pack
                    </p>
                    <p className="text-lg sm:text-2xl font-accent font-black text-foreground tracking-tighter group-hover:text-primary transition-colors duration-300">
                      {theme.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* New Interactive Scroll Controls */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-4 hidden sm:flex">
            <button onClick={() => scroll("left")} className="w-12 h-12 rounded-full glass-strong flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={() => scroll("right")} className="w-12 h-12 rounded-full glass-strong flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"><ChevronRight className="w-6 h-6" /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThemeShowcase;
