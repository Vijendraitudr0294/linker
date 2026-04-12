import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Home, MoveLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans antialiased text-black">
      {/* Decorative Dots Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 flex flex-col items-center text-center"
      >
        <div className="relative mb-8">
            <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 bg-emerald-400 border-8 border-black rounded-[40px] flex items-center justify-center shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
            >
                <Zap className="w-16 h-16 fill-black" />
            </motion.div>
            <motion.div 
                animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-12 left-1/2 -translate-x-1/2"
            >
                <Ghost className="w-10 h-10 text-black/20" />
            </motion.div>
        </div>

        <motion.h1 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-[120px] md:text-[200px] font-[1000] tracking-tighter leading-none uppercase italic mb-8"
        >
          4<span className="bg-pink-300 px-4 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] inline-block mx-2">0</span>4
        </motion.h1>

        <div className="inline-block px-8 py-4 bg-yellow-400 border-4 border-black rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-12">
            <h2 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter">PAGE NOT FOUND</h2>
        </div>

        <p className="text-lg md:text-xl font-black text-black/50 max-w-md mb-16 uppercase leading-tight tracking-tight">
          Oops! The page you're looking for was moved or doesn't exist anymore.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link 
                to="/" 
                className="group px-12 py-5 bg-black text-white border-4 border-black rounded-[20px] text-lg font-black uppercase tracking-widest shadow-[8px_8px_0_0_rgba(16,185,129,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3"
            >
                <Home className="w-5 h-5" /> 
                Return Home
            </Link>
            <button 
                onClick={() => window.history.back()}
                className="px-12 py-5 bg-white text-black border-4 border-black rounded-[20px] text-lg font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3"
            >
                <MoveLeft className="w-5 h-5" />
                Go Back
            </button>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ x: [0, 10, 0], y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-20 right-[10%] w-20 h-20 bg-pink-200 border-4 border-black rounded-[20px] rotate-12 hidden md:block" 
      />
      <motion.div 
        animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-40 left-[15%] w-16 h-16 bg-emerald-200 border-4 border-black rounded-full hidden md:block" 
      />
    </div>
  );
};

export default NotFound;

