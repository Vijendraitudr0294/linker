import { motion } from "framer-motion";
import { WifiOff, RefreshCcw, Zap } from "lucide-react";

/**
 * Biotra Offline / No Network Page
 * Neo-Brutalist Aesthetic
 */
const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans antialiased text-black">
      {/* Decorative Dots Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center text-center max-w-xl"
      >
        <div className="relative mb-12">
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-40 h-40 bg-pink-300 border-8 border-black rounded-[40px] flex items-center justify-center shadow-[20px_20px_0_0_rgba(0,0,0,1)]"
            >
                <WifiOff className="w-20 h-20 text-black stroke-[3]" />
            </motion.div>
            
            <motion.div 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-6 -right-6 w-16 h-16 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
            >
                <Zap className="w-8 h-8 fill-black" />
            </motion.div>
        </div>

        <h1 className="text-[52px] md:text-[80px] font-[1000] tracking-tighter leading-none uppercase italic mb-8">
            CONNECTION <br /> 
            <span className="bg-emerald-400 px-6 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] inline-block my-4">LOST.</span>
        </h1>

        <div className="inline-block px-8 py-4 bg-pink-300 border-4 border-black rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-12">
            <h2 className="text-xl md:text-2xl font-[1000] uppercase tracking-tighter text-black">YOU ARE OFFLINE</h2>
        </div>

        <p className="text-lg md:text-xl font-black text-black/40 mb-16 uppercase leading-tight tracking-tight px-4">
            It looks like you're not connected to the internet. Please check your connection and try again.
        </p>

        <button 
            onClick={handleRetry}
            className="group px-16 py-6 bg-black text-white border-4 border-black rounded-[24px] text-xl font-black uppercase tracking-widest shadow-[12px_12px_0_0_rgba(16,185,129,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-4 active:scale-95"
        >
            <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
            Try Again
        </button>
      </motion.div>

      {/* Extreme Floating Neo-Brutalist shapes */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-emerald-100 border-4 border-black -rotate-12 opacity-50" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-100 border-4 border-black rotate-6 opacity-50" />
    </div>
  );
};

export default Offline;
