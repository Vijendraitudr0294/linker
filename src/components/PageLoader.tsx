import React from "react";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative group">
        <div className="absolute -inset-4 bg-black rounded-[32px] animate-pulse"></div>
        <div className="relative bg-white border-4 border-black p-8 rounded-2xl flex flex-col items-center gap-4 transform rotate-1 group-hover:rotate-0 transition-transform shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <div className="w-16 h-16 border-8 border-black border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="font-black text-black uppercase tracking-tighter text-xl">
            Biotra <span className="text-emerald-500 animate-pulse">Loading...</span>
          </div>
          <div className="h-2 w-32 bg-black/5 rounded-full overflow-hidden border border-black/10">
            <div className="h-full bg-black animate-[loading_1.5s_infinite] w-1/2"></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
