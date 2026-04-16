import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import { ShieldCheck, Lock, Database } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="bg-[#F0F2F5] min-h-screen text-black selection:bg-black selection:text-white font-sans">
            <LandingNav />
            <main className="pt-40 pb-40 px-10 max-w-[1000px] mx-auto min-h-[80vh]">
                <div className="inline-block px-6 py-2 bg-emerald-400 text-black font-black text-[12px] uppercase tracking-[0.3em] mb-12 border-4 border-black rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    SECURITY HUB
                </div>
                <h1 className="text-[52px] md:text-[80px] font-[1000] tracking-tighter uppercase leading-[0.85] mb-16">
                    DEFENDING YOUR <br /> <span className="text-emerald-500">PRESENCE.</span>
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="bg-white border-8 border-black p-8 rounded-[32px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[20px_20px_0_0_rgba(0,0,0,1)] transition-all">
                        <div className="w-16 h-16 bg-yellow-400 border-4 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            <Lock size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Encryption in Transit</h3>
                        <p className="text-black/60 font-medium leading-relaxed">
                            All traffic between you, your audience and our servers is encrypted using industry standard HTTPS and TLS 1.3 cryptography.
                        </p>
                    </div>

                    <div className="bg-white border-8 border-black p-8 rounded-[32px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[20px_20px_0_0_rgba(0,0,0,1)] transition-all">
                        <div className="w-16 h-16 bg-pink-300 border-4 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            <Database size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Data Security</h3>
                        <p className="text-black/60 font-medium leading-relaxed">
                            Database backups, Row Level Security, and encrypted payload signatures ensure your data is accessible only by authorized endpoints.
                        </p>
                    </div>

                    <div className="bg-white border-8 border-black p-8 rounded-[32px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[20px_20px_0_0_rgba(0,0,0,1)] transition-all">
                        <div className="w-16 h-16 bg-sky-400 border-4 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            <ShieldCheck size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Continuous Audit</h3>
                        <p className="text-black/60 font-medium leading-relaxed">
                            We use edge networking firewalls and continuous automated security auditing to prevent DDoS and exploit attacks on your link bio.
                        </p>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
