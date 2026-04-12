import { motion } from "framer-motion";
import { Instagram, Twitter, Github, Linkedin, Rocket, Compass, Layers, ShieldCheck, Zap, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LandingFooter = () => {
   return (
      <footer className="bg-[#060608] py-40 border-t border-white/10 relative flex flex-col items-center overflow-hidden font-sans">
         {/* Background Typography Marquee - Subtler for Dark Theme */}
         <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
            <motion.div 
               animate={{ x: [-500, 500] }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
               className="text-[300px] font-black uppercase whitespace-nowrap text-white italic tracking-tighter"
            >
               BIOTRA BIOTRA BIOTRA BIOTRA BIOTRA
            </motion.div>
         </div>

         <div className="container max-w-[1300px] mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 mb-40">
            {/* Brand Info (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-10 items-start">
               <Link to="/" className="flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:rotate-12">
                      <Sparkles className="w-8 h-8 text-white fill-white/20" />
                  </div>
                  <span className="font-black text-3xl tracking-tighter uppercase italic text-white font-display">BIOTRA</span>
               </Link>
               <p className="text-[14px] font-semibold text-white/40 uppercase tracking-[0.2em] leading-loose max-w-sm">
                  The mission-control for elite creators. Orchestrate your digital commerce, content nodes, and audience intelligence.
               </p>
               <div className="flex gap-4">
                  {[Instagram, Twitter, Github, Linkedin].map((Icon, i) => (
                     <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer shadow-lg"
                     >
                        <Icon size={20} />
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Links (4 cols) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-10 md:gap-20">
               <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Protocols</h4>
                  <div className="flex flex-col gap-5 text-[12px] font-bold uppercase tracking-widest text-white/40">
                     <a href="/#studio" className="hover:text-primary transition-all">Studio</a>
                     <a href="/#forge" className="hover:text-primary transition-all">QR Forge</a>
                     <a href="/#solutions" className="hover:text-primary transition-all">Solutions</a>
                     <Link to="/faq" className="hover:text-primary transition-all">Knowledge</Link>
                  </div>
               </div>
               <div className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Sovereignty</h4>
                  <div className="flex flex-col gap-5 text-[12px] font-bold uppercase tracking-widest text-white/40">
                     <Link to="/privacy" className="hover:text-primary transition-all">Privacy</Link>
                     <Link to="/security" className="hover:text-primary transition-all">Security</Link>
                     <a href="/register" className="hover:text-primary transition-all">Beta Access</a>
                     <a href="mailto:support@biotra.cc" className="hover:text-primary transition-all">Support</a>
                  </div>
               </div>
            </div>

            {/* Newsletter (4 cols) */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 p-10 rounded-[40px] flex flex-col items-start gap-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
               <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-none">JOIN THE <br /> <span className="text-primary italic font-display lowercase">network</span>.</h4>
               <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 leading-relaxed">Weekly creator insights, AI tools, and growth tactics.</p>
               <div className="w-full relative">
                  <input type="email" placeholder="ARCHITECT@NETWORK.CC" className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all shadow-2xl" />
                  <button className="absolute right-2 top-2 w-12 h-12 bg-primary rounded-xl flex items-center justify-center hover:brightness-110 transition-all active:scale-95 shadow-lg cursor-pointer">
                     <Send size={18} className="text-white" />
                  </button>
               </div>
            </div>
         </div>

         {/* Bottom Bar */}
         <div className="w-full border-t border-white/5 pt-12 px-10 flex flex-col items-center gap-10">
            <div className="flex items-center gap-8 text-white/5">
               <Rocket size={32} />
               <Compass size={32} />
               <Layers size={32} />
               <ShieldCheck size={32} />
            </div>
            <div className="flex flex-col md:flex-row gap-8 text-[10px] items-center font-black uppercase tracking-[0.4em] text-white/20 text-center md:text-left">
               <span>© 2026 BIOTRA PROTOCOL — ARCHITECTING SOVEREIGNTY.</span>
               <div className="flex gap-6">
                  {["Privacy", "Security", "Terms"].map(v => <span key={v} className="hover:text-white cursor-pointer transition-colors uppercase tracking-[0.3em]">{v}</span>)}
               </div>
            </div>
         </div>
      </footer>
   );
};
