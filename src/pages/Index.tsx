import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Zap, ShoppingBag, BarChart3, Globe, ArrowRight, Sparkles, User, MessageCircle, Play, CheckCircle2, Layout, ShieldCheck, Cpu, Smartphone, Database, Terminal, Layers, ArrowUpRight, Share2, MousePointer2, Instagram, Twitter, Youtube, Music, ShoppingCart, QrCode, Monitor, ChevronRight, Github, Linkedin, Mail, Heart, Rocket, Compass, Send, Star, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// LOADER COMPONENT
const ExtremeLoader = () => (
  <motion.div 
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 z-[1000] bg-[#FBCFE8] flex flex-col items-center justify-center gap-12 font-sans overflow-hidden"
  >
    <motion.div 
       animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 0.8, 1.2, 1] }} 
       transition={{ duration: 2, repeat: Infinity }}
       className="w-32 h-32 bg-white border-8 border-black rounded-[40px] flex items-center justify-center shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
    >
       <Zap className="w-16 h-16 fill-black" />
    </motion.div>
    <div className="flex flex-col items-center gap-4">
       <div className="text-3xl font-[1000] uppercase italic tracking-tighter">BIOTRA_v1.0.0</div>
       <div className="w-64 h-3 bg-black/10 border-2 border-black rounded-full overflow-hidden">
          <motion.div 
             initial={{ x: "-100%" }} animate={{ x: "100%" }} 
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             className="w-full h-full bg-emerald-400"
          />
       </div>
    </div>
  </motion.div>
);

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import ChatWidget from "@/components/landing/ChatWidget";

