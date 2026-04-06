import { CheckCircle2, ChevronRight, LayoutDashboard, Database, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export const MockFeaturePreview = ({ type }: { type: 'links' | 'qr' }) => {
  return (
    <div className="w-full h-[240px] bg-[#0c0c0c] flex items-center justify-center p-6 relative overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f25f30]/5 via-transparent to-transparent opacity-50" />
      
      {type === 'links' ? (
        <div className="w-[85%] max-w-[300px] space-y-3">
          {/* Mock Link Block 1 */}
          <div className="bg-[#111] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              </div>
              <div>
                <div className="w-20 h-2 bg-white/20 rounded-full mb-1.5" />
                <div className="w-24 h-1.5 bg-white/10 rounded-full" />
              </div>
            </div>
            <div className="w-10 h-5 rounded-full bg-[#f25f30] flex items-center p-0.5 justify-end shadow-[0_0_10px_rgba(242,95,48,0.3)]">
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          {/* Mock Link Block 2 */}
          <div className="bg-[#111] p-3 rounded-2xl border border-white/5 opacity-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <div className="w-3 h-3 bg-orange-500 rounded-sm" />
              </div>
              <div>
                <div className="w-24 h-2 bg-white/10 rounded-full mb-1.5" />
                <div className="w-16 h-1.5 bg-white/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-[85%] max-w-[300px]">
          <div className="bg-[#111] p-5 rounded-3xl border border-[#f25f30]/20 flex gap-5 items-center">
            {/* Mock QR Target */}
            <div className="w-16 h-16 bg-white rounded-xl p-2 shrink-0 shadow-xl shadow-[#f25f30]/10 flex flex-wrap gap-1 content-start">
               {/* Pattern mock */}
               <div className="w-4 h-4 bg-black rounded-sm" />
               <div className="w-4 h-4 bg-black rounded-sm" />
               <div className="w-6 h-4 bg-black rounded-sm opacity-60" />
               <div className="w-4 h-4 bg-black rounded-sm" />
               <div className="w-2 h-2 bg-[#f25f30] rounded-sm relative left-1 top-1" />
            </div>
            <div className="flex-1 space-y-2.5">
               <div className="w-16 h-2 bg-[#f25f30] rounded-full" />
               <div className="w-full h-1.5 bg-white/20 rounded-full" />
               <div className="w-20 h-1.5 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MockFAQPreview = () => {
    return (
        <div className="w-full h-[320px] bg-[#0c0c0c] flex items-center justify-center p-8 relative overflow-hidden pointer-events-none select-none">
           <div className="absolute right-0 top-0 w-48 h-48 bg-[#f25f30] rounded-full blur-[80px] opacity-10" />
           
           <div className="w-full max-w-[320px] bg-[#111] border border-white/10 rounded-3xl p-5 shadow-2xl relative z-10 flex flex-col gap-4">
               {/* Header mock */}
               <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                     <LayoutDashboard className="w-4 h-4 text-white hover:text-[#f25f30]" />
                  </div>
                  <div>
                      <div className="w-24 h-2.5 bg-white/80 rounded-full mb-2" />
                      <div className="w-16 h-1.5 bg-[#f25f30]/80 rounded-full" />
                  </div>
               </div>

               {/* Rows mock */}
               <div className="space-y-3">
                  {[Smartphone, Database, LayoutDashboard].map((Icon, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                         <div className="flex items-center gap-3">
                             <Icon className="w-4 h-4 text-white/50" />
                             <div className="w-20 h-2 bg-white/30 rounded-full" />
                         </div>
                         <ChevronRight className="w-3 h-3 text-white/20" />
                      </div>
                  ))}
               </div>
           </div>
        </div>
    );
}
