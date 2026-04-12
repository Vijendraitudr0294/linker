import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import BiotraCCNavbar from "@/components/landing/legacy/BiotraCCNavbar";
import BiotraCCFooter from "@/components/landing/legacy/BiotraCCFooter";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#22C55E] selection:text-black">
      <BiotraCCNavbar />

      <main className="pt-36 pb-24 px-6 flex items-center justify-center min-h-screen">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <div className="w-24 h-24 bg-[#22C55E] border-8 border-black rounded-[32px] flex items-center justify-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] mx-auto">
            <Zap className="w-14 h-14 text-black fill-black" />
          </div>

          <h1 className="text-[120px] md:text-[200px] font-black tracking-tighter text-black uppercase leading-none">
            404.
          </h1>

          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">PAGE NOT FOUND.</h2>
            <p className="text-sm font-black uppercase tracking-widest text-black/40 max-w-sm mx-auto leading-relaxed">
              THE LINK YOU FOLLOWED LEADS NOWHERE. GO BACK AND TRY A DIFFERENT PATH.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-3 h-16 px-10 bg-black text-white font-black uppercase tracking-widest border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(34,197,94,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-5 h-5" /> GO HOME
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 h-16 px-10 bg-white text-black font-black uppercase tracking-widest border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              OPEN DASHBOARD
            </Link>
          </div>
        </div>
      </main>

      <BiotraCCFooter />
    </div>
  );
};

export default NotFound;
