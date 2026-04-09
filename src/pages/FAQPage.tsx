import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FAQPage() {
    const [open, setOpen] = useState<number | null>(0);
    const faqs = [
        { q: "WHAT DOES OWNING MY PAGE MEAN?", a: "IT MEANS YOU OWN YOUR ENTIRE ONLINE PRESENCE. NO ONE CAN TAKE YOUR LINKS, FANS, OR MONEY FROM YOU. YOU ARE IN TOTAL CONTROL, WITHOUT PAYING ANY FEES." },
        { q: "HOW DO THE 0% FEES WORK?", a: "WE TAKE ZERO MONEY FROM YOUR SALES. UNLIKE OTHER SITES THAT TAKE 15% OF WHAT YOU MAKE, WE TAKE NOTHING. YOU KEEP 100% OF YOUR PROFIT." },
        { q: "CAN I MAKE IT LOOK PROFESSIONAL?", a: "YES. IT IS VERY EASY TO CUSTOMIZE. NO CODING NEEDED. JUST CLICK TO CHANGE COLORS, BORDERS, AND FONTS TO MATCH YOUR STYLE." },
        { q: "HOW DOES AI HELP ME?", a: "OUR SYSTEM HELPS SMART AI TOOLS LIKE CHATGPT FIND YOUR PAGE EASILY. THIS MEANS MORE PEOPLE WILL FIND YOU AND YOUR WORK ON THE INTERNET." }
    ];

    return (
        <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white font-sans">
            <LandingNav />
            <main className="pt-40 pb-40 px-10 max-w-[1400px] mx-auto min-h-[80vh]">
                <div className="inline-block px-4 py-2 bg-pink-300 text-black font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">QUESTIONS</div>
                <h1 className="text-[60px] md:text-[100px] font-[1000] tracking-tighter uppercase leading-[0.85] mb-20">ANSWERS<br />HERE.</h1>
                <div className="flex flex-col gap-6 max-w-4xl">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                            <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <span className="text-xl md:text-2xl font-black uppercase">{faq.q}</span>
                                <ChevronDown className={cn("w-8 h-8 transition-transform duration-300", open === i && "rotate-180")} />
                            </button>
                            <div className={cn("overflow-hidden transition-all duration-300 px-8 text-lg font-medium text-black/70 bg-gray-50", open === i ? "max-h-[500px] py-6 border-t-4 border-black" : "max-h-0 py-0")}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
