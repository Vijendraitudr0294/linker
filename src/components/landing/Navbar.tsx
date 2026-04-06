import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "/#how-it-works" },
    { name: "Sectors", href: "/#marketplace" },
    { name: "Protocol", href: "/#deep-tech" }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 font-body ${
        isScrolled ? "bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4" : "bg-transparent py-8"
      }`}
    >
      <div className="boutique-container flex items-center justify-between">
        
        {/* Boutique Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-700">
             <div className="w-6 h-6 border-b-4 border-r-4 border-black/40 -rotate-45 group-hover:rotate-0 transition-transform" />
          </div>
          <span className="text-[20px] font-display font-black tracking-tight text-white group-hover:text-primary transition-colors">BIOTRA</span>
        </Link>

        {/* Desktop Anchor Hub */}
        <div className="hidden md:flex items-center gap-12">
           {navLinks.map((link) => (
             <a 
               key={link.name} 
               href={link.href}
               className="label text-[10px] text-white/30 hover:text-primary tracking-[0.3em] transition-all hover:translate-y-[-2px]"
             >
                {link.name}
             </a>
           ))}
        </div>

        {/* Global Connection Trigger */}
        <div className="flex items-center gap-8">
           <button 
             onClick={() => navigate("/login")}
             className="hidden sm:block label text-[10px] text-white/40 hover:text-white transition-colors"
           >
              Log In
           </button>
           <Button className="h-12 px-8 rounded-sm bg-primary text-black font-display font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white transition-all shadow-xl group">
              Establish Node <Sparkles className="w-3.5 h-3.5 ml-3 group-hover:text-primary transition-colors" />
           </Button>
           
           <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           >
              {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

      </div>

      {/* Boutique Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 bg-[#0A0A0A] z-[90] flex flex-col items-center justify-center gap-12 pt-24">
           {navLinks.map((link) => (
             <a 
               key={link.name} 
               href={link.href}
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-[32px] font-display font-bold text-white hover:text-primary transition-colors"
             >
                {link.name}
             </a>
           ))}
           <div className="w-12 h-[1px] bg-white/10" />
           <Button className="h-16 px-12 rounded-sm bg-primary text-black font-display font-black uppercase tracking-[0.1em] text-[12px]">
              Establish Node
           </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
