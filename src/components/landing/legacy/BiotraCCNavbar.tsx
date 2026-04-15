import { Link } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "DESIGN", path: "/#design" },
  { label: "CODES", path: "/#codes" },
  { label: "USERS", path: "/#users" },
  { label: "FAQ", path: "/#faq" },
  { label: "BLOG", path: "/blog" },
  { label: "PRICING", path: "/#pricing" },
];

const BiotraCCNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 pt-2 sm:pt-4 pointer-events-none">
      <nav className="w-full max-w-7xl mx-auto bg-white border-2 sm:border-4 border-black rounded-2xl sm:rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-between pointer-events-auto overflow-hidden sm:overflow-visible">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#22C55E] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-black" />
          </div>
          <span className="text-base sm:text-lg lg:text-xl font-black tracking-tighter uppercase italic text-black">BIOTRA</span>
          <span className="hidden md:inline-block px-2 py-0.5 bg-white border-2 border-black rounded-full text-[9px] font-black tracking-widest uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            v1.2 // STABLE
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => item.path.startsWith("/#") ? (
            <a
              key={item.label}
              href={item.path.replace('/', '')}
              className="text-[10px] font-black tracking-[0.2em] text-black/40 hover:text-black hover:-translate-y-0.5 transition-all uppercase pointer-events-auto cursor-pointer"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className="text-[10px] font-black tracking-[0.2em] text-black/40 hover:text-black hover:-translate-y-0.5 transition-all uppercase pointer-events-auto cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <Link
            to="/login"
            className="hidden sm:block text-[10px] font-black tracking-widest text-black/50 hover:text-black transition-colors uppercase"
          >
            LOGIN
          </Link>
          <Link
            to="/register"
            className="bg-black text-white rounded-xl sm:rounded-2xl px-3 sm:px-6 h-8 sm:h-11 border-2 border-black shadow-[2px_2px_0_0_rgba(34,197,94,1)] sm:shadow-[4px_4px_0_0_rgba(34,197,94,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black text-[8px] sm:text-[10px] tracking-[0.2em] uppercase flex items-center whitespace-nowrap pointer-events-auto"
          >
            START &gt;
          </Link>
          <button 
            className="lg:hidden w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center border-2 border-black rounded-xl sm:rounded-full bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none pointer-events-auto transition-transform"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[72px] sm:top-[88px] left-2 right-2 sm:left-4 sm:right-4 bg-white border-4 border-black rounded-[32px] p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] lg:hidden flex flex-col gap-6 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((item) => item.path.startsWith("/#") ? (
              <a
                key={item.label}
                href={item.path.replace('/', '')}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-black tracking-tighter text-black uppercase hover:text-[#22C55E] pointer-events-auto cursor-pointer"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-black tracking-tighter text-black uppercase hover:text-[#22C55E] pointer-events-auto cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="h-1 bg-black/5 rounded-full w-full" />
          <div className="flex flex-col gap-4">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-black tracking-widest text-black/50 hover:text-black uppercase text-center"
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex justify-center bg-black text-white rounded-2xl py-4 border-2 border-black shadow-[4px_4px_0_0_rgba(34,197,94,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black text-[14px] tracking-[0.2em] uppercase"
            >
              GET STARTED &gt;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiotraCCNavbar;