// HERO SECTION (STORY: TESSA)
const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <section className="relative min-h-[90vh] pt-32 pb-20 bg-[#F0F2F5] overflow-hidden flex items-center">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Parallax Floating Icons - Emotional Trigger: Joyful Liberation */}
            <div className="absolute inset-0 pointer-events-none">
                {[
                    { Icon: Instagram, bg: "bg-pink-300", text: "text-black", top: "12%", left: "8%" },
                    { Icon: Twitter, bg: "bg-sky-400", text: "text-black", top: "75%", left: "5%" },
                    { Icon: Youtube, bg: "bg-red-400", text: "text-white", top: "45%", left: "12%" },
                    { Icon: Music, bg: "bg-emerald-400", text: "text-black", top: "18%", left: "85%" },
                    { Icon: ShoppingCart, bg: "bg-yellow-400", text: "text-black", top: "82%", left: "88%" },
                    { Icon: QrCode, bg: "bg-fuchsia-400", text: "text-black", top: "50%", left: "90%" }
                ].map(({ Icon, bg, text, top, left }, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            y: [0, i % 2 === 0 ? 20 : -20, 0],
                            x: [0, i % 3 === 0 ? 15 : -15, 0],
                            rotate: [0, i % 2 === 0 ? 10 : -10, 0]
                        }}
                        transition={{ 
                            duration: 5 + i, 
                            repeat: Infinity, 
                            delay: i * 0.2, 
                            ease: "easeInOut" 
                        }}
                        style={{ 
                            left, 
                            top,
                            y: useTransform(scrollY, [0, 1000], [0, ((i % 2 === 0 ? 1 : -1) * 200)])
                        }}
                        className={cn("absolute w-12 h-12 sm:w-16 sm:h-16 border-[3px] border-black rounded-xl md:rounded-[20px] shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-center z-0", bg, text)}
                    >
                        <Icon size={24} strokeWidth={3} />
                    </motion.div>
                ))}
            </div>

            <div className="container max-w-[1400px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-400 border-4 border-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                            <Sparkles className="w-4 h-4 fill-black" /> REAL STORIES: TESSA
                        </div>
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-pink-300 border-4 border-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                            <Zap className="w-4 h-4 fill-black text-black" /> AI POWERED
                        </div>
                    </div>
                    <h1 className="text-[42px] md:text-[64px] font-[1000] tracking-tighter leading-[1.1] text-black mb-10 uppercase">
                        ONE LINK FOR <br />
                        <span className="relative inline-block mt-4">
                            <span className="relative z-10 text-white px-4">EVERYTHING.</span>
                            <span className="absolute inset-0 bg-black -rotate-1 skew-x-3 scale-[1.05] border-4 border-black shadow-[12px_12px_0_0_rgba(236,72,153,1)]" />
                        </span>
                    </h1>
                    <p className="text-lg font-[1000] text-black/70 leading-relaxed mb-8 max-w-xl uppercase">
                        STOP USING LINKS YOU DON'T OWN. BIOTRA GIVES YOU A PAGE THAT YOU CONTROL. IT'S YOUR BRAND. IT'S YOUR MONEY. ONE LINK, ALL YOUR STUFF.
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-10 italic">
                        "EASY TO START. IMPOSSIBLE TO IGNORE."
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-emerald-400 text-black border-4 border-black rounded-[24px] text-xl font-[1000] uppercase tracking-widest shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all text-center">
                            GET STARTED FREE
                        </Link>
                    </div>
                </motion.div>

                <div className="relative">
                    <motion.div 
                        style={{ y: y1 }}
                        className="relative w-full aspect-square bg-pink-300 border-8 border-black rounded-[60px] shadow-[32px_32px_0_0_rgba(0,0,0,1)] overflow-hidden"
                    >
                        <img src="/images/hero_new.png" alt="Biotra Product Showcase" className="w-full h-full object-cover" />
                        
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-12 right-12 w-48 h-16 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center justify-center font-[1000] uppercase text-[10px] tracking-widest gap-2">
                           <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Tessa Live Now
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// STUDIO SECTION (STORY: MARCUS)
const StudioSection = () => (
    <section id="studio" className="py-32 bg-[#FBCFE8] border-y-8 border-black overflow-hidden">
        <div className="container max-w-[1400px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}>
                    <div className="inline-block px-4 py-2 bg-black text-white font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">STYLE STUDIO</div>
                    <h2 className="text-[48px] md:text-[82px] font-[1000] leading-[0.85] tracking-tighter mb-10 uppercase">
                        DESIGN YOUR <br /> PAGE.
                    </h2>
                    <p className="text-xl font-black text-black leading-relaxed mb-10 max-w-lg uppercase">
                        NO COMPLICATED TOOLS. JUST CLICK AND BUILD. LOOK PROFESSIONAL IN SECONDS. CUSTOMIZE EVERYTHING—BORDERS, FONTS, AND COLORS.
                    </p>
                    <p className="text-lg font-bold text-black/40 italic mb-12 uppercase">
                        IT'S YOUR ART. IT'S YOUR STYLE. NO LIMITS.
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest text-pink-600 mb-16 underline decoration-4">
                        "LOOK GOOD. FEEL BETTER."
                    </p>
                    <button className="px-12 py-6 bg-white border-4 border-black rounded-2xl text-lg font-[1000] uppercase shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all active:scale-95">
                       BUILD YOUR PAGE
                    </button>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 5 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ type: "spring", bounce: 0.5, duration: 0.8 }} className="relative group">
                    <div className="relative w-full aspect-video bg-white border-8 border-black rounded-[40px] shadow-[24px_24px_0_0_rgba(0,0,0,1)] overflow-hidden group-hover:-translate-y-2 group-hover:shadow-[32px_32px_0_0_rgba(0,0,0,1)] transition-all duration-500">
                       <img src="/images/studio.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                        className="absolute -top-12 -right-12 p-8 bg-yellow-400 border-4 border-black rounded-3xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] max-w-[240px] cursor-pointer"
                    >
                        <Layout size={32} className="mb-4 stroke-[3]" />
                        <h4 className="text-sm font-bold mb-2 tracking-tight">Marcus Profile v2.1</h4>
                        <p className="text-[10px] font-medium uppercase text-black/40 tracking-widest italic">100% Uncompromised</p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </section>
);

