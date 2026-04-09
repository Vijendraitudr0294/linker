import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PrivacyPolicy() {
    return (
        <div className="bg-[#F0F2F5] min-h-screen text-black selection:bg-black selection:text-white font-sans">
            <LandingNav />
            <main className="pt-40 pb-40 px-10 max-w-[1000px] mx-auto min-h-[80vh]">
                <div className="inline-block px-6 py-2 bg-pink-300 text-black font-black text-[12px] uppercase tracking-[0.3em] mb-12 border-4 border-black rounded-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    PRIVACY POLICY
                </div>
                <h1 className="text-[52px] md:text-[80px] font-[1000] tracking-tighter uppercase leading-[0.85] mb-16">
                    HOW WE PROTECT <br /> <span className="text-pink-500">YOUR DATA.</span>
                </h1>
                
                <div className="bg-white border-8 border-black p-10 md:p-16 rounded-[40px] shadow-[24px_24px_0_0_rgba(0,0,0,1)] space-y-12">
                    <section>
                        <h2 className="text-3xl font-[1000] uppercase italic tracking-tight mb-6 flex items-center gap-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 border-2 border-black rounded-md text-sm not-italic shadow-[2px_2px_0_0_rgba(0,0,0,1)]">1</span> 
                            Information Collection
                        </h2>
                        <p className="text-lg font-medium text-black/70 leading-relaxed border-l-4 border-emerald-400 pl-6">
                            We collect basic account information when you register, such as your email address and preferred username. Because we focus on a zero-fee model for creators, any integrations with payment providers are direct between you and the provider—meaning we never store your payment data.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-3xl font-[1000] uppercase italic tracking-tight mb-6 flex items-center gap-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 border-2 border-black rounded-md text-sm not-italic shadow-[2px_2px_0_0_rgba(0,0,0,1)]">2</span> 
                            How We Use Information
                        </h2>
                        <p className="text-lg font-medium text-black/70 leading-relaxed border-l-4 border-pink-400 pl-6">
                            We use your data strictly to operate out services, display your public creator profiles, and provide you with actionable analytics. We do not sell your data to third-party data brokers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-[1000] uppercase italic tracking-tight mb-6 flex items-center gap-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 border-2 border-black rounded-md text-sm not-italic shadow-[2px_2px_0_0_rgba(0,0,0,1)]">3</span> 
                            User Analytics
                        </h2>
                        <p className="text-lg font-medium text-black/70 leading-relaxed border-l-4 border-blue-400 pl-6">
                            For tracking clicks on your links, we record anonymized aggregate data regarding visitors. This is surfaced strictly to you in the Analytics dashboard to help you grow your audience.
                        </p>
                    </section>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
