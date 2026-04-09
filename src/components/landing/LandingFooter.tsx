import { motion } from "framer-motion";
import { Instagram, Twitter, Github, Linkedin, Rocket, Compass, Layers, ShieldCheck, Zap, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LandingFooter = () => {
   return (
      <footer className="bg-white py-40 border-t-8 border-black relative flex flex-col items-center overflow-hidden">
         {/* Background Typography Marquee */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <motion.div 
               animate={{ x: [-1000, 1000] }}
               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
               className="text-[400px] font-[1000] uppercase whitespace-nowrap text-black italic tracking-tighter"
            >
               BIOTRA BIOTRA BIOTRA BIOTRA BIOTRA
            </motion.div>
         </div>

         <div className="container max-w-[1400px] mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-32 mb-40">
            {/* Brand Info */}
            <div className="flex flex-col gap-12 items-start">
               <Link to="/" className="flex items-center gap-4 hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-emerald-400 border-4 border-black rounded-[20px] flex items-center justify-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                      <Zap className="text-black w-10 h-10 fill-black" />
                  </div>
                  <span className="font-[1000] text-3xl tracking-tighter uppercase italic text-black">BIOTRA</span>
               </Link>
               <p className="text-sm font-black uppercase text-black/50 tracking-[0.2em] leading-relaxed">
                  The Ultimate Digital OS for Creators. <br /> Build your bio, storefront, and community in one place.
               </p>
               <div className="flex gap-6">
                  {[
                     { Icon: Instagram, color: "bg-pink-300" },
                     { Icon: Twitter, color: "bg-sky-400" },
                     { Icon: Github, color: "bg-yellow-400" },
                     { Icon: Linkedin, color: "bg-[#D1FAE5]" }
                  ].map(({ Icon, color }, i) => (
                     <motion.div 
                        key={i}
                        whileHover={{ y: -6, rotate: 6 }}
                        className={cn("w-14 h-14 border-4 border-black rounded-2xl flex items-center justify-center transition-all cursor-pointer text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]", color)}
                     >
                        <Icon size={24} strokeWidth={3} />
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-20">
               <div className="space-y-10">
                  <h4 className="inline-block px-4 py-2 bg-yellow-400 text-black border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-[0.5em] italic shadow-[4px_4px_0_0_rgba(0,0,0,1)]">PLATFORM</h4>
                  <div className="flex flex-col gap-6 text-[12px] font-black uppercase tracking-widest text-black/60">
                     <a href="/#studio" className="hover:text-black hover:translate-x-2 transition-all">Studio</a>
                     <a href="/#forge" className="hover:text-black hover:translate-x-2 transition-all">QR Forge</a>
                     <a href="/#solutions" className="hover:text-black hover:translate-x-2 transition-all">Solutions</a>
                     <Link to="/faq" className="hover:text-black hover:translate-x-2 transition-all">Knowledge Base</Link>
                  </div>
               </div>
               <div className="space-y-10">
                  <h4 className="inline-block px-4 py-2 bg-pink-300 text-black border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-[0.5em] italic shadow-[4px_4px_0_0_rgba(0,0,0,1)]">COMMUNITY</h4>
                  <div className="flex flex-col gap-6 text-[12px] font-black uppercase tracking-widest text-black/60">
                     <Link to="/privacy" className="hover:text-black hover:translate-x-2 transition-all">Privacy Policy</Link>
                     <Link to="/security" className="hover:text-black hover:translate-x-2 transition-all">Security Hub</Link>
                     <a href="/register" className="hover:text-black hover:translate-x-2 transition-all">Beta Access</a>
                     <a href="mailto:support@biotra.cc" className="hover:text-black hover:translate-x-2 transition-all">Support</a>
                  </div>
               </div>
            </div>

            {/* Newsletter */}
            <div className="bg-[#FBCFE8] p-12 rounded-[40px] border-8 border-black flex flex-col items-start gap-8 text-black shadow-[24px_24px_0_0_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform duration-500">
               <h4 className="text-4xl font-[1000] uppercase italic tracking-tighter leading-[0.9]">JOIN THE <br /> CREATOR HUB.</h4>
               <p className="text-[11px] font-black uppercase tracking-widest text-black/60 leading-relaxed">Weekly creator insights, AI tools, and growth tactics.</p>
               <div className="w-full relative">
                  <input type="text" placeholder="HELLO@CREATOR.COM" className="w-full bg-white border-4 border-black p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all" />
                  <button className="absolute right-3 top-2 w-12 h-12 bg-emerald-400 border-4 border-black rounded-xl flex items-center justify-center hover:translate-y-1 transition-all active:scale-95 cursor-pointer">
                     <Send size={20} strokeWidth={4} />
                  </button>
               </div>
            </div>
         </div>

         {/* Bottom Bar */}
         <div className="w-full border-t-8 border-black pt-20 px-10 flex flex-col items-center gap-12 bg-[#FEF08A] mb-[-160px] pb-[160px]">
            <div className="flex items-center gap-6 text-black/20">
               <Rocket size={48} strokeWidth={2} />
               <Compass size={48} strokeWidth={2} />
               <Layers size={48} strokeWidth={2} />
               <ShieldCheck size={48} strokeWidth={2} />
            </div>
            <div className="flex flex-col md:flex-row gap-12 text-[10px] items-center font-black uppercase tracking-[0.4em] text-black text-center md:text-left leading-relaxed">
               <span>© 2024 BIOTRA – THE #1 AI-POWERED PLATFORM FOR MODERN CREATORS</span>
               <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
                  <Link to="/privacy" className="hover:text-pink-600 transition-colors bg-white px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">PRIVACY POLICY</Link>
                  <Link to="/security" className="hover:text-emerald-600 transition-colors bg-white px-4 py-2 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">SECURITY HUB</Link>
               </div>
            </div>
         </div>
      </footer>
   );
};