// FORGE SECTION (STORY: ELENA)
const ForgeSection = () => (
    <section id="forge" className="py-32 bg-[#FEF08A] border-b-8 border-black overflow-hidden">
        <div className="container max-w-[1400px] mx-auto px-10 text-center lg:text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center lg:flex-row-reverse">
                <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ type: "spring", bounce: 0.4, duration: 0.8 }} className="lg:order-2">
                    <div className="inline-block px-4 py-2 bg-black text-white font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">QR FORGE</div>
                    <h2 className="text-[42px] md:text-[64px] font-[1000] leading-[0.85] tracking-tighter mb-10 uppercase">
                        SMART QR <br /> CODES.
                    </h2>
                    <p className="text-lg font-black text-black leading-relaxed mb-10 max-w-lg uppercase">
                        PRINT THEM. SHARE THEM. CONNECT YOUR SHOP TO THE REAL WORLD. PEOPLE JUST SCAN YOUR CODE TO SEE YOUR STUFF.
                    </p>
                    <p className="text-lg font-bold text-black/40 italic mb-12 uppercase">
                        NEON CODES. STUNNING DESIGN. FAST LOADING.
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest text-[#B45309] mb-16 border-b-4 border-black inline-block">
                        "SCAN. SHOP. ENJOY."
                    </p>
                    <div className="flex justify-center lg:justify-start">
                        <button className="px-12 py-6 bg-white border-4 border-black rounded-2xl text-lg font-[1000] uppercase shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all active:scale-95">
                           MAKE YOUR CODE
                        </button>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -5 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ type: "spring", bounce: 0.5, duration: 0.8 }} className="relative lg:order-1 group">
                    <div className="relative w-full aspect-video bg-white border-8 border-black rounded-[40px] shadow-[24px_24px_0_0_rgba(0,0,0,1)] overflow-hidden group-hover:-translate-y-2 group-hover:shadow-[32px_32px_0_0_rgba(0,0,0,1)] transition-all duration-500">
                       <img src="/images/qr.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <motion.div 
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        animate={{ rotate: [0, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-10 -left-10 p-10 bg-emerald-400 border-4 border-black rounded-full shadow-[12px_12px_0_0_rgba(0,0,0,1)] cursor-pointer"
                    >
                        <QrCode size={48} className="stroke-[3]" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </section>
);

// COMMERCE SECTION (STORY: ALEX)
const CommerceSection = () => (
    <section id="commerce" className="py-32 bg-[#D1FAE5] border-b-8 border-black overflow-hidden">
        <div className="container max-w-[1400px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}>
                    <div className="inline-block px-4 py-2 bg-black text-white font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">MERCHANT HUB</div>
                    <h2 className="text-[42px] md:text-[64px] font-[1000] leading-[0.85] tracking-tighter mb-10 uppercase">
                        KEEP ALL <br /> THE MONEY.
                    </h2>
                    <p className="text-lg font-black text-black leading-relaxed mb-10 max-w-lg uppercase">
                        OTHER SITES TAKE 30% OF YOUR SALES. WE TAKE ZERO. YOU WORK HARD, SO YOU SHOULD KEEP ALL THE PROFIT.
                    </p>
                    <p className="text-lg font-bold text-black/40 italic mb-12 uppercase">
                        NO MIDDLEMEN. NO HIDDEN FEES. JUST DIRECT SALES. <span className="text-white bg-black font-black px-2 py-1 rotate-1 inline-block border-2 border-black shadow-[4px_4px_0_0_rgba(0,255,0,1)]">100% PROFIT.</span>
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest text-[#059669] mb-16 underline decoration-4">
                        "YOUR WORK. YOUR CASH."
                    </p>
                    <button className="px-12 py-6 bg-white border-4 border-black rounded-2xl text-lg font-[1000] uppercase shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all active:scale-95">
                       START YOUR SHOP
                    </button>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 5 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ type: "spring", bounce: 0.5, duration: 0.8 }} className="relative group">
                    <div className="relative w-full aspect-video bg-cyan-200 border-8 border-black rounded-[40px] shadow-[24px_24px_0_0_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center p-8 group-hover:-translate-y-2 group-hover:shadow-[32px_32px_0_0_rgba(0,0,0,1)] transition-all duration-500">
                       <ShoppingCart size={120} className="text-black/10 absolute transition-transform duration-700 group-hover:scale-125" />
                       <div className="relative z-10 w-full max-w-sm bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                          <div className="w-full h-32 bg-gray-100 rounded-xl mb-4 border-2 border-black/10 flex items-center justify-center">
                             <ShoppingCart size={32} className="text-black/20" />
                          </div>
                          <h4 className="font-[1000] uppercase text-xl mb-1">Neon Creator Pack</h4>
                          <p className="text-sm font-bold text-black/50 mb-4">Digital Download</p>
                          <div className="flex items-center justify-between">
                             <span className="font-black text-2xl">$29.00</span>
                             <button className="px-6 py-2 bg-black text-emerald-400 border-2 border-black rounded-xl text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,255,0,1)]">Buy Now</button>
                          </div>
                       </div>
                    </div>
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        animate={{ rotate: [-2, 2, -2] }}
                        transition={{ rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                        className="absolute -top-8 -right-8 p-6 bg-yellow-400 border-4 border-black rounded-full shadow-[12px_12px_0_0_rgba(0,0,0,1)] cursor-pointer"
                    >
                        <span className="font-black text-2xl uppercase italic tracking-tighter text-black">0% FEE</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </section>
);

// ARCHETYPES (STORY: MAYA, LEON, APEX)
const Solutions = () => {
    const cardVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } } };
    
    return (
    <section id="solutions" className="py-32 bg-[#F0F2F5] border-b-8 border-black">
        <div className="container max-w-[1400px] mx-auto px-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24 flex flex-col items-center text-center max-w-4xl mx-auto">
                <h2 className="text-[42px] md:text-[64px] font-[1000] leading-[0.85] uppercase tracking-tighter mb-10 italic">WHO IS BIOTRA FOR?</h2>
                <p className="inline-block px-4 py-2 bg-yellow-400 text-black border-2 border-black rounded-lg text-xl font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)]">REAL PEOPLE GETTING THEIR FREEDOM.</p>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Maya - The Creator */}
                <motion.div variants={cardVariants} whileHover={{ y: -10, rotate: -1 }} className="bg-white border-8 border-black p-12 rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col items-start gap-10 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-pink-300 border-4 border-black rounded-[24px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <User size={40} className="stroke-[3]" />
                    </div>
                    <div>
                        <h3 className="text-[32px] font-[1000] uppercase italic leading-none mb-6">Maya: The Creator</h3>
                        <p className="text-sm font-black text-black/60 leading-relaxed mb-8 uppercase">
                           UNIFY 12 DIFFERENT LINKS INTO ONE POWERFUL HUB. <span className="font-black text-black bg-yellow-200 px-1 border border-black inline-block">SIMPLE, SMART, AND SECURE.</span>
                        </p>
                        <p className="text-[10px] font-black uppercase text-pink-600 underline decoration-2 underline-offset-4">"GET ORGANIZED."</p>
                    </div>
                </motion.div>

                {/* Leon - The Shop */}
                <motion.div variants={cardVariants} whileHover={{ y: -10, scale: 1.02 }} className="bg-white border-8 border-black p-12 rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col items-start gap-10 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-yellow-400 border-4 border-black rounded-[24px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <ShoppingCart size={40} className="stroke-[3]" />
                    </div>
                    <div>
                        <h3 className="text-[32px] font-[1000] uppercase italic leading-none mb-6">Leon: The Shop</h3>
                        <p className="text-sm font-black text-black/60 leading-relaxed mb-8 uppercase">
                           KEEP 100% OF YOUR PROFITS. NO PLATFORM FEES. <span className="font-black text-white bg-black px-1 border border-black inline-block">100% OWNERSHIP.</span>
                        </p>
                        <p className="text-[10px] font-black uppercase text-yellow-600 underline decoration-2 underline-offset-4">"SELL DIRECT."</p>
                    </div>
                </motion.div>

                {/* Apex - The Brand */}
                <motion.div variants={cardVariants} whileHover={{ y: -10, rotate: 1 }} className="bg-white border-8 border-black p-12 rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col items-start gap-10 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-emerald-400 border-4 border-black rounded-[24px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <Globe size={40} className="stroke-[3]" />
                    </div>
                    <div>
                        <h3 className="text-[32px] font-[1000] uppercase italic leading-none mb-6">Apex: The Brand</h3>
                        <p className="text-sm font-black text-black/60 leading-relaxed mb-8 uppercase">
                           TRACK DATA WITHOUT COMPROMISING USER TRUST. <span className="font-black text-black bg-emerald-300 px-1 border border-black inline-block">UNSHAKEABLE INTEGRITY.</span>
                        </p>
                        <p className="text-[10px] font-black uppercase text-emerald-600 underline decoration-2 underline-offset-4">"PROTECT RIVACY."</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    </section>
    );
};

