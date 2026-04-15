import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  Globe, 
  Shield, 
  Zap, 
  ArrowRight, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Github, 
  ArrowUpRight,
  Database,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── CUSTOM CURSOR ───
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      });
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
      });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-difference" 
      />
      <div 
        ref={followerRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-400/50 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" 
      />
    </>
  );
};

// ─── NAV BAR ───
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);

      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 py-6 px-10 flex justify-between items-center",
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-cyan-400 flex items-center justify-center rounded-sm rotate-45">
          <Zap className="text-black -rotate-45" size={20} fill="black" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Biotra</span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        {["Process", "Vision", "Capital", "Connect"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-cyan-400 transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all">
        Launch App
      </button>
    </motion.nav>
  );
};

// ─── HERO SECTION ───
const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", {
        yPercent: 100,
        stagger: 0.1,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5
      });
      
      gsap.to(".hero-video", {
        scale: 1.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black flex flex-col justify-center items-center px-10">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="hero-video w-full h-full object-cover opacity-40"
        >
          <source 
            src="https://cdn.pixabay.com/video/2016/10/24/5946-187514930_large.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-6xl">
        <div className="overflow-hidden mb-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="reveal-text text-cyan-400 font-black text-sm uppercase tracking-[0.5em] mb-4"
          >
            The Future of Digital Identity
          </motion.p>
        </div>
        
        <div className="overflow-hidden">
          <h1 ref={titleRef} className="reveal-text text-[12vw] md:text-[8vw] font-black leading-[0.9] text-white uppercase tracking-tighter italic">
            BIOTRA_ <br />
            <span className="text-transparent border-text stroke-white">SYSTEMS.</span>
          </h1>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
          <button className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black uppercase text-sm tracking-widest hover:bg-cyan-400 transition-all transform hover:scale-105 active:scale-95">
            Get Started
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-4 text-white/40 uppercase text-[10px] font-black tracking-[0.3em]">
            <div className="w-12 h-[1px] bg-white/20" />
            Empowering 50k+ Creators
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase font-black tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-400/50 to-transparent" />
      </motion.div>
    </section>
  );
};

