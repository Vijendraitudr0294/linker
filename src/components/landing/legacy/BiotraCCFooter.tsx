import { Link } from "react-router-dom";
import { Twitter, Instagram, Github, Linkedin, Send, Rocket, Compass, Layers, Shield, MessageCircle, Zap } from "lucide-react";

const BiotraCCFooter = () => {
  return (
    <footer className="relative bg-[#f8f9fa] overflow-hidden font-sans pt-24 border-t-8 border-black">
      {/* Background Watermark */}
      <div className="absolute bottom-10 left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0">
        <span className="text-[250px] font-black tracking-tighter text-black/[0.03] leading-none">BIOTRA</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-12 h-12 bg-[#4ADE80] border-4 border-black rounded-[12px] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                <Zap className="w-6 h-6 text-black fill-black" />
              </div>
              <span className="text-3xl font-[1000] tracking-tighter text-black uppercase italic">BIOTRA</span>
            </Link>

            <div className="space-y-2">
              <p className="text-black/60 font-[1000] uppercase tracking-widest text-xs leading-relaxed max-w-sm">
                THE ULTIMATE DIGITAL OS FOR CREATORS.
              </p>
              <p className="text-black/60 font-[1000] uppercase tracking-widest text-xs leading-relaxed max-w-sm">
                BUILD YOUR BIO, STOREFRONT, AND COMMUNITY IN ONE PLACE.
              </p>
            </div>

            <div className="flex gap-4">
               {[
                 { icon: Instagram, color: "bg-[#FBCFE8]", label: "Instagram" },
                 { icon: Twitter, color: "bg-[#38BDF8]", label: "Twitter" },
                 { icon: Github, color: "bg-[#FDE047]", label: "Github" },
                 { icon: Linkedin, color: "bg-[#86EFAC]", label: "LinkedIn" }
               ].map((social, i) => (
                 <a key={i} href="#" aria-label={social.label} className={`w-12 h-12 border-4 border-black rounded-full flex items-center justify-center text-black ${social.color} hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all`}>
                    <social.icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 space-y-8">
            <div className="inline-block px-4 py-1.5 bg-[#FDE047] border-2 border-black rounded-full shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
               <h4 className="text-[10px] font-black tracking-[0.2em] text-black uppercase">PLATFORM</h4>
            </div>
            <ul className="space-y-6">
              {[
                { label: "Studio", path: "/dashboard" },
                { label: "QR Forge", path: "/dashboard/qrforge" },
                { label: "Solutions", path: "/dashboard/links" },
                { label: "Knowledge Base", path: "/help" }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-xs font-[1000] text-black/60 hover:text-black uppercase tracking-widest transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="inline-block px-4 py-1.5 bg-[#FBCFE8] border-2 border-black rounded-full shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
               <h4 className="text-[10px] font-black tracking-[0.2em] text-black uppercase">COMMUNITY</h4>
            </div>
            <ul className="space-y-6">
              {[
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Security Hub", path: "/security" },
                { label: "Beta Access", path: "/register" },
                { label: "Support", path: "/contact" }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-xs font-[1000] text-black/60 hover:text-black uppercase tracking-widest transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Newsletter Card */}
          <div className="md:col-span-3">
             <div className="bg-[#FBCFE8] border-8 border-black rounded-[32px] p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] w-full">
                <h3 className="text-4xl font-[1000] tracking-tighter leading-[0.9] text-black uppercase italic mb-6">
                   JOIN THE<br />CREATOR<br />HUB.
                </h3>
                <p className="text-[10px] font-[1000] text-black/70 tracking-widest uppercase mb-8 leading-relaxed">
                   WEEKLY CREATOR INSIGHTS, AI TOOLS, AND GROWTH TACTICS.
                </p>
                <div className="relative">
                   <input 
                      type="email" 
                      id="newsletter_email"
                      name="newsletter_email"
                      placeholder="HELLO@CREATOR.COM" 
                      className="w-full h-14 bg-white border-4 border-black rounded-full pl-6 pr-14 text-black font-[1000] uppercase text-[10px] tracking-widest placeholder:text-black/30 focus:outline-none focus:ring-0"
                   />
                   <button className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-[#4ADE80] border-2 border-black rounded-full text-black hover:bg-[#22C55E] transition-all">
                      <Send className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Yellow Strip */}
      <div className="bg-white border-t-4 border-black relative z-10 py-6 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center justify-center gap-4 text-black/40">
               <Rocket className="w-5 h-5 flex-shrink-0" />
               <Compass className="w-5 h-5 flex-shrink-0" />
               <Layers className="w-5 h-5 flex-shrink-0" />
               <Shield className="w-5 h-5 flex-shrink-0" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
               <span className="text-[10px] font-[1000] tracking-widest uppercase text-black text-center">
                  © 2024 BIOTRA - THE #1 AI-POWERED PLATFORM FOR MODERN CREATORS
               </span>
               <div className="flex gap-4">
                  <Link to="/privacy" className="px-5 py-2 bg-white border-2 border-black rounded-full text-[9px] font-black uppercase tracking-widest text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                     PRIVACY POLICY
                  </Link>
                  <Link to="/security" className="px-5 py-2 bg-white border-2 border-black rounded-full text-[9px] font-black uppercase tracking-widest text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                     SECURITY HUB
                  </Link>
               </div>
            </div>
         </div>
         
         {/* Floating Chat Bubble */}
         <button className="absolute -top-6 right-6 md:right-12 w-14 h-14 bg-[#4ADE80] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all">
            <MessageCircle className="w-6 h-6 text-black fill-black" />
         </button>
      </div>
    </footer>
  );
};

export default BiotraCCFooter;
