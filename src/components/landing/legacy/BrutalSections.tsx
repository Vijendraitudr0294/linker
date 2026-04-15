import { Paintbrush, QrCode, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const BrutalSections = () => {
  return (
    <div className="font-sans">
      {/* DESIGN YOUR PAGE */}
      <section id="design" className="py-32 bg-[#FBCFE8] border-b-8 border-black">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
              <Paintbrush className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase leading-[0.85]">
              DESIGN <br /> YOUR PAGE.
            </h2>
            <div className="space-y-4">
              <p className="text-xl font-black text-black uppercase tracking-tight leading-none">
                NO COMPLICATED TOOLS.
              </p>
              <p className="text-sm font-bold text-black/60 uppercase tracking-widest leading-relaxed">
                JUST CLICK AND BUILD. LOOK PROFESSIONAL IN SECONDS. CUSTOMIZE EVERYTHING—BORDERS, FONTS, AND COLORS.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative aspect-video bg-white border-8 border-black rounded-[32px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] overflow-hidden hover:-translate-y-2 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all"
          >
             <div className="absolute inset-0 flex items-center justify-center font-black text-black/5 text-9xl select-none rotate-12">STYLE</div>
             <div className="relative p-8 grid grid-cols-3 gap-4 h-full content-center">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-20 bg-gray-50 border-4 border-black rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]" />
                ))}
             </div>
          </motion.div>
        </div>
      </section>

      {/* SMART QR CODES */}
      <section id="codes" className="py-32 bg-[#E0E7FF] border-b-8 border-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             className="order-2 md:order-1 relative aspect-video bg-white border-8 border-black rounded-[32px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex items-center justify-center p-12 hover:-translate-y-2 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all cursor-crosshair"
          >
             <QrCode size={200} strokeWidth={1} className="text-black transition-transform hover:scale-110" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 md:order-2 space-y-8"
          >
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase leading-[0.85]">
              SMART <br /> QR CODES.
            </h2>
            <div className="space-y-4">
              <p className="text-xl font-black text-black uppercase tracking-tight leading-none">
                PRINT THEM. SHARE THEM.
              </p>
              <p className="text-sm font-bold text-black/60 uppercase tracking-widest leading-relaxed">
                CONNECT YOUR SHOP TO THE REAL WORLD. PEOPLE JUST SCAN YOUR CODE TO SEE YOUR STUFF.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* KEEP ALL THE MONEY */}
      <section className="py-32 bg-[#CCFBF1] border-b-8 border-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase leading-[0.85]">
              KEEP ALL <br /> THE MONEY.
            </h2>
            <div className="space-y-4">
              <p className="text-xl font-black text-black uppercase tracking-tight leading-none">
                COMMISSION-FREE EVERYTHING.
              </p>
              <p className="text-sm font-bold text-black/60 uppercase tracking-widest leading-relaxed">
                OTHER SITES TAKE 30% OF YOUR SALES. WE TAKE ZERO. YOU WORK HARD, SO YOU SHOULD KEEP ALL THE PROFIT.
              </p>
            </div>
          </motion.div>
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             className="relative flex justify-center"
          >
             <div className="w-full max-w-sm aspect-[4/5] bg-white border-8 border-black rounded-[40px] shadow-[16px_16px_0_0_rgba(0,0,0,1)] p-8 flex flex-col gap-6 hover:-translate-y-2 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all">
                <div className="h-12 w-1/2 bg-[#4ADE80] border-4 border-black rounded-full" />
                <div className="space-y-3">
                   <div className="h-12 bg-gray-50 border-4 border-black rounded-xl" />
                   <div className="h-12 bg-gray-50 border-4 border-black rounded-xl" />
                   <div className="h-4 tracking-widest font-black text-[10px] text-center uppercase">SECURE CHECKOUT</div>
                </div>
                <div className="mt-auto h-20 bg-black border-4 border-black rounded-2xl flex items-center justify-center font-black text-white text-xl tracking-widest">0% FEES</div>
             </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BrutalSections;
