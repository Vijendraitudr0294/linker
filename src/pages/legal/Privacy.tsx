import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />
      
      <main className="py-24 px-6">
        <div className="max-w-4xl mx-auto border-8 border-black bg-white p-12 md:p-20 rounded-[48px] shadow-[24px_24px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase mb-16 leading-[0.85]">
            PRIVACY <br /> POLICY.
          </h1>

          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">1. INFORMATION COLLECTION</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                WE COLLECT BASIC ACCOUNT INFORMATION (EMAIL, USERNAME, AND PROFILE DATA) TO OPERATE OUR SERVICES. AS A ZERO-FEE PLATFORM, 
                WE NEVER STORE OR PROCESS THIRD-PARTY SERVICE DATA. ANY EXTERNAL INTEGRATIONS OCCUR DIRECTLY BETWEEN YOU AND YOUR PROVIDERS.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">2. DATA USAGE</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                YOUR DATA IS USED SOLELY TO PROVIDE ANALYTICS, DISPLAY YOUR PUBLIC PROFILE, AND IMPROVE THE PLATFORM. WE DO NOT SELL, RENT, 
                OR TRADE YOUR PERSONAL DATA TO THIRD-PARTY ADVERTISERS OR DATA BROKERS.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">3. ANALYTICS & COOKIES</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                WE USE ANONYMIZED AGGREGATE DATA TO PROVIDE YOU WITH PERFORMANCE METRICS. ESSENTIAL COOKIES ARE USED ONLY TO MAINTAIN 
                YOUR SESSION SECURITY AND PREFERENCES. NO INVASIVE TRACKING SCRIPTS ARE PERMITTED ON YOUR BIOTRA PAGE.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">4. USER CONTROL</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                YOU HAVE THE RIGHT TO DELETE YOUR ACCOUNT AND ALL ASSOCIATED DATA AT ANY TIME VIA THE DASHBOARD. YOUR DATA IS YOURS. 
                BIOTRA IS MERELY THE INFRASTRUCTURE THAT POWERS IT.
              </p>
            </section>

            <div className="pt-12 border-t-4 border-black/5">
              <p className="text-[10px] font-black tracking-[0.4em] text-black/20 uppercase">LAST UPDATED: MARCH 2026</p>
            </div>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default Privacy;
