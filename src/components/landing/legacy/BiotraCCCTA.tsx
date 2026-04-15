import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BiotraCCCTA = () => {
  return (
    <div className="py-60 bg-[#F3F4F6] relative overflow-hidden border-t-8 border-black">
      {/* Background Decorative Illustration Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Blob 1 */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -30, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-emerald-400 border-8 border-black rounded-[100px] opacity-20 blur-2xl"
        />
        
        {/* Animated Ring */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-40 w-[600px] h-[600px] border-[24px] border-black/5 rounded-full"
        />

        {/* Floating Shapes */}
        <motion.div 
           animate={{ y: [-20, 20, -20] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="absolute top-40 right-20 w-16 h-16 bg-pink-400 border-4 border-black rotate-45 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
        />
        <motion.div 
           animate={{ rotate: [0, 360] }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-40 left-20 w-24 h-24 border-8 border-yellow-400 rounded-full border-dashed"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
             <div className="inline-block px-6 py-2 bg-black text-white font-black text-xs uppercase tracking-[0.5em] mb-4">
                Final Protocol
             </div>
             <h2 className="text-6xl md:text-[140px] font-[1000] tracking-tighter text-black uppercase leading-[0.8] mb-8">
               READY TO <br />
               <motion.span 
                  className="italic underline decoration-emerald-400 decoration-[16px] underline-offset-[-8px]"
                  animate={{ 
                    color: ["#000", "#10b981", "#000"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
               >
                 DOMINATE?
               </motion.span>
             </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl font-black text-black uppercase tracking-[0.3em] max-w-2xl"
          >
            NO CREDIT CARD. NO COMPROMISE. <br />
            JUST ABSOLUTE <span className="bg-yellow-300 px-2 border-2 border-black">AUTHORITY.</span>
          </motion.p>

          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ type: "spring", bounce: 0.5 }}
             className="relative group"
          >
            <div className="absolute inset-0 bg-emerald-400 border-4 border-black rounded-[32px] translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
            <Button
              asChild
              className="relative h-28 px-16 bg-black text-white border-4 border-black rounded-[32px] font-[1000] text-2xl md:text-4xl tracking-widest uppercase flex items-center justify-center hover:bg-black transition-all group-hover:-translate-x-2 group-hover:-translate-y-2 active:translate-x-0 active:translate-y-0"
            >
              <Link to="/auth">
                CLAIM YOUR THRONE
              </Link>
            </Button>
            
            {/* Visual Micro-elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-white border-4 border-black rounded-lg flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform shadow-lg">
               <span className="text-xl">🚀</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BiotraCCCTA;