// FAQ / ANSWER ENGINE (AEO)
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "WHAT IS BIOTRA?",
            answer: "IT IS YOUR PERSONAL WEBSITE. YOU OWN ALL THE DATA AND THE DESIGN. IT IS ONE LINK THAT SHOWS ALL YOUR SOCIALS AND PRODUCTS."
        },
        {
            question: "IS IT REALLY FREE?",
            answer: "YES. WE DO NOT TAKE ANY MONEY FROM YOUR SALES. WE TAKE 0%. YOU KEEP 100% OF WHAT YOU SELL."
        },
        {
            question: "IS IT HARD TO BUILD?",
            answer: "NO. IT IS VERY EASY. NO CODING NEEDED. JUST DRAG, DROP, AND LOOK GREAT IN MINUTES."
        },
        {
            question: "WHERE DOES IT WORK?",
            answer: "IT WORKS EVERYWHERE IN THE WORLD. ANYONE CAN SEE YOUR PAGE ON THEIR PHONE OR COMPUTER."
        },
        {
            question: "CAN I USE MY OWN NAME?",
            answer: "YES. YOU CAN USE YOUR OWN CUSTOM DOMAIN (LIKE MYNAME.COM) TO MAKE YOUR BRAND LOOK SUCCESSFUL."
        }
    ];

    return (
        <section className="py-40 bg-[#F0F2F5] border-b-8 border-black">
            {/* AEO Schema Injection */}
            <script 
                type="application/ld+json" 
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqs.map(faq => ({
                            "@type": "Question",
                            "name": faq.question,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.answer
                            }
                        }))
                    })
                }} 
            />
            <div className="container max-w-[1000px] mx-auto px-10">
                <div className="mb-20">
                    <div className="inline-block px-4 py-2 bg-pink-300 text-black font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">QUESTIONS</div>
                    <h2 className="text-[48px] md:text-[82px] font-[1000] leading-[0.85] tracking-tighter uppercase mb-6">
                        ANSWERS <br /> <span className="italic text-emerald-500 underline decoration-[12px] underline-offset-4">HERE.</span>
                    </h2>
                    <p className="text-xl font-bold text-black/60 max-w-2xl uppercase">SIMPLE ANSWERS FOR REAL HUMANS.</p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white border-4 border-black rounded-[24px] overflow-hidden shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all">
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-emerald-400 transition-colors text-left group"
                            >
                                <span className="text-xl sm:text-2xl font-[1000] uppercase tracking-tight pr-8 text-black">{faq.question}</span>
                                <div className={cn("w-10 h-10 shrink-0 border-4 border-black rounded-full flex items-center justify-center transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white group-hover:shadow-none group-hover:translate-y-[2px] group-hover:translate-x-[2px]", openIndex === i ? "rotate-90 bg-black *:stroke-white" : "")}>
                                    <ChevronRight className="w-5 h-5 stroke-[4] transition-colors" />
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div 
                                        initial={{ height: 0 }} 
                                        animate={{ height: "auto" }} 
                                        exit={{ height: 0 }}
                                        className="overflow-hidden bg-[#FEF08A]"
                                    >
                                        <div className="p-8 border-t-4 border-black">
                                            <p className="text-lg font-bold text-black/80 leading-relaxed italic">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// TESTIMONIALS (VOICES FROM THE VOID)
