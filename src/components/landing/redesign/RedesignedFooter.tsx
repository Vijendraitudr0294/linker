import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Github, ArrowRight } from "lucide-react";

const RedesignedFooter = () => {
  return (
    <footer className="py-24 bg-background border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container max-w-[1240px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-[20px] font-display font-black tracking-tight text-foreground uppercase italic">BIOTRA</span>
            </Link>
            <p className="text-[14px] font-medium text-muted-foreground leading-relaxed uppercase tracking-widest leading-loose">
              Manifesting the next generation of digital authority. Built in the network for the network.
            </p>
            <div className="flex items-center gap-5">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <div key={i} className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer border border-white/5">
                  <Icon className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Product</h5>
            <ul className="space-y-4">
              {["Platform", "Features", "Marketplace", "Pricing"].map(v => (
                <li key={v} className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase tracking-widest">
                  <Link to={`/${v.toLowerCase()}`}>{v}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Company</h5>
            <ul className="space-y-4">
              {["About", "Changelog", "Status", "Contact"].map(v => (
                <li key={v} className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase tracking-widest">
                  <Link to={`/${v.toLowerCase()}`}>{v}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Subscribe to the Protocol</h5>
            <div className="relative">
              <input 
                type="email" 
                placeholder="node@network.com" 
                className="w-full h-16 rounded-[24px] bg-white text-black border-none px-8 text-[13px] font-bold placeholder:text-black/20 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
              />
              <button className="absolute right-2 top-2 h-12 w-12 flex items-center justify-center rounded-[18px] bg-black text-white hover:bg-black/90 transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Join 50k+ architects across the global grid.</p>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
          <div>&copy; 2026 BIOTRA SYSTEM PROTOCOL. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-10">
            {["Privacy", "Terms", "Cookies"].map(item => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="hover:text-foreground transition-colors cursor-pointer">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RedesignedFooter;
