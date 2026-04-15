import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const TickerTape = () => {
  return (
    <motion.div 
      className="relative border-y-8 border-black py-6 overflow-hidden flex items-center scrollbar-hide"
      animate={{ backgroundColor: ["#22C55E", "#FBCFE8", "#FDE047", "#38BDF8", "#22C55E"] }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    >
      <div className="flex animate-marquee whitespace-nowrap items-center scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-10 mx-10">
            <span className="text-4xl font-black tracking-tighter text-black uppercase">POWERING CREATORS & SMBS</span>
            <Zap className="w-8 h-8 fill-black text-black" />
            <span className="text-4xl font-black tracking-tighter text-black uppercase">UNLIMITED SOCIAL REACH</span>
            <Zap className="w-8 h-8 fill-black text-black" />
          </div>
        ))}
      </div>
      <div className="flex absolute top-0 animate-marquee2 whitespace-nowrap items-center scrollbar-hide">
         {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-10 mx-10">
            <span className="text-4xl font-black tracking-tighter text-black uppercase">POWERING CREATORS & SMBS</span>
            <Zap className="w-8 h-8 fill-black text-black" />
            <span className="text-4xl font-black tracking-tighter text-black uppercase">UNLIMITED SOCIAL REACH</span>
            <Zap className="w-8 h-8 fill-black text-black" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TickerTape;