// ─── WHAT WE DO SECTION ───
const WhatWeDo = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "Identity Orchestration",
      description: "Unified digital footprint across all platforms with decentralized protocol security.",
      icon: Cpu,
      image: "/biotra_tech_vision_1_1776275989608.png"
    },
    {
      title: "Market Integrity",
      description: "Direct-to-consumer infrastructure with 0% platform fees. Absolute revenue ownership.",
      icon: Shield,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Global Reach",
      description: "Localized payment gateways and multi-currency support for cross-border commerce.",
      icon: Globe,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Neural Analytics",
      description: "Privacy-first audience insights powered by on-device machine learning models.",
      icon: Layers,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section id="process" ref={containerRef} className="py-40 bg-black px-10 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-32 flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-10">
              WE ARCHITECT <br /> 
              <span className="text-cyan-400 italic">DOMINANCE.</span>
            </h2>
          </div>
          <p className="text-white/40 font-bold uppercase text-lg max-w-sm leading-tight mb-2">
            WE PROVIDE THE TOOLS. YOU PROVIDE THE VISION. TOGETHER WE REWRITE THE INTERNET'S REVENUE MODEL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group relative h-[500px] border border-white/10 rounded-3xl overflow-hidden bg-white/5"
            >
              <img src={f.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              
              <div className="absolute bottom-0 left-0 p-10 z-20 w-full">
                <f.icon className="text-cyan-400 mb-6 group-hover:rotate-12 transition-transform" size={40} />
                <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tight">{f.title}</h3>
                <p className="text-white/60 font-bold text-sm uppercase leading-relaxed max-w-xs transition-opacity group-hover:text-white">
                  {f.description}
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-black text-[10px] tracking-widest uppercase">Explore Module</span>
                  <ArrowUpRight className="text-white" size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── INVESTMENT SECTION ───
const Investment = () => {
  return (
    <section id="vision" className="py-40 bg-[#050505] px-10 relative overflow-hidden">
      {/* Abstract Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-cyan-400 font-black text-xs uppercase tracking-[0.5em] mb-8 block">Investment & Vision</span>
            <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-12 italic">
              SCALING <br /> VALUE.
            </h2>
            <p className="text-xl text-white/80 font-bold uppercase leading-relaxed mb-12 max-w-xl">
              Biotra is not just a platform; it's a financial asset for creators. We invest in the growth of our ecosystem, ensuring that every user has the capital and intelligence to scale.
            </p>
            
            <div className="grid grid-cols-2 gap-10">
              <div>
                <div className="text-4xl font-black text-white mb-2 tracking-tighter">$12M+</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Capital Deployed</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-2 tracking-tighter">0%</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Creator Tax</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Venture Capital", val: "Tech-Scale", icon: Zap },
              { label: "Community Fund", val: "Growth-First", icon: Users },
              { label: "Infrastructure", val: "Ultra-Fast", icon: Database },
              { label: "AI Research", val: "Predictive", icon: Sparkles }
            ].map((item, i) => (
              <div key={i} className="p-10 border border-white/10 bg-white/5 rounded-3xl hover:border-cyan-400/50 transition-colors group">
                <item.icon size={32} className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{item.label}</div>
                <div className="text-xl font-black text-white uppercase">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── CONTACT / FOOTER ───
const Contact = () => {
  return (
    <footer id="connect" className="pt-60 pb-20 bg-black px-10 text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-400/20 blur-[120px] rounded-full -z-10" />

      <div className="max-w-[1400px] mx-auto">
        <div className="border-t border-white/10 pt-20 flex flex-col items-center text-center">
          <h2 className="text-[10vw] font-black uppercase tracking-tighter leading-none mb-20 italic hover:text-cyan-400 transition-colors cursor-pointer">
            LET'S TALK_
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 w-full text-left">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-8 underline underline-offset-8">Global HQ</div>
              <p className="text-xl font-bold uppercase leading-relaxed text-white/60">
                124 Innovation Way<br />
                Palo Alto, CA 94301<br />
                Silicon Valley
              </p>
            </div>
            
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-8 underline underline-offset-8">Direct Connect</div>
              <div className="space-y-4">
                <a href="mailto:hello@biotra.cc" className="flex items-center gap-4 group">
                  <Mail size={20} className="text-white/20 group-hover:text-cyan-400" />
                  <span className="text-xl font-bold uppercase group-hover:translate-x-2 transition-transform">hello@biotra.cc</span>
                </a>
                <a href="tel:+1000000000" className="flex items-center gap-4 group">
                  <Phone size={20} className="text-white/20 group-hover:text-cyan-400" />
                  <span className="text-xl font-bold uppercase group-hover:translate-x-2 transition-transform">+1 (800) BIOTRA</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="flex gap-6">
                <a href="#" className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition-all">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition-all">
                  <Github size={20} />
                </a>
                <a href="#" className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition-all">
                  <Linkedin size={20} />
                </a>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mt-10">
                &copy; 2026 BIOTRA SYSTEMS INC. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="mt-40 border-y border-white/10 py-10 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 whitespace-nowrap"
          >
            {[1, 2, 3].map(i => (
              <span key={i} className="text-9xl font-black uppercase tracking-tighter opacity-5 italic">
                IDENTITY ORCHESTRATION / MARKET INTEGRITY / GLOBAL REACH / NEURAL ANALYTICS / 
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

// ─── CHAT BOT ───
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 h-[450px] bg-black border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-cyan-400 p-6 flex items-center gap-4">
              <Zap size={20} className="text-black" fill="black" />
              <div className="text-black font-black uppercase text-xs tracking-widest">Biotra AI</div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none">
                <p className="text-white/60 text-xs font-bold uppercase leading-relaxed">
                  System Online. How can I help you architect your dominance today?
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <input 
                type="text" 
                placeholder="Type command..." 
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 uppercase text-[10px] font-black"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 group"
      >
        <MessageCircle size={30} className={cn("transition-transform", isOpen ? "rotate-90" : "")} />
      </button>
    </div>
  );
};

// ─── MAIN APP PAGE ───
export default function Index() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stagger: 0.1,
    damping: 30,
    restDelta: 0.001
  });

  // Preloader
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-t-4 border-cyan-400 rounded-full"
          />
          <Zap size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" fill="cyan" />
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-cyan-400 font-black uppercase text-xs tracking-[1em]"
        >
          Initializing_
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white selection:bg-cyan-400 selection:text-black cursor-none">
      <style>{`
        .border-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #22d3ee;
        }
        * {
          scroll-behavior: smooth;
        }
      `}</style>
      
      <CustomCursor />
      
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-400 origin-left z-[100]" 
        style={{ scaleX }} 
      />

      <Navbar />
      
      <main>
        <Hero />
        <WhatWeDo />
        <Investment />
        <Contact />
      </main>

      <ChatBot />
    </div>
  );
}
