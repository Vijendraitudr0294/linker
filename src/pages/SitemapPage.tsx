import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function SitemapPage() {
    const sections = [
        { title: "Core Substrate", links: ["/home", "/studio", "/forge", "/solutions"] },
        { title: "Network & Directory", links: ["/marketplace", "/pricing", "/features"] },
        { title: "Dashboard Modules", links: ["/dashboard", "/dashboard/links", "/dashboard/qrforge", "/dashboard/socialflow"] },
        { title: "Knowledge & Trust", links: ["/faq", "/privacy", "/security", "/help", "/api-docs"] },
    ];

    return (
        <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white font-sans">
            <LandingNav />
            <main className="pt-40 pb-40 px-10 max-w-[1400px] mx-auto min-h-[80vh]">
                <div className="inline-block px-4 py-2 bg-yellow-400 text-black font-black text-[10px] uppercase tracking-widest mb-8 border-2 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">INDEX_MAP</div>
                <h1 className="text-[60px] md:text-[100px] font-[1000] tracking-tighter uppercase leading-[0.85] mb-20">SITEMAP</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white border-8 border-black p-10 rounded-[32px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all">
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-8">{section.title}</h2>
                            <div className="flex flex-col gap-4">
                                {section.links.map((link) => (
                                    <a key={link} href={link} className="text-lg font-bold hover:text-emerald-500 hover:translate-x-2 transition-all block border-b-2 border-black/10 pb-2">{link}</a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
