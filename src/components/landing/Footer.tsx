import { Link } from "react-router-dom";
import { Twitter, Instagram, Globe, Mail, ArrowUpRight, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-16 pb-16 bg-background border-t border-surface-border font-body relative overflow-hidden transition-colors duration-700">
      {/* Background Decorative Element */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] -ml-40 -mb-40 pointer-events-none" />
      
      <div className="boutique-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 mb-20">
          
          {/* Brand & Mission */}
          <div className="md:col-span-12 lg:col-span-5 space-y-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
                 <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-[20px] font-display font-black tracking-tight text-foreground uppercase tracking-tighter">BIOTRA</span>
            </Link>
            <p className="max-w-[420px] text-lg text-muted-foreground font-light leading-relaxed">
               The platform for world-class creators. Architecting digital identities and direct commerce with precision.
            </p>
            
            {/* Social Pill Hub */}
            <div className="flex items-center gap-4">
               {[Twitter, Instagram, Mail, Globe].map((Icon, i) => (
                 <a key={i} href="#" className="w-12 h-12 rounded-full border border-surface-border flex items-center justify-center hover:border-primary/40 hover:text-primary transition-all text-muted-foreground/20 bg-surface-glass hover:scale-110 active:scale-95 group">
                    <Icon className="w-4 h-4 transition-transform group-hover:rotate-12" />
                 </a>
               ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-6 lg:col-span-3 grid grid-cols-1 gap-10">
             <div className="space-y-6">
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary font-black">Platform</span>
                <ul className="space-y-4">
                   {["Creator Studio", "Direct Shop", "Analytics Hub", "Service Guide"].map(link => (
                     <li key={link}>
                        <a href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-all hover:translate-x-1 inline-block font-medium">
                           {link}
                        </a>
                     </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Interaction Hub / Subscribe */}
          <div className="md:col-span-6 lg:col-span-4 space-y-10">
             <div className="space-y-6">
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground/40 font-black">Stay Updated</span>
                <div className="relative group shadow-2xl">
                   <input 
                      type="email" 
                      placeholder="hello@biotra.xyz" 
                      className="w-full h-16 bg-surface-glass border border-surface-border rounded-full px-8 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-all shadow-inner"
                   />
                   <button className="absolute right-2 top-2 h-12 px-6 rounded-full bg-primary text-white font-display font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95">
                      Subscribe
                   </button>
                </div>
                <p className="text-[11px] text-muted-foreground/30 font-mono tracking-widest leading-loose uppercase font-black">
                   Join the network for exclusive updates.
                </p>
             </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-surface-border flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-10">
              <span className="text-[9px] font-mono text-muted-foreground/20 tracking-[0.2em] uppercase font-black">Copyright @2025, Listifyi Innovation Private Limited. All Rights Reserved</span>
              <div className="flex gap-6">
                 {["Privacy", "Terms", "Support"].map(l => (
                    <a key={l} href="#" className="text-[9px] font-mono text-muted-foreground/20 hover:text-primary transition-colors uppercase tracking-[0.2em] font-black">{l}</a>
                 ))}
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface-glass border border-surface-border">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                 <span className="text-[9px] font-mono text-muted-foreground/30 tracking-widest uppercase font-black">System: Online</span>
              </div>
              <span className="text-[9px] font-mono text-primary/30 tracking-widest uppercase italic font-black">"CRAFT ABOVE ALL."</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
