import { useState, useEffect } from "react";
import { Zap, ChevronRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const LandingNav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Design", href: "/#studio", color: "hover:text-pink-500" },
        { label: "Codes", href: "/#forge", color: "hover:text-yellow-500" },
        { label: "Universe", href: "/#universe", color: "hover:text-fuchsia-400" },
        { label: "Users", href: "/#solutions", color: "hover:text-emerald-500" },
        { label: "Team", href: "/#team", color: "hover:text-blue-600" },
        { label: "FAQ", href: "/faq", color: "hover:text-blue-500", isLink: true },
        { label: "Sitemap", href: "/sitemap", color: "hover:text-fuchsia-500", isLink: true },
        { label: "Pricing", href: "/pricing", color: "hover:text-pink-500", isLink: true },
    ];

    return (
        <>
            <nav className={cn(
                "fixed top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-[100] px-4 py-3 md:px-8 md:py-4 flex items-center justify-between rounded-[24px] md:rounded-[32px] bg-white border-4 border-black transition-all duration-300",
                scrolled ? "top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]" : "shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
            )}>
                <div className="flex items-center gap-4 md:gap-6">
                    <Link to="/" className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-400 border-2 border-black rounded-[8px] md:rounded-[10px] flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            <Zap className="text-black w-4 h-4 md:w-6 md:h-6 fill-black" />
                        </div>
                        <span className="font-[1000] text-xl md:text-2xl tracking-tighter uppercase italic text-black">BIOTRA</span>
                    </Link>
                    <div className="hidden xl:flex items-center justify-center px-2 py-1 bg-[#FEF08A] border-2 border-black rounded-md text-[9px] font-black tracking-widest -rotate-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">v1.2 // STABLE</div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-black">
                    {navLinks.map((link) => (
                        link.isLink ? (
                            <Link key={link.label} to={link.href} className={cn("hover:-translate-y-1 transition-all", link.color)}>{link.label}</Link>
                        ) : (
                            <a key={link.label} href={link.href} className={cn("hover:-translate-y-1 transition-all", link.color)}>{link.label}</a>
                        )
                    ))}
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                    <Link to="/login" className="hidden sm:block text-[10px] md:text-[11px] font-black text-black uppercase tracking-widest hover:underline decoration-4 decoration-emerald-400 underline-offset-8">Login</Link>
                    <Link to="/register" className="px-4 py-2.5 md:px-8 md:py-4 bg-black text-white border-2 border-black rounded-[14px] md:rounded-[16px] text-[9px] md:text-xs font-[1000] uppercase tracking-widest shadow-[4px_4px_0_0_rgba(16,185,129,1)] md:shadow-[6px_6px_0_0_rgba(16,185,129,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2">
                        Start <span className="hidden xs:inline">Site</span> <ChevronRight className="w-3 h-3 md:w-4 md:h-4 stroke-[4]" />
                    </Link>
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden w-10 h-10 border-2 border-black rounded-xl bg-white flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[90] bg-[#FBCFE8] pt-32 pb-10 px-8 flex flex-col font-bruddle lg:hidden"
                    >
                        <div className="absolute inset-0 pointer-events-none opacity-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
                        </div>
                        <div className="flex flex-col gap-6 relative z-10 overflow-y-auto">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {link.isLink ? (
                                        <Link 
                                            to={link.href} 
                                            className="text-4xl font-[1000] uppercase tracking-tighter text-black hover:text-white transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ) : (
                                        <a 
                                            href={link.href} 
                                            className="text-4xl font-[1000] uppercase tracking-tighter text-black hover:text-white transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                            <Link 
                                to="/login" 
                                className="mt-8 text-2xl font-black uppercase text-black/40 hover:text-black transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Member Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="mt-4 px-10 py-6 bg-emerald-400 border-4 border-black rounded-2xl text-xl font-[1000] uppercase tracking-widest shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Join Biotra
                            </Link>
                        </div>
                        
                        <div className="mt-auto pt-10 border-t-2 border-black/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-black/30">
                            <span>Biotra v1.2</span>
                            <span>© 2024</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LandingNav;
