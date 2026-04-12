import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />
      
      <main className="py-24 px-6">
        <div className="max-w-4xl mx-auto border-8 border-black bg-white p-12 md:p-20 rounded-[48px] shadow-[24px_24px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase mb-16 leading-[0.85]">
            TERMS OF <br /> SERVICE.
          </h1>

          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">1. SERVICE DESCRIPTION</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                BIOTRA PROVIDES A COMMISSION-FREE LINK-IN-BIO PLATFORM INCLUDING PROFILE BUILDING, PRODUCT CATALOGS, CONTACT FORMS, 
                AND ANALYTICS TOOLS. WE MAINTAIN A COMPLETELY FREE TIER TO EMPOWER ALL CREATORS GLOBALLY.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">2. USER OWNERSHIP</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                YOU RETAIN FULL OWNERSHIP OF ALL CONTENT, LINKS, AND PRODUCTS UPLOADED TO BIOTRA. BY USING OUR SERVICE, 
                YOU GRANT US A NON-EXCLUSIVE LICENSE TO HOST AND DISPLAY THIS CONTENT TO THE AUDIENCES YOU DIRECT TO YOUR PAGE.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">3. PROHIBITED CONDUCT</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                PROHIBITED ACTIVITIES INCLUDE THE DISTRIBUTION OF MALWARE, ILLEGAL CONTENT, HARASSMENT, IMPERSONATION, 
                AND UNAUTHORIZED AUTOMATED SCRAPING OF THE BIOTRA NETWORK.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">4. LIMITATION OF LIABILITY</h2>
              <p className="font-bold text-black/60 uppercase tracking-widest leading-relaxed text-sm">
                BIOTRA IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE ARE NOT RESPONSIBLE FOR THE CONDUCT OF USERS 
                ON THE NETWORK OR THE ACCURACY OF CONTENT HOSTED ON INDIVIDUAL PAGES.
              </p>
            </section>

            <div className="pt-12 border-t-4 border-black/5">
              <p className="text-[10px] font-black tracking-[0.4em] text-black/20 uppercase">LAST UPDATED: MARCH 29, 2026</p>
            </div>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default Terms;
