import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BiotraCCCTA = () => {
  return (
    <div className="py-48 bg-[#F3F4F6] relative overflow-hidden">
      <div className="absolute top-10 left-10 w-40 h-40 bg-[#4ADE80] border-8 border-black rounded-full opacity-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#FBCFE8] border-8 border-black rotate-12 opacity-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10"
      >
        <h2 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black uppercase leading-[0.85]">
          READY TO <br />
          <motion.span 
             animate={{ color: ["#22C55E", "#FDE047", "#38BDF8", "#FBCFE8", "#22C55E"] }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            OWN YOUR AUDIENCE?
          </motion.span>
        </h2>
        
        <p className="text-lg font-black text-black/40 uppercase tracking-[0.2em]">
          NO CREDIT CARD. NO COMPROMISE. NO BRAINER.
        </p>

        <motion.div
           animate={{ rotate: [-1, 1, -1] }}
           transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
           className="inline-block hover:scale-[1.02] transition-transform"
        >
          <Button
            asChild
            className="h-20 md:h-24 px-8 md:px-16 bg-black hover:bg-black/90 text-white border-4 border-black rounded-3xl shadow-[12px_12px_0_0_rgba(34,197,94,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all font-black text-xl md:text-2xl tracking-widest uppercase text-center flex items-center justify-center"
          >
            <Link to="/auth">CLAIM YOUR LINK NOW</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BiotraCCCTA;
