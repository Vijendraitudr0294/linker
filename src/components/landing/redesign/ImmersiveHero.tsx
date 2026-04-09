import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";

const ImmersiveHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 50, stiffness: 100 };
  const floatX = useSpring(useTransform(mouseX, [-600, 600], [-25, 25]), springConfig);
  const floatY = useSpring(useTransform(mouseY, [-600, 600], [-25, 25]), springConfig);
  const floatXReverse = useSpring(useTransform(mouseX, [-600, 600], [25, -25]), springConfig);
  const floatYReverse = useSpring(useTransform(mouseY, [-600, 600], [25, -25]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100vh] w-full flex flex-col items-center pt-32 pb-20 overflow-hidden bg-[#f4ece3]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
        .hero-title { font-family: 'Outfit', sans-serif; }
        .neo-shadow { box-shadow: 4px 4px 0px 0px rgba(0,0,0,1); }
        .neo-border { border: 2px solid #000; }
        .float-obj { filter: drop-shadow(4px 4px 0px rgba(0,0,0,1)); }
      `}</style>

      {/* Floating Elements */}
      <motion.div 
        style={{ x: floatX, y: floatY }}
        className="absolute top-[15%] left-[10%] w-24 h-24 hidden lg:block"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full float-obj">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="#ff6b6b" stroke="#000" strokeWidth="4" />
          <circle cx="50" cy="50" r="15" fill="#fff" stroke="#000" strokeWidth="3" />
        </svg>
      </motion.div>

      <motion.div 
        style={{ x: floatXReverse, y: floatYReverse }}
        className="absolute top-[25%] right-[12%] w-24 h-24 hidden lg:block"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full float-obj">
          <path d="M0 100 L50 0 L100 100 Z" fill="#4ecdc4" stroke="#000" strokeWidth="4" />
          <circle cx="50" cy="65" r="10" fill="#fff" stroke="#000" strokeWidth="3" />
        </svg>
      </motion.div>

      <motion.div 
        style={{ x: floatX, y: floatYReverse }}
        className="absolute bottom-[40%] left-[8%] w-28 h-28 hidden lg:block"
      >
         <svg fill="none" viewBox="0 0 100 100" className="w-full h-full float-obj">
           <polygon points="50,10 100,100 0,100" fill="#feca57" stroke="#000" strokeWidth="4" />
           <circle cx="50" cy="60" r="12" fill="#fff" stroke="#000" strokeWidth="3" />
         </svg>
      </motion.div>

      <motion.div 
        style={{ x: floatXReverse, y: floatY }}
        className="absolute top-[45%] right-[8%] w-32 h-32 hidden lg:block"
      >
         <svg fill="none" viewBox="0 0 100 100" className="w-full h-full float-obj">
            <path d="M 0 100 A 50 50 0 0 1 100 100" fill="#a55eea" stroke="#000" strokeWidth="4" />
         </svg>
      </motion.div>

      <div className="container max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[900px] space-y-6"
        >
          <h1 className="hero-title text-5xl md:text-7xl font-black text-[#1a1a1a] leading-[1.1] tracking-tight">
            Empower Your Brand <br className="hidden md:block"/>
            with <span className="inline-block bg-[#feca57] text-[#1a1a1a] px-5 py-2 mx-2 rounded-full neo-border neo-shadow -rotate-2 transform">#Collaborative</span> <br className="hidden md:block"/>
            Digital Presence
          </h1>

          <p className="text-lg md:text-xl text-[#4a4a4a] font-medium max-w-[600px] mx-auto mt-6">
            Manage all your links, stores, and audience from one place like a pro! Seven products cover all the needs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button 
              className="h-14 px-8 rounded-full bg-[#1a1a1a] text-white font-bold text-[15px] neo-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              asChild
            >
              <Link to="/register">Start a free trial</Link>
            </Button>
            <Button 
              className="h-14 px-8 rounded-full bg-white text-[#1a1a1a] font-bold text-[15px] neo-border neo-shadow hover:-translate-y-1 hover:bg-[#f8f9fa] transition-all"
              asChild
            >
              <Link to="/contact">Book a live demo</Link>
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
           className="mt-20 w-full max-w-[1000px] relative"
        >
          {/* Main Dashboard Image */}
          <div className="rounded-3xl bg-white neo-border neo-shadow p-2 overflow-hidden w-full relative z-10">
             <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eee]">
               <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
               <div className="w-3 h-3 rounded-full bg-[#feca57]" />
               <div className="w-3 h-3 rounded-full bg-[#4ecdc4]" />
             </div>
             <img 
               src="/creator-lifestyle.png" 
               alt="Dashboard Mockup" 
               className="w-full h-auto rounded-b-[20px] object-cover max-h-[600px]"
               style={{ filter: 'grayscale(0%) contrast(1.1) brightness(1.05)' }}
             />
             
             {/* Overlay UI elements to mimic dashboard */}
             <div className="absolute top-[20%] left-[10%] bg-white neo-border neo-shadow rounded-2xl p-4 w-48 rotate-[-5deg]">
                <div className="w-10 h-10 bg-[#feca57] rounded-full mb-3 flex items-center justify-center neo-border">
                  <span className="text-xl">👋</span>
                </div>
                <h4 className="font-bold text-sm">Welcome Back</h4>
                <div className="mt-2 text-xs text-gray-500">Profile engagement up 45% this week.</div>
             </div>

             <div className="absolute bottom-[20%] right-[10%] bg-white neo-border neo-shadow rounded-2xl p-4 w-56 rotate-[3deg]">
                <div className="flex gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b6b] neo-border" />
                  <div className="w-8 h-8 rounded-full bg-[#4ecdc4] neo-border" />
                  <div className="w-8 h-8 rounded-full bg-[#a55eea] neo-border" />
                </div>
                <h4 className="font-bold text-sm">New Leads</h4>
                <div className="mt-1 text-xs text-gray-500">3 new contacts today.</div>
             </div>
          </div>
        </motion.div>
        
        {/* Floating small dot */}
        <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute right-0 top-[60%] w-12 h-12 bg-[#ff7f50] rounded-full neo-border neo-shadow z-20 flex items-center justify-center"
        >
          <span className="text-white font-bold text-xl">!</span>
        </motion.div>

      </div>
    </section>
  );
};

export default ImmersiveHero;