const Testimonials = () => {
   const { scrollYProgress } = useScroll();
   const xMove = useTransform(scrollYProgress, [0.6, 1], [0, -600]);

   return (
      <section className="py-60 bg-[#FEF08A] border-y-8 border-black relative overflow-hidden">
         <div className="container max-w-[1400px] mx-auto px-10 relative z-10">
            <div className="mb-32 flex flex-col items-center text-center">
               <h2 className="text-[50px] md:text-[84px] font-[1000] uppercase tracking-tighter leading-none mb-12">
                  <span className="bg-emerald-400 px-6 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">VOICES</span> <br /> 
                  FROM THE VOID.
               </h2>
               <p className="text-xl font-[1000] uppercase text-black/30 tracking-[0.2em]">REAL PAGES ONLINE NOW.</p>
            </div>

            <motion.div style={{ x: xMove }} className="flex gap-16 cursor-grab active:cursor-grabbing">
               {[
                  { name: "@ALEX_TECH", quote: "THE ONLY SITE THAT LETS ME OWN MY STUFF. NO FEES. NO LIMITS.", color: "bg-white" },
                  { name: "@SARAH_ART", quote: "DESIGN STUDIO LET ME BUILD MY BRAND EXACTLY HOW I WANTED. TOTAL FREEDOM.", color: "bg-emerald-400" },
                  { name: "@NODE_RUNNER", quote: "QR CODES ARE AMAZING FOR MY SHOP. THEY WORK PERFECTLY EVERY TIME.", color: "bg-pink-300" },
                  { name: "@CRYPTO_KING", quote: "DIRECT SALES WITH NO MIDDLEMEN. THIS IS HOW THE INTERNET SHOULD BE.", color: "bg-yellow-400" },
                  { name: "@MINT_SOUL", quote: "OWNING MY DATA IS EVERYTHING. BIOTRA IS THE BEST. I AM SECURE.", color: "bg-white" }
               ].map((t, i) => (
                  <motion.div 
                     key={i}
                     whileHover={{ rotate: 0, scale: 1.05 }}
                     className={cn("min-w-[400px] p-12 border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] rounded-[40px] flex flex-col gap-10 rotate-[-2deg]", t.color)}
                  >
                     <div className="flex gap-2">
                        {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-5 h-5 fill-black" />)}
                     </div>
                     <div className="flex flex-col gap-6">
                        <MessageCircle size={32} className="text-black/20" />
                        <p className="text-[26px] font-semibold tracking-tight leading-[1.3] text-black">"{t.quote}"</p>
                     </div>
                     <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 bg-black border-2 border-black rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t.name}</span>
                     </div>
                  </motion.div>
               ))}
            </motion.div>
         </div>
      </section>
   );
};

