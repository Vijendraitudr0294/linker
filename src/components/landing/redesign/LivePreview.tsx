import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Eye, Heart, Check, Smartphone, Palette, Zap } from "lucide-react";

const LivePreview = () => {
    const [theme, setTheme] = useState("dark");
    const [activeTab, setActiveTab] = useState("links");
    
    const themes = [
        { id: "dark", color: "bg-black", accent: "var(--primary)", name: "Onyx" },
        { id: "vibrant", color: "bg-indigo-950", accent: "var(--vibrant-pink)", name: "Candy" },
        { id: "neon", color: "bg-cyan-950", accent: "var(--vibrant-cyan)", name: "Neon" }
    ];

    const content = {
        links: [
            { id: 1, title: "Latest Portfolio", icon: Eye },
            { id: 2, title: "Digital Store", icon: ShoppingBag },
            { id: 3, title: "Join Community", icon: Heart }
        ]
    };

    return (
        <section className="py-24 lg:py-40 bg-background relative overflow-hidden font-body transition-colors duration-700">
            {/* Background Decorative */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] opacity-10 blur-[180px] pointer-events-none" 
                 style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.3) 0%, transparent 70%)' }} />
            
            <div className="boutique-container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                
                {/* Left: Messaging */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="max-w-[540px]"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="px-5 py-2 rounded-full border border-surface-border bg-surface-glass backdrop-blur-3xl shadow-xl">
                            <span className="text-[10px] font-mono tracking-widest text-primary font-black uppercase">Real-time Experience</span>
                        </div>
                    </div>
                    <h2 className="text-[44px] md:text-[64px] font-display font-black leading-[1] mb-10 text-foreground tracking-tighter">
                       Design at the <br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-vibrant-pink to-vibrant-yellow bg-[length:200%_auto] animate-gradient-slow italic">speed of vibe.</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-light leading-relaxed mb-12">
                        Create a digital presence that feels like you. Our design studio is built for the next generation of creators who demand precision and energy in every pixel.
                    </p>

                    <div className="grid grid-cols-1 gap-6 mb-12">
                        {[
                            { icon: Palette, title: "Gen-Z Aesthetic", desc: "Trendy presets designed for maximum impact and personality." },
                            { icon: Zap, title: "Instant Feedback", desc: "No more refreshes. Change your universe in under 100ms." }
                        ].map((feat, i) => (
                            <div key={i} className="flex gap-6 items-start group">
                                <div className="w-12 h-12 rounded-2xl bg-surface-glass border border-surface-border flex items-center justify-center flex-shrink-0 group-hover:border-primary transition-colors">
                                    <feat.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <h4 className="text-[16px] font-black text-foreground mb-1 uppercase tracking-widest">{feat.title}</h4>
                                    <p className="text-[14px] text-muted-foreground/60 leading-relaxed">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Phone Preview Interaction */}
                <div className="relative flex flex-col items-center">
                    
                    {/* Theme Switcher Overlay */}
                    <div className="absolute -left-12 top-10 z-30 flex flex-col gap-4">
                        {themes.map(t => (
                            <motion.button
                                key={t.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setTheme(t.id)}
                                className={`w-32 px-5 py-4 rounded-2xl flex items-center justify-between border transition-all shadow-2xl ${
                                    theme === t.id 
                                    ? "bg-primary text-white border-primary" 
                                    : "bg-surface-glass text-muted-foreground border-surface-border backdrop-blur-3xl"
                                }`}
                            >
                                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">{t.name}</span>
                                {theme === t.id && <Check className="w-3 h-3" />}
                            </motion.button>
                        ))}
                    </div>

                    {/* Phone Frame */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="w-[320px] h-[640px] rounded-[3.8rem] bg-neutral-900 border-[10px] border-[#1A1A1A] shadow-5xl relative overflow-hidden"
                    >
                        {/* Dynamic Camera Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#1A1A1A] rounded-b-3xl z-20" />
                        
                        {/* Dynamic Background Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className={`absolute inset-0 ${
                                    theme === 'dark' ? 'bg-black' : 
                                    theme === 'vibrant' ? 'bg-gradient-to-b from-[#4F1A3D] to-black' : 
                                    'bg-gradient-to-b from-[#0A2E36] to-black'
                                } p-8 pt-24 flex flex-col items-center`}
                            >
                                {/* Mock Avatar */}
                                <div className="w-24 h-24 rounded-full border-[3px] border-white/10 p-1.5 mb-8 shadow-2xl">
                                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-primary via-vibrant-pink to-vibrant-yellow animate-gradient-slow" />
                                    </div>
                                </div>
                                
                                <div className="text-center mb-12">
                                    <h5 className="text-2xl font-display font-black text-white mb-3 tracking-tighter transition-all">Alex Volkov</h5>
                                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 font-bold">DIGITAL ARCHITECT</p>
                                </div>

                                <div className="w-full space-y-4">
                                    {content.links.map((link, i) => (
                                        <motion.div
                                            key={link.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 + 0.3 }}
                                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                                            className="w-full py-5 px-8 rounded-3xl bg-white/[0.04] border border-white/5 flex items-center justify-between group cursor-pointer transition-all shadow-lg"
                                        >
                                            <span className="text-[13px] font-bold text-white/90 tracking-tight">{link.title}</span>
                                            <link.icon className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Floating Action */}
                                <div className="mt-auto w-full flex justify-center pb-6">
                                    <div className="px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-inner">
                                        <span className="text-[10px] font-mono text-white/20 tracking-[0.2em] leading-none uppercase font-black uppercase tracking-tighter">Verified Studio</span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Status Floating Pill */}
                    <div className="absolute -right-12 bottom-32 z-30">
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-background/80 backdrop-blur-3xl border border-surface-border px-8 py-5 rounded-[2.5rem] shadow-5xl flex items-center gap-5 transition-colors"
                        >
                            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Satellite Status</span>
                                <span className="text-[14px] font-display font-black text-foreground tracking-tight">Vibe Sync: Active</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LivePreview;
