import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Zap, Users, BarChart3, Globe, 
  Smartphone, ArrowRight, MousePointerClick, 
  MessageSquare, Heart, ShieldCheck, Sparkles,
  ShoppingBag, Layers, Activity, CreditCard,
  ChevronDown, Plus, ExternalLink, Mail,
  Twitter, Instagram, Github, PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- PREMIUM COMPONENTS ---
const FloatingUI = ({ children, className = "", delay = 0, yOffset = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y: yOffset }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.2, delay, ease: [0.23, 1, 0.32, 1] }}
    className={cn("absolute bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[40px] p-6 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)]", className)}
  >
    {children}
  </motion.div>
);

const BentoCard = ({ title, desc, icon: Icon, className = "", delay = 0, badge = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
    className={cn(
      "group relative overflow-hidden rounded-[40px] border border-black/5 bg-white p-10 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_48px_128px_-24px_rgba(0,0,0,0.08)]",
      className
    )}
  >
    {badge && (
      <div className="absolute top-8 right-8 px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">
        {badge}
      </div>
    )}
    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-[80px] transition-all duration-700 group-hover:bg-primary/10 group-hover:scale-110" />
    <div className="relative z-10">
      <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-black/[0.03] transition-all duration-500 group-hover:bg-primary group-hover:text-white">
        <Icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
      </div>
      <h3 className="mb-4 text-2xl font-black tracking-tight text-black">{title}</h3>
      <p className="text-[15px] font-medium leading-relaxed text-black/40">{desc}</p>
    </div>
  </motion.div>
);

const StatBadge = ({ value, label, sublabel }) => (
  <div className="space-y-2">
    <div className="text-4xl md:text-5xl font-black tracking-tighter text-black">{value}</div>
    <div className="space-y-0.5">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">{label}</div>
      <div className="text-[11px] font-bold text-black/60">{sublabel}</div>
    </div>
  </div>
);

export default function LutherLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F0F2F5] text-[#1D1D1F] font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* --- GOOGLE FONTS IMPORT --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-script { font-family: 'Dancing Script', cursive; }
        .glass-panel { background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.4); }
        .gradient-blur-1 { background: radial-gradient(circle, #D1FAE5 0%, transparent 70%); }
        .gradient-blur-2 { background: radial-gradient(circle, #DBEAFE 0%, transparent 70%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* --- NAVIGATION: Enhanced for Luther Aesthetic --- */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        scrolled ? "h-20 bg-white/70 backdrop-blur-xl border-b border-black/5" : "h-24 bg-transparent"
      )}>
        <div className="container max-w-[1300px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-[14px] bg-black flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-black">BIOTRA</span>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {[
              { label: "Platform", path: "/dashboard" },
              { label: "Marketplace", path: "/marketplace" },
              { label: "Pricing", path: "/pricing" },
              { label: "Changelog", path: "/changelog" }
            ].map((item) => (
              <span 
                key={item.label} 
                onClick={() => navigate(item.path)}
                className="text-[12px] font-black uppercase tracking-[0.2em] text-black/30 hover:text-black transition-all cursor-pointer relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-500 group-hover:w-full" />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-5">
             <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:flex text-[11px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">Login</Button>
             <Button onClick={() => navigate('/register')} className="rounded-full bg-black text-white hover:bg-black/90 px-10 py-6 h-14 text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.05] active:scale-95">
              Protocol: START
             </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-20">
        {/* --- BACKGROUND GLOWS --- */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] gradient-blur-1 opacity-40 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute top-1/4 left-0 w-[800px] h-[800px] gradient-blur-2 opacity-30 -translate-x-1/2 pointer-events-none" />

        {/* --- HERO SECTION: World-Class Impact --- */}
        <section className="relative min-h-[95vh] flex items-center overflow-hidden">
          <div className="container max-w-[1300px] mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            
            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="space-y-10 text-center lg:text-left relative z-20">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-black/5 shadow-xl transition-transform hover:scale-105 cursor-default">
                 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.25em] text-black">Active Node: GLOBAL REDIRECT</span>
              </div>
              
              <h1 className="text-[64px] md:text-[92px] font-black leading-[0.85] tracking-tight text-black">
                Architect the <br /> 
                <span className="text-primary italic font-script lowercase py-4 inline-block transform -rotate-2">voice of everyone</span>
                <br /> in any network.
              </h1>

              <p className="text-xl md:text-2xl text-black/50 max-w-[580px] font-medium leading-relaxed uppercase tracking-widest text-[12px]">
                The world's most advanced <span className="text-black font-black">Identity Orchestration Engine</span>. Connect, monetize, and scale with absolute mathematical clarity.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Button onClick={() => navigate('/register')} className="w-full sm:w-auto px-12 py-8 rounded-[32px] bg-black text-white font-black uppercase tracking-[0.2em] text-[14px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] hover:scale-[1.05] transition-all flex items-center gap-4">
                  Deploy Identity <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="w-full sm:w-auto h-16 px-10 rounded-[32px] font-black uppercase tracking-widest text-[11px] text-black/40 hover:text-black group">
                  <PlayCircle className="mr-3 w-6 h-6 text-black/20 group-hover:text-primary transition-colors" /> Watch the Protocol
                </Button>
              </div>
            </motion.div>

            {/* HERO VISUAL: Advanced Fragments */}
            <div className="relative h-[650px] hidden lg:block perspective-1000">
              <FloatingUI className="top-0 right-0 w-[320px] z-30" delay={0.2} yOffset={50}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center"><Activity className="w-6 h-6 text-emerald-600" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-black">Community Pulse</div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500" />
                       <div className="text-[10px] text-black/40 font-black uppercase tracking-widest">Live Syncing</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-emerald-600">93%</div>
                </div>
                <div className="space-y-2">
                   <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "93%" }} transition={{ duration: 2, delay: 1 }} className="h-full bg-emerald-500" />
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Engagement Saturation</p>
                </div>
              </FloatingUI>

              <FloatingUI className="bottom-12 left-0 w-[280px] z-10" delay={0.4} yOffset={70}>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <div className="text-[10px] font-black uppercase tracking-widest text-black/40">Market Sales</div>
                       <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-3xl font-black text-black">+$14,280.00</div>
                    <div className="flex gap-1.5 h-12 items-end">
                       {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((h, i) => (
                         <motion.div 
                           key={i} 
                           initial={{ height: 0 }} 
                           animate={{ height: `${h * 100}%` }} 
                           transition={{ duration: 1, delay: 0.8 + (i * 0.1) }} 
                           className="flex-1 bg-primary/20 rounded-t-sm" 
                         />
                       ))}
                    </div>
                 </div>
              </FloatingUI>

              <FloatingUI className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] !p-0 !rounded-[56px] z-20 overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-black/5" delay={0.6} yOffset={90}>
                 <div className="bg-black text-white p-12 space-y-10">
                    <div className="flex items-center justify-between">
                       <div className="flex -space-x-4">
                          {[1,2,3,4,5].map(i => <img key={i} src={`https://i.pravatar.cc/150?img=${i+20}`} className="w-12 h-12 rounded-full border-4 border-black" alt="user" />)}
                       </div>
                       <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"><Zap className="w-7 h-7 text-white" /></div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black leading-tight tracking-tight">Identity orchestration node fully operational.</h4>
                       <p className="text-[13px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">Status: <span className="text-primary">Verified</span> • Latency: 12ms</p>
                    </div>
                    <Button onClick={() => navigate('/register')} className="w-full rounded-[24px] bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] h-16 text-[11px] shadow-2xl">Establish Protocol</Button>
                 </div>
              </FloatingUI>
            </div>
          </div>
        </section>

        {/* --- COMPARISON: Legacy vs Protocol --- */}
        <section className="py-32 bg-[#F0F2F5] border-y border-black/5 relative overflow-hidden">
           <div className="container max-w-[1100px] mx-auto px-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="p-16 rounded-[56px] bg-white border border-black/5 shadow-2xl shadow-black/[0.02] flex flex-col justify-between group hover:shadow-black/5 transition-all duration-700">
                    <div>
                      <div className="h-14 w-14 rounded-2xl bg-black/5 flex items-center justify-center mb-10 text-black/20 group-hover:text-black/40 transition-colors">
                        <Layers className="w-7 h-7" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black/20 mb-8">Legacy Static Linkage</h4>
                      <h3 className="text-4xl font-black mb-8 leading-[0.9] text-black tracking-tighter">Old links do not <br /> connect human <br /> potential.</h3>
                      <p className="text-black/40 text-[16px] font-medium leading-relaxed">Traditional profiles are static digital graveyards. They lack soul, context, and the power to convert engagement into meaningful relationships.</p>
                    </div>
                    <div className="mt-12 pt-10 border-t border-black/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-black/20">Outcome: Engagement Decay</span>
                    </div>
                 </div>

                 <div className="p-16 rounded-[56px] bg-[#051913] text-white shadow-[0_64px_128px_-32px_rgba(5,25,19,0.4)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-700">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none blur-[100px]" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-10 text-white shadow-2xl shadow-primary/40">
                          <Activity className="w-7 h-7" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-8">Biotra Engine Protocol</h4>
                        <h3 className="text-4xl font-black mb-8 leading-[0.9] tracking-tighter">Automate your <br /> global presence <br /> <span className="text-primary italic font-script lowercase">instantaneously</span>.</h3>
                        <p className="text-white/50 text-[16px] font-medium leading-relaxed">Dynamic, intelligent and conversion-focused. BIOTRA turns every link into a living bridge between your identity and the global network.</p>
                      </div>
                      <div className="mt-12 pt-10 border-t border-white/10">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">Outcome: Absolute Impact</span>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- BENTO FEATURE GRID: Global Orchestration --- */}
        <section className="py-40">
           <div className="container max-w-[1300px] mx-auto px-6">
              <div className="text-center mb-28 space-y-6">
                 <h2 className="text-5xl md:text-7xl font-black tracking-tight text-black leading-[0.9]">Everything in one <br /> unified <span className="text-primary italic font-script lowercase">identity</span> ecosystem.</h2>
                 <p className="text-xl text-black/40 font-medium max-w-[700px] mx-auto leading-relaxed">Scaling your global presence shouldn't be fragmented. Our modules work together natively to automate your growth.</p>
              </div>

              <div className="grid md:grid-cols-6 lg:grid-cols-12 gap-8">
                 <BentoCard 
                    title="Identity Studio" 
                    desc="A world-class command center for your digital persona. Orchestrate multiple profiles, themes, and authority proof with absolute precision." 
                    icon={Layers}
                    className="md:col-span-6 lg:col-span-8"
                    badge="Master Node"
                 />
                 <BentoCard 
                    title="Digital Vault" 
                    desc="Monetize your expertise. Deploy a global marketplace for digital assets, bookings, and recurring revenue." 
                    icon={ShoppingBag}
                    className="md:col-span-6 lg:col-span-4"
                 />
                 <BentoCard 
                    title="Smart Link Matrix" 
                    desc="Dynamic, intelligent deep-linking architecture that adapts to user behavior and platform context." 
                    icon={MessageSquare}
                    className="md:col-span-6 lg:col-span-4"
                 />
                 <BentoCard 
                    title="Real-Time Insights" 
                    desc="Deep-layer interactions tracked with mathematical accuracy. Visualize your network's pulse as it happens." 
                    icon={BarChart3}
                    className="md:col-span-6 lg:col-span-8"
                    badge="Live Data"
                 />
              </div>
           </div>
        </section>

        {/* --- IDENTITY SHOWCASE: Professional Reveal --- */}
        <section className="py-20 relative">
           <div className="container max-w-[1300px] mx-auto px-6">
              <div className="rounded-[72px] bg-black text-white p-20 lg:p-32 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/10 opacity-30 blur-[100px] pointer-events-none" />
                 <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.05),transparent_50%)]" />
                 
                 <div className="grid lg:grid-cols-12 gap-20 items-center relative z-10">
                    <div className="lg:col-span-6 space-y-10">
                       <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                          Product Reveal
                       </div>
                       <h2 className="text-[52px] md:text-[80px] font-black leading-[0.85] tracking-tight">The Identity <br /> <span className="text-primary italic font-script lowercase">orchestration</span> studio.</h2>
                       <p className="text-xl text-white/50 font-medium leading-relaxed">
                          We redesigned the administrative experience from the ground up for high-capacity networks. Every tool you need to manifest your identity, now in one place.
                       </p>
                       <ul className="space-y-6 pt-6">
                          {[
                            "Multi-Node Profile Management",
                            "One-Click Theme Deployment",
                            "Direct Revenue Channel Integration",
                            "Verified Authority Stat Badging"
                          ].map(feature => (
                            <li key={feature} className="flex items-center gap-4 text-[13px] font-black uppercase tracking-widest text-white/80">
                               <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary"><CheckCircle2 className="w-4 h-4" /></div>
                               {feature}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="lg:col-span-6 relative">
                       <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                       <img 
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
                          alt="BIOTRA Studio Preview" 
                          className="rounded-[48px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)] border border-white/10 transform rotate-2 hover:rotate-0 transition-all duration-700" 
                       />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- PRICING PROTOCOL --- */}
        <section className="py-40">
           <div className="container max-w-[1200px] mx-auto px-6">
              <div className="text-center mb-28 space-y-4">
                 <h2 className="text-5xl font-black tracking-tight text-black">Pricing Protocol</h2>
                 <p className="text-lg text-black/40 font-medium">Clear, transparent authorization levels for your growth.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 {[
                   { name: "Entry Node", price: "$0", desc: "For rising architects", features: ["1 Identity Node", "Standard Redirects", "Basic Stats"], cta: "Deploy Now" },
                   { name: "Pro Authority", price: "$10", desc: "For professional networks", features: ["Unlimited Nodes", "Premium Themes", "Revenue Channels", "Deep Analytics"], cta: "Start Protocol", highlight: true },
                   { name: "Enterprise Hub", price: "Custom", desc: "For global organizations", features: ["White Label Nodes", "Dedicated API", "Priority Support", "SLA Guarantee"], cta: "Authorize Hub" }
                 ].map(plan => (
                   <div key={plan.name} className={cn(
                     "p-12 rounded-[56px] border flex flex-col justify-between transition-all duration-700",
                     plan.highlight ? "bg-black text-white border-black shadow-2xl scale-105" : "bg-white border-black/5 text-black hover:scale-[1.02]"
                   )}>
                      <div className="space-y-8">
                         <div>
                            <div className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-4", plan.highlight ? "text-primary" : "text-black/30")}>{plan.name}</div>
                            <div className="flex items-baseline gap-2">
                               <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                               <span className={cn("text-[13px] font-bold uppercase", plan.highlight ? "text-white/40" : "text-black/30")}>/mo</span>
                            </div>
                            <p className={cn("mt-4 text-[14px] font-medium", plan.highlight ? "text-white/50" : "text-black/40")}>{plan.desc}</p>
                         </div>
                         <ul className="space-y-4">
                            {plan.features.map(f => (
                              <li key={f} className="flex items-center gap-3 text-[12px] font-bold tracking-wide uppercase">
                                 <Plus className={cn("w-4 h-4", plan.highlight ? "text-primary" : "text-black/20")} />
                                 {f}
                              </li>
                            ))}
                         </ul>
                      </div>
                      <Button className={cn(
                        "mt-10 w-full h-16 rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all",
                        plan.highlight ? "bg-primary text-white hover:scale-105" : "bg-black/5 text-black hover:bg-black/10"
                      )}>
                        {plan.cta}
                      </Button>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- GLOBAL CONNECTIVITY FOOTER: The Matrix --- */}
        <footer className="py-32 bg-white border-t border-black/5 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none" />
           
           <div className="container max-w-[1300px] mx-auto px-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-16 lg:gap-24">
                 <div className="lg:col-span-4 space-y-10">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                       <div className="w-10 h-10 rounded-[14px] bg-black flex items-center justify-center shadow-xl">
                          <Sparkles className="w-6 h-6 text-white" />
                       </div>
                       <span className="text-2xl font-black tracking-tighter uppercase">BIOTRA</span>
                    </div>
                    <p className="text-[14px] font-medium text-black/40 leading-relaxed uppercase tracking-widest leading-loose">
                       Manifesting the next generation of digital authority. Built in the network for the network.
                    </p>
                    <div className="flex items-center gap-5">
                       {[Twitter, Instagram, Github].map((Icon, i) => (
                         <div key={i} className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center text-black/30 hover:bg-black hover:text-white transition-all cursor-pointer">
                           <Icon className="w-5 h-5" />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Product</h5>
                    <ul className="space-y-4">
                       {["Platform", "Features", "Marketplace", "Pricing"].map(v => (
                         <li key={v} className="text-[12px] font-bold text-black/40 hover:text-black transition-colors cursor-pointer uppercase tracking-widest">{v}</li>
                       ))}
                    </ul>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Company</h5>
                    <ul className="space-y-4">
                       {["About", "Changelog", "Status", "Contact"].map(v => (
                         <li key={v} className="text-[12px] font-bold text-black/40 hover:text-black transition-colors cursor-pointer uppercase tracking-widest">{v}</li>
                       ))}
                    </ul>
                 </div>

                 <div className="lg:col-span-4 space-y-10">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Subscribe to the Protocol</h5>
                    <div className="relative">
                       <input 
                          type="email" 
                          placeholder="node@network.com" 
                          className="w-full h-16 rounded-[24px] bg-black/[0.03] border-none px-8 text-[13px] font-bold placeholder:text-black/20 focus:bg-white focus:ring-2 focus:ring-black/5 transition-all shadow-inner" 
                       />
                       <Button className="absolute right-2 top-2 h-12 px-6 rounded-[18px] bg-black text-white hover:bg-black/90"><ArrowRight className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Join 50k+ architects across the global grid.</p>
                 </div>
              </div>

              <div className="mt-32 pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                    &copy; 2026 BIOTRA SYSTEM PROTOCOL. ALL RIGHTS RESERVED.
                 </div>
                 <div className="flex gap-10">
                    {["Privacy", "Terms", "Cookies"].map(item => <span key={item} className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 hover:text-black cursor-pointer transition-colors">{item}</span>)}
                 </div>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
}