// TEAM SECTION (VOICE: THE LEGENDS)
const TeamSection = () => {
  const members = [
    {
      name: "MIA",
      role: "CEO",
      color: "bg-[#FBCFE8]",
      desc: "LEAD VISIONARY AND STRATEGIC BISCUITS ENTHUSIAST. ENSURES ALL OPERATIONS MEET THE HIGHEST STANDARDS OF CUTENESS AND COMFORT."
    },
    {
      name: "BILLU",
      role: "CTO",
      color: "bg-white",
      desc: "CHIEF TECHNICAL ORCHESTRATOR. MASTER OF SYSTEM PURR-FORMANCE AND CLOUD-CLIMBING ARCHITECTURES. ALWAYS WATCHES THE MICE (AND BUGS)."
    },
    {
      name: "MYRA",
      role: "CMO",
      color: "bg-[#EF4444]",
      desc: "CHIEF MARKETING OFFICER. EXPERT IN BRAND FLUFFINESS AND GLOBAL PAWPRINT EXPANSION. SPECIALIZES IN HEAVY-DUTY LOYALTY PROGRAMS."
    },
    {
      name: "BRANDY",
      role: "CXO",
      color: "bg-[#FBBF24]",
      desc: "CHIEF EXPERIENCE ORCHESTRATOR. OVERSEES THE USER JOURNEY FROM LANDING TO NAP-TIME. EXPERT IN HIGH-FRICTION CARPET DYNAMICS."
    }
  ];

  return (
    <section id="team" className="py-32 bg-[#F0F2F5] border-b-8 border-black overflow-hidden">
      <div className="container max-w-[1400px] mx-auto px-10">
        <div className="mb-24 flex flex-col items-center text-center">
            <h2 className="text-[48px] md:text-[82px] font-[1000] leading-[0.85] tracking-tighter uppercase mb-8 italic">
              THE <span className="bg-emerald-400 px-6 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">LEGENDS</span> <br /> BEHIND BIOTRA
            </h2>
            <p className="text-[14px] font-[1000] uppercase text-black/40 tracking-[0.4em]">PIONEER NODES // STRATEGIC ORCHESTRATION</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {members.map((m, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="flex flex-col items-center group"
            >
              <div className={cn(
                "w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] border-8 border-black rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-none mb-10 overflow-hidden relative",
                m.color
              )}>
                 <div className="absolute inset-x-0 bottom-0 py-4 bg-black/5 text-center font-black uppercase text-[10px] tracking-widest hidden group-hover:block">
                   Node Verified
                 </div>
              </div>
              <h3 className="text-3xl font-[1000] uppercase tracking-tighter mb-2">{m.name}</h3>
              <div className="px-6 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest mb-8 border-2 border-black rounded">
                {m.role}
              </div>
              <div className="relative p-8 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex-1">
                 <div className="absolute top-0 right-0 w-8 h-8 -translate-y-4 translate-x-4 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <User size={14} className="stroke-[3]" />
                 </div>
                 <p className="text-[12px] font-black leading-relaxed uppercase text-black/70">
                   {m.desc}
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// UNIVERSE SECTION (VOICE: THE MANY)
const UniverseSection = () => {
    const categories = [
        {
            title: "Creators & Influencers",
            color: "bg-[#FEF08A]", // Yellow
            items: ["Instagram Influencer", "YouTuber", "TikTok Creator", "Blogger", "Content Creator", "Affiliate Marketer"]
        },
        {
            title: "🛍️ E-commerce & Sellers",
            color: "bg-[#D1FAE5]", // Emerald
            items: ["Small Business Owner", "Online Store", "Dropshipper", "Instagram Seller", "Etsy Seller", "Reseller"]
        },
        {
            title: "💼 Professionals",
            color: "bg-[#DBEAFE]", // Blue
            items: ["Freelancer", "Consultant", "Coach / Mentor", "Job Seeker", "Personal Brand", "Speaker"]
        },
        {
            title: "🎤 Artists & Musicians",
            color: "bg-[#FBCFE8]", // Pink
            items: ["Musician", "Singer", "DJ", "Band", "Performer", "Visual Artist"]
        },
        {
            title: "🏢 Businesses & Startups",
            color: "bg-[#CFFAFE]", // Cyan
            items: ["Startup", "Agency", "Company / Brand", "Restaurant / Cafe", "Real Estate Agent", "Service Provider"]
        },
        {
            title: "💅 Beauty & Lifestyle",
            color: "bg-[#FFEDD5]", // Orange
            items: ["Makeup Artist", "Fashion Influencer", "Fitness Trainer", "Wellness Coach", "Salon / Spa", "Bakers"]
        },
        {
            title: "🎮 Gaming",
            color: "bg-[#EDE9FE]", // Purple
            items: ["Gamer", "Streamer", "Esports Player", "Entertainment Creator"]
        },
        {
            title: "🎓 Educators & Health",
            color: "bg-[#F3F4F6]", // gray
            items: ["Teacher", "Course Creator", "Tutor", "Doctor", "Yoga Instructor", "Gym Owner"]
        }
    ];

    return (
        <section id="universe" className="py-32 bg-white border-b-8 border-black">
            <div className="container max-w-[1400px] mx-auto px-10">
                <div className="mb-24 flex flex-col items-center text-center">
                    <div className="inline-block px-4 py-2 bg-black text-white font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(16,185,129,1)]">VERSATILITY NODE</div>
                    <h2 className="text-[48px] md:text-[82px] font-[1000] leading-[0.85] tracking-tighter uppercase mb-8 italic">
                      THE <span className="bg-yellow-400 px-6 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">UNIVERSAL</span> <br /> HUB.
                    </h2>
                    <p className="text-[14px] font-[1000] uppercase text-black/40 tracking-[0.4em]">CROSS-INDUSTRY SYNC // LIMITLESS IDENTITY</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((cat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className={cn(
                                "p-8 border-4 border-black rounded-[32px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-6 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all",
                                cat.color
                            )}
                        >
                            <h3 className="text-xl font-[1000] uppercase tracking-tighter border-b-2 border-black/10 pb-4">{cat.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {cat.items.map((item, j) => (
                                    <span key={j} className="px-3 py-1.5 bg-white/50 border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 p-12 bg-black text-white rounded-[48px] border-4 border-black shadow-[16px_16px_0_0_rgba(16,185,129,1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                                <Rocket className="w-4 h-4" /> Pro Tip
                            </div>
                            <h3 className="text-3xl md:text-5xl font-[1000] uppercase mb-6 leading-none tracking-tighter">MIX & MATCH YOUR STACK.</h3>
                            <p className="text-lg font-black text-white/60 uppercase">
                                BIOTRA IS MODULAR. A DOCTOR CAN SELL COURSES, A MUSICIAN CAN BOOK GIGS, AND A STARTUP CAN BUILD A COMMUNITY. ONE ACCOUNT. ALL TOOLS.
                            </p>
                        </div>
                        <Link to="/register" className="shrink-0 px-12 py-6 bg-emerald-400 text-black border-4 border-black rounded-2xl text-xl font-[1000] uppercase tracking-widest shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                            JOIN THE UNIVERSE
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

// END OF SECTIONS

export default function Index() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white text-black selection:bg-black selection:text-white font-sans antialiased overflow-x-hidden">
            <AnimatePresence mode="wait">
                {loading && <ExtremeLoader key="loader" />}
            </AnimatePresence>

            <LandingNav />
            <Hero />
            
            <div className="bg-emerald-400 py-10 border-y-8 border-black flex items-center overflow-hidden">
                <motion.div 
                    animate={{ x: [0, -3000] }} 
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex gap-12 whitespace-nowrap"
                >
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex items-center gap-12 text-[52px] font-[1000] uppercase italic tracking-tighter">
                            <span>DIGITAL ID + LINK IN BIO</span>
                            <Globe size={48} strokeWidth={3} className="text-black" />
                            <span>AI POWERED HUB</span>
                            <Sparkles size={48} strokeWidth={3} className="text-black" />
                            <span>SHOPPING CATALOG</span>
                            <ShoppingCart size={48} strokeWidth={3} className="text-black" />
                            <span>QR CODE GENERATOR</span>
                            <QrCode size={48} strokeWidth={3} className="text-black" />
                            <span>POWERING CREATORS & SMBs</span>
                            <Zap className="fill-black" size={48} />
                            <span>UNLIMITED SOCIAL SHARING</span>
                            <Rocket size={48} strokeWidth={3} className="text-black" />
                        </div>
                    ))}
                </motion.div>
            </div>

            <StudioSection />
            <ForgeSection />
            <CommerceSection />

            {/* NEW: HOW IT HELPS */}
            <section className="py-32 bg-white border-b-8 border-black">
                <div className="container max-w-[1400px] mx-auto px-10 text-center">
                    <h2 className="text-[42px] md:text-[64px] font-[1000] uppercase mb-16 tracking-tighter">HOW IT HELPS YOU</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: "CONNECT EVERYTHING", desc: "ONE LINK FOR ALL YOUR SOCIALS AND SHOP." },
                            { title: "SHARE EVERYWHERE", desc: "PUT YOUR LINK IN YOUR BIO AND ON POSTS." },
                            { title: "GROW FAST", desc: "SEE YOUR FANS AND SALES INCREASE EVERY DAY." }
                        ].map((item, i) => (
                            <div key={i} className="p-12 border-4 border-black rounded-[32px] shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-[#D1FAE5]">
                                <h3 className="text-2xl font-[1000] mb-4">{item.title}</h3>
                                <p className="font-black text-black/60 uppercase">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEW: HOME-BASED HEROES */}
            <section className="py-32 bg-pink-300 border-b-8 border-black overflow-hidden">
                <div className="container max-w-[1400px] mx-auto px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <h2 className="text-[42px] md:text-[64px] font-[1000] uppercase mb-10 leading-none">SUPPORTING <br /> HOME MAKERS.</h2>
                            <p className="text-xl font-black mb-12 uppercase leading-relaxed">
                                WE SUPPORT WOMEN WHO RUN BUSINESSES FROM HOME. WHETHER YOU SELL CLOTHES, FOOD, OR ART, BIOTRA HELPS YOU REACH MORE CUSTOMERS.
                            </p>
                            <div className="p-8 bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex items-center gap-6">
                                <Heart className="w-12 h-12 text-red-500 fill-red-500" />
                                <div className="font-black uppercase">"BIOTRA GAVE ME THE POWER TO SELL MY PRODUCTS INTERNATIONALLY FROM MY KITCHEN."</div>
                            </div>
                        </motion.div>
                        <div className="relative">
                            <div className="w-full aspect-square bg-white border-8 border-black rounded-[40px] shadow-[24px_24px_0_0_rgba(0,0,0,1)] flex items-center justify-center p-12">
                                <img src="/images/qr_feature.png" alt="Biotra QR Connect" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Solutions />
            <TeamSection />
            <UniverseSection />
            <FAQSection />
            <Testimonials />
            <LandingFooter />
            <ChatWidget />
        </div>
    );
}
