import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const RedesignedNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Initial theme setup (Dark as request default)
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navLinks = [
    { name: "Design Studio", href: "#how-it-works" },
    { name: "Marketplace", href: "#marketplace" },
    { name: "Capabilities", href: "#features" }
  ];

  return (
    <nav 
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 w-[95%] max-w-[1240px] ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div className={`flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 border ${
        isScrolled 
          ? "bg-background/60 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]" 
          : "bg-surface-glass backdrop-blur-md border-surface-border"
      }`}>
        
        {/* Brand Group */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
               <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[18px] font-display font-black tracking-tight text-foreground uppercase italic">BIOTRA</span>
          </Link>
          
          {/* Community Pulse Badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-surface-glass border border-surface-border">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Last joined 2m ago</span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-10">
           {navLinks.map((link) => (
             <a 
               key={link.name} 
               href={link.href}
               className="text-[12px] font-bold text-muted-foreground hover:text-foreground tracking-widest transition-all uppercase"
             >
                {link.name}
             </a>
           ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-foreground hover:bg-surface-glass transition-colors"
           >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>

           <button 
             onClick={() => navigate("/login")}
             className="hidden sm:block text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
           >
              Log In
           </button>
           <Button className="h-10 px-6 rounded-full bg-primary text-white font-display font-bold uppercase tracking-wider text-[10px] hover:brightness-110 transition-all shadow-lg active:scale-95">
              Get Started
           </Button>
           
           <button 
              className="md:hidden text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           >
              {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 bg-background/95 backdrop-blur-3xl z-[110] flex flex-col items-center justify-center gap-10">
           <button 
              className="absolute top-10 right-10 text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
           >
              <X size={32} />
           </button>
           {navLinks.map((link) => (
             <a 
               key={link.name} 
               href={link.href}
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-[28px] font-display font-bold text-foreground hover:text-primary transition-colors"
             >
                {link.name}
             </a>
           ))}
           <Button className="h-14 px-10 rounded-full bg-primary text-white font-display font-black uppercase tracking-widest text-[12px]">
              Join the Ecosystem
           </Button>
        </div>
      )}
    </nav>
  );
};

export default RedesignedNavbar;
